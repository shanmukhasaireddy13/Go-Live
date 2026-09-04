"use client";

import React from "react";
import { UserSession } from "@/lib/domain-service";
import { SubdomainRecord } from "@/lib/types";
import {
  LayoutDashboard,
  Server,
  Radio,
  Trash2,
  Lock,
  MessageSquare,
  AlertCircle,
  BookOpen,
  Cpu
} from "lucide-react";

export type DashboardTab =
  | "overview"
  | "vercel"
  | "github-pages"
  | "render"
  | "custom"
  | "health"
  | "danger";

interface ManageSidebarProps {
  domain: SubdomainRecord;
  user: UserSession;
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  vercelToken: string | null;
  isLockedDown?: boolean;
}

export function ManageSidebar({
  domain,
  activeTab,
  onSelectTab,
  vercelToken,
  isLockedDown,
}: ManageSidebarProps) {
  const isReleased = isLockedDown || domain.isDeleted || domain.status === "RELEASED";

  return (
    <aside className="w-full md:w-64 lg:w-72 shrink-0 border-b md:border-b-0 md:border-r border-(--color-rule) bg-(--color-card) p-4 sm:p-5 flex flex-col md:h-[calc(100vh-3.5rem)] md:sticky md:top-14 overflow-y-auto">
      <div className="space-y-5">
        {/* Active Subdomain Badge */}
        <div className="p-3.5 rounded-lg bg-(--color-card-subtle) border border-(--color-rule) space-y-1">
          <div className="text-[10px] font-mono text-(--color-muted) uppercase font-bold tracking-wider">
            {isReleased ? "Released Subdomain" : "Active Subdomain"}
          </div>
          <div className="font-mono font-black text-sm text-(--color-ink) truncate" title={domain.fullDomain}>
            {domain.fullDomain}
          </div>
          <div className="flex items-center gap-1.5 pt-0.5 text-[11px] font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                isReleased
                  ? "bg-amber-500"
                  : domain.target
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-amber-500"
              }`}
            />
            <span className="font-semibold text-(--color-ink)">
              {isReleased ? "DNS Purged (Inactive)" : domain.target ? "Live Anycast" : "Awaiting Host"}
            </span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="space-y-1">
          {/* Overview */}
          <button
            type="button"
            onClick={() => onSelectTab("overview")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "overview"
                ? "bg-(--color-ink) text-(--color-paper) shadow-xs"
                : "text-(--color-muted) hover:text-(--color-ink) hover:bg-(--color-card-subtle)"
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Overview</span>
          </button>

          {/* Vercel Deploy */}
          <button
            type="button"
            onClick={() => onSelectTab("vercel")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "vercel"
                ? "bg-(--color-ink) text-(--color-paper) shadow-xs"
                : "text-(--color-muted) hover:text-(--color-ink) hover:bg-(--color-card-subtle)"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xs shrink-0 font-bold">▲</span>
              <span>Vercel Deploy</span>
            </div>
            {isReleased ? (
              <span className="text-[10px] font-mono text-amber-500 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                <span>Locked</span>
              </span>
            ) : (
              vercelToken && <span className="text-[10px] font-mono opacity-80">Connected</span>
            )}
          </button>

          {/* GitHub Pages (v1.1.0) */}
          <button
            type="button"
            onClick={() => onSelectTab("github-pages")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "github-pages"
                ? "bg-(--color-ink) text-(--color-paper) shadow-xs"
                : "text-(--color-muted) hover:text-(--color-ink) hover:bg-(--color-card-subtle)"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 shrink-0 text-indigo-500" />
              <span>GitHub Pages</span>
            </div>
            {isReleased ? (
              <span className="text-[10px] font-mono text-amber-500 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                <span>Locked</span>
              </span>
            ) : domain.target?.includes("github.io") ? (
              <span className="text-[10px] font-mono text-emerald-500 font-bold">Active</span>
            ) : null}
          </button>

          {/* Render Hosting (v1.1.0) */}
          <button
            type="button"
            onClick={() => onSelectTab("render")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "render"
                ? "bg-(--color-ink) text-(--color-paper) shadow-xs"
                : "text-(--color-muted) hover:text-(--color-ink) hover:bg-(--color-card-subtle)"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Cpu className="w-4 h-4 shrink-0 text-purple-500" />
              <span>Render Hosting</span>
            </div>
            {isReleased ? (
              <span className="text-[10px] font-mono text-amber-500 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                <span>Locked</span>
              </span>
            ) : domain.target?.includes("onrender.com") ? (
              <span className="text-[10px] font-mono text-emerald-500 font-bold">Active</span>
            ) : null}
          </button>

          {/* Custom DNS */}
          <button
            type="button"
            onClick={() => onSelectTab("custom")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "custom"
                ? "bg-(--color-ink) text-(--color-paper) shadow-xs"
                : "text-(--color-muted) hover:text-(--color-ink) hover:bg-(--color-card-subtle)"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Server className="w-4 h-4 shrink-0" />
              <span>Custom DNS</span>
            </div>
            {isReleased && (
              <span className="text-[10px] font-mono text-amber-500 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                <span>Locked</span>
              </span>
            )}
          </button>

          {/* DNS & Edge Health */}
          <button
            type="button"
            onClick={() => onSelectTab("health")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "health"
                ? "bg-(--color-ink) text-(--color-paper) shadow-xs"
                : "text-(--color-muted) hover:text-(--color-ink) hover:bg-(--color-card-subtle)"
            }`}
          >
            <Radio className="w-4 h-4 shrink-0" />
            <span>DNS &amp; Edge Health</span>
          </button>

          <div className="pt-3 border-t border-(--color-rule)/60 my-2" />

          {/* Release / Lockdown Tab */}
          <button
            type="button"
            onClick={() => onSelectTab("danger")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "danger"
                ? "bg-red-600 text-white shadow-xs"
                : isReleased
                ? "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                : "text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isReleased ? <Lock className="w-4 h-4 shrink-0" /> : <Trash2 className="w-4 h-4 shrink-0" />}
              <span>{isReleased ? "Release Status" : "Release Domain"}</span>
            </div>
            {isReleased && <span className="text-[10px] font-mono">Active</span>}
          </button>
        </nav>

        {/* Community & Support */}
        <div className="pt-4 border-t border-(--color-rule) space-y-2">
          <div className="text-[10px] font-mono text-(--color-muted) uppercase font-bold tracking-wider px-1">
            Community &amp; Support
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <a
              href="/feedback"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 p-2 rounded-md bg-(--color-card-subtle) hover:bg-(--color-rule)/50 border border-(--color-rule) text-[11px] font-mono text-(--color-ink) transition-colors"
            >
              <MessageSquare className="w-3 h-3 text-emerald-500" />
              <span>Feedback</span>
            </a>
            <a
              href="/issues"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 p-2 rounded-md bg-(--color-card-subtle) hover:bg-(--color-rule)/50 border border-(--color-rule) text-[11px] font-mono text-(--color-ink) transition-colors"
            >
              <AlertCircle className="w-3 h-3 text-amber-500" />
              <span>Issues</span>
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
