import { tool } from "ai";
import { z } from "zod";
import type { ContentUpdate } from "@/types/dashboard";
import { broadcastEvent } from "./broadcast";

/**
 * Tool: Show Content Updates
 *
 * Displays recent content updates (blog posts, social media, emails, ads) on the dashboard.
 * Optionally filters by content type.
 */
export const showContentUpdates = tool({
  description:
    "Show recent content updates on the dashboard. Use when the user asks about content, blog posts, social media posts, or recent updates.",
  inputSchema: z.object({
    contentType: z
      .enum(["blog", "social", "email", "ad"])
      .optional()
      .describe("Filter by content type"),
  }),
  execute: async ({ contentType }) => {
    // Mock data - in production, this would fetch from a database
    const updates = [
      {
        id: "1",
        title: "Spring Sale Announcement",
        type: "blog" as const,
        status: "published" as const,
        summary: "Blog post about upcoming spring promotions",
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        title: "Instagram Story — New Arrivals",
        type: "social" as const,
        status: "scheduled" as const,
        summary: "Carousel post featuring 5 new products",
        updatedAt: new Date().toISOString(),
      },
      {
        id: "3",
        title: "Weekly Newsletter",
        type: "email" as const,
        status: "draft" as const,
        summary: "This week's newsletter with curated picks",
        updatedAt: new Date().toISOString(),
      },
    ].filter(
      (u) => !contentType || u.type === contentType
    ) satisfies ContentUpdate[];

    // Broadcast to Socket.IO for real-time dashboard update
    await broadcastEvent({
      type: "content_updates",
      payload: updates,
      timestamp: new Date().toISOString(),
    });

    return `Showing ${updates.length} content updates on the dashboard.`;
  },
});
