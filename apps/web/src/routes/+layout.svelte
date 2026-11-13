<script lang="ts">
  import '../app.css';
  let { children } = $props();
</script>

<div class="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
  <!-- Modern Navigation Bar -->
  <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <a href="/" class="flex items-center gap-2">
        <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-500/20">
          K
        </div>
        <span class="text-xl font-bold tracking-tight text-slate-900">
          Kos<span class="text-blue-600">Kosan</span>
        </span>
      </a>

      <nav class="hidden md:flex items-center gap-6">
        <a href="/" class="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors">Cari Kos</a>
        <a href="/#popular" class="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors">Kota Populer</a>
        <a href="/#facilities" class="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors">Fasilitas</a>
      </nav>

      <div class="flex items-center gap-3">
        <a 
          href="/admin" 
          class="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all shadow-blue-500/20"
        >
          Dashboard Admin
        </a>
      </div>
    </div>
  </header>

  <!-- Page Content -->
  <main class="flex-1">
    {@render children()}
  </main>

  <!-- Footer -->
  <footer class="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div>
          <div class="flex items-center gap-2 mb-4">
            <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
              K
            </div>
            <span class="text-lg font-bold text-white">KosKosan</span>
          </div>
          <p class="text-sm text-slate-400 leading-relaxed">
            Platform modern pencarian dan penyewaan kos-kosan terpercaya di seluruh kota besar di Indonesia.
          </p>
        </div>
        <div>
          <h4 class="text-white font-semibold text-sm mb-3">Kota Populer</h4>
          <ul class="space-y-2 text-sm">
            <li><a href="/?city=Jakarta+Selatan" class="hover:text-white transition">Jakarta Selatan</a></li>
            <li><a href="/?city=Bandung" class="hover:text-white transition">Bandung</a></li>
            <li><a href="/?city=Sleman" class="hover:text-white transition">Yogyakarta / Sleman</a></li>
            <li><a href="/?city=Surabaya" class="hover:text-white transition">Surabaya</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-white font-semibold text-sm mb-3">Fitur Platform</h4>
          <ul class="space-y-2 text-sm">
            <li><a href="/admin" class="hover:text-white transition">Manajemen Properti</a></li>
            <li><a href="/admin" class="hover:text-white transition">Galeri Multi-Image & Reorder</a></li>
            <li><a href="/admin" class="hover:text-white transition">Ketersediaan Kamar Real-time</a></li>
            <li><a href="/admin" class="hover:text-white transition">Hubungi Pemilik via WhatsApp</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-white font-semibold text-sm mb-3">Bantuan & Kontak</h4>
          <p class="text-sm text-slate-400 mb-2">Punya pertanyaan seputar listing kos?</p>
          <a href="https://wa.me/6281234567890" target="_blank" class="inline-flex items-center text-sm text-emerald-400 hover:text-emerald-300 font-medium">
            Chat WhatsApp Admin &rarr;
          </a>
        </div>
      </div>
      <div class="pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
        &copy; 2026 KosKosan Platform. All rights reserved. Powered by SvelteKit, Bun, Elysia, and Neon PostgreSQL.
      </div>
    </div>
  </footer>
</div>
