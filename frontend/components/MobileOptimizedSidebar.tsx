"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, History, User, FolderOpen, Palette, BarChart3, CreditCard, Settings, HelpCircle, Bell, Menu, X, Home, ChevronRight, Search } from 'lucide-react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Auth } from "@/components/Auth";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileOptimizedSidebar({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const mainLinks = [
    {
      label: "Generate",
      href: "/",
      icon: <Sparkles className="h-5 w-5" />,
      description: "Create new domains"
    },
    {
      label: "Domain Manager",
      href: "/domains",
      icon: <FolderOpen className="h-5 w-5" />,
      badge: 12,
      description: "Manage your domains"
    },
    {
      label: "Branding Kit",
      href: "/branding",
      icon: <Palette className="h-5 w-5" />,
      isNew: true,
      description: "Create brand assets"
    },
    {
      label: "Analytics",
      href: "/analytics",
      icon: <BarChart3 className="h-5 w-5" />,
      description: "View performance data"
    }
  ];

  const accountLinks = [
    {
      label: "History",
      href: "/history",
      icon: <History className="h-5 w-5" />,
      description: "Generation history"
    },
    {
      label: "Subscription",
      href: "/subscription",
      icon: <CreditCard className="h-5 w-5" />,
      description: "Manage billing"
    },
    {
      label: "Profile",
      href: "/profile",
      icon: <User className="h-5 w-5" />,
      description: "Account settings"
    }
  ];

  const supportLinks = [
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
      description: "App preferences"
    },
    {
      label: "Help & Support",
      href: "/help",
      icon: <HelpCircle className="h-5 w-5" />,
      description: "Get assistance"
    }
  ];

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const NavSection = ({ title, links, sectionKey }: { 
    title: string; 
    links: any[]; 
    sectionKey: string;
  }) => (
    <div className="space-y-1">
      <button
        onClick={() => setActiveSection(activeSection === sectionKey ? null : sectionKey)}
        className="flex items-center justify-between w-full px-4 py-3 text-left text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <span>{title}</span>
        <ChevronRight 
          className={cn(
            "h-4 w-4 transition-transform",
            activeSection === sectionKey && "rotate-90"
          )} 
        />
      </button>
      
      <AnimatePresence>
        {activeSection === sectionKey && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-1 pl-4">
              {links.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    pathname === link.href
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                      : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                  )}
                >
                  <div className="flex-shrink-0">
                    {link.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{link.label}</span>
                      {link.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {link.badge}
                        </Badge>
                      )}
                      {link.isNew && (
                        <Badge className="bg-green-500 text-white text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {link.description}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50 md:hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex-shrink-0" />
                <span className="font-semibold text-lg">Domain AI</span>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close mobile navigation">
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-b bg-gray-50">
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" className="h-10" aria-label="Start generating domains">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate
                </Button>
                <Button variant="outline" size="sm" className="h-10 relative" aria-label="View alerts">
                  <Bell className="h-4 w-4 mr-2" />
                  Alerts
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">3</Badge>
                </Button>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <NavSection title="Main" links={mainLinks} sectionKey="main" />
              <NavSection title="Account" links={accountLinks} sectionKey="account" />
              <NavSection title="Support" links={supportLinks} sectionKey="support" />
            </div>

            {/* User Profile */}
            <div className="border-t p-4">
              <Auth />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Bottom Navigation for Mobile
export function MobileBottomNav() {
  const pathname = usePathname();
  
  const bottomNavItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/domains", icon: FolderOpen, label: "Domains", badge: 12 },
    { href: "/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/profile", icon: User, label: "Profile" }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-30">
      <div className="grid grid-cols-4 h-16">
        {bottomNavItems.map(({ href, icon: Icon, label, badge }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 relative transition-colors",
              pathname === href
                ? "text-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900 active:bg-gray-100"
            )}
          >
            <div className="relative">
              <Icon className="h-5 w-5" />
              {badge && (
                <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs">
                  {badge}
                </Badge>
              )}
            </div>
            <span className="text-xs font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
