export default {
  async fetch(request, env, ctx) {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Elegant Fashion - Premium Clothing Store</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
            .animate-fadeIn { animation: fadeIn 0.8s ease-out; }
            .animate-slideIn { animation: slideIn 0.6s ease-out; }
            .gradient-bg { background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); }
            .glass-effect { background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(10px); }
          </style>
        </head>
        <body class="gradient-bg min-h-screen p-4">
          <!-- Header -->
          <header class="max-w-6xl mx-auto py-6 mb-8 animate-fadeIn">
            <div class="flex items-center justify-between">
              <h1 class="text-3xl font-bold text-white">Elegant Fashion</h1>
              <nav class="space-x-6 text-white">
                <a href="#" class="hover:text-gray-300 transition">Shop</a>
                <a href="#" class="hover:text-gray-300 transition">Collections</a>
                <a href="#" class="hover:text-gray-300 transition">About</a>
                <a href="#" class="hover:text-gray-300 transition">Contact</a>
              </nav>
            </div>
          </header>

          <!-- Hero Section -->
          <section class="glass-effect max-w-6xl mx-auto rounded-3xl shadow-2xl p-8 md:p-12 mb-8 animate-fadeIn">
            <div class="text-center mb-12">
              <p class="text-sm text-gray-500 uppercase tracking-wide mb-2">New Season Collection</p>
              <h2 class="text-5xl font-bold text-slate-800 mb-4">Fall/Winter 2026</h2>
              <p class="text-xl text-slate-600 max-w-2xl mx-auto">Discover our latest collection featuring timeless elegance and contemporary style</p>
              <button class="mt-6 bg-slate-800 text-white px-8 py-3 rounded-lg hover:bg-slate-700 transition">Shop Now</button>
            </div>

            <!-- Featured Products -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200 animate-slideIn">
                <div class="bg-slate-100 rounded-lg h-48 mb-4 flex items-center justify-center">
                  <svg class="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-slate-800 mb-2">Premium Jackets</h3>
                <p class="text-slate-600 text-sm mb-3">Crafted from finest materials for ultimate comfort</p>
                <div class="flex items-center justify-between">
                  <span class="text-2xl font-bold text-slate-800">$299</span>
                  <button class="text-slate-600 hover:text-slate-800 transition">View →</button>
                </div>
              </div>

              <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200 animate-slideIn" style="animation-delay: 0.1s;">
                <div class="bg-slate-100 rounded-lg h-48 mb-4 flex items-center justify-center">
                  <svg class="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-slate-800 mb-2">Designer Shirts</h3>
                <p class="text-slate-600 text-sm mb-3">Contemporary cuts with classic appeal</p>
                <div class="flex items-center justify-between">
                  <span class="text-2xl font-bold text-slate-800">$149</span>
                  <button class="text-slate-600 hover:text-slate-800 transition">View →</button>
                </div>
              </div>

              <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200 animate-slideIn" style="animation-delay: 0.2s;">
                <div class="bg-slate-100 rounded-lg h-48 mb-4 flex items-center justify-center">
                  <svg class="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-slate-800 mb-2">Luxury Accessories</h3>
                <p class="text-slate-600 text-sm mb-3">Complete your look with signature pieces</p>
                <div class="flex items-center justify-between">
                  <span class="text-2xl font-bold text-slate-800">$89</span>
                  <button class="text-slate-600 hover:text-slate-800 transition">View →</button>
                </div>
              </div>
            </div>

            <!-- Features -->
            <div class="bg-slate-50 rounded-xl p-6">
              <div class="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div class="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h4 class="font-semibold text-slate-800 mb-1">Free Shipping</h4>
                  <p class="text-xs text-slate-600">On orders over $200</p>
                </div>
                <div>
                  <div class="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                  </div>
                  <h4 class="font-semibold text-slate-800 mb-1">Secure Payment</h4>
                  <p class="text-xs text-slate-600">100% secure checkout</p>
                </div>
                <div>
                  <div class="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
                    <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                  </div>
                  <h4 class="font-semibold text-slate-800 mb-1">Easy Returns</h4>
                  <p class="text-xs text-slate-600">30-day return policy</p>
                </div>
                <div>
                  <div class="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mb-3">
                    <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                    </svg>
                  </div>
                  <h4 class="font-semibold text-slate-800 mb-1">Premium Quality</h4>
                  <p class="text-xs text-slate-600">Handpicked materials</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Footer -->
          <footer class="max-w-6xl mx-auto text-center text-white py-8 animate-fadeIn">
            <div class="mb-4">
              <p class="text-sm mb-2">Follow us on social media</p>
              <div class="flex items-center justify-center space-x-4">
                <a href="#" class="hover:text-gray-300 transition">Instagram</a>
                <span class="text-gray-500">•</span>
                <a href="#" class="hover:text-gray-300 transition">Facebook</a>
                <span class="text-gray-500">•</span>
                <a href="#" class="hover:text-gray-300 transition">Twitter</a>
              </div>
            </div>
            <p class="text-xs text-gray-400">© 2026 Elegant Fashion. All rights reserved.</p>
          </footer>
        </body>
      </html>
    `;

    return new Response(html, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    });
  },
};
