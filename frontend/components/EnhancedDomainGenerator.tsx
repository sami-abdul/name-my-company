"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { TierSelector } from "@/components/ui/tier-selector";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Sparkles, Wand2, Settings, Target, Lightbulb, Users, Palette, Brain, Zap } from 'lucide-react';
import { Loading } from "./Loading";
import { DomainList } from "./DomainList";
import { mockDomains, mockUser } from "@/lib/utils";
import { BUSINESS_INDUSTRIES, BRAND_STYLES, BRAND_PERSONALITIES } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import type { Domain, GenerationRequest, SubscriptionTier, BusinessInfo } from "@/types";
import { cn } from "@/lib/utils";

export function EnhancedDomainGenerator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(mockUser.subscription.tier);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    industry: '',
    style: '',
    keywords: [],
    targetAudience: '',
    brandPersonality: []
  });
  const [prompt, setPrompt] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4");
  const [advancedSettings, setAdvancedSettings] = useState({
    creativity: 7,
    length: 'medium',
    includeNumbers: false,
    includeDashes: false,
    domainExtensions: ['.com', '.io', '.co']
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const { toast } = useToast();

  const totalSteps = selectedTier === 'free' ? 2 : 4;
  const progress = (currentStep / totalSteps) * 100;

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'Enter',
      ctrlKey: true,
      callback: () => {
        if (currentStep < totalSteps && canProceed()) {
          setCurrentStep(prev => prev + 1);
        } else if (currentStep === totalSteps && canProceed()) {
          handleGenerate();
        }
      },
      description: 'Next step or generate'
    },
    {
      key: 'Escape',
      callback: () => {
        if (hasGenerated) {
          setHasGenerated(false);
          setCurrentStep(1);
          setDomains([]);
        }
      },
      description: 'Reset generator'
    }
  ]);

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !businessInfo.keywords.includes(keywordInput.trim())) {
      setBusinessInfo(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput("");
      toast({
        title: "Keyword added",
        description: `"${keywordInput.trim()}" added to your keywords`,
        variant: "success"
      });
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setBusinessInfo(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
    toast({
      title: "Keyword removed",
      description: `"${keyword}" removed from your keywords`,
      variant: "default"
    });
  };

  const handlePersonalityToggle = (personality: string) => {
    setBusinessInfo(prev => ({
      ...prev,
      brandPersonality: prev.brandPersonality.includes(personality)
        ? prev.brandPersonality.filter(p => p !== personality)
        : [...prev.brandPersonality, personality]
    }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    toast({
      title: "Generating domains...",
      description: `Using ${selectedModel} to create ${selectedTier === 'premium' ? 'unlimited' : selectedTier === 'mid' ? '50' : '5'} domain suggestions`,
      variant: "default"
    });
    
    // Simulate API call with tier-based delay
    const delay = selectedTier === 'premium' ? 1500 : selectedTier === 'mid' ? 2500 : 3500;
    setTimeout(() => {
      setDomains(mockDomains);
      setHasGenerated(true);
      setIsGenerating(false);
      
      toast({
        title: "Domains generated!",
        description: `Successfully generated ${mockDomains.length} domain suggestions`,
        variant: "success"
      });
    }, delay);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return prompt.trim().length > 10;
      case 2:
        return selectedTier === 'free' || (businessInfo.industry && businessInfo.targetAudience);
      case 3:
        return businessInfo.keywords.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full -translate-y-16 translate-x-16" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Describe Your Project
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project-description">What are you building?</Label>
                <Textarea
                  id="project-description"
                  placeholder="e.g., AI-powered fitness tracking app for busy professionals who want to maintain healthy habits without spending hours planning workouts..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] resize-none transition-all focus:ring-2 focus:ring-blue-500"
                  maxLength={500}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Be specific about your target audience and unique value proposition</span>
                  <span className={cn(
                    "transition-colors",
                    prompt.length > 450 && "text-orange-500",
                    prompt.length > 480 && "text-red-500"
                  )}>
                    {prompt.length}/500
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>AI Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="transition-all hover:border-blue-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-purple-500" />
                        <div>
                          <div>GPT-4</div>
                          <div className="text-xs text-muted-foreground">Most creative, best quality</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="gpt-3.5">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-blue-500" />
                        <div>
                          <div>GPT-3.5</div>
                          <div className="text-xs text-muted-foreground">Faster, good quality</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-green-500/10 to-transparent rounded-full -translate-y-12 -translate-x-12" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Select value={businessInfo.industry} onValueChange={(value) => 
                    setBusinessInfo(prev => ({ ...prev, industry: value }))
                  }>
                    <SelectTrigger className="transition-all hover:border-blue-300">
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_INDUSTRIES.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Brand Style</Label>
                  <Select value={businessInfo.style} onValueChange={(value) => 
                    setBusinessInfo(prev => ({ ...prev, style: value }))
                  }>
                    <SelectTrigger className="transition-all hover:border-blue-300">
                      <SelectValue placeholder="Choose your style" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRAND_STYLES.map((style) => (
                        <SelectItem key={style} value={style}>
                          {style}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Textarea
                  placeholder="e.g., Health-conscious professionals aged 25-40 who value efficiency and data-driven insights..."
                  value={businessInfo.targetAudience}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, targetAudience: e.target.value }))}
                  className="min-h-[80px] resize-none transition-all focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-3">
                <Label>Brand Personality</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {BRAND_PERSONALITIES.map((personality) => (
                    <div key={personality} className="flex items-center space-x-2">
                      <Checkbox
                        id={personality}
                        checked={businessInfo.brandPersonality.includes(personality)}
                        onCheckedChange={() => handlePersonalityToggle(personality)}
                        className="transition-all"
                      />
                      <Label htmlFor={personality} className="text-sm font-normal cursor-pointer">
                        {personality}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-28 h-28 bg-gradient-to-tl from-purple-500/10 to-transparent rounded-full translate-y-14 translate-x-14" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Keywords & Focus
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Important Keywords</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a keyword..."
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                    className="transition-all focus:ring-2 focus:ring-purple-500"
                  />
                  <Button onClick={handleAddKeyword} variant="outline" className="shrink-0">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3 min-h-[2rem]">
                  {businessInfo.keywords.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No keywords added yet</p>
                  ) : (
                    businessInfo.keywords.map((keyword) => (
                      <Badge 
                        key={keyword} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-red-100 hover:text-red-700 transition-colors" 
                        onClick={() => handleRemoveKeyword(keyword)}
                      >
                        {keyword} ×
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-1/2 w-20 h-20 bg-gradient-to-b from-gray-500/10 to-transparent rounded-full -translate-y-10 -translate-x-10" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-500" />
                Advanced Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Creativity Level: {advancedSettings.creativity}/10</Label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={advancedSettings.creativity}
                  onChange={(e) => setAdvancedSettings(prev => ({ ...prev, creativity: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Conservative</span>
                  <span>Balanced</span>
                  <span>Creative</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Domain Length Preference</Label>
                <Select value={advancedSettings.length} onValueChange={(value) => 
                  setAdvancedSettings(prev => ({ ...prev, length: value }))
                }>
                  <SelectTrigger className="transition-all hover:border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (4-8 characters)</SelectItem>
                    <SelectItem value="medium">Medium (8-15 characters)</SelectItem>
                    <SelectItem value="long">Long (15+ characters)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Domain Options</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-numbers"
                      checked={advancedSettings.includeNumbers}
                      onCheckedChange={(checked) => 
                        setAdvancedSettings(prev => ({ ...prev, includeNumbers: checked as boolean }))
                      }
                    />
                    <Label htmlFor="include-numbers" className="cursor-pointer">Include numbers</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-dashes"
                      checked={advancedSettings.includeDashes}
                      onCheckedChange={(checked) => 
                        setAdvancedSettings(prev => ({ ...prev, includeDashes: checked as boolean }))
                      }
                    />
                    <Label htmlFor="include-dashes" className="cursor-pointer">Include dashes</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  if (hasGenerated) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Generated Domains</h2>
            <p className="text-muted-foreground">
              Generated {domains.length} domains using {selectedModel} for {businessInfo.industry || 'your project'}
            </p>
          </div>
          <Button onClick={() => {
            setHasGenerated(false);
            setCurrentStep(1);
            setDomains([]);
          }} variant="outline" className="transition-all hover:bg-gray-50">
            Generate More
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <DomainList domains={domains} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Generate Domain Names</h2>
            <p className="text-muted-foreground">
              Step {currentStep} of {totalSteps} - {selectedTier === 'free' ? 'Quick Generation' : 'Advanced Generation'}
            </p>
          </div>
          <Badge variant="outline" className={cn(
            "transition-all",
            selectedTier === 'free' && "border-gray-300",
            selectedTier === 'mid' && "border-blue-300 text-blue-700",
            selectedTier === 'premium' && "border-purple-300 text-purple-700"
          )}>
            {selectedTier.toUpperCase()} Plan
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 transition-all" />
        </div>
      </div>

      {/* Tier Selection for Free Users */}
      {selectedTier === 'free' && currentStep === 1 && (
        <Card className="border-blue-200 bg-blue-50 transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-blue-500" />
              <div className="flex-1">
                <div className="font-medium">Unlock Advanced Generation</div>
                <div className="text-sm text-muted-foreground">
                  Get better results with business information, keywords, and advanced settings
                </div>
              </div>
              <Button size="sm" onClick={() => setSelectedTier('mid')} className="transition-all">
                Upgrade
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step Content */}
      {renderStep()}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
          className="transition-all"
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                i + 1 <= currentStep ? "bg-blue-500" : "bg-gray-200"
              )}
            />
          ))}
        </div>

        {currentStep < totalSteps ? (
          <Button
            onClick={() => setCurrentStep(prev => prev + 1)}
            disabled={!canProceed()}
            className="transition-all"
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleGenerate}
            disabled={!canProceed() || isGenerating}
            className="min-w-[120px] transition-all"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                <span>Generating...</span>
              </div>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate Domains
              </>
            )}
          </Button>
        )}
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="text-xs text-muted-foreground text-center">
        <span>💡 Tip: Use </span>
        <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+Enter</kbd>
        <span> to proceed, </span>
        <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Esc</kbd>
        <span> to reset</span>
      </div>
    </div>
  );
}
