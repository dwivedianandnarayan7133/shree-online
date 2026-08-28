const https = require('https');
const http = require('http');
const { URL } = require('url');
const zlib = require('zlib');

// In-memory cookie store per host
let cookieJar = {};
let proxyCache = {};

// Custom HTTPS Agent with legacy TLS/cipher support for Indian Govt & NIC portals
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  ciphers: 'DEFAULT@SECLEVEL=0',
  minVersion: 'TLSv1',
  keepAlive: false
});

const httpAgent = new http.Agent({
  keepAlive: false
});

// Known Ad & Tracking Networks to Block
const AD_SCRIPT_PATTERNS = [
  /googlesyndication\.com/i,
  /doubleclick\.net/i,
  /googleads\.g\.doubleclick\.net/i,
  /adservice\.google\./i,
  /popads\.net/i,
  /propellerads\.com/i,
  /outbrain\.com/i,
  /taboola\.com/i,
  /infolinks\.com/i,
  /adsterra\.com/i,
  /mgid\.com/i,
  /adnxs\.com/i,
  /amazon-adsystem\.com/i,
  /criteo\.com/i,
  /scorecardresearch\.com/i,
  /pagead2\.googlesyndication\.com/i
];

/**
 * Execute HTTP/HTTPS Request with Automatic Protocol Fallback
 */
