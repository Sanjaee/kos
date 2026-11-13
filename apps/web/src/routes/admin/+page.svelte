<script lang="ts">
  import { onMount } from 'svelte';
  import { formatRupiah } from '$lib/utils';

  let activeTab = $state<'overview' | 'kos' | 'rooms' | 'facilities'>('overview');
  let isLoggedIn = $state(false);
  let email = $state('admin@kosan.com');
  let password = $state('admin123');

  let stats = $state({
    totalBoardingHouses: 3,
    totalRooms: 6,
    availableRooms: 4,
    occupiedRooms: 2,
    totalPropertyViews: 1061
  });

  let kosList = $state<any[]>([
    {
      id: 'kos-1',
      name: 'Kos Melati Exclusive Kemang',
      city: 'Jakarta Selatan',
      monthlyPrice: 2800000,
      genderPolicy: 'mixed',
      status: 'published',
      isFeatured: true,
      totalRoomsCount: 3,
      availableRoomsCount: 2
    },
    {
      id: 'kos-2',
      name: 'Griya Asri Dago ITB',
      city: 'Bandung',
      monthlyPrice: 1750000,
      genderPolicy: 'female_only',
      status: 'published',
      isFeatured: true,
      totalRoomsCount: 2,
      availableRoomsCount: 1
    },
    {
      id: 'kos-3',
      name: 'Kost Putra Kaliurang UGM',
      city: 'Sleman',
      monthlyPrice: 1350000,
      genderPolicy: 'male_only',
      status: 'published',
      isFeatured: true,
      totalRoomsCount: 1,
      availableRoomsCount: 1
    }
  ]);

  let showCreateModal = $state(false);
  let newKos = $state({
    name: '',
    city: 'Jakarta Selatan',
    district: '',
    address: '',
    monthlyPrice: 1500000,
    genderPolicy: 'mixed',
    description: '',
    contactNumber: '6281234567890'
  });

  function handleLogin(e: Event) {
    e.preventDefault();
    if (email && password) {
      isLoggedIn = true;
    }
  }

  function handleCreateKos(e: Event) {
    e.preventDefault();
    if (!newKos.name) return;

    kosList = [
      {
        id: `kos-${Date.now()}`,
        name: newKos.name,
        city: newKos.city,
        monthlyPrice: newKos.monthlyPrice,
        genderPolicy: newKos.genderPolicy,
        status: 'published',
        isFeatured: false,
        totalRoomsCount: 1,
        availableRoomsCount: 1
      },
      ...kosList
    ];
    stats.totalBoardingHouses += 1;
    showCreateModal = false;
  }
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {#if !isLoggedIn}
    <!-- Admin Login Screen -->
    <div class="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-xl mt-12">
      <div class="text-center mb-6">
        <div class="w-12 h-12 bg-blue-600 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-2xl mb-3 shadow-md">
          K
        </div>
        <h2 class="text-2xl font-bold text-slate-900">Admin Login</h2>
        <p class="text-xs text-slate-500 mt-1">Masuk untuk mengelola properti, kamar, dan foto kos-kosan</p>
      </div>

      <form onsubmit={handleLogin} class="space-y-4">
        <div>
          <label for="admin-email" class="block text-xs font-bold uppercase text-slate-600 mb-1">Email</label>
          <input 
            id="admin-email"
            type="email" 
            bind:value={email}
            required
            class="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label for="admin-pass" class="block text-xs font-bold uppercase text-slate-600 mb-1">Password</label>
          <input 
            id="admin-pass"
            type="password" 
            bind:value={password}
            required
            class="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button 
          type="submit"
          class="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow transition"
        >
          Masuk ke Dashboard
        </button>
      </form>

      <div class="mt-6 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500 space-y-1">
        <div class="font-bold text-slate-700">Akun Demo Terdaftar di Neon DB:</div>
        <div>Email: <code class="text-blue-600 font-mono">admin@kosan.com</code></div>
        <div>Password: <code class="text-blue-600 font-mono">admin123</code></div>
      </div>
    </div>
  {:else}
    <!-- Dashboard Workspace -->
    <div class="space-y-8">
      <!-- Dashboard Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 class="text-2xl font-black text-slate-900">Dashboard Manajemen Kos</h1>
          <p class="text-xs text-slate-500 mt-0.5">Kelola properti, ketersediaan kamar, dan galeri gambar</p>
        </div>

        <div class="flex items-center gap-3">
          <button 
            onclick={() => showCreateModal = true}
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition"
          >
            <span>+</span> Tambah Kos Baru
          </button>
          <button 
            onclick={() => isLoggedIn = false}
            class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </div>

      <!-- Stats Overview Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span class="text-xs font-semibold text-slate-400 block mb-1">Total Properti Kos</span>
          <span class="text-2xl font-extrabold text-slate-900">{stats.totalBoardingHouses}</span>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span class="text-xs font-semibold text-slate-400 block mb-1">Total Kamar</span>
          <span class="text-2xl font-extrabold text-slate-900">{stats.totalRooms}</span>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span class="text-xs font-semibold text-slate-400 block mb-1">Kamar Tersedia</span>
          <span class="text-2xl font-extrabold text-emerald-600">{stats.availableRooms}</span>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span class="text-xs font-semibold text-slate-400 block mb-1">Total Views</span>
          <span class="text-2xl font-extrabold text-blue-600">{stats.totalPropertyViews}</span>
        </div>
      </div>

      <!-- Properties Management Table -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 class="text-base font-bold text-slate-900">Daftar Properti Kos</h2>
          <span class="text-xs text-slate-500 font-medium">{kosList.length} Properti Aktif</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-700">
            <thead class="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th class="py-3 px-4">Nama Kos</th>
                <th class="py-3 px-4">Kota</th>
                <th class="py-3 px-4">Harga Sewa</th>
                <th class="py-3 px-4">Kebijakan</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              {#each kosList as item}
                <tr class="hover:bg-slate-50/50 transition">
                  <td class="py-3 px-4 font-bold text-slate-900">{item.name}</td>
                  <td class="py-3 px-4">{item.city}</td>
                  <td class="py-3 px-4 font-semibold text-blue-600">{formatRupiah(item.monthlyPrice)}</td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 font-medium">
                      {item.genderPolicy}
                    </span>
                  </td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-700 font-bold">
                      {item.status}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-right space-x-2">
                    <a href={`/kos/${item.slug || item.id}`} class="text-blue-600 hover:underline font-semibold">
                      Lihat
                    </a>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  {/if}
</div>

<!-- Modal Tambah Kos -->
{#if showCreateModal}
  <div class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
    <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 class="text-base font-bold text-slate-900">Tambah Properti Kos Baru</h3>
        <button onclick={() => showCreateModal = false} class="text-slate-400 hover:text-slate-600 text-lg">&times;</button>
      </div>

      <form onsubmit={handleCreateKos} class="space-y-3 text-xs">
        <div>
          <label for="create-name" class="block font-bold text-slate-700 mb-1">Nama Kos</label>
          <input 
            id="create-name"
            type="text" 
            bind:value={newKos.name} 
            required 
            placeholder="Contoh: Kos Mawar Indah"
            class="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500" 
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="create-city" class="block font-bold text-slate-700 mb-1">Kota</label>
            <select id="create-city" bind:value={newKos.city} class="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white">
              <option value="Jakarta Selatan">Jakarta Selatan</option>
              <option value="Bandung">Bandung</option>
              <option value="Sleman">Sleman / Jogja</option>
              <option value="Surabaya">Surabaya</option>
            </select>
          </div>
          <div>
            <label for="create-gender" class="block font-bold text-slate-700 mb-1">Kebijakan</label>
            <select id="create-gender" bind:value={newKos.genderPolicy} class="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white">
              <option value="mixed">Campur</option>
              <option value="female_only">Putri</option>
              <option value="male_only">Putra</option>
            </select>
          </div>
        </div>

        <div>
          <label for="create-price" class="block font-bold text-slate-700 mb-1">Harga Sewa Bulanan (Rp)</label>
          <input 
            id="create-price"
            type="number" 
            bind:value={newKos.monthlyPrice} 
            required 
            class="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500" 
          />
        </div>

        <div>
          <label for="create-address" class="block font-bold text-slate-700 mb-1">Alamat Lengkap</label>
          <input 
            id="create-address"
            type="text" 
            bind:value={newKos.address} 
            placeholder="Jl. Sukajadi No. 12" 
            class="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500" 
          />
        </div>

        <div class="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
          <button 
            type="button" 
            onclick={() => showCreateModal = false}
            class="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200"
          >
            Batal
          </button>
          <button 
            type="submit" 
            class="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700"
          >
            Simpan Properti
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
