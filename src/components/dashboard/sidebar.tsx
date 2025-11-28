"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import { NAVIGATION, SETTINGS_NAVIGATION, LEVEL_TITLES } from "@/constants";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  Users,
  Home,
  Calendar,
  FileCheck,
  Camera,
  BarChart3,
  Building,
  Database,
  Settings,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Award,
  PiggyBank,
  CreditCard,
  Plug,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  FileText,
  FolderKanban,
  Users,
  Home,
  Calendar,
  FileCheck,
  Camera,
  BarChart3,
  Building,
  Database,
  Settings,
  PiggyBank,
  CreditCard,
  Trophy,
  Plug,
};

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarCollapsed, company } = useAppStore();

  // デモ用のレベルデータ
  const level = company?.level ?? 42;
  const xp = company?.xp ?? 8420;
  const xpForNextLevel = level * 200;
  const xpProgress = (xp % xpForNextLevel) / xpForNextLevel * 100;

  const currentTitle = LEVEL_TITLES.slice()
    .reverse()
    .find((t) => level >= t.minLevel)?.title ?? "見習い";

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "flex flex-col border-r bg-background transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!sidebarCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <Home className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">LinK HOUSE OS</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={cn(sidebarCollapsed && "mx-auto")}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="flex flex-col gap-1 px-2">
            {NAVIGATION.map((item) => {
              const Icon = iconMap[item.icon];
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

              if (sidebarCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-md mx-auto",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        {Icon && <Icon className="h-5 w-5" />}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  {Icon && <Icon className="h-5 w-5" />}
                  <span>{item.title}</span>
                </Link>
              );
            })}

            <Separator className="my-4" />

            {/* Settings */}
            {SETTINGS_NAVIGATION.map((item) => {
              const Icon = iconMap[item.icon];
              const isActive = pathname === item.href;

              if (sidebarCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-md mx-auto",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        {Icon && <Icon className="h-5 w-5" />}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  {Icon && <Icon className="h-5 w-5" />}
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Gamification Status */}
        {!sidebarCollapsed && (
          <div className="border-t p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">Lv.{level}</span>
              <Badge variant="secondary" className="ml-auto">
                {currentTitle}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>XP: {xp.toLocaleString()}</span>
                <span>{Math.round(xpProgress)}%</span>
              </div>
              <Progress value={xpProgress} className="h-2" />
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Award className="h-4 w-4" />
              <span>12 バッジ獲得</span>
            </div>
          </div>
        )}

        {sidebarCollapsed && (
          <div className="border-t p-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center gap-1 py-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span className="text-xs font-medium">Lv.{level}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div>
                  <p className="font-medium">{currentTitle}</p>
                  <p className="text-xs">XP: {xp.toLocaleString()}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}
