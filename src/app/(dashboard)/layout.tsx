"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarExpanded, setSidebarExpanded] = React.useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Hidden on mobile, expands on hover */}
      <div className="hidden lg:block">
        <Sidebar onHoverChange={setSidebarExpanded} />
      </div>

      {/* Main content - moves when sidebar expands */}
      <div
        className={`flex flex-col transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
          sidebarExpanded ? "lg:pl-[280px]" : "lg:pl-[72px]"
        }`}
      >
        <Header showMenuButton />

        <main className="flex-1 p-6 lg:p-8 pb-20 lg:pb-8">{children}</main>
      </div>

      {/* Mobile navigation */}
      <MobileNav />
    </div>
  );
}
