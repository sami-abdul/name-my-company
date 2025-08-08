"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, Wand2, Download, Share, Eye } from 'lucide-react';

export function BrandingKit() {
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Domain Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Domain for Branding</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['techstartup.com', 'innovateai.io', 'futuretech.co'].map((domain) => (
              <Button
                key={domain}
                variant={selectedDomain === domain ? "default" : "outline"}
                onClick={() => setSelectedDomain(domain)}
                className="h-auto p-4 flex flex-col items-center"
              >
                <div className="font-medium">{domain}</div>
                <Badge variant="secondary" className="mt-1">Available</Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedDomain && (
        <>
          {/* Logo Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                AI Logo Generation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded-lg p-4 text-center">
                    <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg mb-3 flex items-center justify-center text-white font-bold">
                      Logo {i}
                    </div>
                    <Button variant="outline" size="sm">Select</Button>
                  </div>
                ))}
              </div>
              <Button className="w-full">
                <Wand2 className="h-4 w-4 mr-2" />
                Generate More Variations
              </Button>
            </CardContent>
          </Card>

          {/* Color Palette */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Brand Colors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-full h-16 bg-blue-500 rounded-lg mb-2"></div>
                  <div className="text-sm font-medium">Primary</div>
                  <div className="text-xs text-muted-foreground">#3B82F6</div>
                </div>
                <div className="text-center">
                  <div className="w-full h-16 bg-purple-500 rounded-lg mb-2"></div>
                  <div className="text-sm font-medium">Secondary</div>
                  <div className="text-xs text-muted-foreground">#8B5CF6</div>
                </div>
                <div className="text-center">
                  <div className="w-full h-16 bg-yellow-500 rounded-lg mb-2"></div>
                  <div className="text-sm font-medium">Accent</div>
                  <div className="text-xs text-muted-foreground">#F59E0B</div>
                </div>
                <div className="text-center">
                  <div className="w-full h-16 bg-gray-500 rounded-lg mb-2"></div>
                  <div className="text-sm font-medium">Neutral</div>
                  <div className="text-xs text-muted-foreground">#6B7280</div>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Generate New Palette
              </Button>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download Brand Kit
            </Button>
            <Button variant="outline" className="flex-1">
              <Share className="h-4 w-4 mr-2" />
              Share Brand Kit
            </Button>
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
