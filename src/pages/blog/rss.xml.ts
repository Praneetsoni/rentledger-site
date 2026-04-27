import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIRoute } from "astro";

// RSS feed for /blog/* posts only — programmatic pages are intentionally
// excluded so the feed stays focused on editorial content. Per playbook
// §M1.3 setup; ships empty until first blog post lands.
export const GET: APIRoute = async (context) => {
  const posts = await getCollection("blog", ({ data }) => !data.draft);

  return rss({
    title: "RentLedger Blog",
    description:
      "Tax, bookkeeping, and rental-property guides for landlords. Built by RentLedger — the iOS rental tracker.",
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.id}/`,
      author: post.data.author,
      categories: post.data.tags,
    })),
    customData: "<language>en-us</language>",
    stylesheet: undefined,
  });
};
