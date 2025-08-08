import { BrandingKit } from "@/components/BrandingKit";

export default function BrandingPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Branding Kit</h1>
        <p className="text-neutral-600">
          Create complete brand identities with AI-generated logos, color palettes, and social media assets.
        </p>
      </div>
      
      <BrandingKit />
    </div>
  );
}
