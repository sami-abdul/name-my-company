"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Globe, DollarSign, Loader2 } from 'lucide-react';
import type { Domain } from "@/types";

interface DomainListProps {
  domains: Domain[];
}

export function DomainList({ domains }: DomainListProps) {
  const [checkingDomains, setCheckingDomains] = useState<Set<string>>(new Set());

  const handleCheckAvailability = async (domain: Domain) => {
    setCheckingDomains(prev => new Set(prev).add(domain.id));
    
    // Simulate API call
    setTimeout(() => {
      setCheckingDomains(prev => {
        const newSet = new Set(prev);
        newSet.delete(domain.id);
        return newSet;
      });
    }, 1500);
  };

  const getAvailabilityBadge = (domain: Domain) => {
    const isChecking = checkingDomains.has(domain.id);
    
    if (isChecking) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Checking...
        </Badge>
      );
    }

    if (domain.isAvailable === undefined) {
      return null;
    }

    return domain.isAvailable ? (
      <Badge variant="default" className="bg-green-500 hover:bg-green-600 flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Available
      </Badge>
    ) : (
      <Badge variant="destructive" className="flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        Taken
      </Badge>
    );
  };

  return (
    <div className="space-y-3">
      {domains.map((domain) => (
        <Card key={domain.id} className="transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="font-medium text-lg">{domain.fullDomain}</div>
                  {domain.price && domain.isAvailable && (
                    <div className="flex items-center gap-1 text-sm text-neutral-600">
                      <DollarSign className="h-3 w-3" />
                      ${domain.price}/year
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {getAvailabilityBadge(domain)}
                
                {domain.isAvailable === undefined && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCheckAvailability(domain)}
                    disabled={checkingDomains.has(domain.id)}
                  >
                    Check Availability
                  </Button>
                )}
                
                {domain.isAvailable && (
                  <Button size="sm">
                    Register Domain
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
