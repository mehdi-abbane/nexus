// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import sitemap from "@astrojs/sitemap";
import { fileURLToPath } from "url";

// https://astro.build/config
export default defineConfig({
	site: "https://nexus-mehdi-abbane.netlify.app",
	i18n: {
		defaultLocale: 'en',
		locales: ['en']
	},

	vite: {
		resolve: {
			alias: {
				"@src": fileURLToPath(new URL("./src", import.meta.url)),
				"@components": fileURLToPath(new URL("./src/components", import.meta.url)),
				"@styles": fileURLToPath(new URL("./src/styles", import.meta.url)),
			},
		},
		plugins: [tailwindcss()],
	},

	integrations: [sitemap()],
});
