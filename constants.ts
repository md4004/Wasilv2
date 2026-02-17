
import { Service, Location, Dispatcher, Review, CountryInfo } from './types';

export const SERVICES: Service[] = [
  // POWER/SOLAR
  { id: 'solar-check', category: 'POWER/SOLAR', title: 'Battery Health Check', description: 'Deep diagnostic for UPS/Solar battery banks.', icon: '🔋', basePrice: 30, priority: 'High' },
  { id: 'inverter-beep', category: 'POWER/SOLAR', title: 'Inverter Troubleshooting', description: 'Fixing beeping alarms and transfer errors.', icon: '⚡', basePrice: 40, priority: 'High' },
  { id: 'panel-clean', category: 'POWER/SOLAR', title: 'Solar Panel Cleaning', description: 'Optimizing efficiency with safe cleaning.', icon: '☀️', basePrice: 25, priority: 'Normal' },
  
  // IT & TECH
  { id: 'wifi-fix', category: 'IT & TECH', title: 'Wi-Fi Troubleshooting', description: 'Resolving dead zones and router restarts.', icon: '📶', basePrice: 20, priority: 'Normal' },
  { id: 'laptop-repair', category: 'IT & TECH', title: 'Laptop & Desktop Repair', description: 'Hardware fixes or software cleanup.', icon: '💻', basePrice: 50, priority: 'Normal' },
  { id: 'printer-setup', category: 'IT & TECH', title: 'Printer & Device Setup', description: 'Installing new devices for parents.', icon: '🖨️', basePrice: 15, priority: 'Normal' },
  
  // HOUSEHOLD
  { id: 'home-chef', category: 'HOUSEHOLD', title: 'Cooking (Home Chef)', description: 'Home-cooked meals for your parents.', icon: '🥘', basePrice: 45, priority: 'Normal' },
  { id: 'cleaning', category: 'HOUSEHOLD', title: 'Home Cleaning', description: 'Deep cleaning and tidying up.', icon: '✨', basePrice: 35, priority: 'Normal' },
  { id: 'pet-care', category: 'HOUSEHOLD', title: 'Pet Care', description: 'Dog walking and pet feeding.', icon: '🐾', basePrice: 25, priority: 'Normal' },

  // PLUMBING
  { id: 'leak-repair', category: 'PLUMBING', title: 'Leak Repair', description: 'Fixing pipes, faucets, or boiler issues.', icon: '🚰', basePrice: 35, priority: 'High' },
  { id: 'tank-fill', category: 'PLUMBING', title: 'Water Tank Coordination', description: 'Ensuring water delivery and level checks.', icon: '💧', basePrice: 15, priority: 'Normal' },
  
  // ESSENTIALS
  { id: 'medication', category: 'ESSENTIALS', title: 'Medication Delivery', description: 'Sourcing and delivery of chronic meds.', icon: '💊', basePrice: 15, priority: 'High' },
  { id: 'grocery', category: 'ESSENTIALS', title: 'Grocery Shopping', description: 'Fresh produce and pantry stocking.', icon: '🛒', basePrice: 20, priority: 'Normal' },
  
  // OTHER
  { id: 'custom-request', category: 'OTHER', title: 'Custom Request', description: 'A unique need not listed above? Describe it and we will handle it.', icon: '✨', basePrice: 50, priority: 'Normal' },
];

export const LOCATIONS: Location[] = [
  'Beirut (Central)', 'Beirut (Hamra)', 'Beirut (Ashrafieh)', 'Jal El Dib', 'Antelias', 
  'Jounieh', 'Byblos', 'Zahle', 'Tripoli', 'Saida', 'Tyre'
];

