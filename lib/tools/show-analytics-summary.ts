import { tool } from "ai";
import { z } from "zod";
import type { AnalyticsSummary } from "@/types/dashboard";
import { broadcastEvent } from "./broadcast";

/**
 * Tool: Show Analytics Summary
 *
 * Displays an analytics overview (visitors, conversions, revenue, top channels) on the dashboard.
 * Optionally filters by time period (today, week, month).
 */
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
    // Mock data - in production, this would fetch from Google Analytics, Mixpanel, etc.
    const summary: AnalyticsSummary = {
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

    // Broadcast to Socket.IO for real-time dashboard update
    await broadcastEvent({
      type: "analytics_summary",
      payload: summary,
      timestamp: new Date().toISOString(),
    });

    return `Analytics summary displayed on the dashboard. Today: ${summary.totalVisitors} visitors, ${summary.totalConversions} conversions (${summary.conversionRate}% rate), $${summary.revenueToday} revenue (+${summary.revenueTrend}%).`;
  },
});
