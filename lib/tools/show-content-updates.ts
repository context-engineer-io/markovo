import { tool } from "ai";
import { z } from "zod";
import type { ContentUpdate } from "@/types/dashboard";
import { broadcastEvent } from "./broadcast";

const MOCK_CONTENT_UPDATES: ContentUpdate[] = [
  {
    id: "1",
    title: "Spring Sale Announcement",
    type: "blog",
    status: "published",
    summary: "Blog post about upcoming spring promotions",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Instagram Story — New Arrivals",
    type: "social",
    status: "scheduled",
    summary: "Carousel post featuring 5 new products",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Weekly Newsletter",
    type: "email",
    status: "draft",
    summary: "This week's newsletter with curated picks",
    updatedAt: new Date().toISOString(),
  },
];

export const showContentUpdates = tool({
  description:
    "Display recent content updates on the user's dashboard in real-time. REQUIRED: You must call this function when user asks about content, blog posts, social media posts, or recent updates. The dashboard will update immediately with content items.",

  inputSchema: z.object({
    contentType: z
      .enum(["blog", "social", "email", "ad"])
      .optional()
      .describe("Filter by content type. Leave empty to show all content."),
  }),

  execute: async ({ contentType }) => {
    const filteredUpdates = MOCK_CONTENT_UPDATES.filter(
      (u) => !contentType || u.type === contentType
    );

    await broadcastEvent({
      type: "content_updates",
      payload: filteredUpdates,
      timestamp: new Date().toISOString(),
    });

    return `Showing ${filteredUpdates.length} content updates on the dashboard.`;
  },
});
