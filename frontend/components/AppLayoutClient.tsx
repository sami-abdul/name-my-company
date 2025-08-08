"use client";

import { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink, SidebarSection } from "@/components/ui/sidebar";
import { MobileOptimizedSidebar, MobileBottomNav } from "@/components/MobileOptimizedSidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Auth } from "@/components/Auth";
import { Sparkles, History, User, FolderOpen, Palette, BarChart3, CreditCard, Settings, HelpCircle, Bell, Menu } from 'lucide-react';
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
const [sidebarOpen, setSidebarOpen] = useState(false);
const [mobileNavOpen, setMobileNavOpen] = useState(false);

const mainLinks = [
  {
    label: "Generate",
    href: "/",
    icon: <Sparkles className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
  },
  {
    label: "Domain Manager",
    href: "/domains",
    icon: <FolderOpen className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
    badge: 12
  },
  {
    label: "Branding Kit",
    href: "/branding",
    icon: <Palette className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
    isNew: true
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: <BarChart3 className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
  }
];

const accountLinks = [
  {
    label: "History",
    href: "/history",
    icon: <History className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
  },
  {
    label: "Subscription",
    href: "/subscription",
    icon: <CreditCard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
  },
  {
    label: "Profile",
    href: "/profile",
    icon: <User className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
  }
];

const supportLinks = [
  {
    label: "Settings",
    href: "/settings",
    icon: <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
  },
  {
    label: "Help & Support",
    href: "/help",
    icon: <HelpCircle className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
  }
];

return (
  <div className={cn(
    "flex flex-col md:flex-row bg-gray-50 dark:bg-neutral-800 w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
    "min-h-screen"
  )}>
    {/* Mobile Header */}
    <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
        <span className="font-semibold">Name My Company</span>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="ghost" size="sm" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">3</Badge>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setMobileNavOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </div>

    {/* Desktop Sidebar */}
    <div className="hidden md:block">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <Logo />
            
            {/* Removed Quick Actions */}

            {/* Main Navigation */}
            <div className="mt-8 space-y-6">
              <SidebarSection title="Main">
                {mainLinks.map((link, idx) => (
                  <SidebarLink key={idx} link={link} />
                ))}
              </SidebarSection>

              <SidebarSection title="Account">
                {accountLinks.map((link, idx) => (
                  <SidebarLink key={idx} link={link} />
                ))}
              </SidebarSection>

              <SidebarSection title="Support">
                {supportLinks.map((link, idx) => (
                  <SidebarLink key={idx} link={link} />
                ))}
              </SidebarSection>
            </div>
          </div>
          
          {/* Bottom section: Theme and Profile */}
          <div className="mt-auto border-t border-neutral-200 dark:border-neutral-700 pt-4 space-y-3">
            <div className="px-2">
              <ThemeToggle />
            </div>
            <Auth />
          </div>
        </SidebarBody>
      </Sidebar>
    </div>

    {/* Mobile Sidebar */}
    <MobileOptimizedSidebar 
      isOpen={mobileNavOpen} 
      onClose={() => setMobileNavOpen(false)} 
    />
    
    {/* Main Content */}
    <div className="flex flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto bg-white dark:bg-neutral-900 pb-20 md:pb-0">
        {children}
      </div>
    </div>

    {/* Mobile Bottom Navigation */}
    <MobileBottomNav />
  </div>
);
}

function Logo() {
return (
  <Link
    href="/"
    className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
  >
    <div className="h-5 w-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="font-medium text-black dark:text-white whitespace-pre"
    >
      Name My Company
    </motion.span>
  </Link>
);
}

// Import useSidebar hook
// import { useSidebar } from "@/components/ui/sidebar"; // not used here
