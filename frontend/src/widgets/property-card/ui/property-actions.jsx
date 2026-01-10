import { Heart, Share2, Calendar, ExternalLink } from 'lucide-react';
import { Button } from '@/shared/ui/button';

export function PropertyActions({
  property,
  user,
  isFavorite,
  onFavorite,
  onBook,
  onShare,
  showBookButton = true,
}) {
  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavorite) {
      onFavorite(property.id);
    }
  };

  const handleShareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onShare) {
      onShare(property);
    } else {
      navigator.clipboard.writeText(window.location.origin + `/properties/${property.id}`);
    }
  };

  const handleBookClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onBook) {
      onBook(property);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleFavoriteClick}
        className={`flex-1 ${isFavorite ? 'text-rose-500' : 'text-muted-foreground'}`}
      >
        <Heart className={`h-4 w-4 mr-1 ${isFavorite ? 'fill-current' : ''}`} />
        {isFavorite ? 'Saved' : 'Save'}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleShareClick}
        className="flex-1 text-muted-foreground"
      >
        <Share2 className="h-4 w-4 mr-1" />
        Share
      </Button>

      {showBookButton && (
        <Button
          variant="default"
          size="sm"
          onClick={handleBookClick}
          className="flex-1"
        >
          <Calendar className="h-4 w-4 mr-1" />
          Book
        </Button>
      )}
    </div>
  );
}
