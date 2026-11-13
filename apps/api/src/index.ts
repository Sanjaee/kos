import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { jwt } from '@elysiajs/jwt';
import { db, schema, users, boardingHouses, rooms, facilities, boardingHouseImages, boardingHouseFacilities, roomFacilities, activityLogs } from '@my-kosan/database';
import { eq, desc, asc, and, or, like, sql, inArray } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-my-kosan-development-at-least-32-characters';
const PORT = process.env.PORT || 3001;

// S3 / R2 Configuration
const s3Configured = Boolean(process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY && process.env.S3_BUCKET_NAME);
const s3Client = s3Configured ? new S3Client({
  region: process.env.S3_REGION || 'auto',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  }
}) : null;

export const app = new Elysia()
  .use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }))
  .use(
    jwt({
      name: 'jwt',
      secret: JWT_SECRET
    })
  )
  .onError(({ code, error, set }) => {
    console.error('API Error:', code, error);
    set.status = code === 'NOT_FOUND' ? 404 : code === 'VALIDATION' ? 400 : 500;
    return {
      success: false,
      error: error.message || 'Internal Server Error'
    };
  })
  .get('/api/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  // --- AUTHENTICATION ---
  .group('/api/auth', (app) =>
    app
      .post('/login', async ({ body, jwt, set }) => {
        const { email, password } = body as any;
        const user = await db.query.users.findFirst({
          where: eq(users.email, email)
        });

        if (!user) {
          set.status = 401;
          return { success: false, error: 'Invalid email or password' };
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          set.status = 401;
          return { success: false, error: 'Invalid email or password' };
        }

        const token = await jwt.sign({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        });

        return {
          success: true,
          data: {
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              avatarUrl: user.avatarUrl
            }
          }
        };
      })
      .get('/me', async ({ headers, jwt, set }) => {
        const auth = headers['authorization'];
        if (!auth?.startsWith('Bearer ')) {
          set.status = 401;
          return { success: false, error: 'Unauthorized' };
        }
        const token = auth.slice(7);
        const payload = await jwt.verify(token);
        if (!payload) {
          set.status = 401;
          return { success: false, error: 'Invalid or expired token' };
        }

        const user = await db.query.users.findFirst({
          where: eq(users.id, payload.id as string)
        });

        if (!user) {
          set.status = 404;
          return { success: false, error: 'User not found' };
        }

        return {
          success: true,
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatarUrl: user.avatarUrl
          }
        };
      })
  )

  // --- PUBLIC & ADMIN KOS ROUTES ---
  .group('/api/kos', (app) =>
    app
      .get('/', async ({ query }) => {
        const search = query.search as string;
        const city = query.city as string;
        const minPrice = query.minPrice ? Number(query.minPrice) : undefined;
        const maxPrice = query.maxPrice ? Number(query.maxPrice) : undefined;
        const gender = query.gender as string;
        const status = query.status as string || 'published';
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 12;
        const offset = (page - 1) * limit;

        const conditions: any[] = [];
        if (status !== 'all') {
          conditions.push(eq(boardingHouses.status, status as any));
        }
        if (city) {
          conditions.push(eq(boardingHouses.city, city));
        }
        if (gender && gender !== 'all') {
          conditions.push(eq(boardingHouses.genderPolicy, gender as any));
        }
        if (minPrice !== undefined) {
          conditions.push(sql`${boardingHouses.monthlyPrice} >= ${minPrice}`);
        }
        if (maxPrice !== undefined) {
          conditions.push(sql`${boardingHouses.monthlyPrice} <= ${maxPrice}`);
        }
        if (search) {
          const s = `%${search.toLowerCase()}%`;
          conditions.push(
            or(
              sql`LOWER(${boardingHouses.name}) LIKE ${s}`,
              sql`LOWER(${boardingHouses.city}) LIKE ${s}`,
              sql`LOWER(${boardingHouses.district}) LIKE ${s}`,
              sql`LOWER(${boardingHouses.address}) LIKE ${s}`
            )
          );
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const [items, totalResult] = await Promise.all([
          db.query.boardingHouses.findMany({
            where: whereClause,
            limit,
            offset,
            orderBy: [desc(boardingHouses.isFeatured), desc(boardingHouses.createdAt)],
            with: {
              images: {
                orderBy: [asc(boardingHouseImages.sortOrder)],
              },
              rooms: true,
              facilities: {
                with: {
                  facility: true
                }
              }
            }
          }),
          db.select({ count: sql<number>`count(*)` }).from(boardingHouses).where(whereClause)
        ]);

        const total = Number(totalResult[0]?.count || 0);

        // Format items with primaryImage and available room count
        const formatted = items.map((bh: any) => {
          const primaryImage = bh.images.find((img: any) => img.isPrimary) || bh.images[0] || null;
          const availableRoomsCount = bh.rooms?.filter((r: any) => r.status === 'available').length || 0;
          return {
            ...bh,
            primaryImage,
            availableRoomsCount,
            totalRoomsCount: bh.rooms?.length || 0,
            facilities: bh.facilities?.map((f: any) => f.facility).filter(Boolean)
          };
        });

        return {
          success: true,
          data: formatted,
          meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        };
      })
      .get('/detail/:idOrSlug', async ({ params, set }) => {
        const item: any = await db.query.boardingHouses.findFirst({
          where: or(eq(boardingHouses.slug, params.idOrSlug), eq(boardingHouses.id, params.idOrSlug)),
          with: {
            images: {
              orderBy: [asc(boardingHouseImages.sortOrder)]
            },
            rooms: {
              with: {
                facilities: {
                  with: {
                    facility: true
                  }
                }
              }
            },
            facilities: {
              with: {
                facility: true
              }
            },
            owner: {
              columns: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        });

        if (!item) {
          set.status = 404;
          return { success: false, error: 'Boarding house not found' };
        }

        // Increment view count asynchronously
        await db.update(boardingHouses)
          .set({ totalViews: sql`${boardingHouses.totalViews} + 1` })
          .where(eq(boardingHouses.id, item.id));

        const primaryImage = item.images.find((img: any) => img.isPrimary) || item.images[0] || null;
        const availableRoomsCount = item.rooms?.filter((r: any) => r.status === 'available').length || 0;

        return {
          success: true,
          data: {
            ...item,
            primaryImage,
            availableRoomsCount,
            totalRoomsCount: item.rooms?.length || 0,
            facilities: item.facilities?.map((f: any) => f.facility).filter(Boolean),
            rooms: item.rooms?.map((r: any) => ({
              ...r,
              facilities: r.facilities?.map((rf: any) => rf.facility).filter(Boolean)
            }))
          }
        };
      })
      .post('/', async ({ body, headers, jwt, set }) => {
        const auth = headers['authorization'];
        if (!auth?.startsWith('Bearer ')) {
          set.status = 401;
          return { success: false, error: 'Unauthorized' };
        }
        const user = await jwt.verify(auth.slice(7));
        if (!user) {
          set.status = 401;
          return { success: false, error: 'Unauthorized' };
        }

        const data = body as any;
        const [newKos] = await db.insert(boardingHouses).values({
          ownerId: user.id as string,
          name: data.name,
          slug: data.slug,
          shortDescription: data.shortDescription,
          description: data.description,
          address: data.address,
          city: data.city,
          district: data.district,
          postalCode: data.postalCode,
          latitude: data.latitude ? String(data.latitude) : null,
          longitude: data.longitude ? String(data.longitude) : null,
          monthlyPrice: data.monthlyPrice,
          deposit: data.deposit || 0,
          electricityIncluded: Boolean(data.electricityIncluded),
          waterIncluded: Boolean(data.waterIncluded),
          genderPolicy: data.genderPolicy || 'mixed',
          smokingPolicy: data.smokingPolicy,
          petPolicy: data.petPolicy,
          visitorPolicy: data.visitorPolicy,
          status: data.status || 'published',
          isFeatured: Boolean(data.isFeatured),
          contactNumber: data.contactNumber
        }).returning();

        // Connect facilities if provided
        if (data.facilityIds && Array.isArray(data.facilityIds)) {
          for (const facId of data.facilityIds) {
            await db.insert(boardingHouseFacilities).values({
              boardingHouseId: newKos.id,
              facilityId: facId
            }).onConflictDoNothing();
          }
        }

        return { success: true, data: newKos };
      })
      .patch('/:id', async ({ params, body, headers, jwt, set }) => {
        const auth = headers['authorization'];
        if (!auth?.startsWith('Bearer ')) {
          set.status = 401;
          return { success: false, error: 'Unauthorized' };
        }
        const user = await jwt.verify(auth.slice(7));
        if (!user) {
          set.status = 401;
          return { success: false, error: 'Unauthorized' };
        }

        const data = body as any;
        const [updated] = await db.update(boardingHouses)
          .set({
            name: data.name,
            slug: data.slug,
            shortDescription: data.shortDescription,
            description: data.description,
            address: data.address,
            city: data.city,
            district: data.district,
            postalCode: data.postalCode,
            latitude: data.latitude ? String(data.latitude) : undefined,
            longitude: data.longitude ? String(data.longitude) : undefined,
            monthlyPrice: data.monthlyPrice,
            deposit: data.deposit,
            electricityIncluded: data.electricityIncluded,
            waterIncluded: data.waterIncluded,
            genderPolicy: data.genderPolicy,
            smokingPolicy: data.smokingPolicy,
            petPolicy: data.petPolicy,
            visitorPolicy: data.visitorPolicy,
            status: data.status,
            isFeatured: data.isFeatured,
            contactNumber: data.contactNumber,
            updatedAt: new Date()
          })
          .where(eq(boardingHouses.id, params.id))
          .returning();

        if (data.facilityIds && Array.isArray(data.facilityIds)) {
          await db.delete(boardingHouseFacilities).where(eq(boardingHouseFacilities.boardingHouseId, params.id));
          for (const facId of data.facilityIds) {
            await db.insert(boardingHouseFacilities).values({
              boardingHouseId: params.id,
              facilityId: facId
            }).onConflictDoNothing();
          }
        }

        return { success: true, data: updated };
      })
      .delete('/:id', async ({ params, headers, jwt, set }) => {
        const auth = headers['authorization'];
        if (!auth?.startsWith('Bearer ')) {
          set.status = 401;
          return { success: false, error: 'Unauthorized' };
        }
        const user = await jwt.verify(auth.slice(7));
        if (!user) {
          set.status = 401;
          return { success: false, error: 'Unauthorized' };
        }

        await db.delete(boardingHouses).where(eq(boardingHouses.id, params.id));
        return { success: true, message: 'Boarding house deleted successfully' };
      })
  )

  // --- IMAGES & GALLERY API ---
  .group('/api/kos/:id/images', (app) =>
    app
      .get('/', async ({ params }) => {
        const images = await db.query.boardingHouseImages.findMany({
          where: eq(boardingHouseImages.boardingHouseId, params.id),
          orderBy: [asc(boardingHouseImages.sortOrder)]
        });
        return { success: true, data: images };
      })
      .post('/upload-url', async ({ params, body }) => {
        const { filename, contentType } = body as any;
        const key = `kos/${params.id}/${Date.now()}-${filename}`;

        if (s3Configured && s3Client) {
          const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: key,
            ContentType: contentType || 'image/jpeg',
          });
          const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
          const publicUrl = `${process.env.S3_PUBLIC_DOMAIN || 'https://images.kosan.com'}/${key}`;
          return {
            success: true,
            data: { uploadUrl, key, publicUrl }
          };
        } else {
          // Direct fallback image endpoint
          const publicUrl = `https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80`;
          return {
            success: true,
            data: { uploadUrl: publicUrl, key, publicUrl }
          };
        }
      })
      .post('/confirm', async ({ params, body }) => {
        const data = body as any;
        const existingImages = await db.query.boardingHouseImages.findMany({
          where: eq(boardingHouseImages.boardingHouseId, params.id)
        });

        const isFirst = existingImages.length === 0;

        const [newImage] = await db.insert(boardingHouseImages).values({
          boardingHouseId: params.id,
          storageKey: data.storageKey || `manual/${Date.now()}`,
          imageUrl: data.imageUrl,
          thumbnailUrl: data.thumbnailUrl || data.imageUrl,
          altText: data.altText || 'Boarding house photo',
          isPrimary: data.isPrimary !== undefined ? data.isPrimary : isFirst,
          sortOrder: data.sortOrder !== undefined ? data.sortOrder : existingImages.length
        }).returning();

        return { success: true, data: newImage };
      })
      .patch('/reorder', async ({ params, body }) => {
        const { imageOrders } = body as { imageOrders: { id: string; sortOrder: number }[] };
        for (const item of imageOrders) {
          await db.update(boardingHouseImages)
            .set({ sortOrder: item.sortOrder })
            .where(and(eq(boardingHouseImages.id, item.id), eq(boardingHouseImages.boardingHouseId, params.id)));
        }
        return { success: true, message: 'Images reordered successfully' };
      })
      .patch('/:imageId/primary', async ({ params }) => {
        // Unset primary for all images of this kos
        await db.update(boardingHouseImages)
          .set({ isPrimary: false })
          .where(eq(boardingHouseImages.boardingHouseId, params.id));

        // Set primary for selected image
        await db.update(boardingHouseImages)
          .set({ isPrimary: true })
          .where(and(eq(boardingHouseImages.id, params.imageId), eq(boardingHouseImages.boardingHouseId, params.id)));

        return { success: true, message: 'Primary thumbnail updated successfully' };
      })
      .delete('/:imageId', async ({ params }) => {
        await db.delete(boardingHouseImages)
          .where(and(eq(boardingHouseImages.id, params.imageId), eq(boardingHouseImages.boardingHouseId, params.id)));

        return { success: true, message: 'Image deleted successfully' };
      })
  )

  // --- ROOMS API ---
  .group('/api/rooms', (app) =>
    app
      .get('/', async ({ query }) => {
        const kosId = query.kosId as string;
        const conditions = kosId ? eq(rooms.boardingHouseId, kosId) : undefined;
        const allRooms = await db.query.rooms.findMany({
          where: conditions,
          with: {
            boardingHouse: true,
            facilities: {
              with: {
                facility: true
              }
            }
          }
        });
        return { success: true, data: allRooms };
      })
      .post('/', async ({ body, headers, jwt, set }) => {
        const auth = headers['authorization'];
        if (!auth?.startsWith('Bearer ')) {
          set.status = 401;
          return { success: false, error: 'Unauthorized' };
        }
        const user = await jwt.verify(auth.slice(7));
        if (!user) {
          set.status = 401;
          return { success: false, error: 'Unauthorized' };
        }

        const data = body as any;
        const [newRoom] = await db.insert(rooms).values({
          boardingHouseId: data.boardingHouseId,
          roomNumber: data.roomNumber,
          roomType: data.roomType,
          description: data.description,
          price: data.price,
          size: data.size,
          status: data.status || 'available'
        }).returning();

        return { success: true, data: newRoom };
      })
      .patch('/:id', async ({ params, body }) => {
        const data = body as any;
        const [updated] = await db.update(rooms)
          .set({
            roomNumber: data.roomNumber,
            roomType: data.roomType,
            description: data.description,
            price: data.price,
            size: data.size,
            status: data.status,
            updatedAt: new Date()
          })
          .where(eq(rooms.id, params.id))
          .returning();

        return { success: true, data: updated };
      })
      .delete('/:id', async ({ params }) => {
        await db.delete(rooms).where(eq(rooms.id, params.id));
        return { success: true, message: 'Room deleted successfully' };
      })
  )

  // --- FACILITIES API ---
  .group('/api/facilities', (app) =>
    app
      .get('/', async () => {
        const all = await db.query.facilities.findMany({
          orderBy: [asc(facilities.name)]
        });
        return { success: true, data: all };
      })
      .post('/', async ({ body }) => {
        const data = body as any;
        const [item] = await db.insert(facilities).values({
          name: data.name,
          icon: data.icon || 'Check'
        }).returning();
        return { success: true, data: item };
      })
  )

  // --- ADMIN DASHBOARD STATS ---
  .get('/api/admin/stats', async () => {
    const [totalBh] = await db.select({ count: sql<number>`count(*)` }).from(boardingHouses);
    const [totalRm] = await db.select({ count: sql<number>`count(*)` }).from(rooms);
    const [availRm] = await db.select({ count: sql<number>`count(*)` }).from(rooms).where(eq(rooms.status, 'available'));
    const [occRm] = await db.select({ count: sql<number>`count(*)` }).from(rooms).where(eq(rooms.status, 'occupied'));
    const [totalViews] = await db.select({ sum: sql<number>`COALESCE(SUM(${boardingHouses.totalViews}), 0)` }).from(boardingHouses);

    const recentBh = await db.query.boardingHouses.findMany({
      limit: 5,
      orderBy: [desc(boardingHouses.createdAt)],
      with: {
        images: true,
        rooms: true
      }
    });

    const recentLogs = await db.query.activityLogs.findMany({
      limit: 5,
      orderBy: [desc(activityLogs.createdAt)],
      with: {
        user: true
      }
    });

    return {
      success: true,
      data: {
        totalBoardingHouses: Number(totalBh?.count || 0),
        totalRooms: Number(totalRm?.count || 0),
        availableRooms: Number(availRm?.count || 0),
        occupiedRooms: Number(occRm?.count || 0),
        totalPropertyViews: Number(totalViews?.sum || 0),
        recentlyAddedProperties: recentBh,
        recentActivities: recentLogs
      }
    };
  });

if (import.meta.main) {
  app.listen(PORT);
  console.log(`🚀 KosKosan Elysia API running at http://localhost:${PORT}`);
}
