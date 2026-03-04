import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText, stepCountIs, convertToModelMessages } from "ai";
import type { UIMessage } from "ai";
import {
  showContentUpdates,
  showCampaignMetrics,
  showAnalyticsSummary,
} from "@/lib/tools";

const anthropic = createAnthropic({
  baseURL: "https://models.assistant.legogroup.io/claude/v1",
  authToken: process.env.ANTHROPIC_AUTH_TOKEN,
});

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: UIMessage[] };
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: anthropic(
      process.env.ANTHROPIC_MODEL_ID || "anthropic.claude-sonnet-4-5-20250929-v1:0"
    ),
    system: `You are Intent, an AI marketing assistant for small businesses. You help with content creation, campaign management, and analytics. When users ask to see data, use the appropriate tool to display it on their dashboard. Be concise and actionable.`,
    messages: modelMessages,
    tools: {
      show_content_updates: showContentUpdates,
      show_campaign_metrics: showCampaignMetrics,
      show_analytics_summary: showAnalyticsSummary,
    },
    stopWhen: stepCountIs(3),
  });

  return result.toUIMessageStreamResponse();
}
