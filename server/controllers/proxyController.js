const https = require('https');
const http = require('http');
const { URL } = require('url');
const zlib = require('zlib');

let cookieJar = {};
let proxyCache = {};

// Clean standard agents with relaxed timeout and rejectUnauthorized false
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
      timeout: 8000
    };

    let proxyReq;
    try {
      proxyReq = client.request(targetUrl, requestOptions, (proxyRes) => {
        resolve({ proxyRes, parsedUrl, targetUrl });
      });
    } catch (err) {
      return reject(err);
    }

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
      reject(new Error('Connection timed out. Remote server is slow or enforcing anti-proxy firewall.'));
    });

    if (req.method === 'POST' && req.body) {
      const postData = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      proxyReq.write(postData);
    }

    proxyReq.end();
  });
}

const browseUrl = async (req, res) => {
  let targetUrl = req.query.url;
  const adshield = req.query.adshield !== 'false';

  if (!targetUrl) {
    return renderGatewayLanding(res, 'https://www.sarkariresult.com');
  }

  try {
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
        renderGatewayLanding(res, targetUrl, err.message);
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
          renderGatewayLanding(res, targetUrl, processErr.message);
        }
      });
    } else {
      res.writeHead(proxyRes.statusCode || 200, headers);
      proxyRes.on('error', () => {});
      proxyRes.pipe(res);
    }
  } catch (err) {
    renderGatewayLanding(res, targetUrl, err.message);
  }
};

function renderGatewayLanding(res, targetUrl, errorMsg = '') {
  if (res.headersSent) return;
  const safeUrl = targetUrl || 'https://www.sarkariresult.com';
  
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>Shree Online Official Gateway</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 24px; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
        .gateway-card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 36px 28px; max-width: 560px; width: 100%; text-align: center; box-shadow: 0 14px 40px rgba(0,0,0,0.35); }
        .badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 800; margin-bottom: 12px; }
        h1 { font-size: 22px; font-weight: 900; color: #ffffff; margin: 0 0 8px 0; }
        p { font-size: 13px; color: #94a3b8; line-height: 1.6; margin: 0 0 16px 0; }
        .url-box { background: #0f172a; padding: 10px 14px; border-radius: 10px; font-family: monospace; font-size: 13px; color: #34d399; word-break: break-all; margin-bottom: 24px; border: 1px solid #334155; text-align: left; }
        .action-row { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
        .btn-launch { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; padding: 14px 24px; border-radius: 10px; text-decoration: none; font-weight: 900; font-size: 14px; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 14px rgba(37,99,235,0.4); }
        .btn-launch:hover { background: #1d4ed8; }
        .btn-sub { background: #334155; color: #f1f5f9; padding: 14px 20px; border-radius: 10px; border: none; font-weight: 700; font-size: 13px; cursor: pointer; }
        .footer-note { font-size: 11px; color: #64748b; margin-top: 24px; border-top: 1px solid #334155; padding-top: 14px; }
      </style>
    </head>
    <body>
      <div class="gateway-card">
        <div class="badge">⚡ Shree Online Official Gateway</div>
        <h1>Direct Government Portal Access</h1>
        <p>This official government or banking portal enforces direct client session security and OTP protection:</p>
        <div class="url-box">🔗 ${safeUrl}</div>
        <div class="action-row">
          <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="btn-launch">
            🚀 Launch Portal in Direct Window
          </a>
          <button onclick="window.location.reload()" class="btn-sub">
            ⟳ Retry In-Portal
          </button>
        </div>
        <div class="footer-note">
          © 2013 – 2026 Shree Online Sewa Kendra • Main Market, Mahuli, S.K.N (U.P.)
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
