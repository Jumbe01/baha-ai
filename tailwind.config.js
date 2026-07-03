import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
                display: ['Poppins', 'Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                // Deep navy sidebar / hero panel
                navy: {
                    50: '#eef4fb',
                    100: '#d7e5f5',
                    200: '#adc7e8',
                    300: '#7ba3d6',
                    400: '#4a79bd',
                    500: '#2b568f',
                    600: '#1d3d6b',
                    700: '#132c50',
                    800: '#0d2547',
                    900: '#0b1f3a',
                    950: '#081627',
                },
                // Primary brand blue (CTAs, active states)
                brand: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                },
                // Cyan accent (the "AI" wordmark / highlights)
                accent: {
                    400: '#56c7f7',
                    500: '#38bdf8',
                    600: '#0ea5e9',
                },
            },
            borderRadius: {
                xl: '0.875rem',
                '2xl': '1.125rem',
            },
            boxShadow: {
                card: '0 1px 3px 0 rgb(15 23 42 / 0.06), 0 1px 2px -1px rgb(15 23 42 / 0.04)',
                'card-hover': '0 8px 24px -6px rgb(15 23 42 / 0.12)',
            },
        },
    },

    plugins: [forms],
};
