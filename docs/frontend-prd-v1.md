# Frontend PRD - Phase 1 Day 3
## AI Domain Name Tool Frontend

### Overview
Simple, functional frontend for the AI Domain Name Tool MVP. This frontend connects to the existing backend APIs to provide basic domain generation functionality.

### Objectives
- Provide basic user interface for domain generation
- Display generated domains with availability status
- Show user generation history
- Create intuitive user flows for MVP testing

### Target Audience
- Users testing the MVP functionality
- Basic domain name generation needs
- Simple, clean interface requirements

---

## Core Features (Phase 1 Day 3)

### 1. Domain Generation Interface
**Purpose**: Allow users to generate domain names using AI

**Components**:
- Text input field for business description/prompt
- Generate button
- Loading state during generation
- Display of generated domains (5 domains per generation)

**User Flow**:
1. User enters business description
2. Clicks "Generate Domains"
3. System shows loading state
4. Displays 5 generated domain names
5. Shows availability status for each domain

**Data Handling**:
- Accept user input for business description
- Display generated domain results
- Handle loading and error states

### 2. Domain Availability Checking
**Purpose**: Check if generated domains are available

**Components**:
- "Check Availability" button for each domain
- Availability status indicator (Available/Not Available)
- Loading state during checking

**User Flow**:
1. User clicks "Check Availability" on a domain
2. System shows loading state
3. Displays availability result
4. Option to check multiple domains

**Data Handling**:
- Display availability status for domains
- Handle availability checking interactions
- Show loading states during checks

### 3. User History Display
**Purpose**: Show user's previous domain generation sessions

**Components**:
- List of previous generation sessions
- Session details (prompt, date, model used)
- Domain suggestions for each session
- Pagination (if needed)

**User Flow**:
1. User navigates to history page
2. System loads user's generation history
3. Displays sessions in chronological order
4. Shows domains generated in each session

**Data Handling**:
- Display user generation history
- Handle pagination for history display
- Show session and domain data

### 4. Sidebar Navigation
**Purpose**: Provide intuitive navigation and user profile access

**Components**:
- Collapsible sidebar with smooth animations
- Navigation links with icons
- User profile section
- Mobile-responsive hamburger menu

**User Flow**:
1. User sees collapsible sidebar on desktop
2. Sidebar expands on hover (desktop) or click (mobile)
3. User can navigate between sections
4. User profile accessible from sidebar

**Data Handling**:
- Display navigation state
- Show user profile information
- Handle sidebar open/close interactions

### 5. Basic Authentication
**Purpose**: Identify users and track their sessions

**Components**:
- Simple login/logout functionality
- User profile display
- Authentication state management

**User Flow**:
1. User logs in (Google OAuth via Supabase)
2. System maintains authentication state
3. User can access protected features
4. User can log out

**Data Handling**:
- Display user authentication state
- Show user profile information
- Handle login/logout interactions

---

## Technical Requirements

### Technology Stack
- **Framework**: Next.js with TypeScript
- **Styling**: Tailwind CSS for simple styling
- **State Management**: React hooks (useState, useEffect)
- **Authentication**: Supabase Auth UI
- **Animations**: Framer Motion for smooth interactions

### Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── sidebar.tsx
│   │   │   └── demo.tsx
│   │   ├── DomainGenerator.tsx
│   │   ├── DomainList.tsx
│   │   ├── UserHistory.tsx
│   │   ├── Auth.tsx
│   │   └── Loading.tsx
│   ├── lib/
│   │   └── utils.ts
│   ├── types/
│   │   └── index.ts
│   ├── app/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── globals.css
├── package.json
├── tailwind.config.js
└── next.config.js
```

### Data Structure
**Mock Data Examples**:
- Domain generation results
- User history data
- Authentication state
- Error and loading states

### Environment Configuration
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Required Dependencies
```bash
npm install framer-motion lucide-react next
```

### Sidebar Component Implementation

**File**: `/components/ui/sidebar.tsx`
```tsx
"use client";

