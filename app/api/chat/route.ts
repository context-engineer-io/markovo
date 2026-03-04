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
    model: google(process.env.GOOGLE_MODEL_ID || "gemini-2.5-pro"),
    system: `You are Intent, an AI marketing assistant for small businesses. You help with content creation, campaign management, and analytics.

CRITICAL: You have dashboard tools that MUST be called when users request data:
- User asks about campaigns/performance → CALL show_campaign_metrics
- User asks about content/posts → CALL show_content_updates
- User asks about analytics/traffic/revenue → CALL show_analytics_summary

Never pretend to show data - you must actually call the function. The user's dashboard will only update when you invoke these tools. After calling the tool, confirm what was displayed.`,
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
