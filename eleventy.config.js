import yaml from "js-yaml";

export default function (eleventyConfig) {
  const siteBase = (process.env.SITE_BASE || "").replace(/\/$/, "");
  eleventyConfig.addGlobalData("siteBase", siteBase);
  eleventyConfig.addDataExtension("yaml", contents => yaml.load(contents));

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "assets/mathjax-tex-svg.js": "assets/mathjax-tex-svg.js" });
  eleventyConfig.addPassthroughCopy({ photos: "photos" });
  eleventyConfig.addPassthroughCopy("CV.pdf");
  eleventyConfig.addPassthroughCopy("favicon.ico");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("google9055ad045873c93a.html");
  eleventyConfig.addPassthroughCopy(".nojekyll");

  eleventyConfig.addCollection("publications", collection =>
    collection.getFilteredByGlob("src/publications/*.md").sort((a, b) => {
      const yearDifference = Number(b.data.year) - Number(a.data.year);
      return yearDifference || a.data.title.localeCompare(b.data.title);
    })
  );
  eleventyConfig.addFilter("limit", (items, count) => items.slice(0, count));
  eleventyConfig.addFilter("currentYear", () => new Date().getFullYear());
  eleventyConfig.addFilter("scholarUrl", value => `https://scholar.google.com/scholar?q=${encodeURIComponent(value)}`);
  eleventyConfig.addFilter("json", value => JSON.stringify(value));
  eleventyConfig.addFilter("withBase", value => `${siteBase}${value}`);

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
}
