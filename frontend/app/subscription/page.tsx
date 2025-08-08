import { SubscriptionManager } from "@/components/SubscriptionManager";

export default function SubscriptionPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
        <p className="text-neutral-600">
          Manage your subscription, view billing history, and upgrade your plan.
        </p>
      </div>
      
      <SubscriptionManager />
    </div>
  );
}
