
export enum ServiceType {
  PLACES = 'Places',
  RATINGS = 'Social Ratings',
  SEO = 'SEO',
  OPTIMIZATION = 'Optimization',
  AUTOMATION = 'Workflow Automation'
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  comment: string;
  rating: number;
}

export interface Review {
  id: string;
  propertyId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  comment: string;
}

export interface BookingFormData {
  name: string;
  email: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  message: string;
}

export type UserRole = 'user' | 'admin';
export type Language = 'en' | 'kn' | 'hi';
export type AppTheme = 'dark' | 'light';

export interface UserSettings {
  language: Language;
  theme: AppTheme;
  notifications: boolean;
}

export interface User {
  id: string;
  name: string; // Full display name
  firstName?: string;
  lastName?: string;
  contact?: string;
  gender?: 'Male' | 'Female' | 'Other';
  dob?: string;
  address?: string;
  email: string;
  role: UserRole;
  avatar?: string;
  settings?: UserSettings;
}

export interface Booking {
  id: string;
  propertyId: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  totalPrice: string;
}

export type PropertyCategory = 'Villa' | 'Apartment' | 'PG' | 'Hostel' | 'Cottage';
export type GuestType = 'Any' | 'Family' | 'Male' | 'Female';
export type PropertyStatus = 'approved' | 'pending' | 'rejected';

export interface PropertyOwner {
  name: string;
  contact: string;
  email: string;
  avatar?: string;
}

export interface Property {
  id: string;
  owner_id?: string; // Link to the User ID of the owner
  title: string;
  location: string;
  category: PropertyCategory;
  allowedGuest: GuestType;
  price: string;
  priceValue: number; // Numeric value for sorting/filtering
  rating: number;
  mainImage: string;
  galleryImages: string[];
  description: string;
  amenities: string[];
  specs: {
    guests: number;
    bedrooms: number;
    bathrooms: number;
    size: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  status?: PropertyStatus; // Optional for backward compatibility with static data
  owner?: PropertyOwner;
  distance?: number;
}
