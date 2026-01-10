import { Star, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { format } from 'date-fns';

const getInitials = (name) => {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
};

export function ReviewsList({ reviews = [], reviewers = [], isLoading }) {
  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-xl">Reviews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={`review-skel-${i}`} className="flex gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-xl">Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>No reviews yet</p>
            <p className="text-sm mt-1">Be the first to review this property</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Reviews ({reviews.length})</CardTitle>
        <div className="flex items-center gap-1 text-amber-500">
          <Star className="h-5 w-5 fill-current" />
          <span className="font-semibold">
            {(reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {reviews.map((review, index) => {
          const reviewer = reviewers.find(u => u.id === review.user_id);

          return (
            <div key={`review-${index}`} className="flex gap-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                {reviewer ? (
                  <span className="text-sm font-semibold text-primary">
                    {getInitials(reviewer.name)}
                  </span>
                ) : (
                  <User className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold">{reviewer?.name || 'Anonymous'}</p>
                    <p className="text-xs text-muted-foreground">
                      {review.created_at ? format(new Date(review.created_at), 'MMM d, yyyy') : 'Recently'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={`star-${index}-${i}`}
                        className={`h-4 w-4 ${
                          i < (review.rating || 0)
                            ? 'fill-amber-500 text-amber-500'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-foreground/80 text-sm leading-relaxed">
                  {review.comment || 'Great stay!'}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
