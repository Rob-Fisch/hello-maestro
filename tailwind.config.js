/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: "#2563eb",
                background: "#f8fafc",
                card: "#ffffff",
                border: "#f1f5f9",
                "muted-foreground": "#64748b",
            },
            borderRadius: {
                'card': '40px',
            }
        },
    },

    plugins: [],
}
