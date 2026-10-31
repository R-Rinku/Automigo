(function() {
  if (document.getElementById("amigo-ai-hud")) return;

  /* ═══════════════════════════════════════════════
     MULTI-PROVIDER AI CONFIGURATION & PROFILES
     ═══════════════════════════════════════════════ */
  const PROVIDER_PROFILES = {
    omniroute: {
      id: "omniroute",
      name: "OmniRoute (Local)",
      icon: "⚡",
      badgeColor: "#a6e3a1",
      url: "http://127.0.0.1:20128/v1/chat/completions",
      modelsUrl: "http://127.0.0.1:20128/v1/models",
      apiKey: "",
      defaultFastModel: "auto/best-fast",
      defaultReasoningModel: "auto/best-reasoning",
      models: ["auto/best-fast", "auto/best-reasoning"],
      keyPlaceholder: "sk-...",
      hint: "Run `omniroute serve` in terminal. Runs on port 20128."
    },
    ollama: {
      id: "ollama",
      name: "Ollama (Free Local)",
      icon: "🦙",
      badgeColor: "#89b4fa",
      url: "http://localhost:11434/v1/chat/completions",
      modelsUrl: "http://localhost:11434/v1/models",
      apiKey: "ollama",
      defaultFastModel: "llama3.1",
      defaultReasoningModel: "llama3.1",
      models: ["llama3.1", "gemma2", "qwen2.5", "mistral", "llama3.2"],
      keyPlaceholder: "Not required (leave empty or 'ollama')",
      hint: "Free offline local AI. Run `ollama run llama3.1` to install."
    },
    nvidia: {
      id: "nvidia",
      name: "NVIDIA NIM (Free Credits)",
      icon: "🟢",
      badgeColor: "#76b900",
      url: "https://integrate.api.nvidia.com/v1/chat/completions",
      modelsUrl: "https://integrate.api.nvidia.com/v1/models",
      apiKey: "",
      defaultFastModel: "meta/llama-3.1-8b-instruct",
      defaultReasoningModel: "meta/llama-3.1-70b-instruct",
      models: [
        "meta/llama-3.1-8b-instruct",
        "meta/llama-3.1-70b-instruct",
        "google/gemma-2-9b-it",
        "google/gemma-2-27b-it",
        "mistralai/mixtral-8x7b-instruct-v0.1"
      ],
      keyPlaceholder: "nvapi-...",
      hint: "Get free API credits at build.nvidia.com (free signup)."
    },
    groq: {
      id: "groq",
      name: "Groq (Ultra-Fast Free Tier)",
      icon: "🚀",
      badgeColor: "#f38ba8",
      url: "https://api.groq.com/openai/v1/chat/completions",
      modelsUrl: "https://api.groq.com/openai/v1/models",
      apiKey: "",
      defaultFastModel: "llama-3.3-70b-versatile",
      defaultReasoningModel: "llama-3.3-70b-versatile",
      models: [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "gemma2-9b-it",
        "mixtral-8x7b-32768"
      ],
      keyPlaceholder: "gsk_...",
      hint: "Free generous rate limits at console.groq.com."
    },
    openrouter: {
      id: "openrouter",
      name: "OpenRouter (Free Models)",
      icon: "🌐",
      badgeColor: "#fab387",
      url: "https://openrouter.ai/api/v1/chat/completions",
      modelsUrl: "https://openrouter.ai/api/v1/models",
      apiKey: "",
      defaultFastModel: "google/gemini-2.0-flash-exp:free",
      defaultReasoningModel: "meta-llama/llama-3.3-70b-instruct:free",
      models: [
        "google/gemini-2.0-flash-exp:free",
        "meta-llama/llama-3.3-70b-instruct:free",
        "meta-llama/llama-3.1-8b-instruct:free",
        "deepseek/deepseek-chat:free"
      ],
      keyPlaceholder: "sk-or-v1-...",
      hint: "Provides completely free models with ':free' suffix at openrouter.ai."
    },
    gemini: {
      id: "gemini",
      name: "Google Gemini (Free Tier)",
      icon: "✨",
      badgeColor: "#89dceb",
      url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      modelsUrl: "https://generativelanguage.googleapis.com/v1beta/openai/models",
      apiKey: "",
      defaultFastModel: "gemini-2.0-flash",
      defaultReasoningModel: "gemini-2.0-flash",
      models: [
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-pro"
      ],
      keyPlaceholder: "AIzaSy...",
      hint: "Get a free API key at aistudio.google.com."
    },
    openai: {
      id: "openai",
      name: "OpenAI",
      icon: "🤖",
      badgeColor: "#cba6f7",
      url: "https://api.openai.com/v1/chat/completions",
      modelsUrl: "https://api.openai.com/v1/models",
      apiKey: "",
      defaultFastModel: "gpt-4o-mini",
      defaultReasoningModel: "gpt-4o",
      models: ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo"],
      keyPlaceholder: "sk-...",
      hint: "Standard OpenAI API key from platform.openai.com."
    },
    custom: {
      id: "custom",
      name: "Custom (OpenAI-compatible)",
      icon: "🛠️",
      badgeColor: "#bac2de",
      url: "",
      modelsUrl: "",
      apiKey: "",
      defaultFastModel: "",
      defaultReasoningModel: "",
      models: [],
      keyPlaceholder: "API Key (if required)",
      hint: "Any OpenAI-compatible /v1/chat/completions endpoint."
    }
  };

  const SETTINGS_STORAGE_KEY = "automigo_ai_settings_v5";
  const STORAGE_DB_KEY = "amigo_quiz_db_v4";
  const MODULE_MEM_KEY = "amigo_module_memory_v1";
  const LOOP_STATE_KEY = "amigo_course_runner_active";
  const LAST_ATTEMPT_KEY = "amigo_last_attempt_state";
  const PREFLIGHT_KEY = "amigo_preflight_passed";
  const ACTIVITY_DONE_KEY = "amigo_activity_done_cache_v1";
  const ALLOWED_MODULES = [1, 2, 3, 4, 5, 6];

  /* ═══════════════════════════════════════════════
     SETTINGS & CONFIGURATION MANAGEMENT
     ═══════════════════════════════════════════════ */
  function getDefaultSettings() {
    return {
      activeProvider: "omniroute",
      providers: {
        omniroute: {
          url: PROVIDER_PROFILES.omniroute.url,
          modelsUrl: PROVIDER_PROFILES.omniroute.modelsUrl,
          apiKey: PROVIDER_PROFILES.omniroute.apiKey,
          fastModel: PROVIDER_PROFILES.omniroute.defaultFastModel,
          reasoningModel: PROVIDER_PROFILES.omniroute.defaultReasoningModel
        },
        ollama: {
          url: PROVIDER_PROFILES.ollama.url,
          modelsUrl: PROVIDER_PROFILES.ollama.modelsUrl,
          apiKey: "ollama",
          fastModel: PROVIDER_PROFILES.ollama.defaultFastModel,
          reasoningModel: PROVIDER_PROFILES.ollama.defaultReasoningModel
        },
        nvidia: {
          url: PROVIDER_PROFILES.nvidia.url,
          modelsUrl: PROVIDER_PROFILES.nvidia.modelsUrl,
          apiKey: "",
          fastModel: PROVIDER_PROFILES.nvidia.defaultFastModel,
          reasoningModel: PROVIDER_PROFILES.nvidia.defaultReasoningModel
        },
        groq: {
          url: PROVIDER_PROFILES.groq.url,
          modelsUrl: PROVIDER_PROFILES.groq.modelsUrl,
          apiKey: "",
          fastModel: PROVIDER_PROFILES.groq.defaultFastModel,
          reasoningModel: PROVIDER_PROFILES.groq.defaultReasoningModel
        },
        openrouter: {
          url: PROVIDER_PROFILES.openrouter.url,
          modelsUrl: PROVIDER_PROFILES.openrouter.modelsUrl,
          apiKey: "",
          fastModel: PROVIDER_PROFILES.openrouter.defaultFastModel,
          reasoningModel: PROVIDER_PROFILES.openrouter.defaultReasoningModel
        },
        gemini: {
          url: PROVIDER_PROFILES.gemini.url,
          modelsUrl: PROVIDER_PROFILES.gemini.modelsUrl,
          apiKey: "",
          fastModel: PROVIDER_PROFILES.gemini.defaultFastModel,
          reasoningModel: PROVIDER_PROFILES.gemini.defaultReasoningModel
        },
        openai: {
          url: PROVIDER_PROFILES.openai.url,
          modelsUrl: PROVIDER_PROFILES.openai.modelsUrl,
          apiKey: "",
          fastModel: PROVIDER_PROFILES.openai.defaultFastModel,
          reasoningModel: PROVIDER_PROFILES.openai.defaultReasoningModel
        },
        custom: {
          url: "",
          modelsUrl: "",
          apiKey: "",
          fastModel: "",
          reasoningModel: ""
        }
      }
    };
  }

  function getSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!raw) return getDefaultSettings();
      const parsed = JSON.parse(raw);
      const defaults = getDefaultSettings();
      // Deep merge with defaults to safeguard new keys
      return {
        activeProvider: parsed.activeProvider || defaults.activeProvider,
        providers: Object.assign({}, defaults.providers, parsed.providers || {})
      };
    } catch(e) {
      return getDefaultSettings();
    }
  }

  function saveSettings(settings) {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ [SETTINGS_STORAGE_KEY]: settings });
      }
    } catch(e) {}
  }

  // Sync settings when modified from extension popup
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes[SETTINGS_STORAGE_KEY]) {
        try {
          const newSettings = changes[SETTINGS_STORAGE_KEY].newValue;
          if (newSettings) {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
            refreshBadge();
            sessionStorage.removeItem(PREFLIGHT_KEY);
            console.log("[Automigo] Synced settings from extension popup!");
          }
        } catch (e) {}
      }
    });
  }

  function getActiveProviderConfig() {
    const s = getSettings();
    const pid = s.activeProvider || "omniroute";
    const profile = PROVIDER_PROFILES[pid] || PROVIDER_PROFILES.omniroute;
    const userCfg = (s.providers && s.providers[pid]) || {};
    return {
      id: pid,
      name: profile.name,
      icon: profile.icon,
      badgeColor: profile.badgeColor,
      url: userCfg.url || profile.url,
      modelsUrl: userCfg.modelsUrl || profile.modelsUrl,
      apiKey: (userCfg.apiKey !== undefined && userCfg.apiKey !== null && userCfg.apiKey !== "") ? userCfg.apiKey : profile.apiKey,
      fastModel: userCfg.fastModel || profile.defaultFastModel,
      reasoningModel: userCfg.reasoningModel || profile.defaultReasoningModel,
      hint: profile.hint
    };
  }

  /* ═══════════════════════════════════════════════
     STORAGE HELPERS
     ═══════════════════════════════════════════════ */
  function getDB() {
    try { return JSON.parse(localStorage.getItem(STORAGE_DB_KEY) || "{}"); } catch(e) { return {}; }
  }
  function saveDB(db) {
    try { localStorage.setItem(STORAGE_DB_KEY, JSON.stringify(db)); } catch(e) {}
  }
  function getModuleMem() {
    try { return JSON.parse(localStorage.getItem(MODULE_MEM_KEY) || "{}"); } catch(e) { return {}; }
  }
  function saveModuleMem(mem) {
    try { localStorage.setItem(MODULE_MEM_KEY, JSON.stringify(mem)); } catch(e) {}
  }
  function getActivityDoneCache() {
    try { return JSON.parse(localStorage.getItem(ACTIVITY_DONE_KEY) || "{}"); } catch(e) { return {}; }
  }
  function saveActivityDoneCache(cache) {
    try { localStorage.setItem(ACTIVITY_DONE_KEY, JSON.stringify(cache)); } catch(e) {}
  }
  function getActivityKey(href) {
    if (!href) return "";
    const m = href.match(/mod\/([a-z]+)\/view\.php\?id=(\d+)/i);
    if (m) return m[1] + "_" + m[2];
    const m2 = href.match(/[?&]id=(\d+)/);
    if (m2) return "act_" + m2[1];
    return href.split("#")[0].split("?")[0];
  }
  function markActivityDone(courseId, activityHref) {
    if (!activityHref) return;
    const cache = getActivityDoneCache();
    if (!cache[courseId]) cache[courseId] = {};
    const key = getActivityKey(activityHref);
    cache[courseId][activityHref] = true;
    if (key) cache[courseId][key] = true;
    saveActivityDoneCache(cache);
    console.log("[Automigo Cache] Activity marked DONE:", key || activityHref);
  }
  function isActivityCachedDone(courseId, activityHref) {
    if (!activityHref) return false;
    const cache = getActivityDoneCache();
    if (!cache[courseId]) return false;
    const key = getActivityKey(activityHref);
    return !!(cache[courseId][activityHref] || (key && cache[courseId][key]));
  }
  function getCourseIdFromUrl() {
    const m = window.location.href.match(/[?&]id=(\d+)/);
    return m ? "course_" + m[1] : "course_unknown";
  }

  /* ═══════════════════════════════════════════════
     TEXT UTILITIES
     ═══════════════════════════════════════════════ */
  function normalizeText(txt) {
    return (txt || "").toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
  }

  function getSimilarityScore(str1, str2) {
    const s1 = normalizeText(str1);
    const s2 = normalizeText(str2);
    if (s1 === s2) return 1.0;
    if (s1.length === 0 || s2.length === 0) return 0;
    if (s1.includes(s2) || s2.includes(s1)) return 0.9;
    const words1 = new Set(s1.split(" ").filter(w => w.length > 2));
    const words2 = new Set(s2.split(" ").filter(w => w.length > 2));
    if (words1.size === 0 || words2.size === 0) return 0;
    let inter = 0;
    words1.forEach(w => { if (words2.has(w)) inter++; });
    return inter / new Set([...words1, ...words2]).size;
  }

  function getCurrentModuleName() {
    const el = document.querySelector(".breadcrumb, .page-header-headings, .page-context-header, nav[aria-label='breadcrumb']");
    if (el) {
      const m = el.innerText.match(/#?Module\s*\d+[^/\n]*/i);
      if (m) return normalizeText(m[0]);
    }
    return "current_module";
  }

  /* ═══════════════════════════════════════════════════════════
     AI SERVICE (Unified OpenAI-Compatible Client)
     Supports OmniRoute, Ollama, NVIDIA, Groq, OpenRouter,
     Gemini, OpenAI, or any Custom endpoint!
     ═══════════════════════════════════════════════════════════ */
  const AIService = {
    async testConnection(providerId) {
      const s = getSettings();
      const pid = providerId || s.activeProvider || "omniroute";
      const profile = PROVIDER_PROFILES[pid] || PROVIDER_PROFILES.omniroute;
      const userCfg = (s.providers && s.providers[pid]) || {};
      const url = userCfg.url || profile.url;
      const apiKey = (userCfg.apiKey !== undefined && userCfg.apiKey !== null && userCfg.apiKey !== "") ? userCfg.apiKey : profile.apiKey;
      const model = userCfg.fastModel || profile.defaultFastModel || "default";

      if (!url) {
        return { ok: false, error: "Endpoint URL is not configured." };
      }

      const headers = { "Content-Type": "application/json" };
      if (apiKey && apiKey !== "ollama") {
        headers["Authorization"] = "Bearer " + apiKey;
      }

      // Add OpenRouter specific attribution headers
      if (pid === "openrouter") {
        headers["HTTP-Referer"] = "https://amigo.amityonline.com";
        headers["X-Title"] = "Automigo AI Solver";
      }

      try {
        const resp = await fetch(url, {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            model: model,
            messages: [{ role: "user", content: "Reply with exactly: OK" }],
            temperature: 0,
            max_tokens: 5
          }),
          signal: AbortSignal.timeout(12000)
        });

        if (!resp.ok) {
          const errText = await resp.text().catch(() => "");
          let msg = "HTTP " + resp.status;
          try {
            const errJson = JSON.parse(errText);
            if (errJson.error && errJson.error.message) msg += ": " + errJson.error.message;
          } catch(e) {
            if (errText) msg += ": " + errText.slice(0, 100);
          }
          return { ok: false, error: msg };
        }

        const data = await resp.json();
        const reply = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
        return { ok: true, model: data.model || model, reply: reply.trim() };
      } catch(err) {
        return { ok: false, error: err.message || "Network / CORS timeout" };
      }
    },

    async chatCompletion(messages, options = {}) {
      const cfg = getActiveProviderConfig();
      if (!cfg.url) {
        throw new Error("AI provider endpoint URL is not configured. Please open settings (⚙️) and set your provider.");
      }

      const model = options.isReasoning ? cfg.reasoningModel : cfg.fastModel;
      const headers = { "Content-Type": "application/json" };
      if (cfg.apiKey && cfg.apiKey !== "ollama") {
        headers["Authorization"] = "Bearer " + cfg.apiKey;
      }
      if (cfg.id === "openrouter") {
        headers["HTTP-Referer"] = "https://amigo.amityonline.com";
        headers["X-Title"] = "Automigo AI Solver";
      }

      const body = {
        model: model,
        messages: messages,
        temperature: options.temperature !== undefined ? options.temperature : 0.05,
        max_tokens: options.max_tokens || 500
      };

      const timeoutMs = options.timeout || (options.isReasoning ? 30000 : 20000);
      const resp = await fetch(cfg.url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs)
      });

      if (!resp.ok) {
        const errText = await resp.text().catch(() => "");
        let msg = "HTTP " + resp.status;
        try {
          const ej = JSON.parse(errText);
          if (ej.error && ej.error.message) msg += ": " + ej.error.message;
        } catch(e) {
          if (errText) msg += " - " + errText.slice(0, 100);
        }
        throw new Error(msg);
      }

      const data = await resp.json();
      return (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
    },

    // Auto-detect local AI services on first load
    async autoDetectLocalProvider() {
      const s = getSettings();
      // If user already customized and chose a working provider, don't override
      if (s.activeProvider && s.activeProvider !== "omniroute") return s.activeProvider;

      // 1. Try OmniRoute (default)
      try {
        const r1 = await fetch("http://127.0.0.1:20128/v1/models", {
          signal: AbortSignal.timeout(1000)
        });
        if (r1.ok) return "omniroute";
      } catch(e) {}

      // 2. Try Ollama local
      try {
        const r2 = await fetch("http://localhost:11434/api/tags", {
          signal: AbortSignal.timeout(1000)
        });
        if (r2.ok) {
          console.log("[Automigo] Auto-detected local Ollama instance!");
          s.activeProvider = "ollama";
          saveSettings(s);
          return "ollama";
        }
      } catch(e) {}

      return s.activeProvider || "omniroute";
    }
  };

  /* ═══════════════════════════════════════════════════════════
     PRE-FLIGHT VALIDATION SYSTEM (MULTI-PROVIDER)
     Validates active AI provider + Amigo LMS URL
     ═══════════════════════════════════════════════════════════ */
  async function runPreflightChecks() {
    const cfg = getActiveProviderConfig();
    log("<span style='color:#89b4fa;font-weight:bold'>⚙️ Running pre-flight checks for " + cfg.icon + " " + cfg.name + "...</span>");

    /* Step 1: Validate active AI provider */
    log("<span style='color:#89b4fa'>1/2 Testing " + cfg.name + " connection...</span>");
    const testResult = await AIService.testConnection(cfg.id);
    if (!testResult.ok) {
      log("<span style='color:#f38ba8;font-weight:bold'>✗ " + cfg.name + " connection failed!</span><br>" +
          "<span style='color:#f9e2af;font-size:11px'>Error: " + testResult.error + "</span><br>" +
          "<span style='color:#a6adc8;font-size:10px'>" + cfg.hint + "</span><br>" +
          "<span style='color:#89b4fa;font-size:11px'>👉 Click the <b>⚙️ Settings</b> icon above to change your provider or API key.</span>");
      updateBadgeStatus(false);
      return false;
    }
    updateBadgeStatus(true);
    log("<span style='color:#a6e3a1'>✓ " + cfg.name + " online (Model: " + (testResult.model || cfg.fastModel) + ")</span>");

    /* Step 2: Validate quiz page is on Amigo */
    log("<span style='color:#89b4fa'>2/2 Checking Amigo page...</span>");
    const url = window.location.href;
    if (!url.includes("amigo.amityonline.com")) {
      log("<span style='color:#f38ba8'>✗ Not on Amigo LMS! Navigate to amigo.amityonline.com first.</span>");
      return false;
    }
    log("<span style='color:#a6e3a1'>✓ On Amigo LMS</span>");

    /* All checks passed */
    log("<span style='color:#a6e3a1;font-weight:bold;font-size:13px'>✓✓ All pre-flight checks passed! Starting runner...</span>");
    sessionStorage.setItem(PREFLIGHT_KEY, "true");
    return true;
  }

  /* ═══════════════════════════════════════════════
     ACCESSIBILITY DIALOG: USER CONFIRMATION POPUP
     ═══════════════════════════════════════════════ */
  function showUserConfirmDialog(title, message, defaultAction, timeoutSec = 15) {
    return new Promise((resolve) => {
      const existing = document.getElementById("amigo-confirm-dialog");
      if (existing) existing.remove();

      const overlay = document.createElement("div");
      overlay.id = "amigo-confirm-dialog";
      overlay.className = "amigo-confirm-overlay";

      let remaining = timeoutSec;
      overlay.innerHTML =
        '<div class="amigo-confirm-modal">' +
          '<div class="amigo-confirm-title">' +
            '<img src="' + (chrome && chrome.runtime ? chrome.runtime.getURL("icons/icon32.png") : "") + '" style="width:24px;height:24px;object-fit:contain" alt="Amigo">' +
            '<span>' + title + '</span>' +
          '</div>' +
          '<div class="amigo-confirm-msg">' + message + '</div>' +
          '<div class="amigo-confirm-timer" id="amigo-confirm-countdown">Auto-' + (defaultAction ? "proceeding" : "skipping") + ' in ' + remaining + 's...</div>' +
          '<div class="amigo-confirm-buttons">' +
            '<button class="amigo-confirm-btn amigo-confirm-yes" id="amigo-dialog-yes">Proceed</button>' +
            '<button class="amigo-confirm-btn amigo-confirm-no" id="amigo-dialog-no">Skip</button>' +
          '</div>' +
        '</div>';

      document.body.appendChild(overlay);

      let timer = null;
      const cleanup = (choice) => {
        if (timer) clearInterval(timer);
        overlay.remove();
        resolve(choice);
      };

      document.getElementById("amigo-dialog-yes").onclick = () => cleanup(true);
      document.getElementById("amigo-dialog-no").onclick = () => cleanup(false);

      timer = setInterval(() => {
        remaining--;
        const cd = document.getElementById("amigo-confirm-countdown");
        if (cd) cd.textContent = "Auto-" + (defaultAction ? "proceeding" : "skipping") + " in " + remaining + "s...";
        if (remaining <= 0) {
          cleanup(defaultAction);
        }
      }, 1000);
    });
  }

  /* ═══════════════════════════════════════════════
     HUD UI (ACCESSIBLE, DRAGGABLE, AUTO-MINIMIZING)
     ═══════════════════════════════════════════════ */
  const hud = document.createElement("div");
  hud.id = "amigo-ai-hud";

  const amigoIconUrl = (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getURL) 
    ? chrome.runtime.getURL("icons/icon32.png") 
    : "https://amigo.amityonline.com/pluginfile.php/1/theme_remui/logomini/1793355966/amigo_logo.png";

  hud.innerHTML =
    '<div class="amigo-hud-header" id="amigo-hud-drag-handle">' +
      '<div class="amigo-hud-title">' +
        '<div class="logo-pulse"><img src="' + amigoIconUrl + '" alt="Amigo"></div>' +
        '<span>Automigo</span>' +
      '</div>' +
      '<div class="amigo-hud-controls">' +
        '<span id="amigo-hud-min-btn" title="Minimize">—</span>' +
      '</div>' +
    '</div>' +
    '<div class="amigo-hud-body" id="amigo-hud-body">' +
      // Proton-style Provider Status Card
      '<div class="amigo-provider-card" id="amigo-provider-badge-bar" title="Change AI in extension popup">' +
        '<div class="amigo-provider-left">' +
          '<div class="status-dot-ring" id="amigo-provider-tag">' +
            '<div class="inner-dot"></div>' +
          '</div>' +
          '<div class="provider-info-text">' +
            '<span class="provider-name-text" id="amigo-active-provider-label">Loading AI...</span>' +
            '<span class="provider-model-text" id="amigo-active-model-label">auto</span>' +
          '</div>' +
        '</div>' +
        '<div class="provider-chip">AI ACTIVE</div>' +
      '</div>' +

      // Proton-style Hero Power Action
      '<div class="amigo-hero-action">' +
        '<button class="amigo-btn-hero" id="amigo-btn-autoloop">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>' +
          '<span>START COURSE RUNNER</span>' +
        '</button>' +
        '<button class="amigo-btn-stop-hero" id="amigo-btn-stop">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>' +
          '<span>STOP RUNNER</span>' +
        '</button>' +
      '</div>' +

      // Secondary Controls
      '<div class="amigo-btn-row">' +
        '<button class="amigo-btn-sub" id="amigo-btn-step-once">⚡ Solve</button>' +
        '<button class="amigo-btn-sub" id="amigo-btn-view-db">💾 Memory</button>' +
        '<button class="amigo-btn-sub" id="amigo-btn-inspect">🔍 Inspect</button>' +
      '</div>' +

      // Status Log Box
      '<div class="amigo-status-box" id="amigo-status-box">' +
        'Ready. Multi-provider AI loaded.</div>' +
    '</div>';

  document.body.appendChild(hud);

  // Restore saved position if any
  try {
    const savedPos = JSON.parse(localStorage.getItem("amigo_hud_pos") || "null");
    if (savedPos && savedPos.top !== undefined && savedPos.left !== undefined) {
      hud.style.top = Math.max(10, Math.min(window.innerHeight - 60, savedPos.top)) + "px";
      hud.style.left = Math.max(10, Math.min(window.innerWidth - 60, savedPos.left)) + "px";
      hud.style.right = "auto";
    }
  } catch(e) {}

  /* ═══════════════════════════════════════════════
     ACCESSIBILITY FEATURE 1: DRAG ANYWHERE ON SCREEN
     ═══════════════════════════════════════════════ */
  let isDragging = false;
  let dragStartX, dragStartY, startHudTop, startHudLeft;

  const dragHandle = document.getElementById("amigo-hud-drag-handle");
  dragHandle.addEventListener("mousedown", (e) => {
    if (e.target.closest(".amigo-hud-controls")) return;
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    const rect = hud.getBoundingClientRect();
    startHudTop = rect.top;
    startHudLeft = rect.left;
    hud.style.right = "auto";
    hud.style.bottom = "auto";
    hud.style.left = startHudLeft + "px";
    hud.style.top = startHudTop + "px";
    hud.style.transition = "none";
    e.preventDefault();
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;
    const newTop = Math.max(8, Math.min(window.innerHeight - 56, startHudTop + deltaY));
    const newLeft = Math.max(8, Math.min(window.innerWidth - (isMin ? 56 : 330), startHudLeft + deltaX));
    hud.style.top = newTop + "px";
    hud.style.left = newLeft + "px";
  });

  window.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      hud.style.transition = "";
      const rect = hud.getBoundingClientRect();
      localStorage.setItem("amigo_hud_pos", JSON.stringify({ top: rect.top, left: rect.left }));
    }
  });

  /* ═══════════════════════════════════════════════
     ACCESSIBILITY FEATURE 2: AUTO-MINIMIZE INACTIVITY TIMER
     ═══════════════════════════════════════════════ */
  let isMin = false;
  let autoMinTimer = null;
  const AUTO_MIN_DELAY_MS = 25000; // Auto-minimizes after 25s of inactivity when not actively solving

  function resetAutoMinTimer() {
    if (autoMinTimer) clearTimeout(autoMinTimer);
    if (!isMin && sessionStorage.getItem(LOOP_STATE_KEY) === "true") {
      autoMinTimer = setTimeout(() => {
        if (!isMin && !isDragging) {
          minimizeHud(true);
        }
      }, AUTO_MIN_DELAY_MS);
    }
  }

  function minimizeHud(min) {
    isMin = min;
    hud.classList.toggle("minimized", isMin);
    document.getElementById("amigo-hud-body").style.display = isMin ? "none" : "flex";
    minBtn.title = isMin ? "Expand" : "Minimize";
    if (isMin) {
      hud.title = "Click to expand Automigo";
    } else {
      hud.removeAttribute("title");
      resetAutoMinTimer();
    }
  }

  const minBtn = document.getElementById("amigo-hud-min-btn");
  minBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    minimizeHud(!isMin);
  });

  // Clicking on minimized circular FAB expands it
  hud.addEventListener("click", (e) => {
    if (isMin) {
      e.stopPropagation();
      minimizeHud(false);
    }
  });

  // Track user activity on page to reset auto-minimize
  ["mousemove", "keydown", "click", "scroll"].forEach(evt => {
    window.addEventListener(evt, resetAutoMinTimer, { passive: true });
  });

  const statusBox = document.getElementById("amigo-status-box");
  const btnAutoLoop = document.getElementById("amigo-btn-autoloop");
  const btnStop = document.getElementById("amigo-btn-stop");

  function log(msg) { statusBox.innerHTML = msg; statusBox.scrollTop = statusBox.scrollHeight; }

  function updateLoopUI(on) {
    btnAutoLoop.style.display = on ? "none" : "block";
    btnStop.style.display = on ? "block" : "none";
  }

  function updateBadgeStatus(online) {
    const tag = document.getElementById("amigo-provider-tag");
    if (!tag) return;
    if (online) {
      tag.classList.remove("offline");
    } else {
      tag.classList.add("offline");
    }
  }

  function refreshBadge() {
    const cfg = getActiveProviderConfig();
    const lbl = document.getElementById("amigo-active-provider-label");
    const mdl = document.getElementById("amigo-active-model-label");
    if (lbl) lbl.innerText = cfg.icon + " " + cfg.name;
    if (mdl) mdl.innerText = cfg.fastModel || "default";
  }

  // Init badge and auto-detect
  refreshBadge();
  AIService.autoDetectLocalProvider().then(pid => {
    refreshBadge();
  });

  /* START button: runs pre-flight first, then starts */
  btnAutoLoop.addEventListener("click", async () => {
    btnAutoLoop.disabled = true;
    btnAutoLoop.style.opacity = "0.5";

    const ok = await runPreflightChecks();
    if (!ok) {
      btnAutoLoop.disabled = false;
      btnAutoLoop.style.opacity = "1";
      return;
    }

    sessionStorage.setItem(LOOP_STATE_KEY, "true");
    updateLoopUI(true);
    btnAutoLoop.disabled = false;
    btnAutoLoop.style.opacity = "1";
    log("<span style='color:#a6e3a1;font-weight:bold'>🚀 Course Runner Active!</span>");
    runPageRouter();
  });

  btnStop.addEventListener("click", () => {
    sessionStorage.removeItem(LOOP_STATE_KEY);
    sessionStorage.removeItem(PREFLIGHT_KEY);
    updateLoopUI(false);
    log("<span style='color:#f38ba8;font-weight:bold'>⏹️ Stopped.</span>");
  });

  document.getElementById("amigo-btn-step-once").addEventListener("click", async () => {
    /* Quick preflight for single-step too */
    if (sessionStorage.getItem(PREFLIGHT_KEY) !== "true") {
      const ok = await runPreflightChecks();
      if (!ok) return;
    }
    runPageRouter();
  });

  document.getElementById("amigo-btn-view-db").addEventListener("click", () => {
    const mem = getModuleMem();
    const mods = Object.keys(mem);
    let total = 0;
    mods.forEach(m => { total += Object.keys(mem[m]).length; });
    const db = getDB();
    const quizzes = Object.keys(db);
    let totalAttempts = 0;
    quizzes.forEach(q => { totalAttempts += (db[q].attempts || []).length; });
    const cfg = getActiveProviderConfig();
    log("<div style='background:#181825;padding:6px;border-radius:4px;margin-top:4px'>" +
        "<b>🧠 Automigo Memory & AI Status:</b><br>" +
        "• Active Provider: <b>" + cfg.icon + " " + cfg.name + "</b><br>" +
        "• Model: <b>" + cfg.fastModel + "</b><br>" +
        "• Modules tracked: <b>" + mods.length + "</b><br>" +
        "• Verified answers: <b>" + total + "</b><br>" +
        "• Quiz histories: <b>" + quizzes.length + "</b><br>" +
        "• Total attempts: <b>" + totalAttempts + "</b><br>" +
        "• Active module: " + getCurrentModuleName() + "</div>");
  });

  /* INSPECT button: dumps full DOM structure to console + HUD */
  document.getElementById("amigo-btn-inspect").addEventListener("click", () => {
    inspectPageStructure();
  });

  updateLoopUI(sessionStorage.getItem(LOOP_STATE_KEY) === "true");

  /* Auto-resume on page reload (preflight already passed for this session) */
  setTimeout(() => {
    if (sessionStorage.getItem(LOOP_STATE_KEY) === "true") {
      enableBackgroundKeepAlive();
      runPageRouter();
    }
  }, 900);

  /* ───── SILENT BACKGROUND KEEP-ALIVE (ZERO DISTURBANCE FOR VLC) ───── */
  let bgKeepAliveCtx = null;
  function enableBackgroundKeepAlive() {
    try {
      if (bgKeepAliveCtx && bgKeepAliveCtx.state === "running") return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      bgKeepAliveCtx = new AudioCtx();
      const osc = bgKeepAliveCtx.createOscillator();
      const gain = bgKeepAliveCtx.createGain();
      gain.gain.value = 0.000001; // Inaudible (zero sound, exempts tab from freezing)
      osc.connect(gain);
      gain.connect(bgKeepAliveCtx.destination);
      osc.start();
      console.log("[Automigo] Silent background keep-alive active (zero VLC disturbance)");
    } catch(e) {}
  }

  /* ═══════════════════════════════════════════════
     PAGE STRUCTURE INSPECTOR (DOM DUMP)
     ═══════════════════════════════════════════════ */
  function inspectPageStructure() {
    const url = window.location.href;
    const title = document.title;
    const R = []; // console report lines
    const H = []; // HUD report lines

    R.push("========== AUTOMIGO PAGE INSPECTION ==========");
    R.push("URL: " + url);
    R.push("Title: " + title);
    H.push("<b>🔍 PAGE INSPECTION</b>");
    H.push("<b>URL:</b> " + url.substring(0, 80));

    /* --- BREADCRUMB --- */
    const bcEl = document.querySelector(".breadcrumb, nav[aria-label='breadcrumb']");
    const bcText = bcEl ? bcEl.innerText.trim().replace(/\n+/g, " > ") : "(none)";
    R.push("\n--- BREADCRUMB ---");
    R.push("Text: " + bcText);
    H.push("<b>Breadcrumb:</b> " + bcText.substring(0, 80));
    if (bcEl) {
      bcEl.querySelectorAll("a").forEach((a, i) => {
        R.push("  Link " + i + ": '" + a.innerText.trim() + "' href=" + (a.href || "").substring(0, 80));
      });
    }

    /* --- PAGE HEADING --- */
    const heading = document.querySelector(".page-header-headings h1, .page-header-headings, h1, h2");
    if (heading) {
      R.push("\nHeading: " + heading.innerText.trim().substring(0, 80));
      H.push("<b>Heading:</b> " + heading.innerText.trim().substring(0, 60));
    }

    /* --- ALL .card ELEMENTS --- */
    const cards = document.querySelectorAll(".card");
    R.push("\n--- .card ELEMENTS: " + cards.length + " total ---");
    let moduleCardCount = 0;
    cards.forEach((c, i) => {
      const txt = (c.innerText || "").trim();
      if (txt.length < 10 || txt.length > 600) return;
      const classes = c.className || "";
      const hasLink = c.querySelector("a[href]");
      const linkHref = hasLink ? hasLink.href.substring(0, 80) : "none";
      const linkText = hasLink ? hasLink.innerText.trim().substring(0, 50) : "";
      R.push("  Card " + i + " [" + c.tagName + " class='" + classes.substring(0, 60) + "']");
      R.push("    TEXT: " + txt.replace(/\n+/g, " | ").substring(0, 200));
      R.push("    LINK: '" + linkText + "' -> " + linkHref);
      if (/module\s*\d/i.test(txt)) moduleCardCount++;
    });
    H.push("<b>Cards:</b> " + cards.length + " (" + moduleCardCount + " with module text)");

    /* --- SECTION CONTAINERS --- */
    R.push("\n--- SECTION CONTAINERS ---");
    const secSelectors = {
      "li[id^='section-']": 0,
      ".course-section": 0,
      ".section.main": 0,
      "[data-sectionid]": 0
    };
    for (const sel in secSelectors) {
      const els = document.querySelectorAll(sel);
      secSelectors[sel] = els.length;
      if (els.length > 0) {
        R.push("  " + sel + ": " + els.length);
        els.forEach((el, i) => {
          if (i < 8) {
            const id = el.id || el.getAttribute("data-sectionid") || "";
            const txt = (el.innerText || "").replace(/\n+/g, " | ").substring(0, 150);
            R.push("    [" + i + "] id='" + id + "' text: " + txt);
          }
        });
      }
    }

    /* --- LINKS CONTAINING 'module' --- */
    R.push("\n--- LINKS WITH 'MODULE' ---");
    let modLinkCount = 0;
    document.querySelectorAll("a").forEach(a => {
      const txt = (a.innerText || "").trim();
      if (/module/i.test(txt) && txt.length < 200) {
        R.push("  '" + txt.substring(0, 80) + "' href=" + (a.href || "").substring(0, 80));
        const parent = a.parentElement;
        if (parent) {
          R.push("    parent: " + parent.tagName + "." + (parent.className || "").substring(0, 40));
          R.push("    parentText: " + (parent.innerText || "").replace(/\n+/g, " | ").substring(0, 120));
        }
        modLinkCount++;
      }
    });
    H.push("<b>Module links:</b> " + modLinkCount);

    /* --- COMPLETION % TEXT --- */
    R.push("\n--- COMPLETION % ---");
    const bodyText = document.body.innerText;
    const pctMatches = bodyText.match(/\d+%\s*complet[e]?/gi);
    R.push("  Found: " + (pctMatches ? pctMatches.join(", ") : "none"));
    H.push("<b>Completion %:</b> " + (pctMatches ? pctMatches.join(", ") : "none"));

    /* --- LOCKED INDICATORS --- */
    R.push("\n--- LOCKED/UNAVAILABLE ---");
    const lockedTexts = bodyText.match(/Not available[^\n]{0,60}/gi);
    R.push("  Found: " + (lockedTexts ? lockedTexts.length + " -> " + lockedTexts.join(" | ") : "none"));
    H.push("<b>Locked:</b> " + (lockedTexts ? lockedTexts.length : 0));

    /* --- ACTIVITY LINKS --- */
    const actLinks = document.querySelectorAll("a[href*='/mod/']");
    R.push("\n--- ACTIVITY LINKS: " + actLinks.length + " ---");
    actLinks.forEach((a, i) => {
      const card = a.closest(".activity, .activity-item, li, .card") || a.parentElement;
      const cardText = card ? card.innerText.replace(/\n+/g, " | ").trim() : "";
      const isDone = /done/i.test(cardText) && !/to do/i.test(cardText);
      const isTodo = /to do/i.test(cardText);
      R.push("  [" + i + "] " + (isDone ? "DONE" : isTodo ? "TODO" : "???") +
        " '" + (a.innerText || "").trim().substring(0, 50) + "' -> " + (a.href || "").substring(0, 60));
      if (i < 5) R.push("    cardText: " + cardText.substring(0, 100));
    });
    H.push("<b>Activities:</b> " + actLinks.length);

    /* --- BUTTONS --- */
    R.push("\n--- BUTTONS ---");
    document.querySelectorAll("button, input[type='submit'], input[type='button'], a.btn").forEach(b => {
      const txt = (b.value || b.innerText || "").trim();
      if (txt && txt.length < 60 && txt !== "_") {
        R.push("  BTN: '" + txt + "' [" + b.tagName + " type=" + (b.type || "") + "]");
      }
    });

    /* --- MODULE TEXT BLOCKS FROM BODY --- */
    R.push("\n--- MODULE TEXT BLOCKS (body scan) ---");
    const modRegex = /#?\s*module\s*(\d+)\s*:?\s*([^\n]*)/gi;
    let match;
    while ((match = modRegex.exec(bodyText)) !== null) {
      const blockEnd = Math.min(match.index + 200, bodyText.length);
      const block = bodyText.substring(match.index, blockEnd).replace(/\n+/g, " | ");
      R.push("  M" + match[1] + ": " + block.substring(0, 180));
    }

    R.push("\n========== END INSPECTION ==========");

    /* Output */
    const fullReport = R.join("\n");
    console.log(fullReport);
    try { navigator.clipboard.writeText(fullReport); } catch(e) {}

    const htmlReport = "<div style='background:#181825;padding:8px;border-radius:4px;font-size:10px;max-height:180px;overflow:auto;line-height:1.4'>" +
      H.join("<br>") +
      "<br><br><span style='color:#a6e3a1'>✅ Full report logged to console (F12) + copied to clipboard!</span>" +
      "</div>";
    log(htmlReport);
  }

  /* ═══════════════════════════════════════════════
     MASTER PAGE ROUTER
     ═══════════════════════════════════════════════ */
  function isModuleBeyondAllowed() {
    const el = document.querySelector(".breadcrumb, .page-header-headings, .page-context-header, nav[aria-label='breadcrumb']");
    const navText = (el ? el.innerText : "").toLowerCase();
    const titleText = document.title.toLowerCase();
    const urlText = window.location.href.toLowerCase();
    /* Check breadcrumb/title/URL for module number (Modules 1-6 allowed) */
    const combined = navText + " " + titleText + " " + urlText;
    const m = combined.match(/#?module\s*(\d+)/i);
    if (m) {
      const modNum = parseInt(m[1], 10);
      return modNum > 6;
    }
    /* Legacy fallback: explicit section 7+ check */
    return /section\s*([7-9]|\d{2,})\b/.test(combined);
  }

  function getModuleNumberFromPage() {
    const el = document.querySelector(".breadcrumb, .page-header-headings, .page-context-header, nav[aria-label='breadcrumb']");
    const fullText = (el ? el.innerText : "") + " " + document.title;
    const m = fullText.match(/#?module\s*(\d+)/i);
    if (m) return parseInt(m[1], 10);
    return null;
  }

  function navigateToModule(modNum) {
    const targetText = "module " + modNum;
    const links = document.querySelectorAll("a, button, [role='tab'], .nav-link");
    for (const link of links) {
      const t = (link.innerText || link.getAttribute("title") || "").toLowerCase().trim();
      if (t.includes(targetText) || t.includes("#module " + modNum)) {
        log("<span style='color:#89b4fa;font-weight:bold'>Navigating to Module " + modNum + "...</span>");
        link.click();
        return true;
      }
    }
    return false;
  }

  function runPageRouter() {
    const url = window.location.href;

    // ══ RULE 1: STRICTLY SKIP MODULE 6+ (NEVER TOUCH MODULES BEYOND 6) ══
    if (isModuleBeyondAllowed()) {
      const detectedMod = getModuleNumberFromPage();
      log("<span style='color:#f38ba8;font-weight:bold;font-size:13px'>⚠️ Module " + (detectedMod || "6+") + " detected — SKIPPING (Only Modules 1-6 allowed)! Returning to Dashboard...</span>");
      setTimeout(() => {
        window.location.href = "https://amigo.amityonline.com/my/";
      }, 1500);
      return;
    }

    // ══ 1. DASHBOARD PAGE (/my/) ══
    if (url.includes("/my/") || url.endsWith("/my")) {
      handleDashboardPage();

    // ══ 2. COURSE OR MODULE OVERVIEW PAGE ══
    } else if (url.includes("/course/view.php")) {
      handleCourseOrModulePage();

    // ══ 3. FEEDBACK ANSWERING PAGE ══
    } else if (url.includes("/mod/feedback/complete.php")) {
      log("<span style='color:#89b4fa'>📝 Filling Feedback '8'...</span>");
      handleFeedbackAnsweringPage();

    // ══ 4. FEEDBACK VIEW / POST-SUBMISSION PAGE ══
    } else if (url.includes("/mod/feedback/")) {
      log("<span style='color:#fab387'>📋 Processing Feedback...</span>");
      handleFeedbackViewPage();

    // ══ 5. REVIEW PAGE ══
    } else if (url.includes("review.php")) {
      log("<span style='color:#cba6f7'>🔍 Parsing review page...</span>");
      handleReviewPage();

    // ══ 6. QUIZ / ASSESSMENT ATTEMPT PAGE ══
    } else if (url.includes("attempt.php")) {
      const isA = checkIsAssessment();
      log("<span style='color:#89b4fa'>📋 Solving " +
          (isA ? "🔥 Module Assessment (1 Attempt Target 30/30)" : "Quiz") + "...</span>");
      solveAttemptPage(true, isA);

    // ══ 7. SUMMARY SUBMIT PAGE ══
    } else if (url.includes("summary.php")) {
      log("<span style='color:#fab387'>📑 Submitting summary...</span>");
      submitSummaryPage();

    // ══ 8. QUIZ / ASSESSMENT VIEW PAGE ══
    } else if (url.includes("/mod/quiz/view.php") ||
               (url.includes("/mod/quiz/") && !url.includes("attempt.php") && !url.includes("review.php"))) {
      const openModalBtn = findStartAttemptModalButton();
      if (openModalBtn) {
        log("<span style='color:#a6e3a1;font-weight:bold'>✅ Auto-confirming open attempt modal...</span>");
        setTimeout(() => openModalBtn.click(), 800);
      } else {
        handleQuizViewPage();
      }

    // ══ 9. E-CONTENT PAGES (Lessons, Resources, URLs, Pages) ══
    } else if (url.includes("/mod/page/view.php") || url.includes("/mod/lesson/") ||
               url.includes("/mod/resource/") || url.includes("/mod/url/")) {
      log("<span style='color:#cdd6f4'>📖 E-Content. Advancing in 2s...</span>");
      setTimeout(() => clickNextActivityOrSection(), 2000);

    // ══ 10. UNKNOWN / CHANGED UI FALLBACK (AI Self-Healing) ══
    } else {
      log("<span style='color:#fab387'>Unknown page state. Inspecting page...</span>");
      setTimeout(() => inspectUnknownPageWithAi(), 2500);
    }
  }

  function checkIsAssessment() {
    const quizId = getQuizIdentifier();
    if (quizId && sessionStorage.getItem("amigo_is_assessment_" + quizId)) {
      return true;
    }

    const allHeadings = Array.from(document.querySelectorAll(
      ".page-header-headings, h1, h2, h3, h4, .breadcrumb, [role='main'] h2, .activityname, .page-header"
    )).map(el => el.innerText).join(" ");

    const combined = (document.title + " " + allHeadings + " " + window.location.href).toLowerCase();

    return combined.includes("assessment") ||
           combined.includes("module assessment") ||
           /\b\d+(?:st|nd|rd|th)\s+module\s+assessment\b/i.test(combined) ||
           combined.includes("30 marks") ||
           combined.includes("/ 30.00") ||
           combined.includes("out of 30");
  }

  /* ═══════════════════════════════════════════════════════════════
     DASHBOARD (/my/) AUTONOMOUS COURSE PICKER
     Scans all available courses, selects uncompleted (<100%),
     and launches course runner.
     ═══════════════════════════════════════════════════════════════ */
  function handleDashboardPage() {
    log("<span style='color:#89b4fa;font-weight:bold'>📊 Amigo Dashboard detected. Scanning courses...</span>");

    setTimeout(() => {
      // Find all dashboard cards
      const cards = Array.from(document.querySelectorAll(".card.dashboard-card, .card, .dashboard-card, .course-info-container"));
      console.log("[Automigo Dashboard] Total cards found:", cards.length);

      const uncompletedCourses = [];

      for (const card of cards) {
        const text = (card.innerText || "").trim();
        const textLower = text.toLowerCase();

        // STRICTLY IGNORE non-academic cards
        if (textLower.includes("business plan") || textLower.includes("weekly pulse") ||
            textLower.includes("free certificate") || textLower.includes("trailblazer")) {
          continue;
        }

        // Must be an academic course card with completion info
        const pctMatch = text.match(/(\d+)%\s*course\s*completed/i) || text.match(/course\s*progress:\s*\|?\s*(\d+)%/i);
        if (!pctMatch) continue;

        const percent = parseInt(pctMatch[1], 10);

        // Find the course link
        const courseLink = card.querySelector("a[href*='/course/view.php?id=']");
        const href = courseLink ? courseLink.href : null;

        const titleEl = card.querySelector("h3, h4, h5, .coursename, [role='heading']");
        const titleMatch = text.match(/course name\s*\|\s*([^|\n]+)/i);
        const title = (titleMatch ? titleMatch[1] : (titleEl ? titleEl.innerText : text.slice(0, 45))).trim();

        if (percent < 100 && href) {
          uncompletedCourses.push({ title, percent, href, link: courseLink });
        }
      }

      console.log("[Automigo Dashboard] Uncompleted courses found:", uncompletedCourses.length);

      if (uncompletedCourses.length > 0) {
        const target = uncompletedCourses[0];
        log("<span style='color:#a6e3a1;font-weight:bold;font-size:13px'>" +
            "🎯 Selected Course: '" + target.title + "' (" + target.percent + "% done) → Opening...</span>");

        setTimeout(() => {
          window.location.href = target.href;
        }, 1500);
        return;
      }

      // Fallback: check academic course links
      const courseLinks = Array.from(document.querySelectorAll("a[href*='/course/view.php?id=']")).filter(a => {
        const t = (a.innerText || "").toLowerCase();
        return !t.includes("business") && !t.includes("weekly") && !t.includes("certificate");
      });
      if (courseLinks.length > 0) {
        const cl = courseLinks[0];
        log("<span style='color:#a6e3a1'>Opening course: " + cl.innerText.trim() + "...</span>");
        setTimeout(() => { window.location.href = cl.href; }, 1500);
        return;
      }

      log("<span style='color:#a6e3a1;font-weight:bold'>🎉 All courses on dashboard appear 100% completed!</span>");
    }, 1800);
  }

  /* ═══════════════════════════════════════════════════════════════
     COURSE & MODULE OVERVIEW PAGE HANDLER
     ═══════════════════════════════════════════════════════════════ */
  function handleCourseOrModulePage() {
    log("<span style='color:#89b4fa'>🏫 Checking Course / Module page...</span>");

    // ══ RULE: NEVER TOUCH MODULES BEYOND 6 ══
    if (isModuleBeyondAllowed()) {
      const detectedMod = getModuleNumberFromPage();
      log("<span style='color:#f38ba8;font-weight:bold'>⚠️ Module " + (detectedMod || "6+") + " detected — SKIPPING! Returning to Dashboard...</span>");
      setTimeout(() => {
        window.location.href = "https://amigo.amityonline.com/my/";
      }, 1500);
      return;
    }

    const curModNum = getModuleNumberFromPage();

    if (curModNum !== null && !ALLOWED_MODULES.includes(curModNum)) {
      log("<span style='color:#f38ba8;font-weight:bold'>⚠️ Module " + curModNum + " is outside allowed range (1-6). Returning to Dashboard...</span>");
      setTimeout(() => {
        window.location.href = "https://amigo.amityonline.com/my/";
      }, 1500);
      return;
    }

    setTimeout(() => {
      const isCourseOverview = detectCourseOverviewPage();

      if (isCourseOverview) {
        handleCourseOverviewModulePicker();
      } else {
        handleInsideModuleActivities(curModNum);
      }
    }, 1200);
  }

  function detectCourseOverviewPage() {
    const url = window.location.href;

    const secMatch = url.match(/[?&]section=(\d+)/);
    if (secMatch && parseInt(secMatch[1], 10) > 0) {
      console.log("[Automigo] Inside module (section=" + secMatch[1] + ") → NOT overview");
      return false;
    }

    const curMod = getModuleNumberFromPage();
    if (curMod !== null) {
      console.log("[Automigo] Inside Module " + curMod + " (from breadcrumb) → NOT overview");
      return false;
    }

    if (url.includes("/course/view.php")) {
      console.log("[Automigo] Course overview page detected (no section in URL)");
      return true;
    }

    return false;
  }

  /* ═══════════════════════════════════════════════════════════════
     MODE A: COURSE OVERVIEW — Smart Module Picker
     ═══════════════════════════════════════════════════════════════ */
  function handleCourseOverviewModulePicker() {
    log("<span style='color:#89b4fa;font-weight:bold'>📊 Course Overview detected. Scanning Module 1-6 sections...</span>");

    const moduleData = [];
    const sectionContainers = Array.from(document.querySelectorAll(
      "[data-sectionid], li[id^='section-'], .section.main, .course-section"
    ));

    console.log("[Automigo] Found " + sectionContainers.length + " raw section containers");

    const seenMods = new Set();

    for (const container of sectionContainers) {
      const text = (container.innerText || "").trim();
      const textLower = text.toLowerCase();

      const modMatch = text.match(/#?\s*module\s*(\d+)/i);
      if (!modMatch) continue;

      const modNum = parseInt(modMatch[1], 10);

      if (!ALLOWED_MODULES.includes(modNum)) {
        console.log("[Automigo] Skipping out-of-range Module " + modNum);
        continue;
      }

      if (textLower.includes("live class") || textLower.includes("study material") ||
          textLower.includes("old recording")) {
        continue;
      }
      if (textLower.includes("course assignment") && modNum !== 6 && !textLower.includes("module 6")) {
        continue;
      }

      if (seenMods.has(modNum)) continue;

      const pctMatch = text.match(/(\d+)%\s*complet/i);
      const percent = pctMatch ? parseInt(pctMatch[1], 10) : -1;

      const isLocked = textLower.includes("not available") ||
                       textLower.includes("restricted") ||
                       textLower.includes("locked") ||
                       !!container.querySelector(".dimmed_text, .isrestricted, .availabilityinfo");

      let clickTarget = container.querySelector("a[href*='section=']");
      if (!clickTarget) clickTarget = container.querySelector("a[href*='/course/view.php']");
      if (!clickTarget) {
        const allLinks = Array.from(document.querySelectorAll("a[href*='section=']"));
        for (const a of allLinks) {
          const at = (a.innerText || "").toLowerCase();
          if (at.includes("module " + modNum) || at.includes("#module " + modNum)) {
            clickTarget = a;
            break;
          }
        }
      }

      const href = clickTarget ? clickTarget.href : "";

      seenMods.add(modNum);
      moduleData.push({
        modNum, percent, isLocked, isDone: percent >= 100,
        text: text.slice(0, 80), clickTarget, href
      });
    }

    if (moduleData.length < 5) {
      const headerLinks = Array.from(document.querySelectorAll(".section-header a, a[href*='section=']"));
      for (const a of headerLinks) {
        const aText = (a.innerText || "").trim();
        const m = aText.match(/#?\s*module\s*(\d+)/i);
        if (m) {
          const modNum = parseInt(m[1], 10);
          if (ALLOWED_MODULES.includes(modNum) && !seenMods.has(modNum)) {
            seenMods.add(modNum);
            const card = a.closest("li[id^='section-'], .card, [data-sectionid]") || a.parentElement;
            const cText = card ? card.innerText : aText;
            const pctMatch = cText.match(/(\d+)%\s*complet/i);
            const percent = pctMatch ? parseInt(pctMatch[1], 10) : -1;
            const isLocked = cText.toLowerCase().includes("not available") || cText.toLowerCase().includes("restricted");
            moduleData.push({
              modNum, percent, isLocked, isDone: percent >= 100,
              text: aText, clickTarget: a, href: a.href
            });
          }
        }
      }
    }

    const uniqueModules = moduleData.sort((a, b) => a.modNum - b.modNum);

    console.log("[Automigo] Module scan results:", uniqueModules.map(m =>
      "M" + m.modNum + "(" + m.percent + "%" +
      (m.isLocked ? " LOCKED" : "") + (m.isDone ? " DONE" : "") + ")"
    ).join(", "));

    let statusHtml = "<div style='background:#181825;padding:6px;border-radius:4px'><b>📊 Module Status:</b><br>";
    for (let n = 1; n <= 6; n++) {
      const mod = uniqueModules.find(m => m.modNum === n);
      if (!mod) {
        statusHtml += "• Module " + n + ": <span style='color:#6c7086'>Not found</span><br>";
      } else if (mod.isDone) {
        statusHtml += "• Module " + n + ": <span style='color:#a6e3a1'>✅ " + mod.percent + "% Complete</span><br>";
      } else if (mod.isLocked) {
        statusHtml += "• Module " + n + ": <span style='color:#6c7086'>🔒 Locked" + (mod.percent >= 0 ? " (" + mod.percent + "%)" : "") + "</span><br>";
      } else {
        statusHtml += "• Module " + n + ": <span style='color:#fab387'>🔄 " + (mod.percent >= 0 ? mod.percent + "%" : "?") + " (In Progress)</span><br>";
      }
    }
    statusHtml += "</div>";

    const allDone = uniqueModules.length > 0 && ALLOWED_MODULES.every(n => {
      const mod = uniqueModules.find(m => m.modNum === n);
      return mod && mod.isDone;
    });

    if (allDone) {
      log(statusHtml + "<span style='color:#a6e3a1;font-weight:bold;font-size:14px'>🎉 All Modules 1-6 are 100% COMPLETE! Returning to Dashboard...</span>");
      setTimeout(() => { window.location.href = "https://amigo.amityonline.com/my/"; }, 2000);
      return;
    }

    const targetModule = uniqueModules.find(m => !m.isDone && !m.isLocked);

    if (targetModule) {
      // If target is Module 6, confirm with user first (Rule 1)
      if (targetModule.modNum === 6 && !sessionStorage.getItem("amigo_approved_module_6")) {
        log("<span style='color:#fab387;font-weight:bold'>⏳ Module 6 reached! Asking user confirmation...</span>");
        showUserConfirmDialog(
          "Proceed to Module 6?",
          "Modules 1–5 are completed. Do you want Automigo to proceed with Module 6 (Final Module & Assessment)?",
          true, // default to proceed after timer
          15
        ).then(proceed => {
          if (proceed) {
            sessionStorage.setItem("amigo_approved_module_6", "true");
            log("<span style='color:#a6e3a1;font-weight:bold'>Opening Module 6...</span>");
            if (targetModule.href) window.location.href = targetModule.href;
            else if (targetModule.clickTarget) targetModule.clickTarget.click();
            else navigateToModule(6);
          } else {
            log("<span style='color:#f38ba8;font-weight:bold'>User skipped Module 6. Returning to Dashboard...</span>");
            setTimeout(() => { window.location.href = "https://amigo.amityonline.com/my/"; }, 1500);
          }
        });
        return;
      }

      log(statusHtml + "<span style='color:#a6e3a1;font-weight:bold;font-size:13px'>🎯 Opening Module " +
          targetModule.modNum + " (" + (targetModule.percent >= 0 ? targetModule.percent + "%" : "?") + " done)...</span>");

      setTimeout(() => {
        if (targetModule.href) {
          window.location.href = targetModule.href;
        } else if (targetModule.clickTarget) {
          targetModule.clickTarget.click();
        } else {
          navigateToModule(targetModule.modNum);
        }
      }, 1500);
      return;
    }

    const remainingLocked = uniqueModules.filter(m => !m.isDone).every(m => m.isLocked);
    if (remainingLocked && uniqueModules.length > 0) {
      log(statusHtml + "<span style='color:#fab387;font-weight:bold'>🔒 All remaining modules are locked. Returning to Dashboard...</span>");
      setTimeout(() => { window.location.href = "https://amigo.amityonline.com/my/"; }, 2000);
      return;
    }

    log(statusHtml + "<span style='color:#fab387'>Trying Module 1 directly...</span>");
    if (!navigateToModule(1)) navigateToModule(2);
  }

  function handleInsideModuleActivities(curModNum) {
    const courseId = getCourseIdFromUrl();
    const url = window.location.href;
    const secMatch = url.match(/[?&]section=(\d+)/);
    const secNum = secMatch ? secMatch[1] : null;

    let sectionContainer = null;
    if (secNum) {
      sectionContainer = document.querySelector("li#section-" + secNum + ".section.main") ||
                         document.querySelector("li#section-" + secNum) ||
                         document.querySelector("[data-sectionid='" + secNum + "']");
    }
    if (!sectionContainer) {
      sectionContainer = document.querySelector(".section.main, [data-sectionid].section.main, li.section.main") ||
                         document.querySelector("#region-main .course-content") ||
                         document.querySelector("#region-main");
    }

    if (!sectionContainer) {
      console.warn("[Automigo Module] Could not isolate section container, falling back to main");
      sectionContainer = document.querySelector(".course-content") || document.body;
    }

    const rawLinks = Array.from(sectionContainer.querySelectorAll(
      ".activity-item a[href*='/mod/'], .activity a[href*='/mod/'], li.activity a[href*='/mod/'], a.aal_link[href*='/mod/'], a.activityname[href*='/mod/'], a[href*='/mod/']"
    ));

    const seenHrefs = new Set();
    const validActivities = [];

    for (const a of rawLinks) {
      if (a.closest(".drawer, #courseindex, .courseindex, .block_course_contents, [data-region='drawer']")) continue;

      const href = (a.href || "").split("#")[0];
      if (!href || seenHrefs.has(href)) continue;

      if (!href.includes("/mod/page/") && !href.includes("/mod/quiz/") && !href.includes("/mod/feedback/") && !href.includes("/mod/lesson/")) {
        continue;
      }

      const text = (a.innerText || a.getAttribute("aria-label") || "").trim().toLowerCase();
      const card = a.closest(".activity, .activity-item, li, .card") || a.parentElement;
      const cardText = card ? card.innerText.toLowerCase() : text;

      if (text.includes("live class") || cardText.includes("live class") ||
          text.includes("study material") || cardText.includes("study material") ||
          text.includes("virtual lab") || cardText.includes("virtual lab") ||
          text.includes("announcement") || cardText.includes("announcement") ||
          text.includes("old recording") || cardText.includes("old recording") ||
          text.includes("walkthrough") || cardText.includes("walkthrough") ||
          text.includes("mettl") || cardText.includes("troubleshooting") ||
          text.includes("re - assignment") || cardText.includes("re - assignment") ||
          text.includes("student feedback for course") || cardText.includes("student feedback for course") ||
          text.includes("student feedback for faculty") || cardText.includes("student feedback for faculty")) {
        continue;
      }

      seenHrefs.add(href);
      validActivities.push({
        link: a, href, card, cardText,
        title: (a.innerText || a.getAttribute("aria-label") || "Activity").trim()
      });
    }

    console.log("[Automigo Module] Valid activities found in current module:", validActivities.length);

    let uncompletedAct = null;
    let doneCount = 0;
    let skippedCached = 0;

    for (const act of validActivities) {
      const href = act.href;
      const actKey = getActivityKey(href);

      const hasDoneButton = act.card && !!act.card.querySelector("button.btn-success, [data-toggled='1'], .badge-success");
      const hasDoneText = (act.cardText.includes("done") && !act.cardText.includes("to do")) ||
                          act.cardText.includes("done: view") ||
                          act.cardText.includes("done: receive a grade") ||
                          act.cardText.includes("done: submit feedback");

      const isDomDone = hasDoneButton || hasDoneText;
      const isCachedDone = isActivityCachedDone(courseId, actKey) || isActivityCachedDone(courseId, href);

      if (isDomDone || isCachedDone) {
        doneCount++;
        markActivityDone(courseId, actKey);
        markActivityDone(courseId, href);
        if (isCachedDone && !isDomDone) skippedCached++;
        continue;
      }

      if (!uncompletedAct) {
        uncompletedAct = act;
      }
    }

    if (skippedCached > 0) {
      console.log("[Automigo Module] Recognized " + skippedCached + " cached-done activities from memory");
    }

    if (uncompletedAct) {
      const isAssess = uncompletedAct.title.toLowerCase().includes("assessment") ||
                       uncompletedAct.cardText.includes("assessment");
      if (isAssess) {
        const qId = uncompletedAct.href.match(/[?&]id=(\d+)/);
        if (qId) sessionStorage.setItem("amigo_is_assessment_" + qId[1], "true");
      }

      log("<span style='color:#fab387;font-weight:bold'>🚀 Next uncompleted item: '" + uncompletedAct.title +
          "' (" + doneCount + "/" + validActivities.length + " done) → Opening...</span>");
      setTimeout(() => {
        if (uncompletedAct.href) {
          window.location.href = uncompletedAct.href;
        } else {
          uncompletedAct.link.click();
        }
      }, 1200);
      return;
    }

    // ══ ALL ITEMS IN THIS MODULE ARE DONE! ══
    log("<span style='color:#a6e3a1;font-weight:bold;font-size:13px'>✅ All " +
        validActivities.length + " items in Module " + (curModNum || "?") + " are DONE!</span>");
    log("<span style='color:#89b4fa'>Returning to course overview to pick next module...</span>");

    setTimeout(() => {
      const baseUrl = window.location.href.replace(/[?&]section=\d+/, "").replace(/&$/, "");
      window.location.href = baseUrl;
    }, 1500);
  }

  function handleFeedbackViewPage() {
    const courseId = getCourseIdFromUrl();
    const href = window.location.href;
    const bodyText = document.body.innerText;

    const isCompletedText = bodyText.includes("We appreciate your honest response") ||
                            bodyText.includes("Thank you for your time") ||
                            bodyText.includes("feedback has already been submitted") ||
                            bodyText.includes("Done: Submit feedback") ||
                            bodyText.includes("Done: View");

    if (isCompletedText) {
      log("<span style='color:#a6e3a1;font-weight:bold'>✅ Feedback already completed! Navigating back...</span>");
      markActivityDone(courseId, href);
      handleFeedbackPostSubmission();
      return;
    }

    const btn = document.querySelector("a[href*='complete.php'], input[value*='Answer the questions'], button[value*='Answer the questions']");
    if (btn) {
      log("<span style='color:#89b4fa;font-weight:bold'>📝 Opening Feedback: 'Answer the questions'...</span>");
      setTimeout(() => {
        if (btn.href) window.location.href = btn.href;
        else btn.click();
      }, 1200);
      return;
    }

    for (const b of document.querySelectorAll("a, button, input[type='button'], input[type='submit']")) {
      const t = (b.value || b.innerText || "").toLowerCase().trim();
      if (t.includes("answer the questions") || t.includes("let's start") || t === "continue") {
        log("<span style='color:#89b4fa'>Clicking '" + t + "'...</span>");
        setTimeout(() => {
          if (b.href) window.location.href = b.href;
          else b.click();
        }, 1200);
        return;
      }
    }

    log("<span style='color:#fab387'>Feedback state clear or completed. Returning to module...</span>");
    markActivityDone(courseId, href);
    handleFeedbackPostSubmission();
  }

  function handleFeedbackAnsweringPage() {
    const bodyText = document.body.innerText;
    const courseId = getCourseIdFromUrl();

    const isPostSubmission = bodyText.includes("We appreciate your honest response") ||
                             bodyText.includes("Thank you for your time") ||
                             bodyText.includes("feedback has already been submitted") ||
                             bodyText.includes("Done: Submit feedback") ||
                             bodyText.includes("Done: View");

    if (isPostSubmission) {
      log("<span style='color:#a6e3a1;font-weight:bold'>✅ Feedback already submitted! Navigating back...</span>");
      markActivityDone(courseId, window.location.href);
      handleFeedbackPostSubmission();
      return;
    }

    const radioGroups = {};
    document.querySelectorAll("input[type='radio']").forEach(r => {
      const name = r.name || "default";
      if (!radioGroups[name]) radioGroups[name] = [];
      radioGroups[name].push(r);
    });

    let answeredCount = 0;
    for (const name in radioGroups) {
      const group = radioGroups[name];
      let targetRadio = group.find(r => {
        const val = (r.value || "").trim();
        const parent = r.parentElement;
        const lbl = parent ? (parent.querySelector("label") || parent).innerText.trim() : "";
        return val === "8" || lbl === "8" || lbl.startsWith("8");
      });

      if (!targetRadio) {
        targetRadio = group[group.length - 1];
      }

      if (targetRadio) {
        targetRadio.checked = true;
        targetRadio.dispatchEvent(new Event("change", { bubbles: true }));
        targetRadio.dispatchEvent(new Event("input", { bubbles: true }));
        targetRadio.click();
        answeredCount++;
      }
    }

    document.querySelectorAll("textarea, input[type='text']").forEach(inp => {
      if (!inp.value) {
        inp.value = "Good";
        inp.dispatchEvent(new Event("change", { bubbles: true }));
        inp.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });

    if (answeredCount === 0) {
      log("<span style='color:#fab387'>No questions found on feedback page. Returning...</span>");
      markActivityDone(courseId, window.location.href);
      handleFeedbackPostSubmission();
      return;
    }

    log("<span style='color:#a6e3a1'>Selected '8' for " + answeredCount + " items! Submitting feedback...</span>");

    setTimeout(() => {
      let btn = document.querySelector(
        "input[value*='Submit your answers'], input[name='savevalues'], input[type='submit'], button[type='submit']"
      );

      if (!btn) {
        for (const b of document.querySelectorAll("button, input[type='button'], input[type='submit'], a.btn")) {
          const t = (b.value || b.innerText || "").toLowerCase().trim();
          if (t.includes("submit your answers") || t.includes("submit")) {
            btn = b;
            break;
          }
        }
      }

      markActivityDone(courseId, window.location.href);

      if (btn) {
        console.log("[Automigo] Submitting feedback via button:", btn);
        btn.click();
        btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
      } else {
        const form = document.querySelector("form");
        if (form) form.submit();
      }

      setTimeout(() => {
        const continueBtn = Array.from(document.querySelectorAll("a, button, input[type='submit'], input[type='button']"))
          .find(el => (el.value || el.innerText || "").toLowerCase().includes("continue"));
        if (continueBtn) {
          if (continueBtn.href) window.location.href = continueBtn.href;
          else continueBtn.click();
        } else {
          handleFeedbackPostSubmission();
        }
      }, 3500);
    }, 1500);
  }

  function handleFeedbackPostSubmission() {
    const courseId = getCourseIdFromUrl();
    markActivityDone(courseId, window.location.href);

    for (const b of document.querySelectorAll("a, button, input[type='button'], input[type='submit']")) {
      const t = (b.value || b.innerText || "").toLowerCase().trim();
      if (t === "continue" || t.includes("continue")) {
        log("<span style='color:#89b4fa'>Clicking 'Continue'...</span>");
        setTimeout(() => {
          if (b.href) window.location.href = b.href;
          else b.click();
        }, 800);
        return;
      }
    }

    const breadcrumbLinks = Array.from(document.querySelectorAll(".breadcrumb a, nav[aria-label='breadcrumb'] a"));
    for (const a of breadcrumbLinks) {
      const t = a.innerText.toLowerCase();
      if (t.includes("module") && !t.includes("feedback") && a.href) {
        log("<span style='color:#89b4fa'>Navigating back to module: '" + a.innerText.trim() + "'</span>");
        setTimeout(() => { window.location.href = a.href; }, 800);
        return;
      }
    }

    const courseBc = document.querySelector(
      ".breadcrumb a[href*='/course/view.php'], nav[aria-label='breadcrumb'] a[href*='/course/view.php']");
    if (courseBc && courseBc.href) {
      log("<span style='color:#89b4fa'>Navigating back to course overview...</span>");
      setTimeout(() => { window.location.href = courseBc.href; }, 800);
      return;
    }

    const courseMatch = window.location.href.match(/courseid=(\d+)/) || window.location.href.match(/id=(\d+)/);
    if (courseMatch) {
      log("<span style='color:#89b4fa'>Returning to course page...</span>");
      setTimeout(() => {
        window.location.href = "https://amigo.amityonline.com/course/view.php?id=" + courseMatch[1];
      }, 1000);
    }
  }

  function clickNextSectionDirectly() {
    for (const el of document.querySelectorAll("a, button, input[type='button'], .btn")) {
      const t = (el.innerText || el.title || el.value || "").trim().toLowerCase();
      if (t.includes("next section")) {
        if (el.href) window.location.href = el.href;
        else el.click();
        return true;
      }
    }
    return false;
  }

  function clickNextActivityOrSection() {
    const nextActBtn = document.querySelector(
      "#next-activity-link, a.next-activity-link, [data-region='next-activity-link'], a[title*='Next activity']"
    );
    if (nextActBtn && nextActBtn.href) {
      window.location.href = nextActBtn.href;
      return true;
    }

    for (const el of document.querySelectorAll("a, button, input[type='button'], .btn")) {
      const t = (el.innerText || el.title || el.value || "").trim().toLowerCase();
      if (t.includes("next activity") || t.includes("next topic") || t.includes("next lesson")) {
        if (el.href) window.location.href = el.href;
        else el.click();
        return true;
      }
    }

    const bcLinks = Array.from(document.querySelectorAll(".breadcrumb a, nav[aria-label='breadcrumb'] a"));
    for (const a of bcLinks) {
      const t = a.innerText.toLowerCase();
      if (t.includes("module") && a.href) {
        log("<span style='color:#89b4fa'>Advancing via module breadcrumb...</span>");
        window.location.href = a.href;
        return true;
      }
    }

    if (clickNextSectionDirectly()) return true;

    const courseBc = document.querySelector(".breadcrumb a[href*='/course/view.php'], nav[aria-label='breadcrumb'] a[href*='/course/view.php']");
    if (courseBc && courseBc.href) {
      window.location.href = courseBc.href;
      return true;
    }

    return false;
  }

  function clickFinishReview() {
    for (const el of document.querySelectorAll("a, button")) {
      const t = (el.innerText || el.title || "").toLowerCase().trim();
      if (t.includes("finish review") || t.includes("back to the quiz")) { el.click(); return; }
    }
    const m = window.location.href.match(/cmid=(\d+)/);
    if (m) window.location.href = "/mod/quiz/view.php?id=" + m[1];
  }

  function findAttemptOrReattemptButton() {
    const modalBtn = findStartAttemptModalButton();
    if (modalBtn) return modalBtn;

    for (const b of document.querySelectorAll("button, input[type='submit'], a.btn, input[type='button']")) {
      const t = (b.value || b.innerText || "").toLowerCase().trim();
      if (t.includes("start attempt") || t.includes("re-attempt quiz") ||
          t.includes("attempt quiz now") || t.includes("attempt quiz") ||
          t.includes("continue the last attempt") || t.includes("attempt assessment")) return b;
    }
    return null;
  }

  function findStartAttemptModalButton() {
    const selectors = [
      ".modal-dialog", ".moodle-dialogue", ".modal-content", ".modal",
      "[role='dialog']", ".confirmation-dialogue", ".moodle-has-zindex",
      "#notice", ".box.py-3.generalbox"
    ];

    for (const sel of selectors) {
      const containers = document.querySelectorAll(sel);
      for (const box of containers) {
        const btns = box.querySelectorAll("button, input[type='submit'], input[type='button'], a.btn");
        for (const b of btns) {
          const txt = (b.value || b.innerText || "").toLowerCase().trim();
          if (txt.includes("cancel") || txt.includes("close") || txt === "x") continue;
          if (txt.includes("start attempt") || txt.includes("start") ||
              txt.includes("continue") || txt.includes("attempt") ||
              txt.includes("yes") || txt.includes("confirm") || txt === "ok") {
            return b;
          }
        }
      }
    }

    for (const b of document.querySelectorAll("button, input[type='submit'], input[type='button'], a.btn")) {
      const txt = (b.value || b.innerText || "").toLowerCase().trim();
      if (txt === "start attempt" || txt.includes("start attempt")) {
        return b;
      }
    }

    return null;
  }

  function watchAndBypassStartModal() {
    let checks = 0;
    const interval = setInterval(() => {
      checks++;
      const btn = findStartAttemptModalButton();
      if (btn) {
        clearInterval(interval);
        log("<span style='color:#a6e3a1;font-weight:bold'>✅ Bypassing confirmation modal ('" + (btn.innerText || btn.value || "Start attempt").trim() + "')...</span>");
        try {
          btn.focus();
          btn.click();
          btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
        } catch(e) {}
      }
      if (checks > 25) {
        clearInterval(interval);
      }
    }, 200);
  }

  /* ═══════════════════════════════════════════════════════════
     REVIEW PAGE HANDLER
     ═══════════════════════════════════════════════════════════ */
  function handleReviewPage() {
    const questions = document.querySelectorAll(".que");
    if (!questions.length) {
      log("<span style='color:#cdd6f4'>No questions on review page. Finishing...</span>");
      setTimeout(() => clickFinishReview(), 1200);
      return;
    }

    const quizId = getQuizIdentifier();
    const db = getDB();
    const modMem = getModuleMem();
    const currentMod = getCurrentModuleName();
    if (!modMem[currentMod]) modMem[currentMod] = {};
    if (!db[quizId]) db[quizId] = { attempts: [] };

    const perQResults = [];
    let correctCount = 0;

    questions.forEach(q => {
      const isCorrect = q.classList.contains("correct");

      const qEl = q.querySelector(".qtext, .formulation");
      const raw = qEl ? qEl.innerText : "";
      const qText = raw.replace(/^Question\s*\d+/i, "").replace(/Not yet answered/i, "")
                       .replace(/Marked out of.*/i, "").replace(/Flag question/i, "").trim();
      const qKey = normalizeText(qText);

      let chosenText = "";
      const sel = q.querySelector("input[type='radio']:checked");
      if (sel) {
        const lbl = q.querySelector("label[for='" + sel.id + "']");
        if (lbl) chosenText = lbl.innerText.trim();
        if (!chosenText) {
          const p = sel.closest(".r0, .r1, div");
          const fb = p ? p.querySelector("label") : null;
          if (fb) chosenText = fb.innerText.trim();
        }
      }

      let correctAnswer = null;
      const rightDiv = q.querySelector(".rightanswer");
      if (rightDiv) {
        const m = rightDiv.innerText.match(/(?:correct answer is|the answer is)[:\s]*(.+)/i);
        if (m) correctAnswer = m[1].trim().replace(/\.\s*$/, "");
      }
      if (!correctAnswer) {
        const co = q.querySelector(".answer .correct label, .answer div.correct label");
        if (co) correctAnswer = co.innerText.trim();
      }
      if (isCorrect && chosenText) correctAnswer = chosenText;
      if (isCorrect) correctCount++;

      perQResults.push({
        qKey: qKey, chosen: chosenText,
        isCorrect: isCorrect, correctAnswer: correctAnswer
      });

      if (correctAnswer && qKey) modMem[currentMod][qKey] = correctAnswer;
    });

    const atts = db[quizId].attempts;
    if (atts.length > 0) {
      const last = atts[atts.length - 1];
      last.perQ = perQResults;
      last.score = correctCount * 5;
    } else {
      db[quizId].attempts.push({
        combo: perQResults.map(p => p.chosen),
        keys: perQResults.map(p => p.qKey),
        score: correctCount * 5,
        perQ: perQResults
      });
    }

    saveDB(db);
    saveModuleMem(modMem);

    const learned = perQResults.filter(p => p.correctAnswer).length;
    log("<span style='color:#cba6f7;font-weight:bold'>🔍 " + correctCount + "/" +
        questions.length + " correct. Learned " + learned + " answers. Finishing review...</span>");
    setTimeout(() => clickFinishReview(), 1500);
  }

  /* ═══════════════════════════════════════════════
     QUIZ VIEW PAGE
     ═══════════════════════════════════════════════ */
  function isQuizAlreadyPerfectScore(isAssessment) {
    const bodyText = document.body.innerText;

    if (!isAssessment) {
      if (bodyText.includes("10.00 / 10.00") || bodyText.includes("10.00/10.00") ||
          bodyText.includes("10 / 10") || bodyText.includes("10/10") ||
          bodyText.includes("10.00 out of 10.00") || bodyText.includes("10 out of 10") ||
          bodyText.includes("100.00%") || bodyText.includes("100%") ||
          bodyText.match(/Highest grade:\s*10(?:\.00)?\s*\/\s*10/i) ||
          bodyText.match(/Overall grade:\s*10(?:\.00)?\s*\/\s*10/i) ||
          bodyText.match(/Grade:\s*10(?:\.00)?\s*(?:\/|\bout of\b)\s*10/i)) {
        return true;
      }
    } else {
      if (bodyText.includes("30.00 / 30.00") || bodyText.includes("30 / 30") ||
          bodyText.includes("30.00 out of 30.00") ||
          bodyText.match(/Highest grade:\s*30(?:\.00)?\s*\/\s*30/i)) {
        return true;
      }
    }

    const rows = document.querySelectorAll("table.quizattemptsummary tbody tr, table.generaltable tbody tr");
    for (const r of rows) {
      const cells = r.querySelectorAll("td");
      for (const c of cells) {
        const t = c.innerText.trim();
        if (!isAssessment) {
          if (t === "10.00" || t === "10" || t.includes("10.00 / 10.00") || t.includes("10 / 10") ||
              t.includes("2.00 / 2.00") || t.includes("2.00/2.00")) {
            return true;
          }
        } else {
          if (t === "30.00" || t === "30" || t.includes("30.00 / 30.00") || t.includes("30 / 30")) {
            return true;
          }
        }
      }
    }

    const quizFp = sessionStorage.getItem("amigo_active_quiz_fp");
    const urlQuizId = getQuizIdentifier();
    const db = getDB();
    for (const k of [quizFp, urlQuizId].filter(Boolean)) {
      if (db[k] && db[k].attempts) {
        for (const att of db[k].attempts) {
          if (att.score !== null && att.score !== undefined) {
            if (!isAssessment && att.score >= 10.0) return true;
            if (isAssessment && att.score >= 30.0) return true;
          }
        }
      }
    }

    return false;
  }

  function extractScoreFromViewPage(isAssessment) {
    const defaultTotal = isAssessment ? 30.0 : 10.0;

    const table = document.querySelector("table.quizattemptsummary, table.generaltable");
    if (table) {
      const headers = Array.from(table.querySelectorAll("th")).map(th => th.innerText.toLowerCase());
      let gradeColIdx = -1, marksColIdx = -1;
      headers.forEach((h, idx) => {
        if (h.includes("grade")) gradeColIdx = idx;
        if (h.includes("mark")) marksColIdx = idx;
      });

      const rows = table.querySelectorAll("tbody tr");
      if (rows.length > 0) {
        for (let r = rows.length - 1; r >= 0; r--) {
          const cells = rows[r].querySelectorAll("td");
          if (cells.length === 0) continue;

          if (gradeColIdx >= 0 && cells[gradeColIdx]) {
            const gm = cells[gradeColIdx].innerText.trim().match(/([\d\.]+)/);
            if (gm) return { score: parseFloat(gm[1]), total: defaultTotal };
          }

          if (marksColIdx >= 0 && cells[marksColIdx]) {
            const mm = cells[marksColIdx].innerText.trim().match(/([\d\.]+)/);
            if (mm) {
              const val = parseFloat(mm[1]);
              return { score: isAssessment ? val : (val * 5), total: defaultTotal };
            }
          }

          for (const cell of cells) {
            const txt = cell.innerText.trim();
            const m = txt.match(/([\d\.]+)\s*(?:\/|\bout of\b)\s*([\d\.]+)/i);
            if (m) {
              const sc = parseFloat(m[1]), tot = parseFloat(m[2]);
              if (tot === 10 || tot === 30) return { score: sc, total: tot };
              if (tot === 2) return { score: sc * 5, total: 10 };
            }
            if (txt === "10.00" || txt === "10") return { score: 10.0, total: 10.0 };
            if (txt === "5.00" || txt === "5") return { score: 5.0, total: 10.0 };
            if (txt === "0.00" || txt === "0") return { score: 0.0, total: 10.0 };
          }
        }
      }
    }

    const bodyText = document.body.innerText;
    const mG = bodyText.match(/Grade\s*[:\s]*([\d\.]+)\s*(?:\/|\bout of\b)\s*([\d\.]+)/i);
    if (mG) return { score: parseFloat(mG[1]), total: parseFloat(mG[2]) };

    const mH = bodyText.match(/Highest grade\s*[:\s]*([\d\.]+)\s*(?:\/|\bout of\b)\s*([\d\.]+)/i);
    if (mH) return { score: parseFloat(mH[1]), total: parseFloat(mH[2]) };

    const mM = bodyText.match(/Marks\s*[:\s]*([\d\.]+)\s*(?:\/|\bout of\b)\s*([\d\.]+)/i);
    if (mM) {
      const sc = parseFloat(mM[1]), tot = parseFloat(mM[2]);
      if (tot === 2) return { score: sc * 5, total: 10 };
      return { score: sc, total: tot };
    }

    return { score: null, total: defaultTotal };
  }

  function handleQuizViewPage() {
    const isA = checkIsAssessment();
    const { score, total } = extractScoreFromViewPage(isA);
    const courseId = getCourseIdFromUrl();
    const quizFp = sessionStorage.getItem("amigo_active_quiz_fp");
    const urlQuizId = getQuizIdentifier();
    const db = getDB();

    const targetKeys = [quizFp, urlQuizId].filter(Boolean);
    targetKeys.forEach(k => {
      if (db[k] && db[k].attempts && db[k].attempts.length > 0 && score !== null) {
        const last = db[k].attempts[db[k].attempts.length - 1];
        if (last.score === null || last.score === undefined) {
          last.score = score;
        }
      }
    });
    saveDB(db);

    if (score !== null) {
      try { sessionStorage.setItem("amigo_last_score", String(score)); } catch(e) {}
    }

    // ══ RULE: MODULE ASSESSMENT - STRICTLY 1 ATTEMPT BY DEFAULT (CONFIRM BEFORE 2ND ATTEMPT) ══
    if (isA) {
      const existingAttemptRows = document.querySelectorAll("table.quizattemptsummary tbody tr, table.generaltable tbody tr");
      const hasExistingAttempt = existingAttemptRows.length > 0;
      const bodyText = document.body.innerText;
      const hasFinishedText = bodyText.includes("Finished") || bodyText.includes("finished") ||
                              bodyText.includes("Completed") || bodyText.match(/Attempt\s+\d+/i);
      const hasDbAttempt = (db[urlQuizId] && db[urlQuizId].attempts && db[urlQuizId].attempts.length > 0);

      if (hasExistingAttempt || hasFinishedText || score !== null || hasDbAttempt) {
        const attemptBtn = findAttemptOrReattemptButton();
        const userApproved2nd = sessionStorage.getItem("amigo_allow_2nd_attempt_" + urlQuizId);

        if (attemptBtn && !userApproved2nd) {
          log("<span style='color:#fab387;font-weight:bold'>⏳ Module Assessment finished (Score: " + (score !== null ? score + "/" + total : "recorded") + "). Asking user for 2nd attempt...</span>");
          showUserConfirmDialog(
            "Module Assessment Re-attempt?",
            "You completed 1 attempt (" + (score !== null ? score + "/" + total : "recorded") + "). Do you want to proceed with a 2nd attempt, or skip to next activity?",
            false, // default to skip after timeout
            15
          ).then(shouldProceed => {
            if (shouldProceed) {
              sessionStorage.setItem("amigo_allow_2nd_attempt_" + urlQuizId, "true");
              log("<span style='color:#a6e3a1;font-weight:bold'>User confirmed 2nd attempt! Launching...</span>");
              attemptBtn.click();
              watchAndBypassStartModal();
            } else {
              log("<span style='color:#89b4fa'>Skipping 2nd attempt as requested. Advancing...</span>");
              markActivityDone(courseId, window.location.href);
              sessionStorage.removeItem("amigo_active_quiz_fp");
              sessionStorage.removeItem("amigo_last_score");
              setTimeout(() => clickNextActivityOrSection(), 1200);
            }
          });
          return;
        }

        log("<span style='color:#a6e3a1;font-weight:bold;font-size:13px'>" +
            "🎯 Module Assessment " + (score !== null ? "scored " + score + "/" + total : "already completed") +
            "! Moving to next activity...</span>");

        markActivityDone(courseId, window.location.href);
        sessionStorage.removeItem("amigo_active_quiz_fp");
        sessionStorage.removeItem("amigo_last_score");
        setTimeout(() => clickNextActivityOrSection(), 2000);
        return;
      }

      log("<span style='color:#fab387;font-weight:bold'>🔥 Module Assessment — FIRST attempt (Targeting 30/30 with Reasoning AI)...</span>");
      const firstBtn = findAttemptOrReattemptButton();
      if (firstBtn) {
        setTimeout(() => {
          firstBtn.click();
          watchAndBypassStartModal();
        }, 1200);
        return;
      }
      setTimeout(() => clickNextActivityOrSection(), 2000);
      return;
    }

    // ══ REGULAR QUIZ: 10/10 PERFECT SCORE ACHIEVED ══
    if (!isA && isQuizAlreadyPerfectScore(false)) {
      log("<span style='color:#a6e3a1;font-weight:bold;font-size:14px'>" +
          "🎉 10/10 PERFECT SCORE ACHIEVED! → Next Activity...</span>");
      markActivityDone(courseId, window.location.href);
      sessionStorage.removeItem("amigo_active_quiz_fp");
      sessionStorage.removeItem("amigo_last_score");
      setTimeout(() => clickNextActivityOrSection(), 1800);
      return;
    }

    // Regular Quiz: Re-attempt button
    const attemptBtn = findAttemptOrReattemptButton();
    if (attemptBtn) {
      const qd = (quizFp && db[quizFp]) ? db[quizFp] : (db[urlQuizId] || { attempts: [] });
      const cnt = qd.attempts ? qd.attempts.length : 0;
      log("<span style='color:#fab387'>🚀 Starting quiz attempt #" + (cnt + 1) +
          " (Score was " + (score !== null ? score : "?") + "/" + total + ")...</span>");
      setTimeout(() => {
        attemptBtn.click();
        watchAndBypassStartModal();
      }, 1200);
      return;
    }

    if (score !== null) {
      markActivityDone(courseId, window.location.href);
      log("<span style='color:#cdd6f4'>Advancing...</span>");
      setTimeout(() => clickNextActivityOrSection(), 2000);
    }
  }

  /* ═══════════════════════════════════════════════════════════════════
     SMART DEDUCTION ENGINE
     ═══════════════════════════════════════════════════════════════════ */
  function computeSmartAnswers(quizId, batch) {
    const db = getDB();
    const qd = db[quizId] || { attempts: [] };
    const attempts = qd.attempts || [];
    const numQ = batch.length;

    const lastScoreStr = sessionStorage.getItem("amigo_last_score");
    if (lastScoreStr !== null && attempts.length > 0) {
      const last = attempts[attempts.length - 1];
      if (last.score === null || last.score === undefined) {
        last.score = parseFloat(lastScoreStr);
        saveDB(db);
        console.log("[Automigo] Backfilled last attempt score:", last.score);
      }
    }

    if (attempts.length === 0) return null;

    const triedCombos = new Set(
      attempts.filter(a => a.combo && a.combo.length === numQ)
              .map(a => a.combo.map(normalizeText).join("|||"))
    );

    const deadOptionsPerQ = Array.from({ length: numQ }, () => new Set());
    attempts.forEach(att => {
      if (att.score === 0 && att.combo && att.combo.length === numQ) {
        for (let qi = 0; qi < numQ; qi++) {
          deadOptionsPerQ[qi].add(normalizeText(att.combo[qi]));
        }
      }
    });

    for (let qi = 0; qi < numQ; qi++) {
      if (deadOptionsPerQ[qi].size > 0) {
        console.log("[Automigo] Q" + (qi + 1) + " permanently purged 0/10 options:", Array.from(deadOptionsPerQ[qi]));
      }
    }

    const optionsPerQ = batch.map((q, qi) => {
      const active = q.options.filter(opt => !deadOptionsPerQ[qi].has(normalizeText(opt)));
      return active.length > 0 ? active : q.options.slice();
    });

    const bankAnswers = batch.map(q => q.bankAnswer);
    const hasAllBank = bankAnswers.every(ans => !!ans);
    if (hasAllBank) {
      console.log("[Automigo] 🏛️ All answers found in Verified Module Bank!");
      return bankAnswers;
    }

    let allCandidates = [];
    if (numQ === 2) {
      for (const opt0 of optionsPerQ[0]) {
        for (const opt1 of optionsPerQ[1]) {
          allCandidates.push([opt0, opt1]);
        }
      }
    } else {
      allCandidates = optionsPerQ[0].map(o => [o]);
      for (let qi = 1; qi < numQ; qi++) {
        const next = [];
        for (const prev of allCandidates) {
          for (const opt of optionsPerQ[qi]) {
            next.push([...prev, opt]);
          }
        }
        allCandidates = next;
      }
    }

    const validCandidates = allCandidates.filter(hyp => {
      for (let qi = 0; qi < numQ; qi++) {
        if (bankAnswers[qi] && normalizeText(hyp[qi]) !== normalizeText(bankAnswers[qi])) {
          return false;
        }
      }

      for (const att of attempts) {
        if (!att.combo || att.combo.length !== numQ) continue;
        if (att.score === null || att.score === undefined) continue;

        let matchCount = 0;
        for (let qi = 0; qi < numQ; qi++) {
          if (normalizeText(att.combo[qi]) === normalizeText(hyp[qi])) {
            matchCount++;
          }
        }

        const expectedScore = matchCount * (10 / numQ);
        if (Math.abs(expectedScore - att.score) > 0.5) {
          return false;
        }
      }

      return true;
    });

    console.log("[Automigo] Remaining valid hypotheses:", validCandidates.length, "out of", allCandidates.length);

    if (validCandidates.length === 1) {
      log("<span style='color:#a6e3a1;font-weight:bold'>🎯 Mathematically proven 10/10 answer found!</span>");
      return validCandidates[0];
    }

    const untriedCandidates = validCandidates.filter(c => !triedCombos.has(c.map(normalizeText).join("|||")));

    if (untriedCandidates.length > 0) {
      let bestCand = untriedCandidates[0];
      let bestMaxRem = 999999;

      for (const probe of untriedCandidates) {
        const outcomes = {};
        for (const hyp of validCandidates) {
          let matches = 0;
          for (let qi = 0; qi < numQ; qi++) {
            if (normalizeText(probe[qi]) === normalizeText(hyp[qi])) matches++;
          }
          outcomes[matches] = (outcomes[matches] || 0) + 1;
        }
        const maxRemaining = Math.max(...Object.values(outcomes));
        if (maxRemaining < bestMaxRem) {
          bestMaxRem = maxRemaining;
          bestCand = probe;
        }
      }

      log("<span style='color:#cba6f7;font-weight:bold'>🧠 Smart Deduction: " +
          validCandidates.length + " possibilities left. Probing optimal combo (attempt #" +
          (attempts.length + 1) + ")...</span>");
      return bestCand;
    }

    const untriedAll = allCandidates.filter(c => !triedCombos.has(c.map(normalizeText).join("|||")));
    if (untriedAll.length > 0) {
      log("<span style='color:#fab387'>Testing new untried combination (attempt #" + (attempts.length + 1) + ")...</span>");
      return untriedAll[0];
    }

    return allCandidates[0];
  }

  function extractPageScenario() {
    const scenarioParts = [];
    document.querySelectorAll(".que.description .formulation, .que.description .qtext").forEach(el => {
      const t = el.innerText.trim();
      if (t && !scenarioParts.includes(t)) scenarioParts.push(t);
    });
    document.querySelectorAll(".scenario, .case-study, .quiz-instructions, .instructions, [class*='scenario']").forEach(el => {
      const t = el.innerText.trim();
      if (t && !scenarioParts.includes(t)) scenarioParts.push(t);
    });
    const introEl = document.querySelector("#intro, .quizinfo, .activity-description");
    if (introEl) {
      const t = introEl.innerText.trim();
      if (t && t.length > 50 && !t.includes("Attempts allowed") && !scenarioParts.includes(t)) {
        scenarioParts.push(t);
      }
    }
    return scenarioParts.join("\n\n");
  }

  async function solveAttemptPage(isAutoSubmit, isAssessment) {
    const questions = document.querySelectorAll(".que");
    if (!questions.length) {
      log("<span style='color:#f38ba8'>No questions found.</span>");
      return;
    }

    const modMem = getModuleMem();
    const currentMod = getCurrentModuleName();
    const moduleKnowledge = modMem[currentMod] || {};

    const pageScenario = extractPageScenario();
    if (pageScenario) {
      console.log("[Automigo] Detected page-level scenario context (" + pageScenario.length + " chars)");
    }

    const batch = [];
    questions.forEach((q, idx) => {
      let raw = "";
      const formEl = q.querySelector(".formulation");
      if (formEl) {
        const clone = formEl.cloneNode(true);
        const ans = clone.querySelector(".answer, .im-controls, .outcome, .comment, .feedback");
        if (ans) ans.remove();
        raw = clone.innerText;
      } else {
        const qEl = q.querySelector(".qtext");
        raw = qEl ? qEl.innerText : (q.innerText || "");
      }

      const qText = raw.replace(/^Question\s*\d+/i, "").replace(/Not yet answered/i, "")
                       .replace(/Marked out of.*/i, "").replace(/Flag question/i, "").trim();
      const qKey = normalizeText(qText);

      const rows = q.querySelectorAll(".answer > div, .answer > .r0, .answer > .r1, .answer > label, .answer li");
      const options = [], optEls = [];
      rows.forEach(row => {
        const radio = row.querySelector("input[type='radio']") || (row.tagName === "INPUT" ? row : null);
        const label = row.querySelector("label") || (row.tagName === "LABEL" ? row : null);
        const text = (label ? label.innerText : row.innerText).trim();
        if (text && radio) { options.push(text); optEls.push({ radio, label, text, container: row }); }
      });
      if (!optEls.length) {
        const radios = q.querySelectorAll("input[type='radio']");
        const labels = q.querySelectorAll(".answer label");
        radios.forEach((r, rI) => {
          const l = labels[rI];
          const t = l ? l.innerText.trim() : "Option " + (rI + 1);
          options.push(t);
          optEls.push({ radio: r, label: l, text: t, container: r.parentElement });
        });
      }

      let bankAnswer = null, highSim = 0;
      for (const [k, ans] of Object.entries(moduleKnowledge)) {
        const sim = getSimilarityScore(k, qKey);
        if (sim > 0.8 && sim > highSim) { highSim = sim; bankAnswer = ans; }
      }

      batch.push({ idx, qText, qKey, options, optionElements: optEls, bankAnswer });
    });

    const quizId = getQuizIdentifier(batch);
    const db = getDB();
    if (!db[quizId]) db[quizId] = { attempts: [] };

    const lastScoreStr = sessionStorage.getItem("amigo_last_score");
    if (lastScoreStr !== null && db[quizId].attempts && db[quizId].attempts.length > 0) {
      const last = db[quizId].attempts[db[quizId].attempts.length - 1];
      if (last.score === null || last.score === undefined) {
        last.score = parseFloat(lastScoreStr);
        saveDB(db);
        console.log("[Automigo] solveAttemptPage backfilled last score:", last.score);
      }
    }

    const deadOptions = Array.from({ length: batch.length }, () => new Set());
    db[quizId].attempts.forEach(att => {
      if (att.score === 0 && att.combo && att.combo.length === batch.length) {
        for (let qi = 0; qi < batch.length; qi++) {
          deadOptions[qi].add(normalizeText(att.combo[qi]));
        }
      }
    });

    const attCount = db[quizId].attempts.length;
    let chosenAnswers = [];
    let logHtml = "";

    const deduced = computeSmartAnswers(quizId, batch);
    const hasDeductions = deduced && deduced.length === batch.length;
    const useAI = isAssessment || (attCount < 2);

    if (!useAI && hasDeductions) {
      log("<span style='color:#cba6f7;font-weight:bold'>🧠 Smart Deduction (Attempt #" +
          (attCount + 1) + " of 5 max)...</span>");
      batch.forEach((q, i) => {
        let chosen, tag;
        if (q.bankAnswer) { chosen = q.bankAnswer; tag = "🏛️ Bank 100%"; }
        else { chosen = deduced[i] || q.options[0]; tag = "🧠 Deduced"; }
        const matched = findMatchingElement(chosen, q.optionElements);
        const final = matched ? matched.text : chosen;
        chosenAnswers.push(final);
        if (matched) clickRadioProperly(matched);
        logHtml += "<div class='amigo-ans-item'><strong>Q" + (i+1) + ":</strong> " +
                   final + " <span style='font-size:10px;color:#cba6f7'>" + tag + "</span></div>";
      });
    } else {
      const cfg = getActiveProviderConfig();
      const aiMode = isAssessment ? ("Deep AI (" + cfg.name + ")") : (cfg.name + " #" + (attCount + 1) + " of 2");
      log("<span style='color:#89b4fa'>Querying " + aiMode + " for " + batch.length + " questions...</span>");

      const filteredBatch = batch.map((q, qi) => {
        const valid = q.options.filter(opt => !deadOptions[qi].has(normalizeText(opt)));
        return Object.assign({}, q, { options: valid.length > 0 ? valid : q.options });
      });

      const aiAnswers = await queryMultiProviderAI(filteredBatch, isAssessment, attCount + 1, pageScenario);
      batch.forEach((q, i) => {
        let chosen, tag;
        if (q.bankAnswer) {
          chosen = q.bankAnswer; tag = "🏛️ Bank 100%";
        } else {
          let ans = aiAnswers[i] || q.options[0];
          if (deadOptions[i].has(normalizeText(ans))) {
            const safe = q.options.find(opt => !deadOptions[i].has(normalizeText(opt)));
            if (safe) ans = safe;
          }
          chosen = ans;
          tag = isAssessment ? "🧠 Deep AI" : ("⚡ AI #" + (attCount + 1));
        }

        const matched = findMatchingElement(chosen, q.optionElements);
        const final = matched ? matched.text : chosen;
        chosenAnswers.push(final);
        if (matched) clickRadioProperly(matched);
        logHtml += "<div class='amigo-ans-item'><strong>Q" + (i+1) + ":</strong> " +
                   final + " <span style='font-size:10px;color:#a6e3a1'>" + tag + "</span></div>";
      });
    }

    db[quizId].attempts.push({
      combo: chosenAnswers,
      keys: batch.map(q => q.qKey),
      score: null, perQ: null
    });
    saveDB(db);

    sessionStorage.setItem(LAST_ATTEMPT_KEY, JSON.stringify({
      quizId, answers: batch.map((q, i) => ({ qKey: q.qKey, qText: q.qText, chosen: chosenAnswers[i] }))
    }));

    log(logHtml + "<div style='color:#a6e3a1;margin-top:4px'>🟢 All selected! Submitting...</div>");
    if (isAutoSubmit) setTimeout(() => clickNextOrFinishAttemptBtn(), 1200);
  }

  /* ═══════════════════════════════════════════════
     MULTI-PROVIDER DEEP AI QUERY
     ═══════════════════════════════════════════════ */
  async function queryMultiProviderAI(batch, isAssessment, attemptNum, pageScenario) {
    const isRetryAI = (attemptNum === 2);
    const results = [];
    const chunkSize = 5;

    for (let c = 0; c < batch.length; c += chunkSize) {
      const chunk = batch.slice(c, c + chunkSize);
      let prompt = "You are a top university professor. Answer each question with 100% academic precision.\n\n";
      if (pageScenario) {
        prompt += "=== SCENARIO / BACKGROUND CONTEXT ===\n" + pageScenario + "\n=====================================\n\n";
      }
      chunk.forEach((q, i) => {
        prompt += "Q" + (c+i+1) + ": " + q.qText + "\nOptions:\n";
        q.options.forEach((opt, oI) => { prompt += "  " + String.fromCharCode(65+oI) + ". " + opt + "\n"; });
        prompt += "\n";
      });
      prompt += 'Reply with a JSON array of the exact correct option texts. Example: ["Option A Text","Option B Text"]';

      const messages = [
        { role: "system", content: "Precise university exam solver. Analyze questions with 100% academic accuracy. Output strictly valid JSON array of answer strings." },
        { role: "user", content: isRetryAI ? (prompt + "\nNote: This is attempt #2. Re-evaluate options with extra academic precision.") : prompt }
      ];

      try {
        const rawReply = await AIService.chatCompletion(messages, {
          isReasoning: isAssessment,
          temperature: isRetryAI ? 0.25 : 0.05,
          max_tokens: 600
        });

        const jm = rawReply.match(/\[[\s\S]*?\]/);
        if (jm) {
          const parsed = JSON.parse(jm[0]);
          if (Array.isArray(parsed) && parsed.length === chunk.length) {
            results.push(...parsed);
            continue;
          }
        }
      } catch(e) {
        console.warn("[Automigo] AI query error for chunk:", e.message || e);
      }
      chunk.forEach(q => results.push(q.options[0]));
    }
    return results;
  }

  /* ═══════════════════════════════════════════════
     HELPERS
     ═══════════════════════════════════════════════ */
  function getQuizIdentifier(batch) {
    if (batch && batch.length > 0) {
      const qKeys = batch.map(q => normalizeText(q.qText).slice(0, 35)).sort().join("___");
      if (qKeys.length > 5) {
        const fp = "quizfp_" + qKeys;
        try { sessionStorage.setItem("amigo_active_quiz_fp", fp); } catch(e) {}
        return fp;
      }
    }
    try {
      const stored = sessionStorage.getItem("amigo_active_quiz_fp");
      if (stored) return stored;
    } catch(e) {}
    const m = window.location.href.match(/[?&](?:cmid|id)=(\d+)/);
    if (m) return "quiz_" + m[1];
    return "quiz_" + normalizeText(document.title).slice(0, 30);
  }

  function clickRadioProperly(o) {
    try {
      if (o.radio) {
        o.radio.checked = true;
        o.radio.dispatchEvent(new Event("change", { bubbles: true }));
        o.radio.dispatchEvent(new Event("input", { bubbles: true }));
        o.radio.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
      } else if (o.label) {
        o.label.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
      }
    } catch(e) {}
  }

  function findMatchingElement(target, elements) {
    const tn = normalizeText(target);
    for (const el of elements) { if (normalizeText(el.text) === tn) return el; }
    let best = null, bs = 0;
    for (const el of elements) {
      const s = getSimilarityScore(el.text, target);
      if (s > bs) { bs = s; best = el; }
    }
    return best || elements[0];
  }

  function clickNextOrFinishAttemptBtn() {
    const fb = document.querySelector(
      "input[name='next'], input[value*='Finish attempt'], button.mod_quiz-next-nav, .submitbtns input");
    if (fb) { fb.click(); return; }
    const np = document.querySelector("input[value*='Next page'], button[value*='Next page']");
    if (np) { np.click(); return; }
    for (const b of document.querySelectorAll("button, input[type='submit']")) {
      const v = (b.value || b.innerText || "").toLowerCase();
      if (v.includes("finish attempt") || v.includes("next page")) { b.click(); return; }
    }
  }

  function submitSummaryPage() {
    log("<span style='color:#fab387'>1️⃣ Submitting summary page...</span>");

    const existingModalBtn = findSummaryModalConfirmButton();
    if (existingModalBtn) {
      log("<span style='color:#a6e3a1;font-weight:bold'>2️⃣ Found open modal → Confirming!</span>");
      clickElementForcefully(existingModalBtn);
      return;
    }

    const submitBtn = findSummarySubmitButton();
    if (submitBtn) {
      clickElementForcefully(submitBtn);
    }

    watchAndConfirmSummaryModal();
  }

  function findSummarySubmitButton() {
    for (const b of document.querySelectorAll("button, input[type='submit'], a.btn, input[type='button']")) {
      const t = (b.value || b.innerText || "").toLowerCase().trim();
      if (t === "submit all and finish" || t.includes("submit all and finish") || t.includes("submit all")) {
        return b;
      }
    }
    return null;
  }

  function findSummaryModalConfirmButton() {
    const dialogSelectors = [
      ".modal-dialog", ".modal", ".moodle-dialogue", "[role='dialog']",
      ".confirmation-dialogue", ".moodle-has-zindex", ".modal-content",
      ".modal-footer", ".moodle-dialogue-confirm"
    ];

    for (const sel of dialogSelectors) {
      const dialogs = document.querySelectorAll(sel);
      for (const d of dialogs) {
        const btns = d.querySelectorAll("button, input[type='button'], input[type='submit'], a.btn");
        for (const b of btns) {
          const txt = (b.value || b.innerText || "").toLowerCase().trim();
          if (txt.includes("cancel") || txt.includes("close") || txt === "x") continue;
          if (txt.includes("submit all and finish") || txt.includes("submit all") ||
              txt.includes("submit") || txt === "yes" || txt.includes("confirm") || txt === "ok") {
            return b;
          }
        }
      }
    }

    const allButtons = document.querySelectorAll("button, input[type='button'], input[type='submit']");
    for (const b of allButtons) {
      const txt = (b.value || b.innerText || "").toLowerCase().trim();
      if (txt === "submit all and finish") {
        const modalParent = b.closest(".modal, .modal-dialog, [role='dialog'], .moodle-dialogue, .modal-footer, .confirmation-dialogue");
        if (modalParent) return b;
      }
    }

    const matches = [];
    for (const b of allButtons) {
      const txt = (b.value || b.innerText || "").toLowerCase().trim();
      if (txt.includes("submit all and finish")) matches.push(b);
    }
    if (matches.length > 1) {
      return matches[matches.length - 1];
    }

    return null;
  }

  function clickElementForcefully(el) {
    if (!el) return;
    try { el.focus(); } catch(e) {}
    try { el.click(); } catch(e) {}
    try { el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window })); } catch(e) {}
    try { el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })); } catch(e) {}
    try { el.dispatchEvent(new PointerEvent("pointerup", { bubbles: true })); } catch(e) {}
  }

  function watchAndConfirmSummaryModal() {
    log("<span style='color:#fab387'>2️⃣ Actively confirming modal...</span>");
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const mb = findSummaryModalConfirmButton();
      if (mb) {
        clearInterval(interval);
        log("<span style='color:#a6e3a1;font-weight:bold'>✅ Modal confirmed! Submitting...</span>");
        clickElementForcefully(mb);
        return;
      }

      if (attempts === 8 || attempts === 16) {
        const sb = findSummarySubmitButton();
        if (sb) clickElementForcefully(sb);
      }

      if (attempts > 35) {
        clearInterval(interval);
        const form = document.querySelector("form[action*='summary.php'], form[action*='processattempt.php']");
        if (form) {
          log("<span style='color:#89b4fa'>Submitting form directly...</span>");
          try { form.submit(); } catch(e) {}
        }
      }
    }, 200);
  }

  /* ═══════════════════════════════════════════════════════════════
     AI PAGE INSPECTOR (SELF-HEALING UI FALLBACK)
     ═══════════════════════════════════════════════════════════════ */
  async function inspectUnknownPageWithAi() {
    try {
      const pageTitle = document.title;
      const url = window.location.href;
      const headings = Array.from(document.querySelectorAll("h1, h2, h3")).map(h => h.innerText.trim()).filter(Boolean).slice(0, 5);
      const buttons = Array.from(document.querySelectorAll("button, input[type='button'], input[type='submit'], a.btn, a[href*='/mod/']"))
        .map(b => (b.innerText || b.value || b.getAttribute("aria-label") || "").trim())
        .filter(t => t.length > 0 && t.length < 50)
        .slice(0, 15);

      log("<span style='color:#89b4fa'>🤖 AI inspecting page structure...</span>");

      const prompt = "Amigo LMS automation navigation.\nURL: " + url +
                     "\nTitle: " + pageTitle +
                     "\nHeadings: " + headings.join(" | ") +
                     "\nVisible Actions: " + buttons.join(" | ") +
                     "\nWhich button text from the list above should be clicked to proceed with the course? Reply ONLY with the exact button text string.";

      const reply = await AIService.chatCompletion([
        { role: "user", content: prompt }
      ], { temperature: 0.1, max_tokens: 60 });

      const suggestedText = (reply || "").replace(/['"]/g, "").trim().toLowerCase();
      log("<span style='color:#a6e3a1'>AI suggests clicking: '" + suggestedText + "'</span>");

      for (const el of document.querySelectorAll("button, a, input")) {
        const t = (el.innerText || el.value || "").toLowerCase().trim();
        if (t && (t === suggestedText || t.includes(suggestedText))) {
          clickElementForcefully(el);
          return;
        }
      }
    } catch(e) {}

    clickNextActivityOrSection();
  }

})();
