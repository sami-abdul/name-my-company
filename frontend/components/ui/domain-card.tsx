"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Heart, HeartIcon, ExternalLink, Copy, MoreHorizontal, Palette, TrendingUp, Shield } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import type { Domain } from "@/types";
import { cn, getStatusColor, formatDate } from "@/lib/utils";

interface DomainCardProps {
  domain: Domain;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  onFavorite?: (domain: Domain) => void;
  onGenerateBranding?: (domain: Domain) => void;
  onCheckAvailability?: (domain: Domain) => void;
  showSelection?: boolean;
}

export function DomainCard({
  domain,
  isSelected = false,
  onSelect,
  onFavorite,
  onGenerateBranding,
  onCheckAvailability,
  showSelection = false
}: DomainCardProps) {
  const [isFavorited, setIsFavorited] = useState(domain.status === 'favorite');
  const [copied, setCopied] = useState(false);

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    onFavorite?.(domain);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(domain.fullDomain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = () => {
    if (domain.isAvailable === undefined) {
      return (
        <Badge variant="outline" className="text-gray-600">
          Not Checked
        </Badge>
      );
    }

    return domain.isAvailable ? (
      <Badge className="bg-green-500 hover:bg-green-600 text-white">
        Available
      </Badge>
    ) : (
      <Badge variant="destructive">
        Taken
      </Badge>
    );
  };

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      isSelected && "ring-2 ring-blue-500"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            {showSelection && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={onSelect}
              />
            )}
            
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              <div>
                <div className="font-semibold text-lg">{domain.fullDomain}</div>
                {domain.category && (
                  <div className="text-sm text-muted-foreground">{domain.category}</div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavorite}
              className={cn(
                "p-1 h-8 w-8",
                isFavorited && "text-red-500 hover:text-red-600"
              )}
            >
              {isFavorited ? (
                <HeartIcon className="h-4 w-4 fill-current" />
              ) : (
                <Heart className="h-4 w-4" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy Domain'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onGenerateBranding?.(domain)}>
                  <Palette className="h-4 w-4 mr-2" />
                  Generate Branding
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {domain.brandingKit && (
              <Badge variant="outline" className="text-purple-600 border-purple-200">
                <Palette className="h-3 w-3 mr-1" />
                Branded
              </Badge>
            )}
          </div>

          {domain.price && domain.isAvailable && (
            <div className="text-sm font-medium text-green-600">
              ${domain.price}/year
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span>Created {formatDate(domain.createdAt)}</span>
          {domain.status === 'favorite' && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-200">
              Favorite
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          {domain.isAvailable === undefined && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCheckAvailability?.(domain)}
              className="flex-1"
            >
              <Shield className="h-4 w-4 mr-2" />
              Check Availability
            </Button>
          )}
          
          {domain.isAvailable && (
            <Button size="sm" className="flex-1">
              Register Domain
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onGenerateBranding?.(domain)}
          >
            <Palette className="h-4 w-4 mr-2" />
            Branding
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
