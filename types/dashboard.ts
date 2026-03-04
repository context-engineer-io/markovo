export interface ContentUpdate {
  id: string;
  title: string;
  type: "blog" | "social" | "email" | "ad";
  status: "draft" | "review" | "published" | "scheduled";
  summary: string;
  updatedAt: string;
}

export interface CampaignMetric {
  id: string;
  name: string;
  channel: "email" | "social" | "ppc" | "seo";
  status: "active" | "paused" | "completed";
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
}

export interface AnalyticsSummary {
  totalVisitors: number;
  totalConversions: number;
  conversionRate: number;
  topChannels: { name: string; value: number }[];
  revenueToday: number;
  revenueTrend: number;
}

export type DashboardEventType =
  | "content_updates"
  | "campaign_metrics"
  | "analytics_summary";

export interface DashboardEvent<T = unknown> {
  type: DashboardEventType;
  payload: T;
  timestamp: string;
}

export interface ContentUpdatesEvent extends DashboardEvent<ContentUpdate[]> {
  type: "content_updates";
}

export interface CampaignMetricsEvent extends DashboardEvent<CampaignMetric[]> {
  type: "campaign_metrics";
}

export interface AnalyticsSummaryEvent extends DashboardEvent<AnalyticsSummary> {
  type: "analytics_summary";
}

export type DashboardUpdatedEvent =
  | ContentUpdatesEvent
  | CampaignMetricsEvent
  | AnalyticsSummaryEvent;
