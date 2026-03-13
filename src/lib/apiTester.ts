export interface ApiStatus {
  name: string;
  status: 'online' | 'error' | 'missing' | 'testing';
  message?: string;
}

function formatError(e: any): string {
  if (e.message === 'Failed to fetch') {
    return 'Failed to fetch (Blocked by CORS - Please enable your Allow CORS browser extension)';
  }
  return e.message || 'Unknown error';
}

export async function testApiConnections(): Promise<ApiStatus[]> {
  const VIRUSTOTAL_API_KEY = import.meta.env.VITE_VIRUSTOTAL_KEY || "";
  const GOOGLE_SAFE_BROWSING_API_KEY = import.meta.env.VITE_GOOGLE_SAFE_BROWSING_KEY || "";
  const PHISHTANK_API_KEY = import.meta.env.VITE_PHISHTANK_KEY || "";
  const IPQUALITYSCORE_API_KEY = import.meta.env.VITE_IPQUALITYSCORE_KEY || "";
  const CLOUDMERSIVE_API_KEY = import.meta.env.VITE_CLOUDMERSIVE_KEY || "";
  const URLHAUS_API_KEY = import.meta.env.VITE_URLHAUS_KEY || "";

  const IS_DEV = import.meta.env.DEV;
  const VT_BASE = IS_DEV ? '/proxy/vt' : 'https://www.virustotal.com';
  const GSB_BASE = IS_DEV ? '/proxy/gsb' : 'https://safebrowsing.googleapis.com';
  const PHISHTANK_BASE = IS_DEV ? '/proxy/phishtank' : 'https://checkurl.phishtank.com';
  const IPQS_BASE = IS_DEV ? '/proxy/ipqs' : 'https://www.ipqualityscore.com';
  const CLOUDMERSIVE_BASE = IS_DEV ? '/proxy/cloudmersive' : 'https://api.cloudmersive.com';
  const URLHAUS_BASE = IS_DEV ? '/proxy/urlhaus' : 'https://urlhaus-api.abuse.ch';

  const results: ApiStatus[] = [];
  const testUrl = "http://example.com";
  
  // VT
    if (VIRUSTOTAL_API_KEY && VIRUSTOTAL_API_KEY !== "your_new_key_here") {
     try {
       const encodedId = btoa(unescape(encodeURIComponent(testUrl))).replace(/=/g, "");
       const res = await fetch(`${VT_BASE}/api/v3/urls/${encodedId}`, {
         method: 'GET',
         headers: { 'x-apikey': VIRUSTOTAL_API_KEY, 'Accept': 'application/json' }
       });
       results.push({
         name: 'VirusTotal',
         status: res.ok || res.status === 404 ? 'online' : 'error',
         message: res.ok || res.status === 404 ? 'Connected API' : `HTTP Error ${res.status}`
       });
     } catch (e: any) { results.push({ name: 'VirusTotal', status: 'error', message: formatError(e) }); }
  } else { results.push({ name: 'VirusTotal', status: 'missing', message: 'API Key not provided in .env (or server needs restart)' }); }

  // GSB
  if (GOOGLE_SAFE_BROWSING_API_KEY && GOOGLE_SAFE_BROWSING_API_KEY !== "your_gsb_key_here") {
      try {
        const payload = {
          client: { clientId: "phishguard", clientVersion: "1.0.0" },
          threatInfo: {
            threatTypes: ["MALWARE"],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url: testUrl }]
          }
        };
        const res = await fetch(`${GSB_BASE}/v4/threatMatches:find?key=${GOOGLE_SAFE_BROWSING_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        results.push({ name: 'Google Safe Browsing', status: res.ok ? 'online' : 'error', message: res.ok ? 'Connected API' : `HTTP Error ${res.status}` });
      } catch (e: any) { results.push({ name: 'Google Safe Browsing', status: 'error', message: formatError(e) }); }
  } else { results.push({ name: 'Google Safe Browsing', status: 'missing', message: 'API Key not provided in .env (or server needs restart)' }); }

  // Phishtank
  if (PHISHTANK_API_KEY && PHISHTANK_API_KEY !== "your_phishtank_key_here") {
      try {
        const res = await fetch(`${PHISHTANK_BASE}/checkurl/`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
           body: new URLSearchParams({ url: testUrl, format: 'json', app_key: PHISHTANK_API_KEY })
        });
        results.push({ name: 'PhishTank', status: res.ok ? 'online' : 'error', message: res.ok ? 'Connected API' : `HTTP Error ${res.status}` });
      } catch (e: any) { results.push({ name: 'PhishTank', status: 'error', message: formatError(e) }); }
  } else { results.push({ name: 'PhishTank', status: 'missing', message: 'API Key not provided in .env (or server needs restart)' }); }

  // IPQualityScore
  if (IPQUALITYSCORE_API_KEY && IPQUALITYSCORE_API_KEY !== "your_ipqs_key_here") {
      try {
        const encodedUrl = encodeURIComponent(testUrl);
        const res = await fetch(`${IPQS_BASE}/api/json/url/${IPQUALITYSCORE_API_KEY}/${encodedUrl}`);
        results.push({ name: 'IPQualityScore', status: res.ok ? 'online' : 'error', message: res.ok ? 'Connected API' : `HTTP Error ${res.status}` });
      } catch (e: any) { results.push({ name: 'IPQualityScore', status: 'error', message: formatError(e) }); }
  } else { results.push({ name: 'IPQualityScore', status: 'missing', message: 'API Key not provided in .env (or server needs restart)' }); }

  // Cloudmersive
  if (CLOUDMERSIVE_API_KEY && CLOUDMERSIVE_API_KEY !== "your_cloudmersive_key_here") {
      try {
        const res = await fetch(`${CLOUDMERSIVE_BASE}/virus/scan/website`, {
          method: 'POST',
          headers: { 'Apikey': CLOUDMERSIVE_API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ Url: testUrl })
        });
        results.push({ name: 'Cloudmersive', status: res.ok ? 'online' : 'error', message: res.ok ? 'Connected API' : `HTTP Error ${res.status}` });
      } catch (e: any) { results.push({ name: 'Cloudmersive', status: 'error', message: formatError(e) }); }
  } else { results.push({ name: 'Cloudmersive', status: 'missing', message: 'API Key not provided in .env (or server needs restart)' }); }

  // URLhaus
  if (URLHAUS_API_KEY && URLHAUS_API_KEY !== "your_urlhaus_key_here") {
       try {
         const payload = new URLSearchParams({ url: testUrl });
         const res = await fetch(`${URLHAUS_BASE}/v1/url/`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
           body: payload
         });
         results.push({ name: 'URLhaus', status: res.ok ? 'online' : 'error', message: res.ok ? 'Connected API' : `HTTP Error ${res.status}` });
       } catch (e: any) { results.push({ name: 'URLhaus', status: 'error', message: formatError(e) }); }
  } else { results.push({ name: 'URLhaus', status: 'missing', message: 'API Key not provided in .env (or server needs restart)' }); }

  return results;
}
