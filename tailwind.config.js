// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core theme colors
        'theme-bg': 'var(--bg-color)',
        'theme-text': 'var(--text-color)',
        'theme-primary-accent1': 'var(--primary-accent1)',
        'theme-primary-accent2': 'var(--primary-accent2)',
        'theme-primary-accent3': 'var(--primary-accent3)',
        'theme-secondary-1': 'var(--secondary-color1)', // Borders, subtle elements
        'theme-secondary-2': 'var(--secondary-color2)', // Input/card backgrounds

        // Semantic colors (optional, but good for consistency)
        'input-bg': 'var(--input-bg-color, var(--secondary-color2))',
        'input-text': 'var(--input-text-color, var(--text-color))',
        'input-border': 'var(--input-border-color, var(--primary-accent1))',
        'button-primary-bg': 'var(--button-primary-bg-color, var(--primary-accent1))',
        'button-primary-text': 'var(--button-primary-text-color, var(--text-color-on-primary))',
        'button-secondary-bg': 'var(--button-secondary-bg-color, var(--primary-accent2))',
        'button-secondary-text': 'var(--button-secondary-text-color, var(--text-color-on-secondary))',

        // Notification/Status colors
        'theme-success-bg': 'var(--success-bg-color)',
        'theme-success-text': 'var(--success-text-color)',
        'theme-danger-bg': 'var(--danger-bg-color)',
        'theme-danger-text': 'var(--danger-text-color)',
        'theme-info-bg': 'var(--info-bg-color)',
        'theme-info-text': 'var(--info-text-color)',
        'theme-warning-bg': 'var(--warning-bg-color)',
        'theme-warning-text': 'var(--warning-text-color)',
      },
      borderColor: theme => ({
        ...theme('colors'), // Make all colors available for borders
        'DEFAULT': 'var(--secondary-color1)', // Default border color
      }),
      ringColor: theme => ({ // For focus rings
        ...theme('colors'),
        'DEFAULT': 'var(--primary-accent1)',
      }),
      boxShadow: {
        'cyber-glow-accent1': '0 0 8px 2px var(--primary-accent1-glow, rgba(0, 255, 255, 0.5))',
        'cyber-glow-accent2': '0 0 8px 2px var(--primary-accent2-glow, rgba(255, 0, 255, 0.5))',
        'cyber-shadow': '0 4px 6px -1px var(--shadow-color, rgba(0, 0, 0, 0.1)), 0 2px 4px -1px var(--shadow-color, rgba(0, 0, 0, 0.06))',
      }
    },
  },
  plugins: [],
};