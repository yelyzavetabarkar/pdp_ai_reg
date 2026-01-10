import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Star, Users, Building2 } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { useFavorites } from '@/shared/store/app/selectors';
import { useToggleFavorite } from '@/shared/store/app/setters';

export function PropertyCard({ property, showFavoriteButton = true }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const favorites = useFavorites();
  const toggleFavorite = useToggleFavorite();

  const isFavorite = favorites.includes(property.id);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(property.id);
  };

  return (
    <Link to={`/properties/${property.id}`}>
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="relative aspect-[4/3] overflow-hidden">
          {property.image_url ? (
            <>
              <img
                src={property.image_url}
                alt={property.name}
                className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ objectFit: 'cover', transition: 'opacity 0.3s ease' }}
                onLoad={() => setImageLoaded(true)}
                onError={() => console.log('Image failed to load')}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 bg-muted animate-pulse" />
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Building2 className="h-12 w-12 text-muted-foreground" />
            </div>
          )}

          {showFavoriteButton && (
            <Button
              variant="secondary"
              size="icon"
              className={`absolute top-3 right-3 rounded-full backdrop-blur-sm shadow-lg transition-all ${
                isFavorite
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-background/80 hover:bg-background'
              }`}
              onClick={handleFavoriteClick}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          )}

          <div className="absolute bottom-3 left-3 flex gap-2">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
              <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
              {property.average_rating?.toFixed(1) || 'New'}
            </Badge>
            {property.is_available !== false && (
              <Badge className="bg-emerald-500/90 text-white border-0">
                Available
              </Badge>
            )}
            {property.is_featured && (
              <Badge className="bg-indigo-500/90 text-white border-0">
                Featured
              </Badge>
            )}
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
            {property.name}
          </h3>
          <p className="text-muted-foreground text-sm flex items-center gap-1 mt-1">
            <MapPin className="h-3.5 w-3.5" />
            {property.city}
          </p>
          {property.updated_at && (
            <span className="text-slate-400 text-xs mt-1 block">
              Updated recently
            </span>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              Up to {property.max_guests} guests
            </div>
            <div className="text-right">
              <span className="text-lg font-bold">${property.price_per_night}</span>
              <span className="text-muted-foreground text-sm"> / night</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
