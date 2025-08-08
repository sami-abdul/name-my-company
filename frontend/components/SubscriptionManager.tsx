"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TierSelector } from "@/components/ui/tier-selector";
import { CreditCard, Calendar, Download, AlertCircle } from 'lucide-react';
import { mockUser } from "@/lib/utils";
import type { SubscriptionTier } from "@/types";

export function SubscriptionManager() {
  const user = mockUser;

  const handleTierSelect = (tier: SubscriptionTier) => {
    console.log('Selected tier:', tier);
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold capitalize">{user.subscription.tier} Plan</div>
              <div className="text-sm text-muted-foreground">
                {user.subscription.tier === 'free' ? 'Free forever' : `$${user.subscription.tier === 'mid' ? '5' : '10'}/month`}
              </div>
            </div>
            <Badge 
              className={user.subscription.status === 'active' ? 'bg-green-500' : 'bg-red-500'}
            >
              {user.subscription.status}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Renews on {new Date(user.subscription.currentPeriodEnd).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {user.generationsUsed} / {user.generationsLimit} generations used
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Options */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Upgrade Your Plan</h2>
        <TierSelector
          selectedTier="premium"
          onTierSelect={handleTierSelect}
          currentTier={user.subscription.tier}
        />
      </div>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Billing History</span>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: '2024-01-15', amount: '$10.00', status: 'Paid', plan: 'Premium' },
              { date: '2023-12-15', amount: '$10.00', status: 'Paid', plan: 'Premium' },
              { date: '2023-11-15', amount: '$5.00', status: 'Paid', plan: 'Mid' }
            ].map((invoice, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{invoice.plan} Plan</div>
                  <div className="text-sm text-muted-foreground">{invoice.date}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{invoice.amount}</div>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    {invoice.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
