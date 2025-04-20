const { Pool } = require('pg');
const amqp = require('amqplib');
const { setTimeout } = require('timers/promises');
require('dotenv').config();

// Enhanced DB configuration
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

let rabbitConnection;
let rabbitChannel;

// Robust RabbitMQ connection with retry logic
const connectRabbitMQ = async () => {
  let retries = 5;
  while (retries > 0) {
    try {
      const connection = await amqp.connect(process.env.RABBITMQ_URL);
      console.log('✅ Connected to RabbitMQ');
      return connection;
    } catch (err) {
      console.error(`❌ Connection failed (${retries} retries left):`, err.message);
      retries--;
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  throw new Error('Failed to connect to RabbitMQ');
};

// Process booking with enhanced logging and retry mechanism
async function processBooking(bookingId, retries = 3, delay = 1000) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      `UPDATE bookings 
       SET status = 'Confirmed', 
           updated_at = NOW() 
       WHERE id = $1 AND status = 'Pending'
       RETURNING id, user_name, movie_id`,
      [bookingId]
    );

    if (result.rowCount === 0) {
      throw new Error('Booking not found or already processed');
    }

    await client.query('COMMIT');
    console.log(`✅ Confirmed booking ${bookingId}`, {
      user: result.rows[0].user_name,
      movie: result.rows[0].movie_id
    });
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    if (retries > 0) {
      console.log(`🔄 Retrying booking ${bookingId} (${retries} left)...`);
      await setTimeout(delay);
      return processBooking(bookingId, retries - 1, delay * 2);
    }
    console.error(`❌ Failed to process booking ${bookingId}:`, error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Initialize RabbitMQ with Dead Letter Exchange (DLX) setup
async function startConsumer() {
  try {
    // Validate environment variable
    if (!process.env.RABBITMQ_URL) throw new Error('Missing RABBITMQ_URL');

    // Connect to RabbitMQ using retry-enabled method
    rabbitConnection = await connectRabbitMQ();
    rabbitChannel = await rabbitConnection.createChannel();

    // Setup Dead Letter Exchange (DLX)
    await rabbitChannel.assertExchange('dead_letter', 'direct', { durable: true });

    // Main queue with DLX configuration
    await rabbitChannel.assertQueue('booking_queue', {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': 'dead_letter',
        'x-dead-letter-routing-key': 'booking_queue.dlq'
      }
    });

    // Dead Letter Queue (DLQ)
    await rabbitChannel.assertQueue('booking_queue.dlq', { durable: true });
    await rabbitChannel.bindQueue('booking_queue.dlq', 'dead_letter', 'booking_queue.dlq');

    // Set QoS for message prefetching
    rabbitChannel.prefetch(5);

    console.log('🚀 Worker ready with proper queue configuration');

    // Consume messages
    rabbitChannel.consume('booking_queue', async (msg) => {
      const bookingId = msg.content.toString();
      try {
        console.log(`📥 Processing booking ${bookingId}`);
        const success = await processBooking(bookingId);

        if (success) {
          rabbitChannel.ack(msg);
          console.log(`✔️  Acknowledged booking ${bookingId}`);
        } else {
          rabbitChannel.nack(msg, false, false);
          console.log(`⏩ Requeued booking ${bookingId}`);
        }
      } catch (error) {
        console.error(`❌ Error processing booking ${bookingId}:`, error.message);
        rabbitChannel.nack(msg, false, false);
      }
    }, { noAck: false });

  } catch (error) {
    console.error('🔥 Worker initialization failed:', error);
    await shutdown();
    process.exit(1);
  }
}

// Graceful shutdown of all connections
async function shutdown() {
  try {
    console.log('\n🛑 Shutting down gracefully...');
    if (rabbitChannel) await rabbitChannel.close();
    if (rabbitConnection) await rabbitConnection.close();
    await pool.end();
    console.log('👋 Clean shutdown complete');
  } catch (error) {
    console.error('Shutdown error:', error);
  }
}

// Listen for termination signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start consumer
startConsumer().catch(shutdown);

// Health check server
require('http').createServer((req, res) => {
  res.statusCode = 200;
  res.end('Worker OK');
}).listen(process.env.HEALTH_PORT || 8080, () => {
  console.log(`💚 Health check server running on port ${process.env.HEALTH_PORT || 8080}`);
});
