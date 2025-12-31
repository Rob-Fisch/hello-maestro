/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: "#ffffff", // White for high contrast
                secondary: "#7c3aed", // Violet 600
                background: "#020617", // Slate 950
                card: "rgba(255, 255, 255, 0.05)", // Glass
                border: "rgba(255, 255, 255, 0.1)", // White/10
                "muted-foreground": "#94a3b8", // Slate 400
            },
            borderRadius: {
                'card': '40px',
            }
        },
    },

    plugins: [],
}
