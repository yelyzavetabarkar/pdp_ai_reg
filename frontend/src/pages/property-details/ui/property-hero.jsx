import { useState } from 'react';
import { MapPin, Star, Users, Building2 } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';

export function PropertyHero({ property }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="relative h-[500px] overflow-hidden">
      {property.image_url ? (
        <>
          <img
            src={property.image_url}
            alt={property.name}
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ objectFit: 'cover', transition: 'opacity 0.3s' }}
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
        </>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 flex items-center justify-center">
          <Building2 className="h-24 w-24 text-slate-500" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className="bg-amber-500/90 text-white border-0">
              <Star className="h-3 w-3 mr-1 fill-current" />
              {property.average_rating?.toFixed(1) || 'New'}
            </Badge>
            {property.is_featured && (
              <Badge className="bg-indigo-500/90 text-white border-0">
                Featured
              </Badge>
            )}
            <Badge variant="secondary" className="bg-slate-800/90 text-slate-200">
              <MapPin className="h-3 w-3 mr-1" />
              {property.city}
            </Badge>
            <Badge variant="secondary" className="bg-slate-800/90 text-slate-200">
              <Users className="h-3 w-3 mr-1" />
              Up to {property.max_guests} guests
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
