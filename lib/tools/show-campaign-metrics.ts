import { tool } from "ai";
import { z } from "zod";
import type { CampaignMetric } from "@/types/dashboard";
import { broadcastEvent } from "./broadcast";

const MOCK_CAMPAIGN_METRICS: CampaignMetric[] = [
  {
    id: "1",
    name: "Spring Email Blast",
    channel: "email",
    status: "active",
    impressions: 12500,
    clicks: 1875,
    conversions: 94,
    spend: 150,
    revenue: 4700,
  },
  {
    id: "2",
    name: "Instagram Growth",
    channel: "social",
    status: "active",
    impressions: 45000,
    clicks: 3200,
    conversions: 128,
    spend: 500,
    revenue: 6400,
  },
  {
    id: "3",
    name: "Google Ads — Brand",
    channel: "ppc",
    status: "active",
    impressions: 8900,
    clicks: 712,
    conversions: 43,
    spend: 890,
    revenue: 3440,
  },
];

export const showCampaignMetrics = tool({
  description:
    "Display campaign performance metrics on the user's dashboard in real-time. REQUIRED: You must call this function when user asks to see campaigns, performance, ROI, or marketing metrics. The dashboard will update immediately with campaign data including impressions, clicks, conversions, spend, and revenue.",

  inputSchema: z.object({
    channel: z
      .enum(["email", "social", "ppc", "seo"])
      .optional()
      .describe("Filter by marketing channel. Leave empty to show all campaigns."),
  }),

  execute: async ({ channel }) => {
    const filteredMetrics = MOCK_CAMPAIGN_METRICS.filter(
      (m) => !channel || m.channel === channel
    );

    await broadcastEvent({
      type: "campaign_metrics",
      payload: filteredMetrics,
      timestamp: new Date().toISOString(),
    });

    return `Showing ${filteredMetrics.length} campaign metrics on the dashboard.`;
  },
});
