"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSocketContext } from "@/components/dashboard/socket-provider";
import type {
  ContentUpdate,
  CampaignMetric,
  AnalyticsSummary,
} from "@/types/dashboard";
import {
  TrendingUp,
  Users,
  MousePointerClick,
  DollarSign,
  FileText,
} from "lucide-react";

export default function DashboardPage() {
  const { lastEvent } = useSocketContext();
  const [contentUpdates, setContentUpdates] = useState<ContentUpdate[]>([]);
  const [campaignMetrics, setCampaignMetrics] = useState<CampaignMetric[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    if (!lastEvent) return;

    switch (lastEvent.type) {
      case "content_updates":
        setContentUpdates(lastEvent.payload);
        break;
      case "campaign_metrics":
        setCampaignMetrics(lastEvent.payload);
        break;
      case "analytics_summary":
        setAnalytics(lastEvent.payload);
        break;
    }
  }, [lastEvent]);

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <section aria-label="Quick statistics">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Visitors Today"
            value={analytics?.totalVisitors ?? "—"}
            icon={Users}
          />
          <StatCard
            title="Conversions"
            value={analytics?.totalConversions ?? "—"}
            icon={MousePointerClick}
          />
          <StatCard
            title="Conversion Rate"
            value={
              analytics ? `${analytics.conversionRate}%` : "—"
            }
            icon={TrendingUp}
          />
          <StatCard
            title="Revenue Today"
            value={
              analytics
                ? `$${analytics.revenueToday.toLocaleString()}`
                : "—"
            }
            icon={DollarSign}
            trend={analytics?.revenueTrend}
          />
        </div>
      </section>

      {/* Morning Brief */}
      <Card>
        <CardHeader>
          <CardTitle>Morning Brief</CardTitle>
          <CardDescription>
            Your daily marketing summary — ask the AI chat to generate one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Open the Chat page and ask &ldquo;Show me today&apos;s analytics&rdquo; to
            populate your dashboard with live data.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-4" aria-hidden="true" />
              Recent Content
            </CardTitle>
            <CardDescription>
              {contentUpdates.length > 0
                ? `${contentUpdates.length} updates`
                : "No content updates yet"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {contentUpdates.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Ask the chat assistant to &ldquo;show content updates&rdquo;
              </p>
            ) : (
              <ul className="space-y-3">
                {contentUpdates.map((update) => (
                  <li
                    key={update.id}
                    className="flex items-start justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {update.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {update.summary}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {update.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Campaign Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-4" aria-hidden="true" />
              Campaign Performance
            </CardTitle>
            <CardDescription>
              {campaignMetrics.length > 0
                ? `${campaignMetrics.length} active campaigns`
                : "No campaign data yet"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {campaignMetrics.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Ask the chat assistant to &ldquo;show campaign metrics&rdquo;
              </p>
            ) : (
              <ul className="space-y-3">
                {campaignMetrics.map((metric) => (
                  <li
                    key={metric.id}
                    className="flex items-start justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {metric.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {metric.clicks} clicks · {metric.conversions}{" "}
                        conversions · ${metric.revenue.toLocaleString()} rev
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {metric.channel}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className="rounded-lg bg-muted p-2">
          <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend !== undefined && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              +{trend}% from yesterday
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
