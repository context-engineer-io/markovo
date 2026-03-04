import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Share2, Mail, Megaphone } from "lucide-react";

export const metadata: Metadata = {
  title: "Content — Intent",
  description: "Manage your marketing content",
};

const contentSections = [
  {
    title: "Blog Posts",
    description: "Create and manage blog articles",
    icon: FileText,
    count: 0,
  },
  {
    title: "Social Media",
    description: "Schedule and manage social posts",
    icon: Share2,
    count: 0,
  },
  {
    title: "Email Campaigns",
    description: "Draft and send email content",
    icon: Mail,
    count: 0,
  },
  {
    title: "Ad Copy",
    description: "Create ad variations and copy",
    icon: Megaphone,
    count: 0,
  },
];

export default function ContentPage() {
  return (
    <div className="space-y-6">
      <section aria-label="Content categories">
        <div className="grid gap-4 sm:grid-cols-2">
          {contentSections.map(({ title, description, icon: Icon, count }) => (
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
                    ? `${count} items`
                    : "No items yet — use the AI chat to generate content"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
