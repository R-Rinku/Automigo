const PROVIDER_PROFILES = {
  omniroute: {
    id: "omniroute",
    name: "OmniRoute (Local Gateway)",
    icon: "⚡",
    url: "http://127.0.0.1:20128/v1/chat/completions",
    modelsUrl: "http://127.0.0.1:20128/v1/models",
    apiKey: "",
    defaultFastModel: "auto/best-fast",
    defaultReasoningModel: "auto/best-reasoning",
    keyPlaceholder: "sk-...",
    hint: "Local AI proxy running on port 20128. Run <code>omniroute serve</code>."
  },
  ollama: {
    id: "ollama",
    name: "Ollama (Free Local)",
    icon: "🦙",
    url: "http://localhost:11434/v1/chat/completions",
    modelsUrl: "http://localhost:11434/v1/models",
    apiKey: "ollama",
    defaultFastModel: "llama3.1",
    defaultReasoningModel: "llama3.1",
    keyPlaceholder: "Not required (leave empty or 'ollama')",
    hint: "100% free local offline AI. Run <code>ollama run llama3.1</code>."
  },
  nvidia: {
    id: "nvidia",
    name: "NVIDIA NIM (Free Credits)",
    icon: "🟢",
    url: "https://integrate.api.nvidia.com/v1/chat/completions",
    modelsUrl: "https://integrate.api.nvidia.com/v1/models",
    apiKey: "",
    defaultFastModel: "meta/llama-3.1-8b-instruct",
    defaultReasoningModel: "meta/llama-3.1-70b-instruct",
    keyPlaceholder: "nvapi-...",
    hint: "Get free inference credits from <b>build.nvidia.com</b> on signup."
  },
  groq: {
    id: "groq",
    name: "Groq (Ultra-Fast Free Tier)",
    icon: "🚀",
    url: "https://api.groq.com/openai/v1/chat/completions",
    modelsUrl: "https://api.groq.com/openai/v1/models",
    apiKey: "",
    defaultFastModel: "llama-3.3-70b-versatile",
    defaultReasoningModel: "llama-3.3-70b-versatile",
    keyPlaceholder: "gsk_...",
    hint: "Blazing fast inference with generous free rate limits at <b>console.groq.com</b>."
  },
  openrouter: {
    id: "openrouter",
    name: "OpenRouter (Free Models)",
    icon: "🌐",
    url: "https://openrouter.ai/api/v1/chat/completions",
    modelsUrl: "https://openrouter.ai/api/v1/models",
    apiKey: "",
    defaultFastModel: "google/gemini-2.0-flash-exp:free",
    defaultReasoningModel: "meta-llama/llama-3.3-70b-instruct:free",
    keyPlaceholder: "sk-or-v1-...",
    hint: "Provides free models with <code>:free</code> suffix at <b>openrouter.ai</b>."
  },
  gemini: {
    id: "gemini",
    name: "Google Gemini (Free Tier)",
    icon: "✨",
    url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    modelsUrl: "https://generativelanguage.googleapis.com/v1beta/openai/models",
    apiKey: "",
    defaultFastModel: "gemini-2.0-flash",
    defaultReasoningModel: "gemini-2.0-flash",
    keyPlaceholder: "AIzaSy...",
    hint: "Get a free API key at <b>aistudio.google.com</b>."
  },
  openai: {
    id: "openai",
    name: "OpenAI",
    icon: "🤖",
    url: "https://api.openai.com/v1/chat/completions",
    modelsUrl: "https://api.openai.com/v1/models",
    apiKey: "",
    defaultFastModel: "gpt-4o-mini",
    defaultReasoningModel: "gpt-4o",
    keyPlaceholder: "sk-...",
    hint: "Standard API key from <b>platform.openai.com</b>."
  },
  custom: {
    id: "custom",
    name: "Custom (OpenAI-compatible)",
    icon: "🛠️",
    url: "",
    modelsUrl: "",
    apiKey: "",
    defaultFastModel: "",
    defaultReasoningModel: "",
    keyPlaceholder: "API key (if needed)",
    hint: "Any OpenAI-compatible <code>/v1/chat/completions</code> endpoint."
  }
};

const SETTINGS_KEY = "automigo_ai_settings_v5";

function getDefaultSettings() {
  const providers = {};
  for (const pid in PROVIDER_PROFILES) {
    const p = PROVIDER_PROFILES[pid];
    providers[pid] = {
      url: p.url,
      modelsUrl: p.modelsUrl,
      apiKey: p.apiKey,
      fastModel: p.defaultFastModel,
      reasoningModel: p.defaultReasoningModel
    };
  }
  return { activeProvider: "omniroute", providers };
}

