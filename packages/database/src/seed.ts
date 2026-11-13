import { db, pool, users, facilities, boardingHouses, rooms, boardingHouseImages, boardingHouseFacilities, roomFacilities, activityLogs } from './index';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Create default users
    const salt = await bcrypt.genSalt(10);
    const superAdminPassword = await bcrypt.hash('admin123', salt);
    const ownerPassword = await bcrypt.hash('owner123', salt);

    console.log('Creating users...');
    const [superAdmin] = await db.insert(users).values({
      name: 'Super Administrator',
      email: 'admin@kosan.com',
      passwordHash: superAdminPassword,
      role: 'super_admin',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    }).onConflictDoNothing().returning();

    const [owner] = await db.insert(users).values({
      name: 'Budi Santoso',
      email: 'owner@kosan.com',
      passwordHash: ownerPassword,
      role: 'property_owner',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    }).onConflictDoNothing().returning();

    const activeOwnerId = owner ? owner.id : (await db.query.users.findFirst())!.id;

    // 2. Insert standard facilities
    console.log('Creating standard facilities...');
    const facilityData = [
      { name: 'WiFi', icon: 'Wifi' },
      { name: 'Air Conditioning (AC)', icon: 'Wind' },
      { name: 'Private Bathroom', icon: 'Bath' },
      { name: 'Shared Bathroom', icon: 'ShowerHead' },
      { name: 'Furnished Bed', icon: 'Bed' },
      { name: 'Wardrobe', icon: 'Archive' },
      { name: 'Study Desk', icon: 'Armchair' },
      { name: 'Shared Kitchen', icon: 'Utensils' },
      { name: 'Motorcycle Parking', icon: 'Bike' },
      { name: 'Car Parking', icon: 'Car' },
      { name: 'CCTV 24 Hours', icon: 'ShieldCheck' },
      { name: 'Laundry Service', icon: 'Shirt' },
      { name: 'Water Dispenser', icon: 'Droplets' },
      { name: 'Living Room', icon: 'Tv' },
      { name: 'Balcony', icon: 'Sun' }
    ];

    const insertedFacilities = [];
    for (const f of facilityData) {
      const [res] = await db.insert(facilities).values(f).onConflictDoNothing().returning();
      if (res) insertedFacilities.push(res);
    }

    const allFacilities = await db.query.facilities.findMany();

    // 3. Insert mock boarding houses with high quality imagery
    console.log('Creating mock boarding houses...');
    const kos1 = await db.insert(boardingHouses).values({
      ownerId: activeOwnerId,
      name: 'Kos Melati Exclusive Kemang',
      slug: 'kos-melati-exclusive-kemang',
      shortDescription: 'Kost exclusive di jantung Kemang Jakarta Selatan dengan fasilitas hotel bintang 3.',
      description: 'Kos Melati Exclusive Kemang menawarkan hunian nyaman, tenang, dan aman. Berada di area strategis Jakarta Selatan dekat pusat perbelanjaan, kafe, stasiun MRT, dan perkantoran. Dilengkapi dengan fasilitas lengkap termasuk kolam renang mini, high speed WiFi 100Mbps, keamanan 24 jam CCTV, dan housekeeping mingguan.',
      address: 'Jl. Kemang Raya No. 42B, Bangka, Mampang Prapatan',
      city: 'Jakarta Selatan',
      district: 'Mampang Prapatan',
      postalCode: '12730',
      latitude: '-6.2608',
      longitude: '106.8166',
      monthlyPrice: 2800000,
      deposit: 1000000,
      electricityIncluded: false,
      waterIncluded: true,
      genderPolicy: 'mixed',
      smokingPolicy: 'Smoking allowed only on the rooftop balcony',
      petPolicy: 'No pets allowed',
      visitorPolicy: 'Visitors allowed until 22:00 WIB in the lobby',
      status: 'published',
      isFeatured: true,
      contactNumber: '6281234567890',
      totalViews: 342
    }).onConflictDoNothing().returning();

    const kos2 = await db.insert(boardingHouses).values({
      ownerId: activeOwnerId,
      name: 'Griya Asri Dago ITB',
      slug: 'griya-asri-dago-itb',
      shortDescription: 'Kost putri nyaman dan tenang hanya 5 menit jalan kaki dari kampus ITB Dago.',
      description: 'Griya Asri Dago dikhususkan untuk mahasiswi dan karyawati muslimah yang mengutamakan ketenangan dan kebersihan. Suasana sejuk khas Bandung utara, kamar luas berjendela besar dengan pencahayaan alami dan sirkulasi udara optimal.',
      address: 'Jl. Dago Asri No. 15, Dago, Coblong',
      city: 'Bandung',
      district: 'Coblong',
      postalCode: '40135',
      latitude: '-6.8833',
      longitude: '107.6150',
      monthlyPrice: 1750000,
      deposit: 500000,
      electricityIncluded: true,
      waterIncluded: true,
      genderPolicy: 'female_only',
      smokingPolicy: 'Strictly non-smoking property',
      petPolicy: 'Cats allowed with permission',
      visitorPolicy: 'Male visitors allowed strictly in the front terrace',
      status: 'published',
      isFeatured: true,
      contactNumber: '6281987654321',
      totalViews: 521
    }).onConflictDoNothing().returning();

    const kos3 = await db.insert(boardingHouses).values({
      ownerId: activeOwnerId,
      name: 'Kost Putra Kaliurang UGM',
      slug: 'kost-putra-kaliurang-ugm',
      shortDescription: 'Kost putra strategis dekat UGM, include listrik dan laundry cuci seterika.',
      description: 'Kost nyaman khusus putra dengan fasilitas lengkap di Jalan Kaliurang KM 5. Dekat dengan berbagai pusat kuliner, minimarket 24 jam, dan halte Trans Jogja. Akses 24 jam dengan sistem smart-lock card.',
      address: 'Jl. Kaliurang KM 5.2 Gg. Mijil No. 8, Caturtunggal, Depok',
      city: 'Sleman',
      district: 'Depok',
      postalCode: '55281',
      latitude: '-7.7610',
      longitude: '110.3840',
      monthlyPrice: 1350000,
      deposit: 300000,
      electricityIncluded: true,
      waterIncluded: true,
      genderPolicy: 'male_only',
      smokingPolicy: 'Smoking allowed in designated smoking areas',
      petPolicy: 'No pets allowed',
      visitorPolicy: 'Guests allowed up to 23:00 WIB',
      status: 'published',
      isFeatured: true,
      contactNumber: '6285678901234',
      totalViews: 198
    }).onConflictDoNothing().returning();

    const currentKosanList = await db.query.boardingHouses.findMany();

    // 4. Attach Images to Kos 1 (Kos Melati)
    if (currentKosanList.length > 0) {
      const bh1 = currentKosanList[0];
      console.log(`Adding images to ${bh1.name}...`);
      const bh1Images = [
        {
          boardingHouseId: bh1.id,
          storageKey: 'mock/kemang-exterior.jpg',
          imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
          thumbnailUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=400&q=80',
          altText: 'Main exterior building view',
          isPrimary: true,
          sortOrder: 0
        },
        {
          boardingHouseId: bh1.id,
          storageKey: 'mock/kemang-bedroom.jpg',
          imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
          thumbnailUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80',
          altText: 'Deluxe bedroom with queen springbed',
          isPrimary: false,
          sortOrder: 1
        },
        {
          boardingHouseId: bh1.id,
          storageKey: 'mock/kemang-bathroom.jpg',
          imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
          thumbnailUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80',
          altText: 'Clean private bathroom with hot water heater',
          isPrimary: false,
          sortOrder: 2
        },
        {
          boardingHouseId: bh1.id,
          storageKey: 'mock/kemang-living.jpg',
          imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
          thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
          altText: 'Cozy shared lounge and study space',
          isPrimary: false,
          sortOrder: 3
        },
        {
          boardingHouseId: bh1.id,
          storageKey: 'mock/kemang-kitchen.jpg',
          imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
          thumbnailUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80',
          altText: 'Modern shared kitchen with microwave and induction cooker',
          isPrimary: false,
          sortOrder: 4
        }
      ];

      for (const img of bh1Images) {
        await db.insert(boardingHouseImages).values(img).onConflictDoNothing();
      }

      // Add rooms to Kos 1
      console.log(`Adding rooms to ${bh1.name}...`);
      await db.insert(rooms).values([
        {
          boardingHouseId: bh1.id,
          roomNumber: '101',
          roomType: 'Deluxe Single',
          description: 'Spacious 4x4m room on 1st floor with balcony garden view',
          price: 2800000,
          size: '4x4 m',
          status: 'available'
        },
        {
          boardingHouseId: bh1.id,
          roomNumber: '102',
          roomType: 'Deluxe Single',
          description: 'Corner room 4x4m with double windows',
          price: 2800000,
          size: '4x4 m',
          status: 'occupied'
        },
        {
          boardingHouseId: bh1.id,
          roomNumber: '201',
          roomType: 'Executive Suite',
          description: 'Top floor 5x4m with private sofa and work station',
          price: 3300000,
          size: '5x4 m',
          status: 'available'
        }
      ]).onConflictDoNothing();

      // Attach facilities
      const primaryFacs = allFacilities.slice(0, 8);
      for (const f of primaryFacs) {
        await db.insert(boardingHouseFacilities).values({
          boardingHouseId: bh1.id,
          facilityId: f.id
        }).onConflictDoNothing();
      }
    }

    if (currentKosanList.length > 1) {
      const bh2 = currentKosanList[1];
      console.log(`Adding images to ${bh2.name}...`);
      await db.insert(boardingHouseImages).values([
        {
          boardingHouseId: bh2.id,
          storageKey: 'mock/dago-exterior.jpg',
          imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
          thumbnailUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80',
          altText: 'Griya Asri Dago front building view',
          isPrimary: true,
          sortOrder: 0
        },
        {
          boardingHouseId: bh2.id,
          storageKey: 'mock/dago-bedroom.jpg',
          imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
          thumbnailUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=400&q=80',
          altText: 'Bright cozy bedroom with desk and wardrobe',
          isPrimary: false,
          sortOrder: 1
        }
      ]).onConflictDoNothing();

      await db.insert(rooms).values([
        {
          boardingHouseId: bh2.id,
          roomNumber: 'A1',
          roomType: 'Standard Putri',
          description: 'Kamar nyaman lantai 1 berangin sejuk Dago',
          price: 1750000,
          size: '3x4 m',
          status: 'available'
        },
        {
          boardingHouseId: bh2.id,
          roomNumber: 'A2',
          roomType: 'Standard Putri',
          description: 'Kamar lantai 1 dekat dapur',
          price: 1750000,
          size: '3x4 m',
          status: 'occupied'
        }
      ]).onConflictDoNothing();

      for (const f of allFacilities.slice(0, 6)) {
        await db.insert(boardingHouseFacilities).values({
          boardingHouseId: bh2.id,
          facilityId: f.id
        }).onConflictDoNothing();
      }
    }

    if (currentKosanList.length > 2) {
      const bh3 = currentKosanList[2];
      console.log(`Adding images to ${bh3.name}...`);
      await db.insert(boardingHouseImages).values([
        {
          boardingHouseId: bh3.id,
          storageKey: 'mock/ugm-exterior.jpg',
          imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
          thumbnailUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=400&q=80',
          altText: 'Modern architectural building facade',
          isPrimary: true,
          sortOrder: 0
        },
        {
          boardingHouseId: bh3.id,
          storageKey: 'mock/ugm-room.jpg',
          imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
          thumbnailUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80',
          altText: 'Standard student room',
          isPrimary: false,
          sortOrder: 1
        }
      ]).onConflictDoNothing();

      await db.insert(rooms).values([
        {
          boardingHouseId: bh3.id,
          roomNumber: 'B1',
          roomType: 'Mahasiswa Single',
          description: 'Kamar nyaman ber-AC dan WiFi kencang',
          price: 1350000,
          size: '3x3 m',
          status: 'available'
        }
      ]).onConflictDoNothing();
    }

    // 5. Insert initial activity log
    console.log('Adding initial activity logs...');
    await db.insert(activityLogs).values({
      userId: activeOwnerId,
      action: 'SYSTEM_SEED',
      entityType: 'system',
      entityId: 'initial_seed',
      metadata: JSON.stringify({ message: 'Database initialized with demo data' })
    }).onConflictDoNothing();

    console.log('✅ Seeding completed successfully!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

seed();
