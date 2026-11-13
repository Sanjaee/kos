import { pgTable, text, timestamp, boolean, integer, numeric, index, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['super_admin', 'admin', 'property_owner'] }).notNull().default('property_owner'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const boardingHouses = pgTable('boarding_houses', {
  id: uuid('id').defaultRandom().primaryKey(),
  ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  shortDescription: text('short_description'),
  description: text('description').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  district: text('district').notNull(),
  postalCode: text('postal_code'),
  latitude: numeric('latitude'),
  longitude: numeric('longitude'),
  monthlyPrice: integer('monthly_price').notNull(),
  deposit: integer('deposit').default(0),
  electricityIncluded: boolean('electricity_included').notNull().default(false),
  waterIncluded: boolean('water_included').notNull().default(false),
  genderPolicy: text('gender_policy', { enum: ['male_only', 'female_only', 'mixed'] }).notNull().default('mixed'),
  smokingPolicy: text('smoking_policy'),
  petPolicy: text('pet_policy'),
  visitorPolicy: text('visitor_policy'),
  status: text('status', { enum: ['published', 'draft', 'archived'] }).notNull().default('published'),
  isFeatured: boolean('is_featured').notNull().default(false),
  contactNumber: text('contact_number'),
  totalViews: integer('total_views').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
}, (table) => [
  index('bh_owner_idx').on(table.ownerId),
  index('bh_city_idx').on(table.city),
  index('bh_status_idx').on(table.status),
  index('bh_monthly_price_idx').on(table.monthlyPrice)
]);

export const boardingHouseImages = pgTable('boarding_house_images', {
  id: uuid('id').defaultRandom().primaryKey(),
  boardingHouseId: uuid('boarding_house_id').notNull().references(() => boardingHouses.id, { onDelete: 'cascade' }),
  storageKey: text('storage_key').notNull(),
  imageUrl: text('image_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  altText: text('alt_text'),
  isPrimary: boolean('is_primary').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow()
}, (table) => [
  index('bhi_bh_idx').on(table.boardingHouseId),
  index('bhi_order_idx').on(table.sortOrder)
]);

export const rooms = pgTable('rooms', {
  id: uuid('id').defaultRandom().primaryKey(),
  boardingHouseId: uuid('boarding_house_id').notNull().references(() => boardingHouses.id, { onDelete: 'cascade' }),
  roomNumber: text('room_number').notNull(),
  roomType: text('room_type').notNull(),
  description: text('description'),
  price: integer('price').notNull(),
  size: text('size'),
  status: text('status', { enum: ['available', 'occupied', 'reserved', 'maintenance'] }).notNull().default('available'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
}, (table) => [
  index('rooms_bh_idx').on(table.boardingHouseId),
  index('rooms_status_idx').on(table.status)
]);

export const facilities = pgTable('facilities', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  icon: text('icon').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const boardingHouseFacilities = pgTable('boarding_house_facilities', {
  id: uuid('id').defaultRandom().primaryKey(),
  boardingHouseId: uuid('boarding_house_id').notNull().references(() => boardingHouses.id, { onDelete: 'cascade' }),
  facilityId: uuid('facility_id').notNull().references(() => facilities.id, { onDelete: 'cascade' })
}, (table) => [
  index('bhf_bh_idx').on(table.boardingHouseId),
  index('bhf_facility_idx').on(table.facilityId)
]);

export const roomFacilities = pgTable('room_facilities', {
  id: uuid('id').defaultRandom().primaryKey(),
  roomId: uuid('room_id').notNull().references(() => rooms.id, { onDelete: 'cascade' }),
  facilityId: uuid('facility_id').notNull().references(() => facilities.id, { onDelete: 'cascade' })
}, (table) => [
  index('rf_room_idx').on(table.roomId),
  index('rf_facility_idx').on(table.facilityId)
]);

export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow()
}, (table) => [
  index('logs_user_idx').on(table.userId),
  index('logs_created_idx').on(table.createdAt)
]);

// RELATIONS
export const usersRelations = relations(users, ({ many }) => ({
  boardingHouses: many(boardingHouses),
  activityLogs: many(activityLogs)
}));

export const boardingHousesRelations = relations(boardingHouses, ({ one, many }) => ({
  owner: one(users, {
    fields: [boardingHouses.ownerId],
    references: [users.id]
  }),
  images: many(boardingHouseImages),
  rooms: many(rooms),
  facilities: many(boardingHouseFacilities)
}));

export const boardingHouseImagesRelations = relations(boardingHouseImages, ({ one }) => ({
  boardingHouse: one(boardingHouses, {
    fields: [boardingHouseImages.boardingHouseId],
    references: [boardingHouses.id]
  })
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  boardingHouse: one(boardingHouses, {
    fields: [rooms.boardingHouseId],
    references: [boardingHouses.id]
  }),
  facilities: many(roomFacilities)
}));

export const facilitiesRelations = relations(facilities, ({ many }) => ({
  boardingHouses: many(boardingHouseFacilities),
  rooms: many(roomFacilities)
}));

export const boardingHouseFacilitiesRelations = relations(boardingHouseFacilities, ({ one }) => ({
  boardingHouse: one(boardingHouses, {
    fields: [boardingHouseFacilities.boardingHouseId],
    references: [boardingHouses.id]
  }),
  facility: one(facilities, {
    fields: [boardingHouseFacilities.facilityId],
    references: [facilities.id]
  })
}));

export const roomFacilitiesRelations = relations(roomFacilities, ({ one }) => ({
  room: one(rooms, {
    fields: [roomFacilities.roomId],
    references: [rooms.id]
  }),
  facility: one(facilities, {
    fields: [roomFacilities.facilityId],
    references: [facilities.id]
  })
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id]
  })
}));

