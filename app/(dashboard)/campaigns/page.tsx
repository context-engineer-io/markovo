import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Megaphone, Mail, Share2, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Campaigns — Intent",
  description: "Manage your marketing campaigns",
};

const campaignTypes = [
  {
    title: "Active Campaigns",
    description: "Currently running campaigns across all channels",
    icon: Megaphone,
    count: 0,
  },
  {
    title: "Email Campaigns",
    description: "Email marketing automation and drip sequences",
    icon: Mail,
    count: 0,
  },
  {
    title: "Social Campaigns",
    description: "Social media advertising and organic campaigns",
    icon: Share2,
    count: 0,
  },
  {
    title: "SEO Campaigns",
    description: "Search engine optimization initiatives",
    icon: Search,
    count: 0,
  },
];

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <section aria-label="Campaign types">
        <div className="grid gap-4 sm:grid-cols-2">
          {campaignTypes.map(({ title, description, icon: Icon, count }) => (
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
                  {count > 0
                    ? `${count} campaigns`
                    : "No campaigns yet — ask the AI chat to show campaign metrics"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