import { cn } from "@/lib/utils";
import Link, { LinkProps } from "next/link";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
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
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-10 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-neutral-100 dark:bg-neutral-800 w-full"
        )}
        {...props}
      >
        <div className="flex justify-end z-20 w-full">
          <Menu
            className="text-neutral-800 dark:text-neutral-200 cursor-pointer"
            onClick={() => setOpen(!open)}
          />
        </div>
        <AnimatePresence>
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
                "fixed h-full w-full inset-0 bg-white dark:bg-neutral-900 p-10 z-[100] flex flex-col justify-between",
                className
              )}
            >
              <div
                className="absolute right-10 top-10 z-50 text-neutral-800 dark:text-neutral-200 cursor-pointer"
                onClick={() => setOpen(!open)}
              >
                <X />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
  props?: LinkProps;
}) => {
  const { open, animate } = useSidebar();
  return (
    <Link
      href={link.href}
      className={cn(
        "flex items-center justify-start gap-2 group/sidebar py-2",
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
        className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </Link>
  );
};
```

**File**: `/components/ui/demo.tsx`
```tsx
"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { LayoutDashboard, UserCog, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function SidebarDemo() {
  const links = [
    {
      label: "Dashboard",
      href: "#",
      icon: (
        <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Profile",
      href: "#",
      icon: (
        <UserCog className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Settings",
      href: "#",
      icon: (
        <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Logout",
      href: "#",
      icon: (
        <LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 max-w-7xl mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-[60vh]" // for your use case, use `h-screen` instead of `h-[60vh]`
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: "Manu Arora",
                href: "#",
                icon: (
                  <Image
                    src="https://assets.aceternity.com/manu.png"
                    className="h-7 w-7 flex-shrink-0 rounded-full"
                    width={50}
                    height={50}
                    alt="Avatar"
                  />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <Dashboard />
    </div>
  );
}

export const Logo = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        Acet Labs
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};

// Dummy dashboard component with content
const Dashboard = () => {
  return (
    <div className="flex flex-1">
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        <div className="flex gap-2">
          {[...new Array(4)].map((i) => (
            <div
              key={"first-array" + i}
              className="h-20 w-full rounded-lg  bg-gray-100 dark:bg-neutral-800 animate-pulse"
            ></div>
          ))}
        </div>
        <div className="flex gap-2 flex-1">
          {[...new Array(2)].map((i) => (
            <div
              key={"second-array" + i}
              className="h-full w-full rounded-lg  bg-gray-100 dark:bg-neutral-800 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

---

## User Interface Design

### Layout
- **Sidebar**: Navigation, user profile, collapsible design
- **Main Content**: Domain generation form and results
- **Responsive**: Mobile-friendly sidebar with hamburger menu
- **Animations**: Smooth transitions and interactions

### Pages
1. **Home Page**: Domain generation interface
2. **History Page**: User generation history
3. **Profile Page**: User information and settings

### Design Principles
- **Simple**: Clean, minimal interface
- **Functional**: Focus on usability over aesthetics
- **Responsive**: Works on desktop and mobile with collapsible sidebar
- **Accessible**: Basic accessibility compliance
- **Animated**: Smooth transitions and micro-interactions

---

## Success Criteria

### Functional Requirements
- ✅ User can input business description for domain generation
- ✅ User can view generated domain names
- ✅ User can see domain availability status
- ✅ User can view generation history
- ✅ User can navigate using collapsible sidebar
- ✅ User can authenticate and maintain session
- ✅ Error handling works correctly
- ✅ Loading states are implemented

### Non-Functional Requirements
- ✅ Page loads in under 3 seconds
- ✅ Responsive design works on mobile
- ✅ No critical JavaScript errors
- ✅ API calls handle errors gracefully

### Testing Requirements
- ✅ Manual testing of all user flows
- ✅ UI component testing
- ✅ Authentication flow testing
- ✅ Error scenario testing

---

## Deliverables

### Code Deliverables
- Complete Next.js application
- UI components and interfaces including sidebar
- Authentication integration
- Basic styling with Tailwind CSS
- TypeScript type definitions
- Framer Motion animations

### Documentation Deliverables
- Setup instructions
- Component documentation
- Basic user manual

### Testing Deliverables
- Manual test results
- Bug report (if any)
- Performance validation

---

## Constraints & Limitations

### Phase 1 Limitations
- No advanced UI/UX features beyond basic sidebar
- No complex animations beyond Framer Motion basics
- No advanced error handling
- No offline functionality
- No advanced styling or branding

### Technical Constraints
- Must use Supabase for authentication
- Must be responsive for mobile devices
- Must handle basic error scenarios
- Must work with mock data for development

---

## Timeline

### Day 3 Implementation (8 hours)
- **Morning (4 hours)**:
  - Set up Next.js project with TypeScript
  - Implement sidebar navigation with Framer Motion
  - Create UI components and interfaces
  - Implement domain generation interface

- **Afternoon (4 hours)**:
  - Implement authentication integration
  - Create user history display
  - Add error handling and loading states
  - Test UI functionality

### Success Metrics
- All UI components working
- User interface functional
- Authentication flow working
- Ready for user testing
- No critical bugs

---

## Future Considerations (Phase 2+)

### Not Included in Phase 1
- Advanced UI/UX design
- Complex animations
- Advanced error handling
- Offline functionality
- Advanced styling and branding
- Performance optimizations
- Advanced accessibility features

### Phase 2 Enhancements
- Professional UI/UX design
- Advanced animations and interactions
- Comprehensive error handling
- Performance optimizations
- Advanced accessibility features
- Mobile app development
- Advanced user features
- Enhanced sidebar with more navigation options

---

## Conclusion

This frontend PRD focuses on delivering a **functional, simple MVP** with a clean user interface. The goal is to provide an intuitive user experience for domain generation and history viewing, enabling user testing of the interface design and user flows.

The implementation prioritizes **usability over aesthetics**, ensuring that all UI components work correctly and users can easily interact with the domain generation features.

**Success**: A working frontend interface that allows users to test the complete user experience and provides feedback for Phase 2 development.
