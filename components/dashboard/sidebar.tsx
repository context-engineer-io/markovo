"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Megaphone,
  BarChart3,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/content", label: "Content", icon: FileText },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  focusModeEnabled?: boolean;
  onFocusModeToggle?: () => void;
}

export function Sidebar({ focusModeEnabled = false, onFocusModeToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-1 flex-col">
      <nav className="flex flex-col gap-1 p-3" aria-label="Main navigation">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Focus Mode Toggle - Desktop only */}
      {onFocusModeToggle && (
        <div className="mt-auto border-t border-border p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onFocusModeToggle}
            className="w-full justify-start gap-3 text-sm font-medium text-muted-foreground hover:text-accent-foreground"
            aria-label={focusModeEnabled ? "Disable focus mode" : "Enable focus mode"}
          >
            {focusModeEnabled ? (
              <>
                <Eye className="size-4" aria-hidden="true" />
                Show AI Assistant
              </>
            ) : (
              <>
                <EyeOff className="size-4" aria-hidden="true" />
                Focus Mode
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
