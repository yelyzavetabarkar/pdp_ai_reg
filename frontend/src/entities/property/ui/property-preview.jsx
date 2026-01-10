import { MapPin, Star } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';

export function PropertyPreview({ property, compact = false }) {
  if (!property) return null;

  return (
    <div className={`flex gap-3 ${compact ? 'items-center' : 'items-start'}`}>
      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
        {property.image_url ? (
          <img
            src={property.image_url}
            alt={property.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <MapPin className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{property.name}</h4>
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {property.city}
        </p>
        {!compact && (
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
              {property.average_rating?.toFixed(1) || 'New'}
            </Badge>
            <span className="text-sm font-medium">
              ${property.price_per_night}/night
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
