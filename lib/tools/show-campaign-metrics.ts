import { tool } from "ai";
import { z } from "zod";
import type { CampaignMetric } from "@/types/dashboard";
import { broadcastEvent } from "./broadcast";

/**
 * Tool: Show Campaign Metrics
 *
 * Displays campaign performance metrics (impressions, clicks, conversions, ROI) on the dashboard.
 * Optionally filters by marketing channel (email, social, PPC, SEO).
 */
export const showCampaignMetrics = tool({
  description:
    "Show campaign performance metrics on the dashboard. Use when the user asks about campaigns, performance, ROI, or marketing metrics.",
  inputSchema: z.object({
    channel: z
      .enum(["email", "social", "ppc", "seo"])
      .optional()
      .describe("Filter by marketing channel"),
  }),
  execute: async ({ channel }) => {
    // Mock data - in production, this would fetch from a database/analytics service
    const metrics = [
      {
        id: "1",
        name: "Spring Email Blast",
        channel: "email" as const,
        status: "active" as const,
        impressions: 12500,
        clicks: 1875,
        conversions: 94,
        spend: 150,
        revenue: 4700,
      },
      {
        id: "2",
        name: "Instagram Growth",
        channel: "social" as const,
        status: "active" as const,
        impressions: 45000,
        clicks: 3200,
        conversions: 128,
        spend: 500,
        revenue: 6400,
      },
      {
        id: "3",
        name: "Google Ads — Brand",
        channel: "ppc" as const,
        status: "active" as const,
        impressions: 8900,
        clicks: 712,
        conversions: 43,
        spend: 890,
        revenue: 3440,
      },
    ].filter(
      (m) => !channel || m.channel === channel
    ) satisfies CampaignMetric[];

    // Broadcast to Socket.IO for real-time dashboard update
    await broadcastEvent({
      type: "campaign_metrics",
      payload: metrics,
      timestamp: new Date().toISOString(),
    });

    return `Showing ${metrics.length} campaign metrics on the dashboard.`;
  },
});
