import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['super_admin', 'admin', 'property_owner']).default('property_owner')
});

export const boardingHouseSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-safe (lowercase letters, numbers, hyphens)'),
  shortDescription: z.string().max(255).optional().nullable(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  district: z.string().min(2, 'District is required'),
  postalCode: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  monthlyPrice: z.number().min(0, 'Monthly price must be positive'),
  deposit: z.number().min(0).optional().nullable(),
  electricityIncluded: z.boolean().default(false),
  waterIncluded: z.boolean().default(false),
  genderPolicy: z.enum(['male_only', 'female_only', 'mixed']).default('mixed'),
  smokingPolicy: z.string().optional().nullable(),
  petPolicy: z.string().optional().nullable(),
  visitorPolicy: z.string().optional().nullable(),
  status: z.enum(['published', 'draft', 'archived']).default('published'),
  isFeatured: z.boolean().default(false),
  contactNumber: z.string().optional().nullable(),
  facilityIds: z.array(z.string()).optional()
});

export const roomSchema = z.object({
  boardingHouseId: z.string().uuid().or(z.string()),
  roomNumber: z.string().min(1, 'Room number is required'),
  roomType: z.string().min(1, 'Room type is required (e.g. Standard, Deluxe)'),
  description: z.string().optional().nullable(),
  price: z.number().min(0, 'Price must be positive'),
  size: z.string().optional().nullable(),
  status: z.enum(['available', 'occupied', 'reserved', 'maintenance']).default('available'),
  facilityIds: z.array(z.string()).optional()
});

export const facilitySchema = z.object({
  name: z.string().min(2, 'Facility name must be at least 2 characters'),
  icon: z.string().min(1, 'Icon name is required')
});

export const imageConfirmSchema = z.object({
  storageKey: z.string().min(1),
  imageUrl: z.string().url('Invalid image URL'),
  thumbnailUrl: z.string().url().optional().nullable(),
  altText: z.string().optional().nullable(),
  isPrimary: z.boolean().default(false),
  sortOrder: z.number().int().default(0)
});

export const imageReorderSchema = z.object({
  imageOrders: z.array(z.object({
    id: z.string(),
    sortOrder: z.number().int()
  }))
});

