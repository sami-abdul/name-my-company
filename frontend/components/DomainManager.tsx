"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DomainCard } from "@/components/ui/domain-card";
import { Search, Filter, Download, Trash2, Heart, FolderOpen } from 'lucide-react';
import { mockDomains } from "@/lib/utils";
import type { Domain } from "@/types";
import Link from "next/link";

export function DomainManager() {
  const [domains, setDomains] = useState<Domain[]>(mockDomains);
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'generated' | 'favorite' | 'checked' | 'purchased'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDomains = domains.filter(domain => {
    const matchesFilter = filter === 'all' || domain.status === filter;
    const matchesSearch = domain.fullDomain.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSelectDomain = (domainId: string, selected: boolean) => {
    const newSelected = new Set(selectedDomains);
    if (selected) {
      newSelected.add(domainId);
    } else {
      newSelected.delete(domainId);
    }
    setSelectedDomains(newSelected);
  };

  const handleBulkAction = (action: 'favorite' | 'delete' | 'export') => {
    console.log(`Bulk ${action} for domains:`, Array.from(selectedDomains));
    // Implement bulk actions
    setSelectedDomains(new Set());
  };

  const getFilterCount = (status: string) => {
    if (status === 'all') return domains.length;
    return domains.filter(d => d.status === status).length;
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search domains..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {selectedDomains.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedDomains.size} selected
            </span>
            <Button variant="outline" size="sm" onClick={() => handleBulkAction('favorite')}>
              <Heart className="h-4 w-4 mr-2" />
              Favorite
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkAction('export')}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkAction('delete')}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All Domains' },
          { key: 'generated', label: 'Generated' },
          { key: 'favorite', label: 'Favorites' },
          { key: 'checked', label: 'Checked' },
          { key: 'purchased', label: 'Purchased' }
        ].map(({ key, label }) => (
          <Button
            key={key}
            variant={filter === key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(key as any)}
            className="flex items-center gap-2"
          >
            {label}
            <Badge variant="secondary" className="ml-1">
              {getFilterCount(key)}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Domain Grid */}
      {filteredDomains.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredDomains.map((domain) => (
            <DomainCard
              key={domain.id}
              domain={domain}
              isSelected={selectedDomains.has(domain.id)}
              onSelect={(selected) => handleSelectDomain(domain.id, selected)}
              showSelection={true}
              onFavorite={(domain) => console.log('Favorite:', domain)}
              onGenerateBranding={(domain) => console.log('Generate branding:', domain)}
              onCheckAvailability={(domain) => console.log('Check availability:', domain)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No domains found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'Try adjusting your search terms' : 'Start generating domains to see them here'}
            </p>
            <Link href="/" aria-label="Go to generator" className="inline-block">
              <Button>Generate Domains</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
