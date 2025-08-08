"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { DomainCard } from "@/components/ui/domain-card";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Search, Filter, Download, Trash2, Heart, FolderOpen, Grid3X3, List, SortAsc, SortDesc, Calendar, DollarSign, Globe, Tag, MoreHorizontal, Eye, EyeOff, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { mockDomains, DOMAIN_EXTENSIONS } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import type { Domain } from "@/types";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

type ViewMode = 'grid' | 'list';
type SortField = 'name' | 'date' | 'price' | 'status';
type SortOrder = 'asc' | 'desc';

interface FilterState {
  status: string[];
  extensions: string[];
  priceRange: [number, number];
  availability: string[];
  dateRange?: DateRange;
}

export function AdvancedDomainManager() {
  const [domains, setDomains] = useState<Domain[]>(mockDomains);
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    extensions: [],
    priceRange: [0, 100],
    availability: [],
    dateRange: undefined
  });

  const { toast } = useToast();
  const { copyToClipboard } = useCopyToClipboard();

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'a',
      ctrlKey: true,
      callback: () => {
        const allSelected = selectedDomains.size === filteredAndSortedDomains.length;
        handleSelectAll(!allSelected);
      },
      description: 'Select all domains'
    },
    {
      key: 'f',
      ctrlKey: true,
      callback: () => setShowFilters(!showFilters),
      description: 'Toggle filters'
    },
    {
      key: 'Delete',
      callback: () => {
        if (selectedDomains.size > 0) {
          setShowDeleteDialog(true);
        }
      },
      description: 'Delete selected domains'
    }
  ]);

  const filteredAndSortedDomains = domains
    .filter(domain => {
      // Search filter
      if (searchQuery && !domain.fullDomain.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(domain.status)) {
        return false;
      }
      
      // Extension filter
      if (filters.extensions.length > 0 && !filters.extensions.includes(domain.extension)) {
        return false;
      }
      
      // Availability filter
      if (filters.availability.length > 0) {
        const availability = domain.isAvailable === true ? 'available' : 
                           domain.isAvailable === false ? 'taken' : 'unchecked';
        if (!filters.availability.includes(availability)) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange?.from) {
        const domainDate = new Date(domain.createdAt);
        if (domainDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && domainDate > filters.dateRange.to) return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'name':
          comparison = a.fullDomain.localeCompare(b.fullDomain);
          break;
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'price':
          comparison = (a.price || 0) - (b.price || 0);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDomains(new Set(filteredAndSortedDomains.map(d => d.id)));
      toast({
        title: "All domains selected",
        description: `Selected ${filteredAndSortedDomains.length} domains`,
        variant: "default"
      });
    } else {
      setSelectedDomains(new Set());
      toast({
        title: "Selection cleared",
        description: "All domains deselected",
        variant: "default"
      });
    }
  };

  const handleBulkAction = async (action: 'favorite' | 'delete' | 'export' | 'tag') => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const count = selectedDomains.size;
    
    switch (action) {
      case 'favorite':
        toast({
          title: "Added to favorites",
          description: `${count} domains added to favorites`,
          variant: "success"
        });
        break;
      case 'delete':
        setDomains(prev => prev.filter(d => !selectedDomains.has(d.id)));
        toast({
          title: "Domains deleted",
          description: `${count} domains deleted successfully`,
          variant: "success"
        });
        break;
      case 'export':
        toast({
          title: "Export started",
          description: `Exporting ${count} domains to CSV`,
          variant: "success"
        });
        break;
      case 'tag':
        toast({
          title: "Tags added",
          description: `Tags added to ${count} domains`,
          variant: "success"
        });
        break;
    }
    
    setSelectedDomains(new Set());
    setIsLoading(false);
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getStatusCount = (status: string) => {
    return domains.filter(d => d.status === status).length;
  };

  const clearFilters = () => {
    setFilters({
      status: [],
      extensions: [],
      priceRange: [0, 100],
      availability: [],
      dateRange: undefined
    });
    setSearchQuery('');
    toast({
      title: "Filters cleared",
      description: "All filters have been reset",
      variant: "default"
    });
  };

  const activeFilterCount = filters.status.length + filters.extensions.length + filters.availability.length + (filters.dateRange ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <SearchInput
            placeholder="Search domains..."
            value={searchQuery}
            onSearch={setSearchQuery}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "transition-all relative",
              showFilters && "bg-accent",
              activeFilterCount > 0 && "border-blue-500"
            )}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 w-8 p-0 transition-all"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 w-8 p-0 transition-all"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="transition-all">
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4 mr-2" /> : <SortDesc className="h-4 w-4 mr-2" />}
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {[
                { field: 'name', label: 'Name' },
                { field: 'date', label: 'Date Created' },
                { field: 'price', label: 'Price' },
                { field: 'status', label: 'Status' }
              ].map(({ field, label }) => (
                <DropdownMenuItem
                  key={field}
                  onClick={() => {
                    if (sortField === field) {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField(field as SortField);
                      setSortOrder('asc');
                    }
                  }}
                  className="flex items-center justify-between"
                >
                  {label}
                  {sortField === field && (
                    sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Bulk Actions */}
          {selectedDomains.size > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="transition-all">
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                  Actions ({selectedDomains.size})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleBulkAction('favorite')} disabled={isLoading}>
                  <Heart className="h-4 w-4 mr-2" />
                  Add to Favorites
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('tag')} disabled={isLoading}>
                  <Tag className="h-4 w-4 mr-2" />
                  Add Tags
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('export')} disabled={isLoading}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Selected
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)} 
                  className="text-red-600"
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card className="transition-all animate-in slide-in-from-top-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Advanced Filters</CardTitle>
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Status Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Status</Label>
                <div className="space-y-2">
                  {[
                    { value: 'generated', label: 'Generated', count: getStatusCount('generated') },
                    { value: 'favorite', label: 'Favorites', count: getStatusCount('favorite') },
                    { value: 'checked', label: 'Checked', count: getStatusCount('checked') },
                    { value: 'purchased', label: 'Purchased', count: getStatusCount('purchased') }
                  ].map(({ value, label, count }) => (
                    <div key={value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${value}`}
                        checked={filters.status.includes(value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleFilterChange('status', [...filters.status, value]);
                          } else {
                            handleFilterChange('status', filters.status.filter(s => s !== value));
                          }
                        }}
                      />
                      <Label htmlFor={`status-${value}`} className="text-sm flex items-center gap-2 cursor-pointer">
                        {label}
                        <Badge variant="secondary" className="text-xs">{count}</Badge>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extension Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Extensions</Label>
                <div className="space-y-2">
                  {DOMAIN_EXTENSIONS.slice(0, 6).map((ext) => (
                    <div key={ext} className="flex items-center space-x-2">
                      <Checkbox
                        id={`ext-${ext}`}
                        checked={filters.extensions.includes(ext)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleFilterChange('extensions', [...filters.extensions, ext]);
                          } else {
                            handleFilterChange('extensions', filters.extensions.filter(e => e !== ext));
                          }
                        }}
                      />
                      <Label htmlFor={`ext-${ext}`} className="text-sm cursor-pointer">
                        {ext}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Availability Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Availability</Label>
                <div className="space-y-2">
                  {[
                    { value: 'available', label: 'Available' },
                    { value: 'taken', label: 'Taken' },
                    { value: 'unchecked', label: 'Not Checked' }
                  ].map(({ value, label }) => (
                    <div key={value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`avail-${value}`}
                        checked={filters.availability.includes(value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleFilterChange('availability', [...filters.availability, value]);
                          } else {
                            handleFilterChange('availability', filters.availability.filter(a => a !== value));
                          }
                        }}
                      />
                      <Label htmlFor={`avail-${value}`} className="text-sm cursor-pointer">
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Date Range</Label>
                <DateRangePicker
                  date={filters.dateRange}
                  onDateChange={(date) => handleFilterChange('dateRange', date)}
                  placeholder="Select date range"
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {filteredAndSortedDomains.length} of {domains.length} domains
          </span>
          {filteredAndSortedDomains.length > 0 && (
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedDomains.size === filteredAndSortedDomains.length && filteredAndSortedDomains.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <Label className="text-sm cursor-pointer">Select all visible</Label>
            </div>
          )}
        </div>

        <Button variant="outline" size="sm" className="transition-all">
          <Download className="h-4 w-4 mr-2" />
          Export All
        </Button>
      </div>

      {/* Domain Grid/List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredAndSortedDomains.length > 0 ? (
        <div className={cn(
          "transition-all",
          viewMode === 'grid' 
            ? "grid grid-cols-1 lg:grid-cols-2 gap-4" 
            : "space-y-3"
        )}>
          {filteredAndSortedDomains.map((domain) => (
            <DomainCard
              key={domain.id}
              domain={domain}
              isSelected={selectedDomains.has(domain.id)}
              onSelect={(selected) => handleSelectDomain(domain.id, selected)}
              showSelection={true}
              onFavorite={(domain) => {
                toast({
                  title: "Added to favorites",
                  description: `${domain.fullDomain} added to favorites`,
                  variant: "success"
                });
              }}
              onGenerateBranding={(domain) => {
                toast({
                  title: "Branding generation started",
                  description: `Creating branding kit for ${domain.fullDomain}`,
                  variant: "default"
                });
              }}
              onCheckAvailability={(domain) => {
                toast({
                  title: "Checking availability",
                  description: `Verifying ${domain.fullDomain} availability`,
                  variant: "default"
                });
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderOpen}
          title="No domains found"
          description={
            searchQuery || activeFilterCount > 0
              ? 'Try adjusting your search terms or filters'
              : 'Start generating domains to see them here'
          }
          action={{
            label: activeFilterCount > 0 ? "Clear Filters" : "Generate Domains",
            ...(activeFilterCount > 0
              ? { onClick: clearFilters }
              : { href: '/' })
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Selected Domains"
        description={`Are you sure you want to delete ${selectedDomains.size} selected domains? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={() => handleBulkAction('delete')}
        loading={isLoading}
      />

      {/* Keyboard Shortcuts Help */}
      <div className="text-xs text-muted-foreground text-center">
        <span>💡 Shortcuts: </span>
        <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+A</kbd>
        <span> select all, </span>
        <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+F</kbd>
        <span> toggle filters, </span>
        <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Del</kbd>
        <span> delete selected</span>
      </div>
    </div>
  );
}
