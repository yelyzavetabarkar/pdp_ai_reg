import { Building2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { PropertyCard } from '@/widgets/property-card/ui/property-card';

export function SimilarProperties({ properties = [], isLoading }) {
  if (isLoading) {
    return (
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Similar Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={`similar-skel-${i}`} className="h-72 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (!properties || properties.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Similar Properties Nearby</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {properties.map((property, index) => (
          <PropertyCard
            key={`similar-prop-${index}`}
            property={property}
            showFavoriteButton={true}
          />
        ))}
      </div>
    </section>
  );
}
