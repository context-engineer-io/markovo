import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Target } from "lucide-react";

export const metadata: Metadata = {
  title: "Analytics — Intent",
  description: "Marketing analytics and performance metrics",
};

const analyticsSections = [
  {
    title: "Traffic Overview",
    description: "Website visitors, page views, and session data",
    icon: Users,
  },
  {
    title: "Conversion Tracking",
    description: "Goal completions, funnel analysis, and attribution",
    icon: Target,
  },
  {
    title: "Revenue Metrics",
    description: "Revenue attribution, ROAS, and LTV",
    icon: TrendingUp,
  },
  {
    title: "Channel Performance",
    description: "Performance breakdown by marketing channel",
    icon: BarChart3,
  },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <section aria-label="Analytics sections">
        <div className="grid gap-4 sm:grid-cols-2">
          {analyticsSections.map(({ title, description, icon: Icon }) => (
            <Card key={title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="size-4" aria-hidden="true" />
                  {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Ask the AI chat to &ldquo;show analytics summary&rdquo; to populate
                  this dashboard
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
