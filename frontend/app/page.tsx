import { EnhancedDomainGenerator } from "@/components/EnhancedDomainGenerator";

export default function HomePage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Domain Name Generator</h1>
        <p className="text-neutral-600">
          Generate unique domain names for your business using AI. 
          Get personalized suggestions based on your industry, target audience, and brand style.
        </p>
      </div>
      
      <EnhancedDomainGenerator />
    </div>
  );
}
