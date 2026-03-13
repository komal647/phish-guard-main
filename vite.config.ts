import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";
import whois from "whois-json";

// Custom Vite plugin to handle WHOIS and RDAP requests securely via the Node backend
function whoisPlugin(): Plugin {
  return {
    name: 'whois-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/api/whois')) {
          const url = new URL(req.url, `http://${req.headers.host}`);
          const domain = url.searchParams.get('domain');

          if (!domain) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Domain parameter is required' }));
            return;
          }

          res.setHeader('Content-Type', 'application/json');

          try {
            console.log(`[Vite] Attempting RDAP fetch for ${domain}`);
            let days = 0;
            let created_date = 'Unknown';
            let registrar = 'Unknown';

            // 1. Try RDAP First (Modern, JSON-native)
            try {
              const rdapRes = await fetch(`https://rdap.org/domain/${domain}`);
              if (rdapRes.ok) {
                const rdapData = await rdapRes.json() as any;
                
                // Parse Registration Event
                if (rdapData.events && Array.isArray(rdapData.events)) {
                  const regEvent = rdapData.events.find((e: any) => e.eventAction === 'registration');
                  if (regEvent && regEvent.eventDate) {
                    const firstSeen = new Date(regEvent.eventDate);
                    days = Math.floor((Date.now() - firstSeen.getTime()) / (1000 * 60 * 60 * 24));
                    created_date = regEvent.eventDate.substring(0, 10);
                  }
                }

                // Parse Registrar
                if (rdapData.entities && Array.isArray(rdapData.entities)) {
                   const regEntity = rdapData.entities.find((e: any) => e.roles && e.roles.includes('registrar'));
                   if (regEntity && regEntity.vcardArray && regEntity.vcardArray[1]) {
                     const fn = regEntity.vcardArray[1].find((v: any) => v[0] === 'fn');
                     if (fn) registrar = fn[3];
                   }
                }

                if (days > 0) {
                  res.end(JSON.stringify({ days, created_date, registrar: registrar || 'RDAP Verified' }));
                  return;
                }
              }
            } catch (e) {
              console.log(`[Vite] RDAP failed for ${domain}, falling back to WHOIS`);
            }

            // 2. Fallback to raw WHOIS port 43 lookup using `whois-json`
            console.log(`[Vite] Falling back to traditional WHOIS for ${domain}`);
            const whoisData = await whois(domain) as any;
            
            // Normalize keys (registrars use different names for creation date)
            const createdRaw = whoisData['creationDate'] || whoisData['created'] || whoisData['registeredOn'] || whoisData['domainRegistrationDate'];
            
            if (createdRaw) {
              const firstSeen = new Date(createdRaw);
              if (!isNaN(firstSeen.getTime())) {
                 days = Math.floor((Date.now() - firstSeen.getTime()) / (1000 * 60 * 60 * 24));
                 created_date = firstSeen.toISOString().substring(0, 10);
              }
            }

            registrar = whoisData['registrar'] || whoisData['sponsoringRegistrar'] || 'Unknown';

            res.end(JSON.stringify({ days, created_date, registrar }));
          } catch (error) {
            console.error('[Vite] WHOIS Error:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to fetch domain age' }));
          }
          return;
        }
        next();
      });
    }
  };
}
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      '/proxy/vt': { target: 'https://www.virustotal.com', changeOrigin: true, rewrite: p => p.replace(/^\/proxy\/vt/, '') },
      '/proxy/gsb': { target: 'https://safebrowsing.googleapis.com', changeOrigin: true, rewrite: p => p.replace(/^\/proxy\/gsb/, '') },
      '/proxy/phishtank': { target: 'https://checkurl.phishtank.com', changeOrigin: true, rewrite: p => p.replace(/^\/proxy\/phishtank/, '') },
      '/proxy/ipqs': { target: 'https://www.ipqualityscore.com', changeOrigin: true, rewrite: p => p.replace(/^\/proxy\/ipqs/, '') },
      '/proxy/cloudmersive': { target: 'https://api.cloudmersive.com', changeOrigin: true, rewrite: p => p.replace(/^\/proxy\/cloudmersive/, '') },
      '/proxy/urlhaus': { target: 'https://urlhaus-api.abuse.ch', changeOrigin: true, rewrite: p => p.replace(/^\/proxy\/urlhaus/, '') },
    }
  },
  plugins: [
    whoisPlugin(),
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'placeholder.svg'],
      devOptions: {
        enabled: true
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5000000,
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: 'PhishGuard - Advanced Phishing Detection',
        short_name: 'PhishGuard',
        description: 'Real-time phishing detection and URL analysis tool.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon'
          },
          {
            src: 'placeholder.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