export const COUNTRIES: CountryInfo[] = [
  { 
    name: 'Lebanon', 
    code: '+961', 
    cities: ['Beirut', 'Jounieh', 'Tripoli', 'Saida', 'Tyre', 'Byblos', 'Zahle', 'Baabda', 'Nabatieh', 'Baalbek'] 
  },
  { 
    name: 'United Arab Emirates', 
    code: '+971', 
    cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain', 'Al Ain', 'Khor Fakkan', 'Kalba'] 
  },
  { 
    name: 'France', 
    code: '+33', 
    cities: ['Paris', 'Lyon', 'Marseille', 'Nice', 'Toulouse', 'Bordeaux', 'Lille', 'Strasbourg', 'Nantes', 'Montpellier'] 
  },
  { 
    name: 'United Kingdom', 
    code: '+44', 
    cities: ['London', 'Manchester', 'Birmingham', 'Glasgow', 'Liverpool', 'Edinburgh', 'Bristol', 'Leeds', 'Sheffield', 'Leicester'] 
  },
  { 
    name: 'USA', 
    code: '+1', 
    cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami', 'San Francisco', 'Washington DC', 'Boston', 'Dallas', 'Austin'] 
  },
  { 
    name: 'Canada', 
    code: '+1', 
    cities: ['Toronto', 'Montreal', 'Vancouver', 'Ottawa', 'Calgary', 'Edmonton', 'Quebec City', 'Winnipeg', 'Mississauga', 'Brampton'] 
  },
  { 
    name: 'Australia', 
    code: '+61', 
    cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra', 'Hobart', 'Darwin', 'Wollongong'] 
  },
  { 
    name: 'Germany', 
    code: '+49', 
    cities: ['Berlin', 'Munich', 'Frankfurt', 'Hamburg', 'Cologne', 'Stuttgart', 'Dusseldorf', 'Dortmund', 'Leipzig', 'Essen'] 
  },
  { 
    name: 'Saudi Arabia', 
    code: '+966', 
    cities: ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina', 'Khobar', 'Dhahran', 'Tabuk', 'Abha', 'Taif'] 
  },
  { 
    name: 'Kuwait', 
    code: '+965', 
    cities: ['Kuwait City', 'Salmiya', 'Hawally', 'Farwaniya', 'Ahmadi', 'Jahra', 'Mubarak Al-Kabeer', 'Fahaheel', 'Mangaf', 'Salwa'] 
  },
  { 
    name: 'Qatar', 
    code: '+974', 
    cities: ['Doha', 'Al Wakrah', 'Al Khor', 'Al Rayyan', 'Lusail', 'Mesaieed', 'Madinat ash Shamal', 'Dukhan', 'Al Daayen', 'Umm Salal'] 
  }
];

export const DISPATCHERS: Dispatcher[] = [
  {
    id: 'disp-1',
    name: 'Samer',
    role: 'Electrical Specialist & Scout Leader',
    rating: 4.9,
    certifications: ['Certified Electrician', 'First Aid Trained', 'Solar Pro'],
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    // Fix: Added missing required property supportedServiceIds
    supportedServiceIds: ['solar-check', 'inverter-beep', 'panel-clean', 'leak-repair', 'tank-fill']
  },
  {
    id: 'disp-2',
    name: 'Rami',
    role: 'IT Technician & Logistics Pro',
    rating: 4.8,
    certifications: ['Cisco Certified', 'Emergency Responder', 'Safe Driver'],
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    // Fix: Added missing required property supportedServiceIds
    supportedServiceIds: ['wifi-fix', 'laptop-repair', 'printer-setup', 'medication', 'grocery']
  }
];

export const REVIEWS: Review[] = [
  {
    id: 'rev-1',
    dispatcherId: 'disp-1',
    expatName: 'Marie K.',
    text: 'Samer fixed my parents inverter in record time. He was so respectful to my father.',
    rating: 5,
    fieldPhotoUrl: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=400&fit=crop'
  },
  {
    id: 'rev-2',
    dispatcherId: 'disp-1',
    expatName: 'Hady S.',
    text: 'The battery health check gave me peace of mind knowing the power wont cut tonight.',
    rating: 5,
    fieldPhotoUrl: 'https://images.unsplash.com/photo-1620216519163-90977813a30c?w=400&h=300&fit=crop'
  },
  {
    id: 'rev-3',
    dispatcherId: 'disp-2',
    expatName: 'Lina M.',
    text: 'Technically brilliant and incredibly patient. My mother finally has reliable Wi-Fi.',
    rating: 5,
    fieldPhotoUrl: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400&h=300&fit=crop'
  }
];

export const MARKUP_PERCENTAGE = 0.50;

export const CANCELLATION_REASONS = [
  "Issue resolved independently",
  "Parent no longer available at this time",
  "Change of plans",
  "Technical error in request",
  "Other (Specify)"
];