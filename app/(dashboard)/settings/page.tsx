import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Plug, Sliders } from "lucide-react";

export const metadata: Metadata = {
  title: "Settings — Intent",
  description: "Account and application settings",
};

const settingsSections = [
  {
    title: "Account",
    description: "Manage your account details and subscription",
    icon: User,
  },
  {
    title: "Integrations",
    description: "Connect Shopify, social accounts, email providers",
    icon: Plug,
  },
  {
    title: "Preferences",
    description: "Notification settings, theme, and AI behavior",
    icon: Sliders,
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <section aria-label="Settings sections">
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
          {settingsSections.map(({ title, description, icon: Icon }) => (
            <Card key={title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="size-4" aria-hidden="true" />
                  {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Coming soon</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
