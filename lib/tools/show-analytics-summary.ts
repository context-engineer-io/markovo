import { tool } from "ai";
import { z } from "zod";
import type { AnalyticsSummary } from "@/types/dashboard";
import { broadcastEvent } from "./broadcast";

const MOCK_ANALYTICS_SUMMARY: AnalyticsSummary = {
  totalVisitors: 3847,
  totalConversions: 265,
  conversionRate: 6.89,
  topChannels: [
    { name: "Organic Search", value: 1423 },
    { name: "Social Media", value: 987 },
    { name: "Email", value: 756 },
    { name: "Direct", value: 681 },
  ],
  revenueToday: 14540,
  revenueTrend: 12.3,
};

export const showAnalyticsSummary = tool({
  description:
    "Show an analytics overview on the dashboard. Use when the user asks about traffic, conversions, revenue, or overall performance.",

  inputSchema: z.object({
    period: z
      .enum(["today", "week", "month"])
      .optional()
      .describe("Time period for analytics"),
  }),

  execute: async () => {
    const summary = MOCK_ANALYTICS_SUMMARY;

    await broadcastEvent({
      type: "analytics_summary",
      payload: summary,
      timestamp: new Date().toISOString(),
    });

    return `Analytics summary displayed on the dashboard. Today: ${summary.totalVisitors} visitors, ${summary.totalConversions} conversions (${summary.conversionRate}% rate), $${summary.revenueToday} revenue (+${summary.revenueTrend}%).`;
  },
});
