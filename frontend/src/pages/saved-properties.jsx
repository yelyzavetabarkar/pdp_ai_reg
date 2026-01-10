import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import useAppStore from '../stores/use-app-store';
import { useFavorites } from '../hooks/use-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, ArrowLeft, MapPin, Star, Sparkles } from 'lucide-react';

const EmptyState = ({ hasFavorites }) => (
  <div className="text-center py-20">
    <div className="w-24 h-24 rounded-3xl bg-muted/40 flex items-center justify-center mx-auto mb-6">
      <Heart className="h-10 w-10 text-primary" />
    </div>
    <h2 className="text-2xl font-bold mb-2">{hasFavorites ? 'Ready to add more?' : 'No saved stays yet'}</h2>
    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
      {hasFavorites
        ? 'Search for new stays to add to your shortlist.'
        : 'Tap the heart icon on any property to keep it here for later.'}
    </p>
    <Button asChild className="rounded-full">
      <Link to="/properties">
        <Sparkles className="h-4 w-4 mr-2" />
        Browse properties
      </Link>
    </Button>
  </div>
);

const SavedPropertyCard = ({ property, onToggleFavorite }) => (
  <Card className="overflow-hidden rounded-2xl border border-border/50 bg-card/90">
    <div className="flex flex-col sm:flex-row">
      <div className="sm:w-56 h-48 sm:h-auto flex-shrink-0 relative">
        {property.image_url ? (
          <img
            src={property.image_url}
            alt={property.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <MapPin className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        <Button
          size="icon"
          variant="secondary"
          className="absolute top-3 right-3 rounded-full bg-white/90 text-destructive hover:bg-white"
          onClick={() => onToggleFavorite(property.id)}
        >
          <Heart className="h-4 w-4" />
        </Button>
      </div>
      <CardContent className="flex-1 p-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold">{property.name}</h3>
              <p className="text-muted-foreground flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {property.city}
              </p>
            </div>
            {property.average_rating && (
              <Badge className="rounded-full bg-primary/15 text-primary">
                <Star className="h-3 w-3 mr-1 text-yellow-400 fill-yellow-400" />
                {Number(property.average_rating).toFixed(1)}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground line-clamp-2 text-sm">
            {property.description || 'Corporate-ready stay with flexible amenities.'}
          </p>
          <div className="flex items-center justify-between pt-3">
            <div>
              <span className="text-2xl font-bold">${property.price_per_night}</span>
              <span className="text-sm text-muted-foreground"> / night</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-xl" asChild>
                <Link to={`/properties/${property.id}`}>View details</Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </div>
  </Card>
);

export default function SavedProperties({ user }) {
  const storeFavorites = useAppStore((state) => state.favorites);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);

  const { favorites: rawFavorites, isLoading: loading, isError, mutate } = useFavorites(user?.id);
  const error = isError ? 'Failed to load saved properties. Please try again.' : null;

  const favoriteProperties = useMemo(() => {
    if (!rawFavorites) return [];
    return rawFavorites
      .map((fav) => fav.property || null)
      .filter(Boolean);
  }, [rawFavorites]);

  const handleToggleFavorite = async (propertyId) => {
    await toggleFavorite(propertyId);
    mutate();
  };

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <EmptyState hasFavorites={false} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Link to="/properties" className="inline-flex items-center gap-1 text-primary hover:text-primary/80">
            <ArrowLeft className="h-4 w-4" />
            Back to explore
          </Link>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Saved stays</h1>
          <p className="text-muted-foreground">
            You have {favoriteProperties.length} saved {favoriteProperties.length === 1 ? 'property' : 'properties'} ready to revisit.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : favoriteProperties.length === 0 ? (
        <EmptyState hasFavorites={storeFavorites.length > 0} />
      ) : (
        <div className="space-y-4">
          {favoriteProperties.map((property) => (
            <SavedPropertyCard
              key={property.id}
              property={property}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