// Storage abstraction (chrome.storage.local with localStorage fallback)
async function getStoredSettings() {
  return new Promise((resolve) => {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([SETTINGS_KEY], (res) => {
        if (res && res[SETTINGS_KEY]) {
          const defaults = getDefaultSettings();
          resolve({
            activeProvider: res[SETTINGS_KEY].activeProvider || defaults.activeProvider,
            providers: Object.assign({}, defaults.providers, res[SETTINGS_KEY].providers || {})
          });
          return;
        }
        resolve(getDefaultSettings());
      });
    } else {
      try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          const defaults = getDefaultSettings();
          resolve({
            activeProvider: parsed.activeProvider || defaults.activeProvider,
            providers: Object.assign({}, defaults.providers, parsed.providers || {})
          });
          return;
        }
      } catch (e) {}
      resolve(getDefaultSettings());
    }
  });
}

async function saveStoredSettings(settings) {
  return new Promise((resolve) => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch(e) {}
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ [SETTINGS_KEY]: settings }, () => resolve());
    } else {
      resolve();
    }
  });
}

// UI Elements
const providerSelect = document.getElementById("provider-select");
const inputApiKey = document.getElementById("input-apikey");
const inputUrl = document.getElementById("input-url");
const inputFastModel = document.getElementById("input-fast-model");
const inputReasonModel = document.getElementById("input-reason-model");
const groupUrl = document.getElementById("group-url");
const providerHint = document.getElementById("provider-hint");
const bannerBadge = document.getElementById("banner-provider-badge");
const bannerModel = document.getElementById("banner-model-text");
const statusPill = document.getElementById("status-pill");
const statusPillText = document.getElementById("status-pill-text");
const resultBox = document.getElementById("test-result-box");
const btnTest = document.getElementById("btn-test");
const btnSave = document.getElementById("btn-save");
const toggleKeyBtn = document.getElementById("toggle-key-visibility");

let currentSettings = null;

// Populate dropdown options
function initProviderOptions() {
  providerSelect.innerHTML = "";
  for (const pid in PROVIDER_PROFILES) {
    const p = PROVIDER_PROFILES[pid];
    const opt = document.createElement("option");
    opt.value = pid;
    opt.textContent = `${p.icon} ${p.name}`;
    providerSelect.appendChild(opt);
  }
}

function updateFormFields(pid) {
  const profile = PROVIDER_PROFILES[pid] || PROVIDER_PROFILES.omniroute;
  const userCfg = (currentSettings.providers && currentSettings.providers[pid]) || {};

  inputApiKey.value = userCfg.apiKey !== undefined ? userCfg.apiKey : (profile.apiKey || "");
  inputApiKey.placeholder = profile.keyPlaceholder || "Enter API Key...";
  inputUrl.value = userCfg.url || profile.url || "";
  inputFastModel.value = userCfg.fastModel || profile.defaultFastModel || "";
  inputReasonModel.value = userCfg.reasoningModel || profile.defaultReasoningModel || "";
  providerHint.innerHTML = profile.hint || "";

  // Show endpoint URL input for custom, omniroute, or ollama
  if (pid === "custom" || pid === "omniroute" || pid === "ollama") {
    groupUrl.style.display = "flex";
  } else {
    groupUrl.style.display = "none";
  }
}

function updateBanner(pid) {
  const profile = PROVIDER_PROFILES[pid] || PROVIDER_PROFILES.omniroute;
  const userCfg = (currentSettings.providers && currentSettings.providers[pid]) || {};
  bannerBadge.textContent = `${profile.icon} ${profile.name}`;
  bannerModel.textContent = `Fast: ${userCfg.fastModel || profile.defaultFastModel} | Reasoning: ${userCfg.reasoningModel || profile.defaultReasoningModel}`;
}

function setStatusPill(state, text) {
  statusPill.className = `status-pill ${state}`;
  statusPillText.textContent = text;
}

function showResult(msg, isSuccess) {
  resultBox.textContent = msg;
  resultBox.className = `result-box ${isSuccess ? "success" : "error"}`;
}

