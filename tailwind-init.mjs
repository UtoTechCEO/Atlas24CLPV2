import fs from "fs";

fs.writeFileSync("tailwind.config.js", `module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,vue}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
`);

fs.writeFileSync("postcss.config.cjs", `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`);

console.log("✅ Tailwind + PostCSS Konfigurationsdateien erstellt.");
