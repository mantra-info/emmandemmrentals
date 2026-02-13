import {
  Wifi,
  AirVent,
  Flame,
  Shirt,
  Wind,
  UtensilsCrossed,
  ParkingCircle,
  Waves,
  Droplets,
  Dumbbell,
  Tv,
  Trees,
  Mountain,
  Music,
  Coffee,
  Utensils,
  Snowflake,
  Shield,
  Key,
  Fan,
  DoorOpen,
  Car,
  Monitor,
  CookingPot,
  Refrigerator,
  Microwave,
  Bath,
  ShowerHead,
  Sofa,
  Hammer,
  KeyRound,
  PawPrint,
  Bike,
  FlameKindling,
  Sun,
  Plug,
  WashingMachine,
  Baby,
} from 'lucide-react';

export type AmenityCategory =
  | 'scenic_views'
  | 'bathroom'
  | 'bedroom_laundry'
  | 'essentials'
  | 'entertainment'
  | 'heating_cooling'
  | 'home_safety'
  | 'internet_office'
  | 'kitchen_dining'
  | 'location_features'
  | 'outdoor'
  | 'parking_facilities'
  | 'services'
  | 'family';

export interface Amenity {
  id: string;
  name: string;
  icon: string; // lucide icon name
  category: AmenityCategory;
  description?: string;
}

export type AmenityStatus = 'included' | 'not_included';

export interface AmenitySelection {
  id: string;
  status: AmenityStatus;
}

