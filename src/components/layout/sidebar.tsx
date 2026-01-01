"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Kanban,
  BarChart3,
  Settings,
  AppWindow,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Panel",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Contactos",
    href: "/leads",
    icon: Users,
  },
  {
    title: "Embudo",
    href: "/pipeline",
    icon: Kanban,
  },
  {
    title: "Análisis",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Balance",
    href: "/balance",
    icon: Wallet,
  },
];

const bottomItems = [
  {
    title: "Configuración",
    href: "/configuracion",
    icon: Settings,
  },
];

interface SidebarProps {
  onHoverChange?: (expanded: boolean) => void;
}

export function Sidebar({ onHoverChange }: SidebarProps) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHoverChange?.(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHoverChange?.(false);
  };

  return (
    <motion.aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={{ width: 72 }}
      animate={{ width: isHovered ? 280 : 72 }}
      transition={{
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r shadow-sm"
    >
      {/* Logo */}
      <div className="flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-3">
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AppWindow className="h-6 w-6 text-primary-foreground" />
          </motion.div>
          <AnimatePresence>
            {isHovered && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                style={{ color: 'var(--foreground)' }}
                className="text-xl font-bold whitespace-nowrap"
              >
                SoluCRM
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Separator */}
      <div className="mx-3 h-px" style={{ backgroundColor: 'var(--border)' }} />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item, idx) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={!isActive ? { color: 'var(--muted-foreground)' } : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-black/5 dark:hover:bg-white/5"
              )}
            >
              <Icon className="h-6 w-6 shrink-0" />
              <AnimatePresence>
                {isHovered && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2, delay: 0.05 * idx }}
                    className="whitespace-nowrap"
                  >
                    {item.title}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Separator */}
      <div className="mx-3 h-px" style={{ backgroundColor: 'var(--border)' }} />

      {/* Bottom items */}
      <div className="space-y-1 px-3 py-4">
        {bottomItems.map((item, idx) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={!isActive ? { color: 'var(--muted-foreground)' } : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-black/5 dark:hover:bg-white/5"
              )}
            >
              <Icon className="h-6 w-6 shrink-0" />
              <AnimatePresence>
                {isHovered && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2, delay: 0.05 * idx }}
                    className="whitespace-nowrap"
                  >
                    {item.title}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </div>

      {/* Hover indicator */}
      <motion.div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-1 rounded-l-full bg-primary"
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: isHovered ? 60 : 0,
          opacity: isHovered ? 1 : 0
        }}
        transition={{ duration: 0.2 }}
      />
    </motion.aside>
  );
}
