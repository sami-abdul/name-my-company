"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogIn, LogOut, User } from 'lucide-react';
import { mockUser } from "@/lib/utils";
import type { User as UserType } from "@/types";
import { cn } from "@/lib/utils"; // Assuming cn is a utility function for class names

export function Auth() {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking authentication state
    setTimeout(() => {
      setUser(mockUser);
      setLoading(false);
    }, 1000);
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    // Simulate login
    setTimeout(() => {
      setUser(mockUser);
      setLoading(false);
    }, 1500);
  };

  const handleLogout = async () => {
    setLoading(true);
    // Simulate logout
    setTimeout(() => {
      setUser(null);
      setLoading(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 group-data-[collapsed=true]:justify-center">
        <div className="animate-pulse flex items-center gap-2 group-data-[collapsed=true]:gap-0">
          <div className="h-8 w-8 bg-neutral-200 rounded-full group-data-[collapsed=true]:h-10 group-data-[collapsed=true]:w-10"></div>
          <div className="h-4 w-20 bg-neutral-200 rounded group-data-[collapsed=true]:hidden"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 group-data-[collapsed=true]:p-2 group-data-[collapsed=true]:flex group-data-[collapsed=true]:justify-center">
        <div className="text-center mb-3 group-data-[collapsed=true]:hidden">
          <div className="text-sm font-medium mb-1">Welcome</div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Sign in to access all features
          </p>
        </div>
        <Button onClick={handleLogin} className="w-full h-8 text-xs group-data-[collapsed=true]:w-8 group-data-[collapsed=true]:p-0">
          <span className="group-data-[collapsed=true]:hidden">Sign in with Google</span>
          <LogIn className="h-4 w-4 group-data-[collapsed=true]:block hidden" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors",
      "group-data-[collapsed=true]:justify-center group-data-[collapsed=true]:gap-0"
    )}>
      <Avatar className="h-8 w-8 group-data-[collapsed=true]:h-10 group-data-[collapsed=true]:w-10">
        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
        <AvatarFallback className="bg-blue-500 text-white text-sm">
          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0 group-data-[collapsed=true]:hidden">
        <div className="font-medium truncate text-sm">{user.name}</div>
        <div className="text-xs text-neutral-600 dark:text-neutral-400 truncate">{user.email}</div>
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleLogout}
        className="h-8 w-8 p-0 hover:bg-neutral-200 dark:hover:bg-neutral-700 group-data-[collapsed=true]:hidden"
        aria-label="Sign out"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
