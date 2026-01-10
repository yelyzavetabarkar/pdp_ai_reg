import { useParams } from 'react-router-dom';
import { Skeleton } from '@/shared/ui/skeleton';
import { useProperty, usePropertyAvailability, useProperties } from '@/entities/property';
import { usePropertyReviews } from '@/entities/review';
import { useUsers } from '@/entities/user/api/queries';
import { BookingForm } from '@/widgets/booking-form/ui/booking-form';
import { PropertyHero } from './property-hero';
import { AmenitiesList } from './amenities-list';
import { ReviewsList } from './reviews-list';
import { SimilarProperties } from './similar-properties';

export function PropertyDetailsPage() {
  const { id } = useParams();

  // Waterfall start: Property first
  const { property, isLoading: propertyLoading } = useProperty(id);

  // Waterfall 1: Reviews after property loaded (depends on property?.id)
  const { reviews, isLoading: reviewsLoading } = usePropertyReviews(property?.id);

  // Waterfall 2: Fetch ALL users then filter client-side to get reviewer info
  const { users, isLoading: usersLoading } = useUsers();
  const reviewerIds = reviews?.map(r => r.user_id) || [];
  const reviewers = users?.filter(u => reviewerIds.includes(u.id)) || [];

  // Waterfall 3: Similar properties - fetch ALL then filter by category
  const { properties: allProperties, isLoading: similarLoading } = useProperties();
  const similarProperties = allProperties
    ?.filter(p => p.id !== property?.id && p.city === property?.city)
    ?.slice(0, 4) || [];

  // Waterfall 4: Availability after property loaded
  const { availability, isLoading: availabilityLoading } = usePropertyAvailability(property?.id);

  const handleBookingSubmit = (bookingData) => {
    console.log('Booking submitted:', bookingData);
  };

  if (propertyLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Skeleton className="h-96 rounded-xl mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Property not found</h1>
        <p className="text-muted-foreground">
          The property you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <PropertyHero property={property} />

      <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card rounded-2xl p-6 shadow-lg border border-border/50">
              <h1 className="text-3xl font-bold mb-2">{property.name}</h1>
              <p className="text-muted-foreground mb-6">{property.city}</p>
              <p className="text-foreground/80 leading-relaxed">
                {property.description || 'Experience premium business accommodation with all the amenities you need for a productive stay.'}
              </p>
            </div>

            <AmenitiesList amenities={property.amenities} />

            <ReviewsList
              reviews={reviews}
              reviewers={reviewers}
              isLoading={reviewsLoading || usersLoading}
            />
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingForm
                property={property}
                availability={availability}
                onSubmit={handleBookingSubmit}
                isSubmitting={false}
              />
            </div>
          </div>
        </div>

        <SimilarProperties
          properties={similarProperties}
          isLoading={similarLoading}
        />
      </div>
    </div>
  );
}
