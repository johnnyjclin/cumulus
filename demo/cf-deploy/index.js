export default {
  async fetch(request, env, ctx) {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>x402 Cloud Gateway</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-slate-50 flex items-center justify-center min-h-screen">
          <div class="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-100">
            <div class="text-5xl mb-4">🚀</div>
            <h1 class="text-2xl font-bold text-slate-800 mb-2">Worker Deployed!</h1>
            <p class="text-slate-600 mb-6">這是一個透過 <strong>x402 Cloud Gateway</strong> 使用 ZIP 上傳並付費部署的 Cloudflare Worker。</p>
            <div class="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-mono text-sm">
              Status: Paid & Active
            </div>
            <div class="mt-8 text-xs text-slate-400">
              Powered by x402 Protocol
            </div>
          </div>
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
