<script lang="ts">
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import { formatRupiah } from '$lib/utils';

  let currentSlug = $derived(page.params.slug);
  let activeImageIndex = $state(0);
  let lightboxOpen = $state(false);

  // Fallback demo data
  let kosData = $state<any>({
    name: 'Kos Melati Exclusive Kemang',
    slug: 'kos-melati-exclusive-kemang',
    city: 'Jakarta Selatan',
    district: 'Mampang Prapatan',
    address: 'Jl. Kemang Raya No. 42B, Bangka, Mampang Prapatan',
    monthlyPrice: 2800000,
    deposit: 1000000,
    electricityIncluded: false,
    waterIncluded: true,
    genderPolicy: 'mixed',
    smokingPolicy: 'Smoking allowed only on the rooftop balcony',
    petPolicy: 'No pets allowed',
    visitorPolicy: 'Visitors allowed until 22:00 WIB in the lobby',
    contactNumber: '6281234567890',
    description: 'Kos Melati Exclusive Kemang menawarkan hunian nyaman, tenang, dan aman. Berada di area strategis Jakarta Selatan dekat pusat perbelanjaan, kafe, stasiun MRT, dan perkantoran. Dilengkapi dengan fasilitas lengkap termasuk high speed WiFi 100Mbps, keamanan 24 jam CCTV, dan housekeeping mingguan.',
    images: [
      {
        imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
        altText: 'Main exterior building view'
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
        altText: 'Deluxe bedroom with queen springbed'
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
        altText: 'Clean private bathroom with hot water'
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        altText: 'Cozy shared lounge and study space'
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
        altText: 'Modern shared kitchen'
      }
    ],
    facilities: [
      { name: 'WiFi 100Mbps' },
      { name: 'Air Conditioning (AC)' },
      { name: 'Kamar Mandi Dalam' },
      { name: 'Kasur Springbed' },
      { name: 'Lemari Pakaian' },
      { name: 'Meja & Kursi Belajar' },
      { name: 'Dapur Bersama' },
      { name: 'Parkir Motor Luas' },
      { name: 'CCTV 24 Jam' }
    ],
    rooms: [
      { roomNumber: '101', roomType: 'Deluxe Single', price: 2800000, size: '4x4 m', status: 'available' },
      { roomNumber: '102', roomType: 'Deluxe Single', price: 2800000, size: '4x4 m', status: 'occupied' },
      { roomNumber: '201', roomType: 'Executive Suite', price: 3300000, size: '5x4 m', status: 'available' }
    ]
  });

  async function loadDetail() {
    try {
      const res = await fetch(`http://localhost:3001/api/kos/detail/${currentSlug}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          kosData = json.data;
        }
      }
    } catch (e) {
      // Graceful fallback to static
    }
  }

  onMount(() => {
    loadDetail();
  });

  function nextImage() {
    if (kosData.images && kosData.images.length > 0) {
      activeImageIndex = (activeImageIndex + 1) % kosData.images.length;
    }
  }

  function prevImage() {
    if (kosData.images && kosData.images.length > 0) {
      activeImageIndex = (activeImageIndex - 1 + kosData.images.length) % kosData.images.length;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (lightboxOpen) {
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') lightboxOpen = false;
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
  <!-- Breadcrumb -->
  <nav class="flex items-center gap-2 text-xs text-slate-500">
    <a href="/" class="hover:text-blue-600">Beranda</a>
    <span>/</span>
    <a href={`/?city=${kosData.city}`} class="hover:text-blue-600">{kosData.city}</a>
    <span>/</span>
    <span class="text-slate-900 font-semibold truncate">{kosData.name}</span>
  </nav>

  <!-- Title & Basic Info Header -->
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <div class="flex items-center gap-2 mb-2">
        <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          {kosData.genderPolicy === 'female_only' ? 'Kos Putri' : kosData.genderPolicy === 'male_only' ? 'Kos Putra' : 'Kos Campur'}
        </span>
        <span class="text-xs text-slate-500">
          📍 {kosData.district}, {kosData.city}
        </span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900">{kosData.name}</h1>
      <p class="text-sm text-slate-500 mt-1">{kosData.address}</p>
    </div>

    <div class="text-left md:text-right">
      <div class="text-xs text-slate-400">Harga Sewa Bulanan</div>
      <div class="text-2xl sm:text-3xl font-black text-blue-600">
        {formatRupiah(kosData.monthlyPrice)}
        <span class="text-sm font-normal text-slate-500">/bln</span>
      </div>
    </div>
  </div>

  <!-- Image Gallery System -->
  <div class="space-y-3">
    <!-- Main Big Image -->
    <div class="relative w-full h-80 sm:h-[480px] rounded-2xl overflow-hidden bg-slate-950 group">
      {#if kosData.images && kosData.images.length > 0}
        <img 
          src={kosData.images[activeImageIndex]?.imageUrl} 
          alt={kosData.images[activeImageIndex]?.altText || kosData.name}
          class="w-full h-full object-cover cursor-pointer transition-all duration-300"
          onclick={() => lightboxOpen = true}
        />
        
        <!-- Next / Prev Buttons -->
        <button 
          onclick={prevImage}
          class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-slate-900 flex items-center justify-center shadow-lg transition opacity-0 group-hover:opacity-100"
        >
          &#8592;
        </button>
        <button 
          onclick={nextImage}
          class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-slate-900 flex items-center justify-center shadow-lg transition opacity-0 group-hover:opacity-100"
        >
          &#8594;
        </button>

        <!-- Image Counter Badge -->
        <div class="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md text-white text-xs font-semibold">
          {activeImageIndex + 1} / {kosData.images.length} Foto &bull; Klik untuk Lightbox
        </div>
      {/if}
    </div>

    <!-- Thumbnails Carousel Strip -->
    {#if kosData.images && kosData.images.length > 1}
      <div class="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {#each kosData.images as img, idx}
          <button 
            type="button"
            onclick={() => activeImageIndex = idx}
            class={`relative flex-shrink-0 w-24 h-18 sm:w-32 sm:h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImageIndex === idx ? 'border-blue-600 scale-95 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
          >
            <img src={img.thumbnailUrl || img.imageUrl} alt={img.altText} class="w-full h-full object-cover" />
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Content Grid: Details & Sticky Booking Card -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
    <!-- Left 2 Cols: Details -->
    <div class="lg:col-span-2 space-y-8">
      <!-- Description -->
      <section class="bg-white rounded-2xl p-6 border border-slate-200 space-y-3">
        <h2 class="text-lg font-bold text-slate-900">Deskripsi Kos</h2>
        <p class="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
          {kosData.description}
        </p>
      </section>

      <!-- Facilities List -->
      <section class="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
        <h2 class="text-lg font-bold text-slate-900">Fasilitas Lengkap</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {#each kosData.facilities || [] as f}
            <div class="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700">
              <span class="text-blue-600 font-bold">&check;</span>
              <span>{f.name}</span>
            </div>
          {/each}
        </div>
      </section>

      <!-- Room Types & Availability -->
      <section class="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
        <h2 class="text-lg font-bold text-slate-900">Tipe & Ketersediaan Kamar</h2>
        <div class="space-y-3">
          {#each kosData.rooms || [] as rm}
            <div class="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition">
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-slate-900 text-sm">Kamar {rm.roomNumber}</span>
                  <span class="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">{rm.roomType}</span>
                </div>
                <div class="text-xs text-slate-500 mt-1">Ukuran: {rm.size || '3x4 m'}</div>
              </div>

              <div class="text-right">
                <span class={`text-xs px-2.5 py-1 rounded-md font-semibold inline-block mb-1 ${rm.status === 'available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
                  {rm.status === 'available' ? 'Tersedia' : 'Terisi'}
                </span>
                <div class="text-xs font-bold text-blue-600">{formatRupiah(rm.price)}/bln</div>
              </div>
            </div>
          {/each}
        </div>
      </section>

      <!-- Rules & Policies -->
      <section class="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
        <h2 class="text-lg font-bold text-slate-900">Peraturan & Kebijakan</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span class="font-bold text-slate-800 block mb-1">Kebijakan Tamu</span>
            <p class="text-slate-600">{kosData.visitorPolicy || 'Tamu diperbolehkan hingga pukul 22.00 WIB'}</p>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span class="font-bold text-slate-800 block mb-1">Kebijakan Merokok</span>
            <p class="text-slate-600">{kosData.smokingPolicy || 'Dilarang merokok di dalam kamar'}</p>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span class="font-bold text-slate-800 block mb-1">Hewan Peliharaan</span>
            <p class="text-slate-600">{kosData.petPolicy || 'Tidak diperbolehkan membawa hewan'}</p>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span class="font-bold text-slate-800 block mb-1">Listrik & Air</span>
            <p class="text-slate-600">
              Listrik: {kosData.electricityIncluded ? 'Termasuk' : 'Token Mandiri'} | Air: {kosData.waterIncluded ? 'Gratis' : 'Bayar'}
            </p>
          </div>
        </div>
      </section>
    </div>

    <!-- Right Col: Sticky Booking / Contact Card -->
    <div>
      <div class="sticky top-24 bg-white rounded-2xl p-6 border border-slate-200 shadow-lg space-y-6">
        <div>
          <span class="text-xs text-slate-500 uppercase tracking-wider font-semibold">Harga Mulai Dari</span>
          <div class="text-3xl font-extrabold text-blue-600">
            {formatRupiah(kosData.monthlyPrice)}
            <span class="text-sm font-normal text-slate-500">/bulan</span>
          </div>
          {#if kosData.deposit}
            <div class="text-xs text-slate-500 mt-1">
              Deposit jaminan: {formatRupiah(kosData.deposit)} (dapat dikembalikan)
            </div>
          {/if}
        </div>

        <div class="space-y-3 pt-3 border-t border-slate-100 text-xs">
          <div class="flex justify-between py-1 border-b border-slate-50">
            <span class="text-slate-500">Kamar Tersedia</span>
            <span class="font-bold text-emerald-600">
              {kosData.rooms?.filter((r: any) => r.status === 'available').length || 1} Kamar Siap
            </span>
          </div>
          <div class="flex justify-between py-1 border-b border-slate-50">
            <span class="text-slate-500">Minimum Sewa</span>
            <span class="font-medium text-slate-800">1 Bulan</span>
          </div>
          <div class="flex justify-between py-1 border-b border-slate-50">
            <span class="text-slate-500">Biaya Listrik</span>
            <span class="font-medium text-slate-800">{kosData.electricityIncluded ? 'Sudah Termasuk' : 'Token Sendiri'}</span>
          </div>
        </div>

        <a 
          href={`https://wa.me/${kosData.contactNumber || '6281234567890'}?text=Halo%20saya%20tertarik%20dengan%20${encodeURIComponent(kosData.name)}`}
          target="_blank"
          class="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all text-center"
        >
          <span>Hubungi Pengelola via WhatsApp</span>
        </a>

        <p class="text-[11px] text-slate-400 text-center leading-relaxed">
          Tanyakan ketersediaan kamar, jadwalkan survei lokasi langsung, atau konsultasi sewa dengan pemilik.
        </p>
      </div>
    </div>
  </div>
</div>

<!-- Fullscreen Lightbox Modal -->
{#if lightboxOpen && kosData.images && kosData.images.length > 0}
  <div 
    class="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
    onclick={() => lightboxOpen = false}
  >
    <button 
      class="absolute top-6 right-6 text-white text-3xl font-light hover:text-slate-300"
      onclick={() => lightboxOpen = false}
    >
      &times;
    </button>

    <div class="relative max-w-5xl max-h-[85vh] flex items-center justify-center" onclick={(e) => e.stopPropagation()}>
      <img 
        src={kosData.images[activeImageIndex]?.imageUrl} 
        alt={kosData.images[activeImageIndex]?.altText} 
        class="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
      />

      <button 
        onclick={prevImage}
        class="absolute -left-12 sm:-left-16 top-1/2 -translate-y-1/2 text-white text-4xl p-2 hover:text-blue-400 transition"
      >
        &#8249;
      </button>
      <button 
        onclick={nextImage}
        class="absolute -right-12 sm:-right-16 top-1/2 -translate-y-1/2 text-white text-4xl p-2 hover:text-blue-400 transition"
      >
        &#8250;
      </button>
    </div>

    <div class="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-xs bg-slate-900/80 px-4 py-2 rounded-full">
      {kosData.images[activeImageIndex]?.altText || kosData.name} ({activeImageIndex + 1} dari {kosData.images.length})
    </div>
  </div>
{/if}
