// eleventy.config.js
const htmlmin = require("html-minifier-terser");
const CleanCss = require("clean-css");
const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");
const sass = require("sass"); // Import the native sass package
const path = require("path");

module.exports = function(eleventyConfig) {
	eleventyConfig.addFilter("dateISO", (d) => new Date(d).toISOString());
	eleventyConfig.addFilter(
		"dateShort",
		(d) => new Date(d).toISOString().split("T")[0],
	);
	eleventyConfig.addFilter("htmlDateString", (dateObj) => {
		if (!dateObj) return "";

		const date = new Date(dateObj);

		return date.toISOString().split("T")[0];
	});

	eleventyConfig.addCollection("pages", (api) => {
		return api.getFilteredByGlob("src/**/*.html");
	});

	eleventyConfig.addTemplateFormats("scss");
	eleventyConfig.addExtension("scss", {
		outputFileExtension: "css",
		compile: async function(inputContent, inputPath) {
			let parsed = path.parse(inputPath);

			// Skip processing partial files starting with an underscore (_variables.scss)
			if (parsed.name.startsWith("_")) {
				return;
			}

			return async (data) => {
				let result = sass.compile(inputPath, {
					loadPaths: [parsed.dir],
					style: "expanded",
				});
				return result.css;
			};
		},
	});
	eleventyConfig.addPassthroughCopy({
		"./src/scss/output.css": "scss/output.css",
	});
	eleventyConfig.addPassthroughCopy({ "./src/js/": "js/" });

	eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
		formats: ["avif", "webp", "jpeg"],
		widths: [400, 800, 1200, 1600, "auto"],
		defaultAttributes: {
			loading: "lazy",
			decoding: "async",
		},
		shouldTransformToPicture: function({ src }) {
			if (src && src.endsWith(".svg")) {
				return false; // Tells the plugin: "Do not touch this element"
			}
			return true; // Process all other image extensions (jpg, png, webp) normally
		},
		// sharpAvifOptions: { quality: 60, effort: 5 },
		// sharpWebpOptions: { quality: 75, effort: 4 },
		// sharpJpegOptions: { quality: 80, progressive: true },
		transformOnRequest: false,
		// transformOnRequest: process.env.ELEVENTY_RUN_MODE === "serve",
	});

	if (process.env.ELEVENTY_ENV === "production") {
		eleventyConfig.addTransform("htmlmin", function(content) {
			if (this.page.outputPath && this.page.outputPath.endsWith(".html")) {
				return htmlmin.minify(content, {
					useShortDoctype: true,
					removeComments: true,
					collapseWhitespace: true,
					minifyJS: true,
				});
			}
			return content;
		});
	}

	eleventyConfig.addFilter("cssmin", function(code) {
		return new CleanCss({}).minify(code).styles;
	});
	eleventyConfig.addPassthroughCopy("src/assets/");
	eleventyConfig.addPassthroughCopy("src/_includes/components/");
	eleventyConfig.addWatchTarget("src/scss/"); // Watch for style changes during dev mode

	return {
		dir: {
			input: "src",
			includes: "_includes",
			output: "_site",
		},
		templateFormats: ["md", "njk", "html"],
		markdownTemplateEngine: "njk",
		htmlTemplateEngine: "njk",
		dataTemplateEngine: "njk",
	};
};
