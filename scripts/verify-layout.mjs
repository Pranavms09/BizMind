import { spawn } from 'child_process';
import http from 'http';

const RESOLUTIONS = [
  { width: 1920, height: 1080, name: '1920x1080 (FHD)' },
  { width: 1600, height: 900, name: '1600x900 (HD+)' },
  { width: 1440, height: 900, name: '1440x900 (MacBook 14/15)' },
  { width: 1280, height: 800, name: '1280x800 (Laptop)' },
  { width: 1024, height: 768, name: '1024x768 (Tablet/Compact)' }
];

const TABS = [
  'dashboard',
  'analyst',
  'competitive',
  'datasets',
  'decisions',
  'memory',
  'learning',
  'timeline'
];

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) {
          reject(msg.error);
        } else {
          resolve(msg.result);
        }
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function run() {
  console.log('🚀 Starting Chrome Layout Verification...');

  // Start headless Chrome with remote debugging
  const chromeProcess = spawn(
    '/usr/bin/google-chrome',
    [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--remote-debugging-port=9222',
      '--window-size=1440,900',
      'about:blank'
    ],
    { stdio: 'ignore' }
  );

  // Wait for Chrome to be ready
  await sleep(1500);

  try {
    const list = await fetchJson('http://127.0.0.1:9222/json/list');
    const pageTarget = list.find((t) => t.type === 'page');
    if (!pageTarget) throw new Error('No page target found');
    const wsUrl = pageTarget.webSocketDebuggerUrl;

    const cdp = new CDPClient(wsUrl);
    await cdp.connect();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('DOM.enable');

    console.log('Connected to Chrome DevTools Protocol successfully.');

    let allPassed = true;
    const results = [];

    for (const res of RESOLUTIONS) {
      console.log(`\n==================================================`);
      console.log(`Testing Viewport: ${res.name} (${res.width}x${res.height})`);
      console.log(`==================================================`);

      // Set device metrics
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: res.width,
        height: res.height,
        deviceScaleFactor: 1,
        mobile: false
      });
      await cdp.send('Emulation.setVisibleSize', { width: res.width, height: res.height });

      for (const tab of TABS) {
        const url = `http://localhost:3000/?tab=${tab}`;
        await cdp.send('Page.navigate', { url });

        // Wait for page to render and settle
        await sleep(1200);

        // Evaluate layout metrics in browser
        const evalRes = await cdp.send('Runtime.evaluate', {
          expression: `
            (() => {
              const sidebar = document.querySelector('aside');
              const main = document.querySelector('main');
              const header = document.querySelector('header');
              const body = document.body;
              const html = document.documentElement;

              const isDesktop = window.innerWidth >= 1024;
              const sRect = sidebar ? sidebar.getBoundingClientRect() : null;
              const mRect = main ? main.getBoundingClientRect() : null;
              const hRect = header ? header.getBoundingClientRect() : null;

              // Check 1: Does sidebar overlap main on desktop?
              let overlap = false;
              if (isDesktop && sRect && mRect) {
                // If main left is smaller than sidebar right, it's overlapping
                overlap = (mRect.left < (sRect.right - 1));
              }

              // Check 2: Does main have horizontal scroll overflow?
              const mainOverflow = main ? (main.scrollWidth > main.clientWidth) : false;

              // Check 3: Does body/root have horizontal scroll overflow?
              const bodyOverflow = (html.scrollWidth > window.innerWidth) || (body.scrollWidth > window.innerWidth);

              // Check 4: Top nav alignment
              let topnavAligned = true;
              if (isDesktop && sRect && hRect) {
                // Header should start at or after sidebar right
                topnavAligned = hRect.left >= (sRect.right - 1);
              }

              // Check 5: Look for any child element overflowing the main viewport horizontally
              let overflowingElements = [];
              if (main) {
                const elements = main.querySelectorAll('*');
                for (const el of elements) {
                  const r = el.getBoundingClientRect();
                  if (r.right > (mRect.right + 2) && r.width > 0 && r.height > 0) {
                    // Check if el is contained inside an intentional overflow-x scroll container
                    let parent = el.parentElement;
                    let isContainedInScrollArea = false;
                    while (parent && parent !== main) {
                      const style = window.getComputedStyle(parent);
                      if (style.overflowX === 'auto' || style.overflowX === 'scroll' || style.overflowX === 'hidden') {
                        const pr = parent.getBoundingClientRect();
                        if (pr.right <= (mRect.right + 2)) {
                          isContainedInScrollArea = true;
                          break;
                        }
                      }
                      parent = parent.parentElement;
                    }

                    if (!isContainedInScrollArea) {
                      const tag = el.tagName.toLowerCase();
                      const cls = (el.className || '').toString().slice(0, 40);
                      overflowingElements.push(tag + '.' + cls + ' (right: ' + Math.round(r.right) + ' vs ' + Math.round(mRect.right) + ')');
                      if (overflowingElements.length >= 3) break;
                    }
                  }
                }
              }

              return {
                isDesktop,
                sidebarWidth: sRect ? sRect.width : 0,
                sidebarRight: sRect ? sRect.right : 0,
                mainLeft: mRect ? mRect.left : 0,
                mainWidth: mRect ? mRect.width : 0,
                mainScrollWidth: main ? main.scrollWidth : 0,
                mainClientWidth: main ? main.clientWidth : 0,
                headerLeft: hRect ? hRect.left : 0,
                headerWidth: hRect ? hRect.width : 0,
                overlap,
                mainOverflow,
                bodyOverflow,
                topnavAligned,
                overflowingElements
              };
            })()
          `,
          returnByValue: true
        });

        const data = evalRes.result.value;
        const pass = !data.overlap && !data.mainOverflow && !data.bodyOverflow && data.topnavAligned && (data.overflowingElements.length === 0);

        if (!pass) {
          allPassed = false;
        }

        const status = pass ? '✅ PASS' : '❌ FAIL';
        console.log(`[${status}] Tab: ${tab.padEnd(12)} | Sidebar: ${data.sidebarWidth}px | Main: ${data.mainWidth}px (L: ${data.mainLeft}px) | Scroll: ${data.mainScrollWidth}/${data.mainClientWidth} | Overlap: ${data.overlap}`);
        if (!pass) {
          console.log(`       Details: overlap=${data.overlap}, mainOverflow=${data.mainOverflow}, bodyOverflow=${data.bodyOverflow}, topnavAligned=${data.topnavAligned}`);
          if (data.overflowingElements.length > 0) {
            console.log(`       Overflowing elements:`, data.overflowingElements);
          }
        }

        results.push({
          resolution: res.name,
          tab,
          pass,
          details: data
        });
      }
    }

    await cdp.close();

    console.log(`\n==================================================`);
    console.log(`SUMMARY: ${results.filter(r => r.pass).length}/${results.length} tests passed.`);
    console.log(`Overall Layout Verification: ${allPassed ? 'ALL PASSED 🎉' : 'ISSUES DETECTED ⚠️'}`);
    console.log(`==================================================\n`);

  } finally {
    chromeProcess.kill();
  }
}

run().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