export const AMENITIES_LIST: Amenity[] = [
  // Scenic views
  { id: 'ocean-view', name: 'Ocean view', icon: 'waves', category: 'scenic_views' },
  { id: 'pool-view', name: 'Pool view', icon: 'droplets', category: 'scenic_views' },
  { id: 'sea-view', name: 'Sea view', icon: 'waves', category: 'scenic_views' },

  // Bathroom
  { id: 'hot-water', name: 'Hot water', icon: 'bath', category: 'bathroom' },
  { id: 'shower-gel', name: 'Shower gel', icon: 'droplets', category: 'bathroom' },
  { id: 'hair-dryer', name: 'Hair dryer', icon: 'wind', category: 'bathroom' },
  { id: 'shampoo', name: 'Shampoo', icon: 'droplets', category: 'bathroom' },
  { id: 'conditioner', name: 'Conditioner', icon: 'droplets', category: 'bathroom' },
  { id: 'body-soap', name: 'Body soap', icon: 'droplets', category: 'bathroom' },

  // Bedroom and laundry
  { id: 'washing-machine', name: 'Washing machine', icon: 'washing-machine', category: 'bedroom_laundry' },
  { id: 'dryer', name: 'Dryer', icon: 'wind', category: 'bedroom_laundry' },
  { id: 'essentials', name: 'Essentials', icon: 'shirt', category: 'bedroom_laundry', description: 'Towels, bed sheets, soap and toilet paper' },
  { id: 'bed-linen', name: 'Bed linen', icon: 'sofa', category: 'bedroom_laundry' },
  { id: 'cotton-linen', name: 'Cotton linen', icon: 'sofa', category: 'bedroom_laundry' },
  { id: 'hangers', name: 'Hangers', icon: 'shirt', category: 'bedroom_laundry' },
  { id: 'extra-pillows', name: 'Extra pillows and blankets', icon: 'sofa', category: 'bedroom_laundry' },
  { id: 'iron', name: 'Iron', icon: 'hammer', category: 'bedroom_laundry' },
  { id: 'clothes-storage', name: 'Clothes storage', icon: 'sofa', category: 'bedroom_laundry' },

  // Entertainment
  { id: 'tv', name: 'TV', icon: 'tv', category: 'entertainment', description: 'TV with standard cable/satellite' },
  { id: 'games-console', name: 'Games console', icon: 'music', category: 'entertainment' },
  { id: 'pool-table', name: 'Pool table', icon: 'music', category: 'entertainment' },
  { id: 'books', name: 'Books and reading material', icon: 'music', category: 'entertainment' },
  { id: 'ping-pong', name: 'Ping pong table', icon: 'music', category: 'entertainment' },
  { id: 'mini-golf', name: 'Mini golf', icon: 'music', category: 'entertainment' },
  { id: 'exercise-equipment', name: 'Exercise equipment', icon: 'dumbbell', category: 'entertainment' },
  { id: 'life-size-games', name: 'Life-size games', icon: 'music', category: 'entertainment' },

  // Heating and cooling
  { id: 'air-conditioning', name: 'Air conditioning', icon: 'air-vent', category: 'heating_cooling' },
  { id: 'heating', name: 'Heating', icon: 'flame', category: 'heating_cooling' },
  { id: 'indoor-fireplace', name: 'Indoor fireplace', icon: 'flame', category: 'heating_cooling' },
  { id: 'ceiling-fan', name: 'Ceiling fan', icon: 'fan', category: 'heating_cooling' },

  // Home safety
  { id: 'smoke-alarm', name: 'Smoke alarm', icon: 'shield', category: 'home_safety' },
  { id: 'carbon-monoxide-alarm', name: 'Carbon monoxide alarm', icon: 'shield', category: 'home_safety' },
  { id: 'fire-extinguisher', name: 'Fire extinguisher', icon: 'shield', category: 'home_safety' },

  // Internet and office
  { id: 'wifi', name: 'Wifi', icon: 'wifi', category: 'internet_office' },
  { id: 'ethernet', name: 'Ethernet connection', icon: 'plug', category: 'internet_office' },
  { id: 'dedicated-workspace', name: 'Dedicated workspace', icon: 'monitor', category: 'internet_office', description: 'In a room with a door' },

  // Kitchen and dining
  { id: 'kitchen', name: 'Kitchen', icon: 'utensils-crossed', category: 'kitchen_dining', description: 'Space where guests can cook their own meals' },
  { id: 'fridge', name: 'Fridge', icon: 'refrigerator', category: 'kitchen_dining' },
  { id: 'microwave', name: 'Microwave', icon: 'microwave', category: 'kitchen_dining' },
  { id: 'cooking-basics', name: 'Cooking basics', icon: 'cooking-pot', category: 'kitchen_dining', description: 'Pots and pans, oil, salt and pepper' },
  { id: 'dishes-cutlery', name: 'Dishes and cutlery', icon: 'utensils', category: 'kitchen_dining', description: 'Bowls, chopsticks, plates, cups, etc.' },
  { id: 'mini-fridge', name: 'Mini fridge', icon: 'refrigerator', category: 'kitchen_dining' },
  { id: 'freezer', name: 'Freezer', icon: 'snowflake', category: 'kitchen_dining' },
  { id: 'dishwasher', name: 'Dishwasher', icon: 'utensils', category: 'kitchen_dining' },
  { id: 'cooker', name: 'Cooker', icon: 'cooking-pot', category: 'kitchen_dining' },
  { id: 'oven', name: 'Oven', icon: 'flame', category: 'kitchen_dining' },
  { id: 'coffee-maker', name: 'Coffee maker', icon: 'coffee', category: 'kitchen_dining' },
  { id: 'wine-glasses', name: 'Wine glasses', icon: 'coffee', category: 'kitchen_dining' },
  { id: 'dining-table', name: 'Dining table', icon: 'utensils', category: 'kitchen_dining' },
  { id: 'kettle', name: 'Kettle', icon: 'coffee', category: 'kitchen_dining' },
  { id: 'toaster', name: 'Toaster', icon: 'coffee', category: 'kitchen_dining' },
  { id: 'baking-sheet', name: 'Baking sheet', icon: 'cooking-pot', category: 'kitchen_dining' },
  { id: 'blender', name: 'Blender', icon: 'coffee', category: 'kitchen_dining' },
  { id: 'barbecue-utensils', name: 'Barbecue utensils', icon: 'utensils', category: 'kitchen_dining' },

  // Location features
  { id: 'private-entrance', name: 'Private entrance', icon: 'door-open', category: 'location_features', description: 'Separate street or building entrance' },
  { id: 'waterfront', name: 'Waterfront', icon: 'waves', category: 'location_features', description: 'Right next to a body of water' },
  { id: 'launderette-nearby', name: 'Launderette nearby', icon: 'shirt', category: 'location_features' },

  // Outdoor
  { id: 'patio-balcony', name: 'Patio or balcony', icon: 'trees', category: 'outdoor' },
  { id: 'outdoor-furniture', name: 'Outdoor furniture', icon: 'trees', category: 'outdoor' },
  { id: 'bbq-grill', name: 'BBQ grill', icon: 'flame', category: 'outdoor' },
  { id: 'firepit', name: 'Firepit', icon: 'flame-kindling', category: 'outdoor' },
  { id: 'hammock', name: 'Hammock', icon: 'trees', category: 'outdoor' },
  { id: 'outdoor-dining', name: 'Outdoor dining area', icon: 'utensils', category: 'outdoor' },
  { id: 'outdoor-kitchen', name: 'Outdoor kitchen', icon: 'utensils-crossed', category: 'outdoor' },
  { id: 'private-back-garden', name: 'Private back garden', icon: 'trees', category: 'outdoor', description: 'Fully fenced' },
  { id: 'boat-berth', name: 'Boat berth', icon: 'waves', category: 'outdoor' },
  { id: 'sun-loungers', name: 'Sun loungers', icon: 'sun', category: 'outdoor' },
  { id: 'bikes', name: 'Bikes', icon: 'bike', category: 'outdoor' },
  { id: 'kayak', name: 'Kayak', icon: 'waves', category: 'outdoor' },

  // Parking and facilities
  { id: 'free-parking', name: 'Free parking on premises', icon: 'parking-circle', category: 'parking_facilities' },
  { id: 'pool', name: 'Pool', icon: 'waves', category: 'parking_facilities' },
  { id: 'hot-tub', name: 'Hot tub', icon: 'droplets', category: 'parking_facilities' },
  { id: 'ev-charger', name: 'EV charger', icon: 'plug', category: 'parking_facilities', description: 'Guests can charge their electric vehicles on the property' },
  { id: 'private-gym', name: 'Private gym', icon: 'dumbbell', category: 'parking_facilities' },
  { id: 'single-level', name: 'Single level home', icon: 'door-open', category: 'parking_facilities' },

  // Services
  { id: 'self-check-in', name: 'Self check-in', icon: 'key-round', category: 'services', description: 'Check yourself in to the home with a door code' },
  { id: 'keypad', name: 'Keypad', icon: 'key', category: 'services' },
  { id: 'pets-allowed', name: 'Pets allowed', icon: 'paw-print', category: 'services' },
  { id: 'long-term-stays', name: 'Long-term stays allowed', icon: 'key', category: 'services', description: 'Allow stays of 28 days or more' },

  // Family
  { id: 'cot', name: 'Cot', icon: 'baby', category: 'family', description: 'Available upon request' },
  { id: 'playpen', name: 'Playpen/travel cot', icon: 'baby', category: 'family', description: 'Available upon request' },
  { id: 'high-chair', name: 'High chair', icon: 'baby', category: 'family', description: 'With food tray' },
];

