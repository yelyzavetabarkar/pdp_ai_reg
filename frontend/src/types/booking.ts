interface Booking {
  id: number;
  price: number;
  status: string;
  property: Property;
  createdAt: string;
}

interface Property {
  id: number;
  name: string;
  price: number;
  city: string;
}

interface BookingResponse {
  id: number;
  property_id: number;
  user_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: string;
  status: string;
  booking_metadata?: string;
  created_at?: string;
}

interface BookingData {
  id: number;
  propertyId: number;
  userId: number;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

type BookingProps = {
  booking: any;
  onCancel?: Function;
  showActions?: boolean;
};

interface CreateBookingRequest {
  property_id?: number;
  user_id?: number;
  check_in?: string;
  check_out?: string;
  guests?: number;
}

interface BookingWithProperty {
  booking?: {
    id?: number;
    property?: {
      name?: string;
      city?: string;
      price_per_night?: number;
      image_url?: string;
    };
    user?: {
      name?: string;
      email?: string;
    };
    check_in?: string;
    check_out?: string;
    total_price?: string;
    status?: string;
  };
}

export type {
  Booking,
  Property,
  BookingResponse,
  BookingData,
  BookingProps,
  CreateBookingRequest,
  BookingWithProperty,
};