async function testConnection(pid, customCfg) {
  const profile = PROVIDER_PROFILES[pid] || PROVIDER_PROFILES.omniroute;
  const url = (customCfg && customCfg.url) || profile.url;
  const apiKey = (customCfg && customCfg.apiKey !== undefined) ? customCfg.apiKey : profile.apiKey;
  const model = (customCfg && customCfg.fastModel) || profile.defaultFastModel || "default";

  if (!url) {
    return { ok: false, error: "Endpoint URL is required." };
  }

  const headers = { "Content-Type": "application/json" };
  if (apiKey && apiKey !== "ollama") {
    headers["Authorization"] = "Bearer " + apiKey;
  }
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
        messages: [{ role: "user", content: "Reply with: OK" }],
        temperature: 0,
        max_tokens: 5
      }),
      signal: AbortSignal.timeout(10000)
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      let msg = "HTTP " + resp.status;
      try {
        const ej = JSON.parse(errText);
        if (ej.error && ej.error.message) msg += ": " + ej.error.message;
      } catch (e) {
        if (errText) msg += ": " + errText.slice(0, 100);
      }
      return { ok: false, error: msg };
    }

    const data = await resp.json();
    return { ok: true, model: data.model || model };
  } catch (err) {
    return { ok: false, error: err.message || "Connection timeout" };
  }
}

// Initial Auto-detection for quick zero-config
async function autoDetectAndInit() {
  currentSettings = await getStoredSettings();

  // If active is omniroute or unset, check if Ollama is running locally instead
  if (currentSettings.activeProvider === "omniroute") {
    try {
      const r1 = await fetch("http://127.0.0.1:20128/v1/models", { signal: AbortSignal.timeout(800) });
      if (!r1.ok) throw new Error();
    } catch (e) {
      // OmniRoute not up, test Ollama
      try {
        const r2 = await fetch("http://localhost:11434/api/tags", { signal: AbortSignal.timeout(800) });
        if (r2.ok) {
          currentSettings.activeProvider = "ollama";
          await saveStoredSettings(currentSettings);
        }
      } catch (e2) {}
    }
  }

  initProviderOptions();
  providerSelect.value = currentSettings.activeProvider;
  updateFormFields(currentSettings.activeProvider);
  updateBanner(currentSettings.activeProvider);

  // Quick background verification
  setStatusPill("checking", "Testing...");
  testConnection(currentSettings.activeProvider, currentSettings.providers[currentSettings.activeProvider])
    .then((res) => {
      if (res.ok) {
        setStatusPill("online", "Connected");
      } else {
        setStatusPill("offline", "Offline");
      }
    });
}

// Event Listeners
providerSelect.addEventListener("change", (e) => {
  const pid = e.target.value;
  updateFormFields(pid);
  resultBox.style.display = "none";
});

toggleKeyBtn.addEventListener("click", () => {
  if (inputApiKey.type === "password") {
    inputApiKey.type = "text";
    toggleKeyBtn.textContent = "🔒";
  } else {
    inputApiKey.type = "password";
    toggleKeyBtn.textContent = "👁️";
  }
});

btnTest.addEventListener("click", async () => {
  const pid = providerSelect.value;
  const cfg = {
    apiKey: inputApiKey.value.trim(),
    url: inputUrl.value.trim(),
    fastModel: inputFastModel.value.trim(),
    reasoningModel: inputReasonModel.value.trim()
  };

  btnTest.disabled = true;
  btnTest.textContent = "Testing...";
  setStatusPill("checking", "Testing...");
  resultBox.style.display = "none";

  const res = await testConnection(pid, cfg);
  btnTest.disabled = false;
  btnTest.textContent = "🧪 Test Connection";

  if (res.ok) {
    setStatusPill("online", "Connected");
    showResult(`✓ Connected successfully! Model: ${res.model}`, true);
  } else {
    setStatusPill("offline", "Failed");
    showResult(`✗ Connection failed: ${res.error}`, false);
  }
});

btnSave.addEventListener("click", async () => {
  const pid = providerSelect.value;
  currentSettings.activeProvider = pid;
  if (!currentSettings.providers[pid]) currentSettings.providers[pid] = {};

  currentSettings.providers[pid].apiKey = inputApiKey.value.trim();
  currentSettings.providers[pid].url = inputUrl.value.trim();
  currentSettings.providers[pid].fastModel = inputFastModel.value.trim();
  currentSettings.providers[pid].reasoningModel = inputReasonModel.value.trim();

  btnSave.disabled = true;
  btnSave.textContent = "Saving...";
  await saveStoredSettings(currentSettings);
  btnSave.disabled = false;
  btnSave.textContent = "💾 Save Settings";

  updateBanner(pid);
  showResult("✓ Settings saved! Active AI updated across all tabs.", true);

  // Ping connection in background
  testConnection(pid, currentSettings.providers[pid]).then(res => {
    if (res.ok) setStatusPill("online", "Connected");
    else setStatusPill("offline", "Offline");
  });
});

document.addEventListener("DOMContentLoaded", autoDetectAndInit);

