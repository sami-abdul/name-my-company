"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, Heart, Calendar, BarChart3, PieChart, LineChart, Download, Filter, RefreshCw } from 'lucide-react';
import { mockAnalytics } from "@/lib/utils";
import { cn } from "@/lib/utils";

type DateRange = '7d' | '30d' | '90d' | '1y';
type ChartType = 'line' | 'bar' | 'pie';

export function InteractiveAnalytics() {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [selectedMetric, setSelectedMetric] = useState('generations');
  const analytics = mockAnalytics;

  // Mock chart data based on selected range
  const getChartData = () => {
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365;
    return Array.from({ length: Math.min(days, 30) }, (_, i) => ({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      generations: Math.floor(Math.random() * 10) + 1,
      favorites: Math.floor(Math.random() * 5),
      success: Math.floor(Math.random() * 80) + 20
    }));
  };

  const chartData = getChartData();

  const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <p className={cn(
                "text-xs flex items-center gap-1 mt-1",
                change > 0 ? "text-green-600" : "text-red-600"
              )}>
                <TrendingUp className="h-3 w-3" />
                {change > 0 ? '+' : ''}{change}% from last period
              </p>
            )}
          </div>
          <Icon className={cn("h-8 w-8", color)} />
        </div>
      </CardContent>
    </Card>
  );

  const SimpleChart = ({ data, type }: { data: any[], type: ChartType }) => {
    const maxValue = Math.max(...data.map(d => d[selectedMetric]));
    
    if (type === 'line') {
      return (
        <div className="h-64 flex items-end justify-between gap-2 p-4">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center gap-2 flex-1">
              <div className="relative w-full h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                <div 
                  className="absolute bottom-0 w-full bg-blue-500 transition-all duration-500 rounded-t-lg"
                  style={{ height: `${(item[selectedMetric] / maxValue) * 100}%` }}
                />
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs font-medium">
                  {item[selectedMetric]}
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{item.date}</span>
            </div>
          ))}
        </div>
      );
    }

    if (type === 'pie') {
      const total = data.reduce((sum, item) => sum + item[selectedMetric], 0);
      return (
        <div className="h-64 flex items-center justify-center">
          <div className="relative w-48 h-48">
            <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold">{total}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="h-64 flex items-end justify-between gap-1 p-4">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center gap-2 flex-1">
            <div 
              className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500 min-h-[4px]"
              style={{ height: `${(item[selectedMetric] / maxValue) * 200}px` }}
            />
            <span className="text-xs text-muted-foreground transform -rotate-45 origin-center">
              {item.date}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={(value: DateRange) => setDateRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="generations">Generations</SelectItem>
              <SelectItem value="favorites">Favorites</SelectItem>
              <SelectItem value="success">Success Rate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg p-1">
            {[
              { type: 'line', icon: LineChart },
              { type: 'bar', icon: BarChart3 },
              { type: 'pie', icon: PieChart }
            ].map(({ type, icon: Icon }) => (
              <Button
                key={type}
                variant={chartType === type ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType(type as ChartType)}
                className="h-8 w-8 p-0"
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>

          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Generations"
          value={analytics.totalGenerations}
          change={12}
          icon={TrendingUp}
          color="text-blue-500"
        />
        <StatCard
          title="Success Rate"
          value={`${analytics.successRate}%`}
          change={5}
          icon={Target}
          color="text-green-500"
        />
        <StatCard
          title="Favorites"
          value={analytics.favoriteCount}
          change={-2}
          icon={Heart}
          color="text-red-500"
        />
        <StatCard
          title="This Month"
          value={32}
          change={18}
          icon={Calendar}
          color="text-purple-500"
        />
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="capitalize">{selectedMetric} Over Time</CardTitle>
            <Badge variant="outline">{dateRange.toUpperCase()}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <SimpleChart data={chartData} type={chartType} />
        </CardContent>
      </Card>

      {/* Detailed Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Generations Used</span>
                <span className="text-sm text-muted-foreground">
                  {analytics.tierUsage.generationsUsed} / {analytics.tierUsage.generationsLimit}
                </span>
              </div>
              <Progress 
                value={(analytics.tierUsage.generationsUsed / analytics.tierUsage.generationsLimit) * 100} 
                className="h-3"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Features Used</span>
                <span className="text-sm text-muted-foreground">
                  {analytics.tierUsage.featuresUsed.length} / 5
                </span>
              </div>
              <Progress 
                value={(analytics.tierUsage.featuresUsed.length / 5) * 100} 
                className="h-3"
              />
            </div>
          </CardContent>
        </Card>

        {/* Top Keywords Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Keyword Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topKeywords.map((keyword, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <span className="font-medium">{keyword.keyword}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{keyword.count} uses</div>
                    <div className="text-xs text-muted-foreground">{keyword.successRate}% success</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.monthlyStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{stat.month}</div>
                    <div className="text-sm text-muted-foreground">
                      {stat.generations} generations, {stat.favorites} favorites
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{stat.brandingKits} branding kits</div>
                    <Badge variant="secondary" className="text-xs">
                      {Math.round((stat.favorites / stat.generations) * 100)}% favorite rate
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Analytics Report
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Create Custom Report
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