// Function to get icon component dynamically
export const getAmenityIcon = (iconName: string) => {
  const iconMap: Record<string, any> = {
    'wifi': Wifi,
    'air-vent': AirVent,
    'flame': Flame,
    'shirt': Shirt,
    'wind': Wind,
    'utensils-crossed': UtensilsCrossed,
    'parking-circle': ParkingCircle,
    'waves': Waves,
    'droplets': Droplets,
    'dumbbell': Dumbbell,
    'tv': Tv,
    'trees': Trees,
    'music': Music,
    'coffee': Coffee,
    'utensils': Utensils,
    'snowflake': Snowflake,
    'shield': Shield,
    'fan': Fan,
    'door-open': DoorOpen,
    'car': Car,
    'monitor': Monitor,
    'cooking-pot': CookingPot,
    'refrigerator': Refrigerator,
    'microwave': Microwave,
    'bath': Bath,
    'shower-head': ShowerHead,
    'sofa': Sofa,
    'hammer': Hammer,
    'key-round': KeyRound,
    'paw-print': PawPrint,
    'bike': Bike,
    'flame-kindling': FlameKindling,
    'sun': Sun,
    'plug': Plug,
    'washing-machine': WashingMachine,
    'baby': Baby,
  };
  return iconMap[iconName] || Wifi;
};

export const AMENITY_CATEGORIES = {
  scenic_views: 'Scenic views',
  bathroom: 'Bathroom',
  bedroom_laundry: 'Bedroom and laundry',
  essentials: 'Essentials',
  entertainment: 'Entertainment',
  heating_cooling: 'Heating and cooling',
  home_safety: 'Home safety',
  internet_office: 'Internet and office',
  kitchen_dining: 'Kitchen and dining',
  location_features: 'Location features',
  outdoor: 'Outdoor',
  parking_facilities: 'Parking and facilities',
  services: 'Services',
  family: 'Family',
};

export const getAmenitiesByCategory = (category: keyof typeof AMENITY_CATEGORIES) => {
  return AMENITIES_LIST.filter(a => a.category === category);
};

export const resolveAmenitySelections = (amenities: any[] = []) => {
  const byId = new Map<string, AmenityStatus>();
  const byName = new Map<string, AmenityStatus>();
  const selectionById = new Map<string, any>();
  const customItems: Amenity[] = [];

  amenities.forEach((amenity) => {
    if (!amenity) return;
    if (typeof amenity === 'string') {
      byName.set(amenity.toLowerCase(), 'included');
      return;
    }
    if (amenity.id) {
      selectionById.set(amenity.id, amenity);
      if (amenity.status === 'included' || amenity.status === 'not_included') {
        byId.set(amenity.id, amenity.status);
      } else {
        byId.set(amenity.id, 'included');
      }
      if (amenity.custom) {
        customItems.push({
          id: amenity.id,
          name: amenity.name || 'Custom amenity',
          icon: amenity.icon || 'wifi',
          category: amenity.category || 'essentials',
          description: amenity.description,
        });
      }
    } else if (amenity.name) {
      byName.set(String(amenity.name).toLowerCase(), 'included');
    }
  });

  const included = AMENITIES_LIST.filter((a) => byId.get(a.id) === 'included' || byName.get(a.name.toLowerCase()) === 'included')
    .map((amenity) => {
      const selection = selectionById.get(amenity.id);
      if (selection?.description) {
        return { ...amenity, description: selection.description };
      }
      return amenity;
    });
  const notIncluded = AMENITIES_LIST.filter((a) => byId.get(a.id) === 'not_included');

  const customIncluded = customItems.filter((a) => byId.get(a.id) !== 'not_included');
  const customNotIncluded = customItems.filter((a) => byId.get(a.id) === 'not_included');

  return { included: [...included, ...customIncluded], notIncluded: [...notIncluded, ...customNotIncluded], statusById: byId };
};
