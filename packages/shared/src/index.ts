export type UserRole = 'super_admin' | 'admin' | 'property_owner';

export type RoomStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';

export type BoardingHouseStatus = 'published' | 'draft' | 'archived';

export type GenderPolicy = 'male_only' | 'female_only' | 'mixed';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BoardingHouseFacility {
  id: string;
  boardingHouseId: string;
  facilityId: string;
  facility?: Facility;
}

export interface Facility {
  id: string;
  name: string;
  icon: string;
  createdAt: string;
}

export interface BoardingHouseImage {
  id: string;
  boardingHouseId: string;
  storageKey: string;
  imageUrl: string;
  thumbnailUrl?: string | null;
  altText?: string | null;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface Room {
  id: string;
  boardingHouseId: string;
  roomNumber: string;
  roomType: string;
  description?: string | null;
  price: number;
  size?: string | null;
  status: RoomStatus;
  createdAt: string;
  updatedAt: string;
  facilities?: Facility[];
}

export interface BoardingHouse {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  description: string;
  address: string;
  city: string;
  district: string;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  monthlyPrice: number;
  deposit?: number | null;
  electricityIncluded: boolean;
  waterIncluded: boolean;
  genderPolicy: GenderPolicy;
  smokingPolicy?: string | null;
  petPolicy?: string | null;
  visitorPolicy?: string | null;
  status: BoardingHouseStatus;
  isFeatured: boolean;
  contactNumber?: string | null;
  totalViews?: number;
  createdAt: string;
  updatedAt: string;
  images?: BoardingHouseImage[];
  rooms?: Room[];
  facilities?: Facility[];
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  availableRoomsCount?: number;
  totalRoomsCount?: number;
  primaryImage?: BoardingHouseImage | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: any;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

export interface DashboardStats {
  totalBoardingHouses: number;
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  totalPropertyViews: number;
  recentlyAddedProperties: BoardingHouse[];
  recentActivities: ActivityLog[];
}

