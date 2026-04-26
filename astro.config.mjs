import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";

export default defineConfig({
  site: "https://rentledger.org",
  trailingSlash: "always",
  build: {
    format: "directory",
  },
  integrations: [sitemap(), mdx()],
});
