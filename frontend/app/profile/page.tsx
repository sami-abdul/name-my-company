import { Auth } from "@/components/Auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Settings, CreditCard } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="container mx-auto p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <User className="h-5 w-5" />
        <h1 className="text-2xl font-bold">Profile</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Auth />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-600">
            Settings and preferences will be available in the next phase.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Billing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-600">
            Billing and subscription management will be available in the next phase.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
