"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Wand2 } from 'lucide-react';
import { Loading } from "./Loading";
import { DomainList } from "./DomainList";
import { mockDomains } from "@/lib/utils";
import type { Domain, GenerationRequest } from "@/types";

export function DomainGenerator() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    
    // Simulate API call
    setTimeout(() => {
      setDomains(mockDomains);
      setHasGenerated(true);
      setIsGenerating(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            Generate Domain Names
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="business-description" className="text-sm font-medium">
              Describe your business or project
            </label>
            <Textarea
              id="business-description"
              placeholder="e.g., AI-powered fitness tracking app for busy professionals"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              className="min-h-[100px] resize-none"
              disabled={isGenerating}
            />
          </div>
          
          <Button 
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <Loading message="Generating domains..." size="sm" />
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate Domain Names
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {hasGenerated && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Domains</CardTitle>
          </CardHeader>
          <CardContent>
            <DomainList domains={domains} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
