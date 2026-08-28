const https = require('https');
const http = require('http');
const { URL } = require('url');
const zlib = require('zlib');

let cookieJar = {};
let proxyCache = {};

// Clean cross-platform HTTPS Agent
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  keepAlive: false
});

const httpAgent = new http.Agent({
  keepAlive: false
});

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
      'Upgrade-Insecure-Requests': '1'
    };

    if (cookieJar[hostKey]) {
      requestHeaders['Cookie'] = cookieJar[hostKey];
    }

    const requestOptions = {
      method: req.method || 'GET',
      headers: requestHeaders,
      agent,
      timeout: 10000
    };

    const proxyReq = client.request(targetUrl, requestOptions, (proxyRes) => {
      resolve({ proxyRes, parsedUrl, targetUrl });
    });

    proxyReq.on('error', (err) => {
      if (isHttps && !isFallback) {
        const fallbackHttpUrl = targetUrl.replace(/^https:\/\//i, 'http://');
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
        reject(new Error('Connection timed out. Remote portal is slow or unreachable.'));
      }
    });

    if (req.method === 'POST' && req.body) {
      const postData = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      proxyReq.write(postData);
    }

    proxyReq.end();
  });
}

const browseUrl = async (req, res) => {
  try {
    let targetUrl = req.query.url;
    const adshield = req.query.adshield !== 'false';

    if (!targetUrl) {
      return res.status(400).send('URL query parameter required.');
    }

    targetUrl = targetUrl.trim().replace(/([^:])\/\/+/g, '$1/');

    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      if (targetUrl.includes('.') && !targetUrl.includes(' ')) {
        targetUrl = `https://${targetUrl}`;
      } else {
        targetUrl = `https://www.bing.com/search?q=${encodeURIComponent(targetUrl)}`;
      }
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(targetUrl);
    } catch (e) {
      targetUrl = `https://www.bing.com/search?q=${encodeURIComponent(targetUrl)}`;
      parsedUrl = new URL(targetUrl);
    }

    if (adshield) {
      for (const pattern of AD_SCRIPT_PATTERNS) {
        if (pattern.test(parsedUrl.hostname) || pattern.test(targetUrl)) {
          return res.status(204).end();
        }
      }
    }

    const { proxyRes, parsedUrl: resolvedUrl, targetUrl: finalTargetUrl } = await makeProxyRequest(targetUrl, req);
    const hostKey = resolvedUrl.hostname;

    if (proxyRes.headers['set-cookie']) {
      const cookies = Array.isArray(proxyRes.headers['set-cookie'])
        ? proxyRes.headers['set-cookie'].map(c => c.split(';')[0]).join('; ')
        : proxyRes.headers['set-cookie'].split(';')[0];
      cookieJar[hostKey] = cookies;
    }

    if ([301, 302, 303, 307, 308].includes(proxyRes.statusCode) && proxyRes.headers.location) {
      let redirectUrl = proxyRes.headers.location;
      if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
        redirectUrl = new URL(redirectUrl, finalTargetUrl).toString();
      }
      return res.redirect(`/api/proxy/browse?url=${encodeURIComponent(redirectUrl)}&adshield=${adshield}`);
    }

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
      proxyRes.on('error', (err) => {
        if (!res.headersSent) {
          renderFallbackNotice(res, targetUrl, err.message);
        }
      });
      proxyRes.on('end', () => {
        try {
          let buffer = Buffer.concat(chunks);

          if (encoding.includes('gzip')) {
            try { buffer = zlib.gunzipSync(buffer); } catch (e) {}
          } else if (encoding.includes('deflate')) {
            try { buffer = zlib.inflateSync(buffer); } catch (e) {}
          } else if (encoding.includes('br')) {
            try { buffer = zlib.brotliDecompressSync(buffer); } catch (e) {}
          }

          let html = buffer.toString('utf-8');
          const baseUrl = `${resolvedUrl.protocol}//${resolvedUrl.host}`;

          // Inject Base href
          if (html.includes('<head>')) {
            html = html.replace('<head>', `<head><base href="${baseUrl}/" />`);
          } else if (html.includes('<HEAD>')) {
            html = html.replace('<HEAD>', `<HEAD><base href="${baseUrl}/" />`);
          }

          delete headers['content-encoding'];
          delete headers['content-length'];

          res.writeHead(proxyRes.statusCode || 200, {
            ...headers,
            'Content-Type': 'text/html; charset=utf-8'
          });
          res.end(html);
        } catch (processErr) {
          renderFallbackNotice(res, targetUrl, processErr.message);
        }
      });
    } else {
      res.writeHead(proxyRes.statusCode || 200, headers);
      proxyRes.on('error', () => {});
      proxyRes.pipe(res);
    }
  } catch (err) {
    renderFallbackNotice(res, req.query.url, err.message);
  }
};

function renderFallbackNotice(res, targetUrl, errorMsg) {
  if (res.headersSent) return;
  const safeUrl = targetUrl || 'https://www.bing.com';
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Shree Online Official Gateway</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 40px; display: flex; align-items: center; justify-content: center; min-height: 100vh; box-sizing: border-box; }
        .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 36px 28px; max-width: 540px; width: 100%; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
        .icon { font-size: 40px; margin-bottom: 12px; }
        h2 { font-size: 20px; font-weight: 800; color: #38bdf8; margin: 0 0 8px 0; }
        p { font-size: 13px; color: #94a3b8; line-height: 1.6; margin: 0 0 20px 0; }
        .url-box { background: #0f172a; padding: 8px 12px; border-radius: 8px; font-family: monospace; font-size: 12px; color: #a7f3d0; word-break: break-all; margin-bottom: 24px; border: 1px solid #334155; }
        .btn-row { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
        .btn-launch { background: #2563eb; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 800; font-size: 13px; display: inline-flex; align-items: center; gap: 6px; }
        .btn-reload { background: #334155; color: #e2e8f0; padding: 12px 18px; border-radius: 8px; border: none; font-weight: 700; font-size: 13px; cursor: pointer; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon">⚡</div>
        <h2>Shree Online Gateway Access</h2>
        <p>This official government portal enforces enhanced security or Direct Access mode:</p>
        <div class="url-box">${safeUrl}</div>
        <div class="btn-row">
          <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="btn-launch">
            🚀 Open Portal Directly in New Tab
          </a>
          <button onclick="window.location.reload()" class="btn-reload">
            ⟳ Retry In-Portal
          </button>
        </div>
      </div>
    </body>
    </html>
  `);
}

const clearCache = async (req, res) => {
  try {
    const cookiesCleared = Object.keys(cookieJar).length;
    cookieJar = {};
    proxyCache = {};

    res.json({
      success: true,
      message: `Browser cache and ${cookiesCleared} host cookies cleared successfully.`,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { browseUrl, clearCache };
