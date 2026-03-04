import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, stepCountIs, convertToModelMessages } from "ai";
import type { UIMessage } from "ai";
import {
  showContentUpdates,
  showCampaignMetrics,
  showAnalyticsSummary,
} from "@/lib/tools";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: UIMessage[] };
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: google(process.env.GOOGLE_MODEL_ID || "gemini-2.5-pro-latest"),
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
