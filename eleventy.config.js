const htmlmin = require("html-minifier-terser");
const esbuild = require("esbuild");
const CleanCss = require("clean-css");
const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");
const sass = require("sass");
const path = require("path");

module.exports = function(eleventyConfig) {
    const isProduction = process.env.ELEVENTY_RUN_MODE === "build";

    // ==========================================
    // 1. FILTERS
    // ==========================================
    eleventyConfig.addFilter("dateISO", (d) => new Date(d).toISOString());
    
    // Unified short date formatting handles both date objects and string/ISO inputs safely
    eleventyConfig.addFilter("dateShort", (d) => {
        if (!d) return "";
        return new Date(d).toISOString().split("T")[0];
    });
    eleventyConfig.addFilter("htmlDateString", eleventyConfig.getFilter("dateShort"));

    eleventyConfig.addFilter("cssmin", function(code) {
        return new CleanCss({}).minify(code).styles;
    });

    // ==========================================
    // 2. COLLECTIONS
    // ==========================================
    eleventyConfig.addCollection("pages", (api) => api.getFilteredByGlob("src/**/*.html"));
    eleventyConfig.addCollection("blog", (api) => api.getFilteredByGlob("src/blog/**/*.md"));
    eleventyConfig.addCollection("projects", (api) => api.getFilteredByGlob("src/projects/**/*.md"));
    
    eleventyConfig.addCollection("posts", (api) => {
        return [
            ...api.getFilteredByGlob("src/blog/**/*.md"),
            ...api.getFilteredByGlob("src/projects/**/*.md"),
        ].sort((a, b) => b.date - a.date);
    });

    // ==========================================
    // 3. SASS / SCSS EXTENSION PIPELINE
    // ==========================================
    eleventyConfig.addTemplateFormats("scss");
    eleventyConfig.addExtension("scss", {
        outputFileExtension: "css",
        compile: async function(inputContent, inputPath) {
            let parsed = path.parse(inputPath);

            // Skip processing partial layout files starting with an underscore
            if (parsed.name.startsWith("_")) return;

            return async () => {
                let result = sass.compile(inputPath, {
                    loadPaths: [parsed.dir],
                    style: isProduction ? "compressed" : "expanded", // Minify on build production
                });
                return result.css;
            };
        },
    });

    // ==========================================
    // 4. JAVASCRIPT ESBUILD PIPELINE
    // ==========================================
    eleventyConfig.addTemplateFormats("js");
    eleventyConfig.addExtension("js", {
        outputFileExtension: "js",
        compile: async function(inputContent, inputPath) {
            // Ignore asset parts/utilities starting with an underscore
            if (inputPath.includes("/_")) return;

            return async () => {
                let result = await esbuild.build({
                    entryPoints: [inputPath],
                    write: false,
                    bundle: true,
                    minify: isProduction,
                    target: "es2020",
                });
                return result.outputFiles[0].text;
            };
        },
    });

    // ==========================================
    // 5. HIGH-PERFORMANCE IMAGE TRANSFORM
    // ==========================================
    eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
        formats: ["avif", "webp"],
        widths: [400, 800, 1200, 1600, "auto"],
        defaultAttributes: {
            loading: "lazy",
            decoding: "async",
            sizes: "(max-width: 1200px) 100vw, 1200px",
        },
        sharpWebpOptions: { quality: 75, effort: 4 },
        transformOnRequest: process.env.ELEVENTY_RUN_MODE === "serve",
    });

    // ==========================================
    // 6. PRODUCTION CODE MINIFICATION
    // ==========================================
    if (isProduction) {
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

    // ==========================================
    // 7. WATCH TARGETS & PASSTHROUGH COPIES
    // ==========================================
    eleventyConfig.addWatchTarget("src/scss/");
    
    // Core structural assets passed right through cleanly
    eleventyConfig.addPassthroughCopy("src/assets/");
    eleventyConfig.addPassthroughCopy("src/_includes/components/");

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
