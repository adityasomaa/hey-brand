import type { MetadataRoute } from "next";
import { caseStudies } from "@/data/content";
import { routes, site } from "@/lib/site";

/**
 * Sitemap. Built from the same route table the nav uses, plus one entry per
 * case study, so adding a study to src/data/content.ts is all it takes.
 * Every URL is derived from `site.url`, so changing the canonical domain in
 * one place updates the sitemap, robots.txt and the canonical tags together.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-08-24");

  const staticRoutes = routes.map((r) => ({
    url: new URL(r.path, site.url).toString(),
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const studyRoutes = caseStudies.map((study) => ({
    url: new URL(`/karya/${study.slug}`, site.url).toString(),
    lastModified,
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...studyRoutes];
}
