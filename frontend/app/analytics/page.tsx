import { InteractiveAnalytics } from "@/components/InteractiveAnalytics";

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-neutral-600">
          Track your domain generation performance with interactive charts and detailed insights.
        </p>
      </div>
      
      <InteractiveAnalytics />
    </div>
  );
}
