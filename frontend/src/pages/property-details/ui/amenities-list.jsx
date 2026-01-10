import { Wifi, Car, Coffee, Tv, Wind, Dumbbell, Waves, Utensils, Briefcase, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

const amenityIcons = {
  wifi: Wifi,
  parking: Car,
  coffee: Coffee,
  tv: Tv,
  ac: Wind,
  gym: Dumbbell,
  pool: Waves,
  kitchen: Utensils,
  workspace: Briefcase,
  security: Shield,
};

const amenityLabels = {
  wifi: 'High-Speed WiFi',
  parking: 'Free Parking',
  coffee: 'Coffee Machine',
  tv: 'Smart TV',
  ac: 'Air Conditioning',
  gym: 'Fitness Center',
  pool: 'Swimming Pool',
  kitchen: 'Full Kitchen',
  workspace: 'Dedicated Workspace',
  security: '24/7 Security',
};

export function AmenitiesList({ amenities = [] }) {
  const amenityList = Array.isArray(amenities) ? amenities : [];

  if (amenityList.length === 0) {
    return null;
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-xl">Amenities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {amenityList.map((amenity, index) => {
            const IconComponent = amenityIcons[amenity] || Shield;
            const label = amenityLabels[amenity] || amenity;

            return (
              <div
                key={`amenity-${index}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <IconComponent className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium">{label}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
