"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, Calendar, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import { DomainList } from "./DomainList";
import { Loading } from "./Loading";
import { mockGenerationHistory } from "@/lib/utils";
import type { GenerationSession } from "@/types";

export function UserHistory() {
  const [sessions, setSessions] = useState<GenerationSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSessions(mockGenerationHistory);
      setLoading(false);
    }, 1000);
  }, []);

  const toggleSession = (sessionId: string) => {
    setExpandedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <Loading message="Loading your generation history..." />
        </CardContent>
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <History className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No generation history</h3>
          <p className="text-neutral-600">
            Start generating domain names to see your history here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <History className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Generation History</h2>
        <Badge variant="secondary">{sessions.length} sessions</Badge>
      </div>

      {sessions.map((session) => {
        const isExpanded = expandedSessions.has(session.id);
        
        return (
          <Card key={session.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base mb-2">
                    {session.prompt}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-neutral-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(session.createdAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Brain className="h-3 w-3" />
                      {session.model}
                    </div>
                    <Badge variant="outline">
                      {session.domains.length} domains
                    </Badge>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSession(session.id)}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            
            {isExpanded && (
              <CardContent className="pt-0">
                <DomainList domains={session.domains} />
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
