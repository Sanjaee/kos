<script lang="ts">
  import { onMount } from 'svelte';
  import { formatRupiah } from '$lib/utils';

  let boardingHouses = $state<any[]>([]);
  let loading = $state(true);
  let searchQuery = $state('');
  let selectedCity = $state('all');
  let selectedGender = $state('all');
  let maxPrice = $state<number | null>(null);

  // Mock initial demo items to ensure instant rendering while fetching
  const initialItems = [
    {
      id: 'kos-1',
      name: 'Kos Melati Exclusive Kemang',
      slug: 'kos-melati-exclusive-kemang',
      city: 'Jakarta Selatan',
      district: 'Mampang Prapatan',
      monthlyPrice: 2800000,
      genderPolicy: 'mixed',
      isFeatured: true,
      availableRoomsCount: 2,
      totalRoomsCount: 3,
      primaryImage: {
        imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80'
      },
      shortDescription: 'Kost exclusive di jantung Kemang Jakarta Selatan dengan fasilitas hotel bintang 3.',
      facilities: [{ name: 'WiFi' }, { name: 'AC' }, { name: 'K. Mandi Dalam' }]
    },
    {
      id: 'kos-2',
      name: 'Griya Asri Dago ITB',
      slug: 'griya-asri-dago-itb',
      city: 'Bandung',
      district: 'Coblong',
      monthlyPrice: 1750000,
      genderPolicy: 'female_only',
      isFeatured: true,
      availableRoomsCount: 1,
      totalRoomsCount: 2,
      primaryImage: {
        imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
      },
      shortDescription: 'Kost putri nyaman dan tenang hanya 5 menit jalan kaki dari kampus ITB Dago.',
      facilities: [{ name: 'WiFi' }, { name: 'Furnished Bed' }, { name: 'Dapur' }]
    },
    {
      id: 'kos-3',
      name: 'Kost Putra Kaliurang UGM',
      slug: 'kost-putra-kaliurang-ugm',
      city: 'Sleman',
      district: 'Depok',
      monthlyPrice: 1350000,
      genderPolicy: 'male_only',
      isFeatured: true,
      availableRoomsCount: 1,
      totalRoomsCount: 1,
      primaryImage: {
        imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'
      },
      shortDescription: 'Kost putra strategis dekat UGM, include listrik dan laundry cuci seterika.',
      facilities: [{ name: 'WiFi' }, { name: 'Parkir Motor' }, { name: 'CCTV' }]
    }
  ];

  async function fetchKos() {
    loading = true;
    try {
      // Connect to API if available, fallback gracefully
      const res = await fetch(`http://localhost:3001/api/kos?status=published`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          boardingHouses = json.data;
          loading = false;
          return;
        }
      }
    } catch (e) {
      // Silently fall back to seed data
    }
    boardingHouses = initialItems;
    loading = false;
  }

  onMount(() => {
    fetchKos();
  });

  const filteredItems = $derived(
    boardingHouses.filter((item) => {
      const matchSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.district.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCity = selectedCity === 'all' || item.city === selectedCity;
      const matchGender = selectedGender === 'all' || item.genderPolicy === selectedGender;
      const matchPrice = !maxPrice || item.monthlyPrice <= maxPrice;

      return matchSearch && matchCity && matchGender && matchPrice;
    })
  );

  function getGenderBadge(policy: string) {
    if (policy === 'female_only') return { text: 'Putri', class: 'bg-pink-50 text-pink-700 border-pink-200' };
    if (policy === 'male_only') return { text: 'Putra', class: 'bg-blue-50 text-blue-700 border-blue-200' };
    return { text: 'Campur', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  }
</script>

<div class="space-y-12 pb-16">
  <!-- Hero Section with Search Interface -->
  <section class="relative bg-gradient-to-b from-blue-900 via-indigo-900 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
    <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
    
    <div class="relative max-w-5xl mx-auto text-center space-y-6">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider border border-blue-400/30">
        Platform Kos-Kosan Terlengkap #1
      </div>
      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
        Temukan Kos Impianmu <br class="hidden sm:inline" />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
          Mudah, Cepat & Terpercaya
        </span>
      </h1>
      <p class="max-w-2xl mx-auto text-lg text-slate-300">
        Ribuan pilihan kamar kos eksklusif, fasilitas lengkap dengan informasi harga transparan dan galeri foto asli.
      </p>

      <!-- Search Card Interface -->
      <div class="bg-white rounded-2xl p-4 sm:p-6 shadow-2xl text-slate-800 text-left max-w-4xl mx-auto mt-8 border border-slate-100">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Keyword Search -->
          <div class="space-y-1.5">
            <label for="search" class="text-xs font-bold uppercase tracking-wider text-slate-500">Cari Nama / Lokasi</label>
            <input 
              id="search"
              type="text" 
              bind:value={searchQuery}
              placeholder="Kemang, Dago, UGM..." 
              class="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <!-- City Filter -->
          <div class="space-y-1.5">
            <label for="city" class="text-xs font-bold uppercase tracking-wider text-slate-500">Pilih Kota</label>
            <select 
              id="city"
              bind:value={selectedCity}
              class="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="all">Semua Kota</option>
              <option value="Jakarta Selatan">Jakarta Selatan</option>
              <option value="Bandung">Bandung</option>
              <option value="Sleman">Sleman / Jogja</option>
            </select>
          </div>

          <!-- Gender Type -->
          <div class="space-y-1.5">
            <label for="gender" class="text-xs font-bold uppercase tracking-wider text-slate-500">Tipe Hunian</label>
            <select 
              id="gender"
              bind:value={selectedGender}
              class="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="all">Semua Tipe</option>
              <option value="female_only">Kos Putri</option>
              <option value="male_only">Kos Putra</option>
              <option value="mixed">Kos Campur</option>
            </select>
          </div>

          <!-- Max Price -->
          <div class="space-y-1.5">
            <label for="price" class="text-xs font-bold uppercase tracking-wider text-slate-500">Harga Maksimal</label>
            <select 
              id="price"
              bind:value={maxPrice}
              class="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value={null}>Tanpa Batas</option>
              <option value={1500000}>&le; Rp 1.5 Juta</option>
              <option value={2000000}>&le; Rp 2.0 Juta</option>
              <option value={3000000}>&le; Rp 3.0 Juta</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Popular Locations Section -->
  <section id="popular" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-slate-900">Kota Populer</h2>
        <p class="text-sm text-slate-500">Jelajahi kos di kota-kota favorit mahasiswa dan pekerja</p>
      </div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <button 
        type="button" 
        onclick={() => selectedCity = 'Jakarta Selatan'}
        class="text-left group relative h-32 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-200"
      >
        <img 
          src="https://images.unsplash.com/photo-1555899434-94d1368aa7af?auto=format&fit=crop&w=500&q=80" 
          alt="Jakarta" 
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
        />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent p-4 flex flex-col justify-end">
          <span class="text-white font-bold text-base">Jakarta Selatan</span>
          <span class="text-slate-300 text-xs">Pusat Bisnis & Hiburan</span>
        </div>
      </button>

      <button 
        type="button" 
        onclick={() => selectedCity = 'Bandung'}
        class="text-left group relative h-32 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-200"
      >
        <img 
          src="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=500&q=80" 
          alt="Bandung" 
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
        />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent p-4 flex flex-col justify-end">
          <span class="text-white font-bold text-base">Bandung</span>
          <span class="text-slate-300 text-xs">Dekat ITB & Unpad</span>
        </div>
      </button>

      <button 
        type="button" 
        onclick={() => selectedCity = 'Sleman'}
        class="text-left group relative h-32 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-200"
      >
        <img 
          src="https://images.unsplash.com/photo-1584810359583-96fc3448beaa?auto=format&fit=crop&w=500&q=80" 
          alt="Yogyakarta" 
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
        />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent p-4 flex flex-col justify-end">
          <span class="text-white font-bold text-base">Yogyakarta / Sleman</span>
          <span class="text-slate-300 text-xs">Dekat UGM & UNY</span>
        </div>
      </button>

      <button 
        type="button" 
        onclick={() => selectedCity = 'all'}
        class="text-left group relative h-32 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-200 flex items-center justify-center bg-blue-50 hover:bg-blue-100"
      >
        <div class="text-center p-4">
          <span class="text-blue-600 font-bold block text-sm">Lihat Semua Kota</span>
          <span class="text-blue-500 text-xs">Reset Filter &rarr;</span>
        </div>
      </button>
    </div>
  </section>

  <!-- Boarding Houses Listing Grid -->
  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-slate-900">
          Daftar Kos Pilihan
        </h2>
        <p class="text-sm text-slate-500">
          Menampilkan {filteredItems.length} pilihan kos yang siap dihuni
        </p>
      </div>

      {#if selectedCity !== 'all' || selectedGender !== 'all' || maxPrice || searchQuery}
        <button 
          onclick={() => { selectedCity = 'all'; selectedGender = 'all'; maxPrice = null; searchQuery = ''; }}
          class="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-md self-start"
        >
          Reset Filter Pencarian
        </button>
      {/if}
    </div>

    {#if filteredItems.length === 0}
      <div class="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-lg mx-auto">
        <div class="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-2xl font-bold">
          ?
        </div>
        <h3 class="text-lg font-bold text-slate-800 mb-1">Kos tidak ditemukan</h3>
        <p class="text-sm text-slate-500 mb-6">
          Tidak ada kos yang sesuai dengan kriteria filter pencarian Anda. Silakan ubah filter atau kata kunci.
        </p>
        <button 
          onclick={() => { selectedCity = 'all'; selectedGender = 'all'; maxPrice = null; searchQuery = ''; }}
          class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
        >
          Tampilkan Semua Kos
        </button>
      </div>
    {:else}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each filteredItems as item (item.id)}
          {@const badge = getGenderBadge(item.genderPolicy)}
          <div class="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 transition-all flex flex-col">
            <!-- Thumbnail Image -->
            <div class="relative h-56 w-full overflow-hidden bg-slate-100">
              <img 
                src={item.primaryImage?.imageUrl || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'} 
                alt={item.name} 
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              
              <div class="absolute top-3 left-3 flex items-center gap-2">
                <span class={`px-2.5 py-1 rounded-md text-xs font-semibold border backdrop-blur-md ${badge.class}`}>
                  {badge.text}
                </span>
                {#if item.isFeatured}
                  <span class="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500 text-white shadow-sm">
                    Featured
                  </span>
                {/if}
              </div>

              <div class="absolute bottom-3 right-3">
                <span class="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-900/80 text-white backdrop-blur-md">
                  Sisa {item.availableRoomsCount || 0} Kamar
                </span>
              </div>
            </div>

            <!-- Content -->
            <div class="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div class="flex items-center gap-1 text-xs text-slate-500 mb-1">
                  <span>{item.district}, {item.city}</span>
                </div>
                
                <h3 class="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-2">
                  <a href={`/kos/${item.slug || item.id}`}>
                    {item.name}
                  </a>
                </h3>

                <p class="text-xs text-slate-500 line-clamp-2 mb-4">
                  {item.shortDescription || item.description || 'Kos nyaman dengan fasilitas memadai dan lokasi strategis.'}
                </p>

                <!-- Facilities tags -->
                {#if item.facilities && item.facilities.length > 0}
                  <div class="flex flex-wrap gap-1.5 mb-4">
                    {#each item.facilities.slice(0, 3) as fac}
                      <span class="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {fac.name}
                      </span>
                    {/each}
                    {#if item.facilities.length > 3}
                      <span class="text-[11px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                        +{item.facilities.length - 3}
                      </span>
                    {/if}
                  </div>
                {/if}
              </div>

              <!-- Price & CTA -->
              <div class="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                <div>
                  <span class="text-xs text-slate-400 block">Mulai dari</span>
                  <span class="text-lg font-extrabold text-blue-600">
                    {formatRupiah(item.monthlyPrice)}
                  </span>
                  <span class="text-xs text-slate-500">/bulan</span>
                </div>

                <a 
                  href={`/kos/${item.slug || item.id}`}
                  class="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-blue-600 transition-colors shadow-sm"
                >
                  Lihat Detail
                </a>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </section>
</div>
