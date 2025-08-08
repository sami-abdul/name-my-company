"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Crown } from 'lucide-react';
import { SUBSCRIPTION_TIERS } from "@/lib/constants";
import type { SubscriptionTier } from "@/types";
import { cn } from "@/lib/utils";

interface TierSelectorProps {
  selectedTier: SubscriptionTier;
  onTierSelect: (tier: SubscriptionTier) => void;
  currentTier?: SubscriptionTier;
}

export function TierSelector({ selectedTier, onTierSelect, currentTier }: TierSelectorProps) {
  const getTierIcon = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'free':
        return <Star className="h-5 w-5" />;
      case 'mid':
        return <Zap className="h-5 w-5" />;
      case 'premium':
        return <Crown className="h-5 w-5" />;
    }
  };

  const getTierGradient = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'free':
        return 'from-gray-500 to-gray-600';
      case 'mid':
        return 'from-blue-500 to-blue-600';
      case 'premium':
        return 'from-purple-500 to-purple-600';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {SUBSCRIPTION_TIERS.map((tier) => {
        const isSelected = selectedTier === tier.tier;
        const isCurrent = currentTier === tier.tier;
        const isPopular = tier.tier === 'mid';

        return (
          <Card
            key={tier.tier}
            className={cn(
              "relative cursor-pointer transition-all duration-200 hover:shadow-lg",
              isSelected && "ring-2 ring-blue-500 shadow-lg",
              tier.tier === 'premium' && "border-purple-200"
            )}
            onClick={() => onTierSelect(tier.tier)}
          >
            {isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white">Most Popular</Badge>
              </div>
            )}
            
            {isCurrent && (
              <div className="absolute -top-3 right-4">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Current Plan
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <div className={cn(
                "w-12 h-12 mx-auto rounded-full bg-gradient-to-r flex items-center justify-center text-white mb-4",
                getTierGradient(tier.tier)
              )}>
                {getTierIcon(tier.tier)}
              </div>
              
              <CardTitle className="text-xl font-bold capitalize">
                {tier.name}
              </CardTitle>
              
              <div className="text-3xl font-bold">
                {tier.price === 0 ? (
                  'Free'
                ) : (
                  <>
                    <span className="text-sm font-normal text-muted-foreground">$</span>
                    {tier.price}
                    <span className="text-sm font-normal text-muted-foreground">/month</span>
                  </>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground">
                {tier.generationsPerMonth === 200 ? 'Unlimited' : tier.generationsPerMonth} generations per month
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={cn(
                  "w-full",
                  isSelected && "bg-blue-600 hover:bg-blue-700",
                  tier.tier === 'premium' && !isSelected && "bg-purple-600 hover:bg-purple-700"
                )}
                variant={isSelected ? "default" : "outline"}
                disabled={isCurrent}
              >
                {isCurrent ? 'Current Plan' : isSelected ? 'Selected' : 'Select Plan'}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
