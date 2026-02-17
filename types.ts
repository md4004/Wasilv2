

export enum RequestStatus {
  REQUESTED = 'Requested',
  ASSIGNED = 'Runner Assigned',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export type Category = 'IT & TECH' | 'POWER/SOLAR' | 'PLUMBING' | 'ESSENTIALS' | 'HOUSEHOLD' | 'OTHER';

export type Language = 'en' | 'fr' | 'ar';

export type UserRole = 'user' | 'dispatcher' | 'admin';

export type Location = 
  | 'Beirut (Central)' 
  | 'Beirut (Hamra)' 
  | 'Beirut (Ashrafieh)' 
  | 'Jal El Dib' 
  | 'Antelias' 
  | 'Jounieh' 
  | 'Byblos' 
  | 'Zahle' 
  | 'Tripoli' 
  | 'Saida' 
  | 'Tyre';

export interface Service {
  id: string;
  category: Category;
  title: string;
  description: string;
  icon: string;
  basePrice: number;
  priority: 'High' | 'Normal';
}

export interface Dependant {
  id: string;
  userId?: string; // Track who this dependant belongs to
  userName?: string; // For Admin view
  name: string;
  dateOfBirth: string;
  location: Location;
  fullAddress: string;
  medicalConditions: string;
  medications: string[];
  photoUrl?: string;
  gender: 'Male' | 'Female';
}

export interface Provider {
  id: string;
  name: string;
  role: string;
  rating: number;
  certifications: string[];
  photoUrl: string;
  workingVideoUrl?: string;
  fieldPhotoUrl?: string;
  supportedServiceIds: string[];
}

// Fix: Export Dispatcher as an alias for Provider to satisfy imports in components using "Dispatcher" terminology
export type Dispatcher = Provider;

export interface Review {
  id: string;
  dispatcherId: string;
  expatName: string;
  text: string;
  rating: number;
  fieldPhotoUrl: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface ServiceRequest {
  id: string;
  userId: string;
  userName?: string; // Added to track request ownership in Admin view
  serviceId: string;
  serviceTitle: string;
  category: Category;
  dependantId: string;
  parentName: string;
  location: Location;
  status: RequestStatus;
  urgentNotes: string;
  expatPrice: number;
  runnerPayout: number;
  timestamp: string;
  aiReassurance?: string;
  isCustom?: boolean;
  assignedDispatcherId?: string;
  cancellationReason?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export type SubscriptionTier = 'Basic' | 'Standard' | 'Premium';

export interface User {
  uid: string;
  name: string;
  email: string;
  dateOfBirth?: string;
  phone: string;
  country: string;
  address: string;
  photoUrl: string;
  plan: SubscriptionTier;
  role: UserRole;
  savedAddresses?: { name: string; area: Location }[];
}

export type AppView = 
  | 'DASHBOARD' 
  | 'CATALOG' 
  | 'REQUEST_FLOW' 
  | 'TRACKING' 
  | 'ACCOUNT' 
  | 'AUTH' 
  | 'DEPENDANTS' 
  | 'NOTIFICATIONS_FULL' 
  | 'PAYMENT_METHODS_ADD'
  | 'DISPATCHERS'
  | 'DISPATCHER_DASHBOARD'
  | 'ADMIN_DASHBOARD';

export interface CountryInfo {
  name: string;
  code: string;
  cities: string[];
}