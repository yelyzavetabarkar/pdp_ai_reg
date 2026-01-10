import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Building2, Sparkles, Shield, Zap, MapPin } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';
import { PropertyCard } from '@/widgets/property-card/ui/property-card';
import { PropertyFilters } from '@/features/filters/property-filters';
import { useProperties, useCuratedProperties } from '@/entities/property';

const heroHighlights = [
  {
    id: 'executive',
    title: 'Executive-ready stays',
    description: 'Suites curated for leadership travel with concierge-level service.',
    icon: Building2,
    color: 'from-blue-500 to-indigo-500',
  },
  {
    id: 'assurance',
    title: 'Enterprise-grade assurance',
    description: '24/7 safety monitoring, enterprise billing, and policy compliance.',
    icon: Shield,
    color: 'from-emerald-500 to-teal-500',
  },
];

export function PropertiesPage() {
  const { properties, isLoading } = useProperties();
  const { curated, isLoading: curatedLoading } = useCuratedProperties();

  const [displayedCount, setDisplayedCount] = useState(12);
  const [filters, setFilters] = useState({
    searchQuery: '',
    selectedCity: 'all',
    priceRange: 'all',
  });

  const loadMoreRef = useRef(null);

  const cities = useMemo(() => {
    return properties.map((p) => p.city);
  }, [properties]);

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        if (!property.name.toLowerCase().includes(query) &&
            !property.city.toLowerCase().includes(query)) {
          return false;
        }
      }

      if (filters.selectedCity !== 'all' && property.city !== filters.selectedCity) {
        return false;
      }

      if (filters.priceRange !== 'all') {
        const price = property.price_per_night;
        if (filters.priceRange === '0-100' && price >= 100) return false;
        if (filters.priceRange === '100-200' && (price < 100 || price >= 200)) return false;
        if (filters.priceRange === '200-500' && (price < 200 || price >= 500)) return false;
        if (filters.priceRange === '500+' && price < 500) return false;
      }

      return true;
    });
  }, [properties, filters]);

  const displayedProperties = useMemo(() => {
    return filteredProperties.slice(0, displayedCount);
  }, [filteredProperties, displayedCount]);

  const hasMore = displayedCount < filteredProperties.length;

  const trackCityView = (city) => {
    console.log('User scrolled past hero while viewing city:', city);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200 && filters.selectedCity !== 'all') {
        trackCityView(filters.selectedCity);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setDisplayedCount((prev) => prev + 12);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setDisplayedCount(12);
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={`skel-${i}`} className="h-80 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-12">
            <Badge className="mb-4" variant="secondary">
              <Sparkles className="h-3 w-3 mr-1" />
              Business Travel Reimagined
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Where Business Meets
              <span className="text-primary"> Comfort</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Premium accommodations designed for the modern business traveler.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {heroHighlights.map((highlight, idx) => (
              <div
                key={`highlight-${idx}`}
                className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg"
              >
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${highlight.color} flex items-center justify-center mb-4`}>
                  <highlight.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{highlight.title}</h3>
                <p className="text-muted-foreground text-sm">{highlight.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {curated.length > 0 && !curatedLoading && (
        <section className="py-12 border-t border-border/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Featured Properties</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {curated.slice(0, 3).map((property, idx) => (
                <PropertyCard key={`curated-${idx}`} property={property} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold">All Properties</h2>
              <p className="text-muted-foreground">
                {filteredProperties.length} properties available
              </p>
            </div>
            <PropertyFilters cities={cities} onFilterChange={handleFilterChange} />
          </div>

          {displayedProperties.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-6">
                <MapPin className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No properties found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
              <Button variant="outline" onClick={() => handleFilterChange({ searchQuery: '', selectedCity: 'all', priceRange: 'all' })}>
                Clear filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedProperties.map((property, idx) => (
                  <PropertyCard key={`prop-${idx}`} property={property} />
                ))}
              </div>

              {hasMore && (
                <div ref={loadMoreRef} className="flex justify-center mt-8">
                  <Button variant="outline" onClick={() => setDisplayedCount((p) => p + 12)}>
                    Load more
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
