"use client";

import * as React from "react"
import Link, { LinkProps } from "next/link"
import { motion } from "framer-motion"
import { Menu, X, Bell } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
  badge?: number;
  isNew?: boolean;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

export const SidebarContext = React.createContext<SidebarContextProps | undefined>(undefined);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

export function useSidebarOptional(): SidebarContextProps | undefined {
  return React.useContext(SidebarContext);
}

export function SidebarProvider({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) {
  const [openState, setOpenState] = React.useState(false);
  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function Sidebar({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
}

export function SidebarBody(props: React.ComponentProps<typeof motion.div>) {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
}

export function DesktopSidebar({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        "h-full px-4 py-4 hidden md:flex md:flex-col bg-neutral-100 dark:bg-neutral-800 w-[300px] flex-shrink-0",
        className
      )}
      animate={{
        width: animate ? (open ? "300px" : "60px") : "300px",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      data-collapsed={!open}
      {...props}
    >
      <div className={cn("flex flex-col h-full group")} data-collapsed={!open}>
        {children}
      </div>
    </motion.div>
  );
}

export function MobileSidebar({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-16 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-neutral-100 dark:bg-neutral-800 w-full border-b border-neutral-200 dark:border-neutral-700"
        )}
        {...props}
      >
        <div className="flex items-center justify-between w-full">
          <div className="font-semibold">Domain AI</div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">3</Badge>
            </Button>
            <Menu
              className="text-neutral-800 dark:text-neutral-200 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => setOpen(!open)}
            />
          </div>
        </div>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className={cn(
              "fixed h-full w-full inset-0 bg-white dark:bg-neutral-900 p-6 z-[100] flex flex-col",
              className
            )}
          >
            <div
              className="absolute right-6 top-6 z-50 text-neutral-800 dark:text-neutral-200 cursor-pointer hover:text-red-600 transition-colors"
              onClick={() => setOpen(!open)}
            >
              <X />
            </div>
            <div className="flex flex-col h-full pt-12">
              {children}
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}

export function SidebarLink({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
  props?: LinkProps;
}) {
  const { open, animate } = useSidebar();
  return (
    <Link
      href={link.href}
      className={cn(
        "flex items-center justify-start gap-2 group/sidebar py-2 px-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors relative",
        className
      )}
      {...props}
    >
      {link.icon}
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0 flex-1"
      >
        {link.label}
      </motion.span>
      
      {link.badge && open && (
        <Badge variant="secondary" className="ml-auto">
          {link.badge}
        </Badge>
      )}
      
      {link.isNew && open && (
        <Badge className="ml-auto bg-green-500 text-white">
          New
        </Badge>
      )}
    </Link>
  );
}

export function SidebarSection({
  title,
  children,
  className
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { open } = useSidebar();

  return (
    <div className={cn("space-y-2", className)}>
      {title ? (
        <div
          className={cn(
            "px-2 h-6 flex items-center",
            open ? "justify-start" : "justify-center"
          )}
        >
          {open ? (
            <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              {title}
            </div>
          ) : (
            <div
              aria-hidden="true"
              className="h-[1px] w-6 bg-neutral-300 dark:bg-neutral-700 rounded"
              title={title}
            />
          )}
        </div>
      ) : null}
      {children}
    </div>
  );
}