function makeProxyRequest(targetUrl, req, options = {}) {
  const { isFallback = false } = options;

  return new Promise((resolve, reject) => {
    let parsedUrl;
    try {
      parsedUrl = new URL(targetUrl);
    } catch (e) {
      return reject(new Error(`Invalid URL: ${targetUrl}`));
    }

    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;
    const agent = isHttps ? httpsAgent : httpAgent;
    const hostKey = parsedUrl.hostname;

    const requestHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1'
    };

    if (cookieJar[hostKey]) {
      requestHeaders['Cookie'] = cookieJar[hostKey];
    }

    const requestOptions = {
      method: req.method || 'GET',
      headers: requestHeaders,
      agent,
      timeout: 18000
    };

    const proxyReq = client.request(targetUrl, requestOptions, (proxyRes) => {
      resolve({ proxyRes, parsedUrl, targetUrl });
    });

    proxyReq.on('error', (err) => {
      // If HTTPS failed due to SSL handshake / ECONNRESET / ECONNREFUSED on government sites (like upsssc.gov.in)
      if (isHttps && !isFallback) {
        const fallbackHttpUrl = targetUrl.replace(/^https:\/\//i, 'http://');
        console.warn(`[Proxy Fallback] HTTPS failed for ${parsedUrl.hostname} (${err.message}). Retrying with HTTP: ${fallbackHttpUrl}`);
        makeProxyRequest(fallbackHttpUrl, req, { isFallback: true })
          .then(resolve)
          .catch(reject);
      } else {
        reject(err);
      }
    });

    proxyReq.on('timeout', () => {
      proxyReq.destroy();
      if (isHttps && !isFallback) {
        const fallbackHttpUrl = targetUrl.replace(/^https:\/\//i, 'http://');
        makeProxyRequest(fallbackHttpUrl, req, { isFallback: true })
          .then(resolve)
          .catch(reject);
      } else {
        reject(new Error('Connection timed out. Remote server is slow or unreachable.'));
      }
    });

    if (req.method === 'POST' && req.body) {
      const postData = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      proxyReq.write(postData);
    }

    proxyReq.end();
  });
}

/**
 * Universal In-Portal Web Proxy Gateway with AdShield & Protocol Fallback
 */
const browseUrl = async (req, res) => {
  try {
    let targetUrl = req.query.url;
    const adshield = req.query.adshield !== 'false';

    if (!targetUrl) {
      return res.status(400).send('URL query parameter required.');
    }

    // Clean duplicate slashes in pathname (e.g. upsssc.gov.in//AllNotifications.aspx -> upsssc.gov.in/AllNotifications.aspx)
    targetUrl = targetUrl.trim().replace(/([^:])\/\/+/g, '$1/');

    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      if (targetUrl.includes('.') && !targetUrl.includes(' ')) {
        targetUrl = `https://${targetUrl}`;
      } else {
        targetUrl = `https://www.bing.com/search?q=${encodeURIComponent(targetUrl)}`;
      }
    }

    // Google search auto-reroute to clean engine
    if (targetUrl.includes('google.com/search') && !targetUrl.includes('igu=1')) {
      try {
        const parsedGoogle = new URL(targetUrl);
        const query = parsedGoogle.searchParams.get('q') || '';
        targetUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
      } catch (e) {}
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(targetUrl);
    } catch (e) {
      targetUrl = `https://www.bing.com/search?q=${encodeURIComponent(targetUrl)}`;
      parsedUrl = new URL(targetUrl);
    }

    // AdShield Domain Interceptor: Block direct subresource requests to ad networks
    if (adshield) {
      for (const pattern of AD_SCRIPT_PATTERNS) {
        if (pattern.test(parsedUrl.hostname) || pattern.test(targetUrl)) {
          return res.status(204).end();
        }
      }
    }

    const { proxyRes, parsedUrl: resolvedUrl, targetUrl: finalTargetUrl } = await makeProxyRequest(targetUrl, req);
    const hostKey = resolvedUrl.hostname;

    // Store returned cookies
    if (proxyRes.headers['set-cookie']) {
      const cookies = Array.isArray(proxyRes.headers['set-cookie'])
        ? proxyRes.headers['set-cookie'].map(c => c.split(';')[0]).join('; ')
        : proxyRes.headers['set-cookie'].split(';')[0];
      cookieJar[hostKey] = cookies;
    }

    // Handle HTTP redirects (301, 302, 303, 307, 308)
    if ([301, 302, 303, 307, 308].includes(proxyRes.statusCode) && proxyRes.headers.location) {
      let redirectUrl = proxyRes.headers.location;
      if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
        redirectUrl = new URL(redirectUrl, finalTargetUrl).toString();
      }
      return res.redirect(`/api/proxy/browse?url=${encodeURIComponent(redirectUrl)}&adshield=${adshield}`);
    }

    // Strip frame blocking & CSP headers
    const headers = { ...proxyRes.headers };
    delete headers['x-frame-options'];
    delete headers['content-security-policy'];
    delete headers['content-security-policy-report-only'];
    delete headers['x-content-security-policy'];
    delete headers['x-webkit-csp'];
    delete headers['cross-origin-embedder-policy'];
    delete headers['cross-origin-opener-policy'];
    delete headers['cross-origin-resource-policy'];

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Frame-Options', 'ALLOWALL');

    const contentType = proxyRes.headers['content-type'] || '';
    const encoding = (proxyRes.headers['content-encoding'] || '').toLowerCase();

    if (contentType.includes('text/html')) {
      let chunks = [];
      proxyRes.on('data', chunk => chunks.push(chunk));
      proxyRes.on('end', () => {
        let buffer = Buffer.concat(chunks);

        // 1. Decompress
        try {
          if (encoding.includes('gzip')) {
            buffer = zlib.gunzipSync(buffer);
          } else if (encoding.includes('deflate')) {
            buffer = zlib.inflateSync(buffer);
          } else if (encoding.includes('br')) {
            buffer = zlib.brotliDecompressSync(buffer);
          }
        } catch (decompErr) {
          console.warn('Decompression notice:', decompErr.message);
        }

        let html = buffer.toString('utf8');

        // 2. AdShield Deep Cleaner: Strip Ad scripts & banner blocks
        let blockedAdCount = 0;
        if (adshield) {
          html = html.replace(/<script[^>]*(?:googlesyndication|doubleclick|popads|propellerads|adservice|outbrain|taboola|infolinks|adsterra|mgid|adnxs|amazon-adsystem|criteo)[^>]*>[\s\S]*?<\/script>/gi, () => {
            blockedAdCount++;
            return '<!-- [AdShield Blocked Ad Script] -->';
          });

          html = html.replace(/<ins[^>]*class=["'][^"']*adsbygoogle[^"']*["'][^>]*>[\s\S]*?<\/ins>/gi, () => {
            blockedAdCount++;
            return '<!-- [AdShield Blocked Ad Banner] -->';
          });

          html = html.replace(/<iframe[^>]*(?:google_ads|doubleclick|popads|adservice)[^>]*>[\s\S]*?<\/iframe>/gi, () => {
            blockedAdCount++;
            return '<!-- [AdShield Blocked Ad Iframe] -->';
          });
        }

        // 3. Neutralize frame-busting scripts in HTML
        html = html.replace(/top\.location/g, 'window.location')
                   .replace(/window\.top\.location/g, 'window.location')
                   .replace(/parent\.location/g, 'window.location')
                   .replace(/window\.parent\.location/g, 'window.location');

        // 4. Neutralize target="_blank", target="_top", target="_parent"
        html = html.replace(/target\s*=\s*["']_blank["']/gi, 'target="_self"')
                   .replace(/target\s*=\s*["']_top["']/gi, 'target="_self"')
                   .replace(/target\s*=\s*["']_parent["']/gi, 'target="_self"');

        // 5. Inject Base Tag & AdShield CSS
        const baseHref = `${resolvedUrl.protocol}//${resolvedUrl.host}${resolvedUrl.pathname.substring(0, resolvedUrl.pathname.lastIndexOf('/') + 1)}`;
        const adshieldStyle = adshield ? `
          <style id="shree-adshield-css">
            .adsbygoogle, [id*="google_ads"], [class*="ad-banner"], [class*="ad_banner"], 
            [class*="ads-holder"], [class*="ad_container"], iframe[src*="ad"], 
            iframe[src*="doubleclick"], .sponsored-post, #top-ad, #bottom-ad { 
              display: none !important; 
              visibility: hidden !important; 
              height: 0 !important; 
              max-height: 0 !important; 
              opacity: 0 !important; 
              pointer-events: none !important; 
            }
          </style>
        ` : '';

        const baseTag = `<base href="${baseHref}" />${adshieldStyle}`;
        if (html.includes('<head>')) {
          html = html.replace('<head>', `<head>${baseTag}`);
        } else if (html.includes('<HEAD>')) {
          html = html.replace('<HEAD>', `<HEAD>${baseTag}`);
        } else {
          html = `${baseTag}${html}`;
        }

        // Absolute Gateway Endpoint to guarantee zero relative 404s when <base> is active
        const proxyOrigin = `http://localhost:5000`;

        // 6. In-Page Event Interception & Navigation Trap
        const clientScript = `
          <script>
            (function() {
              var PROXY_ORIGIN = '${proxyOrigin}';
              
              // Trap window.open
              window.open = function(url) {
                if (url) {
                  window.location.href = PROXY_ORIGIN + '/api/proxy/browse?url=' + encodeURIComponent(url) + '&adshield=${adshield}';
                }
                return window;
              };

              // Intercept all link clicks
              document.addEventListener('click', function(e) {
                var a = e.target.closest('a');
                if (a && a.href && !a.href.startsWith('javascript:') && !a.href.startsWith('#')) {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = PROXY_ORIGIN + '/api/proxy/browse?url=' + encodeURIComponent(a.href) + '&adshield=${adshield}';
                }
              }, true);

              // Intercept all form submissions
              document.addEventListener('submit', function(e) {
                var form = e.target;
                if (form && form.action) {
                  var method = (form.method || 'GET').toUpperCase();
                  if (method === 'GET') {
                    e.preventDefault();
                    var formData = new FormData(form);
                    var params = new URLSearchParams(formData).toString();
                    var actionUrl = form.action + (form.action.includes('?') ? '&' : '?') + params;
                    window.location.href = PROXY_ORIGIN + '/api/proxy/browse?url=' + encodeURIComponent(actionUrl) + '&adshield=${adshield}';
                  }
                }
              }, true);
            })();
          </script>
        `;

        html = html.replace('</body>', `${clientScript}</body>`);
        if (!html.includes(clientScript)) {
          html += clientScript;
        }

        delete headers['content-encoding'];
        delete headers['content-length'];

        res.setHeader('X-AdShield-Blocked', String(blockedAdCount));
        res.writeHead(proxyRes.statusCode || 200, {
          ...headers,
          'Content-Type': 'text/html; charset=utf-8'
        });
        res.end(html);
      });
    } else {
      // Stream non-HTML assets (CSS, JS, Images, Fonts)
      res.writeHead(proxyRes.statusCode || 200, headers);
      proxyRes.pipe(res);
    }
  } catch (err) {
    if (!res.headersSent) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <div style="font-family: system-ui, sans-serif; padding: 40px; text-align: center; background: #0f172a; color: #f8fafc; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <h2 style="color: #ef4444; margin-bottom: 12px;">Shree Online Gateway Notice</h2>
          <p style="color: #94a3b8; max-width: 550px; margin: 0 auto 20px auto; line-height: 1.6;">
            Unable to connect to <b>${req.query.url || 'website'}</b> (${err.message}).
          </p>
          <div style="display: flex; gap: 12px;">
            <button onclick="window.location.reload()" style="padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
              Retry Loading
            </button>
            <button onclick="window.location.href='http://localhost:5000/api/proxy/browse?url=https://www.bing.com&adshield=true'" style="padding: 10px 20px; background: #1e293b; color: white; border: 1px solid #475569; border-radius: 8px; font-weight: bold; cursor: pointer;">
              Open Search Engine
            </button>
          </div>
        </div>
      `);
    }
  }
};

/**
 * Clear Browser Proxy Cache, Cookie Jar & Active Web Sessions
 */
const clearCache = async (req, res) => {
  try {
    const cookiesCleared = Object.keys(cookieJar).length;
    cookieJar = {};
    proxyCache = {};

    res.json({
      success: true,
      message: `Browser cache, session history, and ${cookiesCleared} host cookies cleared successfully.`,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { browseUrl, clearCache };
