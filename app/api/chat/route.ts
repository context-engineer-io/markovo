import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText, tool, stepCountIs, convertToModelMessages } from "ai";
import type { UIMessage } from "ai";
import { z } from "zod";

const anthropic = createAnthropic({
  baseURL: "https://models.assistant.legogroup.io/claude/v1",
  authToken: process.env.ANTHROPIC_AUTH_TOKEN,
});
import type {
  AnalyticsSummary,
  CampaignMetric,
  ContentUpdate,
  DashboardUpdatedEvent,
} from "@/types/dashboard";

const SOCKET_URL = process.env.SOCKET_URL || "http://localhost:3001";

async function broadcastEvent(event: DashboardUpdatedEvent) {
  await fetch(`${SOCKET_URL}/broadcast`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });
}

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: UIMessage[] };
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: anthropic(process.env.ANTHROPIC_MODEL_ID || "anthropic.claude-sonnet-4-5-20250929-v1:0"),
    system: `You are Intent, an AI marketing assistant for small businesses. You help with content creation, campaign management, and analytics. When users ask to see data, use the appropriate tool to display it on their dashboard. Be concise and actionable.`,
    messages: modelMessages,
    tools: {
      show_content_updates: tool({
        description:
          "Show recent content updates on the dashboard. Use when the user asks about content, blog posts, social media posts, or recent updates.",
        inputSchema: z.object({
          contentType: z
            .enum(["blog", "social", "email", "ad"])
            .optional()
            .describe("Filter by content type"),
        }),
        execute: async ({ contentType }) => {
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

          await broadcastEvent({
            type: "content_updates",
            payload: updates,
            timestamp: new Date().toISOString(),
          });

          return `Showing ${updates.length} content updates on the dashboard.`;
        },
      }),

      show_campaign_metrics: tool({
        description:
          "Show campaign performance metrics on the dashboard. Use when the user asks about campaigns, performance, ROI, or marketing metrics.",
        inputSchema: z.object({
          channel: z
            .enum(["email", "social", "ppc", "seo"])
            .optional()
            .describe("Filter by marketing channel"),
        }),
        execute: async ({ channel }) => {
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

          await broadcastEvent({
            type: "campaign_metrics",
            payload: metrics,
            timestamp: new Date().toISOString(),
          });

          return `Showing ${metrics.length} campaign metrics on the dashboard.`;
        },
      }),

      show_analytics_summary: tool({
        description:
          "Show an analytics overview on the dashboard. Use when the user asks about traffic, conversions, revenue, or overall performance.",
        inputSchema: z.object({
          period: z
            .enum(["today", "week", "month"])
            .optional()
            .describe("Time period for analytics"),
        }),
        execute: async () => {
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

          await broadcastEvent({
            type: "analytics_summary",
            payload: summary,
            timestamp: new Date().toISOString(),
          });

          return `Analytics summary displayed on the dashboard. Today: ${summary.totalVisitors} visitors, ${summary.totalConversions} conversions (${summary.conversionRate}% rate), $${summary.revenueToday} revenue (+${summary.revenueTrend}%).`;
        },
      }),
    },
    stopWhen: stepCountIs(3),
  });

  return result.toUIMessageStreamResponse();
}
