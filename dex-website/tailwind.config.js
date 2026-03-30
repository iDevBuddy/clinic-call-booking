/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                dark: {
                    DEFAULT: '#111111',
                    deeper: '#0a0a0a',
                    card: '#1a1a1a',
                    hover: '#222222',
                },
                accent: {
                    DEFAULT: '#e05132',
                    dim: 'rgba(224, 81, 50, 0.15)',
                    hover: '#c9432a',
                },
                border: {
                    DEFAULT: '#2a2a2a',
                    hover: '#3a3a3a',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                mono: ['IBM Plex Mono', 'monospace'],
            },
        },
    },
    plugins: [],
}
