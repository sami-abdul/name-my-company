import { AdvancedDomainManager } from "@/components/AdvancedDomainManager";

export default function DomainsPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Domain Manager</h1>
        <p className="text-neutral-600">
          Manage all your generated domains with advanced filtering, sorting, and bulk operations.
        </p>
      </div>
      
      <AdvancedDomainManager />
    </div>
  );
}
