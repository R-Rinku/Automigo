/**
 * Automigo AI Quiz Solver — MV3 Background Service Worker
 * Proxies AI API requests (OmniRoute, Ollama, NVIDIA NIM, Groq, Gemini, OpenRouter, OpenAI, Custom)
 * with full extension host permissions, completely bypassing HTTPS mixed-content and
 * private network access (PNA / CORS) restrictions on amigo.amityonline.com.
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log("[Automigo Background] Service Worker installed and ready.");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 1. AI Network Proxy
  if (request.type === "AI_FETCH") {
    const { url, options = {} } = request;
    const fetchOptions = {
      method: options.method || "GET",
      headers: options.headers || {}
    };

    if (options.body) {
      fetchOptions.body = typeof options.body === "string" ? options.body : JSON.stringify(options.body);
    }

    const timeoutMs = options.timeout || 30000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    fetchOptions.signal = controller.signal;

    fetch(url, fetchOptions)
      .then(async (res) => {
        clearTimeout(timeoutId);
        const text = await res.text();
        let data = null;
        try {
          data = JSON.parse(text);
        } catch (e) {
          // Non-JSON response
        }
        sendResponse({
          ok: res.ok,
          status: res.status,
          statusText: res.statusText,
          text: text,
          data: data
        });
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        const isTimeout = err.name === "AbortError";
        sendResponse({
          ok: false,
          status: 0,
          error: isTimeout ? `Request timed out after ${timeoutMs}ms` : (err.message || "Network error")
        });
      });

    return true; // Keep message channel open for async sendResponse
  }

  // 2. Open Extension Settings Popup programmatically
  if (request.type === "OPEN_POPUP") {
    if (chrome.action && chrome.action.openPopup) {
      chrome.action.openPopup().catch(() => {});
    }
    sendResponse({ ok: true });
    return true;
  }

  // 3. Keep-alive ping
  if (request.type === "PING") {
    sendResponse({ ok: true, pong: Date.now() });
    return true;
  }
});

