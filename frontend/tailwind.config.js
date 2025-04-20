/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
      extend: {
        colors: {
          background: "hsl(var(--color-background))",
          foreground: "hsl(var(--color-foreground))",
          primary:    "hsl(var(--color-primary))",
          secondary:  "hsl(var(--color-secondary))",
        },
        borderRadius: {
          md: "var(--radius-md)",
        },
        fontFamily: {
          sans: ["var(--font-sans)", "system-ui"],
        },
      },
    },
    plugins: [],
  };
  