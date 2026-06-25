"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => ObsideepseekPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var VIEW_TYPE = "obsideepseek-chat-view";
var DEEPSEEK_API_BASE = "https://api.deepseek.com/v1";
var PLUGIN_DATA_DIR = ".obsideepseek";
var SESSIONS_DIR = `${PLUGIN_DATA_DIR}/sessions`;
var DEFAULT_SAVE_PATH = "DeepSeek Sync/Conversations";
var DOMAINS = {
  "00": { label: "AI", path: "11_Raw/AI/", keywords: ["ai", "\u4EBA\u5DE5\u667A\u80FD", "llm", "gpt", "deepseek", "codex", "claude", "openai", "\u6A21\u578B", "\u7B97\u6CD5", "\u7F16\u7A0B", "python", "\u4EE3\u7801", "machine learning", "neural"] },
  "01": { label: "Fashion", path: "11_Raw/Fashion/", keywords: ["fashion", "\u65F6\u5C1A", "\u897F\u88C5", "bespoke", "suit", "\u9762\u6599", "\u5B9A\u5236", "\u670D\u88C5", "\u7A7F\u642D", "tailor", "\u7248\u578B", "cloth"] },
  "02": { label: "Esoteric", path: "11_Raw/Esoteric/", keywords: ["esoteric", "\u7384\u5B66", "\u547D\u7406", "\u98CE\u6C34", "\u516B\u5B57", "\u6613\u7ECF", "\u5360\u535C", "\u661F\u76D8", "\u5854\u7F57", "\u795E\u79D8\u5B66", "tarot", "astrology"] },
  "03": { label: "TCM", path: "11_Raw/TCM/", keywords: ["tcm", "\u4E2D\u533B", "\u4E2D\u836F", "\u9488\u7078", "\u7ECF\u7EDC", "\u6C14\u8840", "\u4E94\u810F", "\u65B9\u5242", "\u517B\u751F", "\u8109\u8BCA", "acupuncture", "herbal"] },
  "05": { label: "Stocks", path: "11_Raw/Stocks/", keywords: ["stock", "\u80A1\u7968", "\u6295\u8D44", "\u57FA\u91D1", "\u7406\u8D22", "A\u80A1", "\u6E2F\u80A1", "\u7F8E\u80A1", "\u91CF\u5316", "\u4EA4\u6613", "k\u7EBF", "market", "trade"] }
};
var DEFAULT_SETTINGS = {
  apiKey: "",
  model: "deepseek-chat",
  temperature: 0.7,
  maxTokens: 4096,
  autoSave: true,
  savePath: DEFAULT_SAVE_PATH,
  exportPath: "11_Raw/Journal",
  enableDomainClassification: true,
  systemPrompt: "You are a knowledgeable assistant. Answer the user's questions thoroughly and helpfully."
};
var ObsideepseekPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
    this.currentSession = null;
  }
  async onload() {
    await this.loadSettings();
    await this.ensureDataDirs();
    this.registerView(VIEW_TYPE, (leaf) => new ObsideepseekChatView(leaf, this));
    this.addRibbonIcon("message-square", "Obsideepseek", () => this.activateView());
    this.addCommand({
      id: "open-obsideepseek-chat",
      name: "\u6253\u5F00 DeepSeek \u804A\u5929",
      callback: () => this.activateView()
    });
    this.addCommand({
      id: "obsideepseek-export-current",
      name: "\u5BFC\u51FA\u5F53\u524D\u5BF9\u8BDD\u5230\u77E5\u8BC6\u5E93",
      callback: () => this.exportCurrentSession()
    });
    this.addCommand({
      id: "obsideepseek-new-session",
      name: "\u65B0\u5EFA DeepSeek \u5BF9\u8BDD",
      callback: () => this.newSession()
    });
    this.addSettingTab(new ObsideepseekSettingTab(this.app, this));
  }
  onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE);
  }
  // ─── Data Directory ──────────────────────────────────────
  async ensureDataDirs() {
    for (const dir of [PLUGIN_DATA_DIR, SESSIONS_DIR]) {
      const exists = this.app.vault.getAbstractFileByPath(dir);
      if (!exists) {
        await this.app.vault.createFolder(dir);
      }
    }
  }
  // ─── Session Management ──────────────────────────────────
  getCurrentSession() {
    return this.currentSession;
  }
  setCurrentSession(s) {
    this.currentSession = s;
  }
  async newSession() {
    const session = {
      id: generateId(),
      title: `\u5BF9\u8BDD_${(0, import_obsidian.moment)().format("YYYYMMDD_HHmmss")}`,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: this.settings.model
    };
    this.currentSession = session;
    await this.saveSessionToDataDir(session);
    return session;
  }
  async saveSessionToDataDir(session) {
    try {
      const path = `${SESSIONS_DIR}/${session.id}.json`;
      const existing = this.app.vault.getAbstractFileByPath(path);
      const content = JSON.stringify(session, null, 2);
      if (existing instanceof import_obsidian.TFile) {
        await this.app.vault.modify(existing, content);
      } else {
        await this.app.vault.create(path, content);
      }
    } catch (err) {
      console.error("Failed to save session:", err);
    }
  }
  async loadSessionHistory() {
    const sessions = [];
    try {
      const folder = this.app.vault.getAbstractFileByPath(SESSIONS_DIR);
      if (!folder) return sessions;
      const files = await this.app.vault.getAllLoadedFiles();
      const sessionFiles = files.filter(
        (f) => f.path.startsWith(SESSIONS_DIR + "/") && f.path.endsWith(".json")
      );
      for (const f of sessionFiles) {
        try {
          const content = await this.app.vault.read(f);
          sessions.push(JSON.parse(content));
        } catch {
        }
      }
    } catch {
    }
    return sessions.sort((a, b) => b.updatedAt - a.updatedAt);
  }
  // ─── Settings ────────────────────────────────────────────
  async loadSettings() {
    const saved = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, saved);
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  // ─── Domain Classification ───────────────────────────────
  classifyDomain(text) {
    if (!this.settings.enableDomainClassification) return "99";
    const lower = text.toLowerCase();
    const scores = {};
    let esotericScore = 0, tcmScore = 0;
    for (const [code, info] of Object.entries(DOMAINS)) {
      let score = 0;
      for (const kw of info.keywords) {
        const re = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
        const matches = lower.match(re);
        score += matches ? matches.length : 0;
      }
      scores[code] = score;
      if (code === "02") esotericScore = score;
      if (code === "03") tcmScore = score;
    }
    if (esotericScore >= 2 && tcmScore >= 2) return "04";
    let best = "99", bestScore = 0;
    for (const [code, score] of Object.entries(scores)) {
      if (score > bestScore) {
        best = code;
        bestScore = score;
      }
    }
    return best;
  }
  // ─── API ─────────────────────────────────────────────────
  async sendMessage(messages) {
    if (!this.settings.apiKey) {
      throw new Error("\u8BF7\u5148\u5728\u8BBE\u7F6E\u4E2D\u586B\u5165 DeepSeek API Key");
    }
    const apiMessages = [
      { role: "system", content: this.settings.systemPrompt },
      ...messages.filter((m) => m.role !== "system").map((m) => ({
        role: m.role,
        content: m.content
      }))
    ];
    try {
      const resp = await (0, import_obsidian.requestUrl)({
        url: `${DEEPSEEK_API_BASE}/chat/completions`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.settings.apiKey}`
        },
        body: JSON.stringify({
          model: this.settings.model,
          messages: apiMessages,
          temperature: this.settings.temperature,
          max_tokens: this.settings.maxTokens,
          stream: false
        })
      });
      const data = resp.json;
      if (data.error) throw new Error(data.error.message || "API Error");
      return data.choices?.[0]?.message?.content || "";
    } catch (err) {
      console.error("DeepSeek API error:", err);
      throw err;
    }
  }
  // ─── Export ──────────────────────────────────────────────
  async exportCurrentSession() {
    const session = this.currentSession;
    if (!session || session.messages.length === 0) {
      new import_obsidian.Notice("\u274C \u6CA1\u6709\u53EF\u5BFC\u51FA\u7684\u5BF9\u8BDD");
      return;
    }
    await this.exportSession(session);
  }
  async exportSession(session, customPath) {
    try {
      const targetDir = customPath || this.settings.exportPath;
      let domain = "99";
      if (this.settings.enableDomainClassification) {
        domain = this.classifyDomain(session.messages.map((m) => m.content).join("\n"));
      }
      session.domain = domain;
      let saveDir = targetDir;
      const domainInfo = DOMAINS[domain];
      if (domainInfo) {
        const domainFolder = this.app.vault.getAbstractFileByPath(domainInfo.path);
        if (domainFolder) {
          saveDir = domainInfo.path;
        }
      }
      const domainLabel = DOMAINS[domain]?.label ?? (domain === "04" ? "Journal" : "General");
      const frontmatter = [
        "---",
        `title: "${session.title}"`,
        `created: ${(0, import_obsidian.moment)(session.createdAt).format("YYYY-MM-DD HH:mm:ss")}`,
        `updated: ${(0, import_obsidian.moment)(session.updatedAt).format("YYYY-MM-DD HH:mm:ss")}`,
        `domain: "${domainLabel}"`,
        `model: "${session.model}"`,
        `messages: ${session.messages.length}`,
        `source: "obsideepseek"`,
        "---",
        ""
      ].join("\n");
      const bodyParts = [
        `# ${session.title}`,
        "",
        `> \u6A21\u578B: ${session.model} | \u65E5\u671F: ${(0, import_obsidian.moment)(session.createdAt).format("YYYY-MM-DD HH:mm")} | \u9886\u57DF: ${domainLabel}`,
        ""
      ];
      for (const msg of session.messages) {
        if (msg.role === "system") continue;
        const roleEmoji = msg.role === "user" ? "\u{1F464}" : "\u{1F916}";
        const timeStr = msg.timestamp ? (0, import_obsidian.moment)(msg.timestamp).format("HH:mm:ss") : "";
        bodyParts.push(`### ${roleEmoji} ${msg.role === "user" ? "User" : "DeepSeek"} ${timeStr}`);
        bodyParts.push("");
        bodyParts.push(msg.content);
        bodyParts.push("");
        bodyParts.push("---");
        bodyParts.push("");
      }
      const content = frontmatter + bodyParts.join("\n");
      await this.ensureDirectory(saveDir);
      const filename = `${(0, import_obsidian.moment)().format("YYYY-MM-DD")}-${session.id}.md`;
      const fullPath = (0, import_obsidian.normalizePath)(`${saveDir}/${filename}`);
      const existing = this.app.vault.getAbstractFileByPath(fullPath);
      if (existing instanceof import_obsidian.TFile) {
        await this.app.vault.modify(existing, content);
      } else {
        await this.app.vault.create(fullPath, content);
      }
      new import_obsidian.Notice(`\u2705 \u5DF2\u5BFC\u51FA: ${fullPath}`);
      return fullPath;
    } catch (err) {
      console.error("Export error:", err);
      new import_obsidian.Notice("\u274C \u5BFC\u51FA\u5931\u8D25: " + err.message);
      return null;
    }
  }
  async exportAllSessions() {
    try {
      const sessions = await this.loadSessionHistory();
      if (sessions.length === 0) {
        new import_obsidian.Notice("\u274C \u6CA1\u6709\u5386\u53F2\u5BF9\u8BDD\u53EF\u5BFC\u51FA");
        return;
      }
      let exported = 0;
      for (const s of sessions) {
        const result = await this.exportSession(s);
        if (result) exported++;
      }
      new import_obsidian.Notice(`\u2705 \u5DF2\u5BFC\u51FA ${exported}/${sessions.length} \u6761\u5BF9\u8BDD`);
    } catch (err) {
      new import_obsidian.Notice("\u274C \u6279\u91CF\u5BFC\u51FA\u5931\u8D25: " + err.message);
    }
  }
  async ensureDirectory(path) {
    const parts = path.replace(/\\/g, "/").split("/").filter((p) => p.length > 0);
    let current = "";
    for (const part of parts) {
      if (current) current += "/";
      current += part;
      const folder = this.app.vault.getAbstractFileByPath(current);
      if (!folder) {
        await this.app.vault.createFolder(current);
      }
    }
  }
  // ─── Auto-save ──────────────────────────────────────────
  async autoSaveSession() {
    if (this.settings.autoSave && this.currentSession) {
      await this.saveSessionToDataDir(this.currentSession);
    }
  }
};
var ObsideepseekChatView = class extends import_obsidian.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.isLoading = false;
    this.plugin = plugin;
  }
  getViewType() {
    return VIEW_TYPE;
  }
  getDisplayText() {
    return "Obsideepseek";
  }
  getIcon() {
    return "message-square";
  }
  async onOpen() {
    const container = this.containerEl;
    container.empty();
    container.addClass("obsideepseek-container");
    const header = container.createDiv({ cls: "obsideepseek-header" });
    header.createEl("h3", { text: "\u{1F9E0} Obsideepseek" });
    const headerBtns = header.createDiv({ cls: "obsideepseek-header-buttons" });
    const newBtn = headerBtns.createEl("button", { cls: "obsideepseek-btn", text: "\u65B0\u5EFA" });
    newBtn.addEventListener("click", () => this.newSession());
    const exportBtn = headerBtns.createEl("button", { cls: "obsideepseek-btn", text: "\u5BFC\u51FA" });
    exportBtn.addEventListener("click", () => this.plugin.exportCurrentSession());
    this.statusEl = container.createDiv({ cls: "obsideepseek-status" });
    this.updateStatus("\u5C31\u7EEA");
    this.messagesEl = container.createDiv({ cls: "obsideepseek-messages" });
    this.showWelcome();
    const inputContainer = container.createDiv({ cls: "obsideepseek-input-container" });
    this.inputEl = inputContainer.createEl("textarea", {
      cls: "obsideepseek-input",
      attr: { placeholder: "\u8F93\u5165\u6D88\u606F... (Enter \u53D1\u9001, Shift+Enter \u6362\u884C)", rows: "3" }
    });
    const inputBtns = inputContainer.createDiv({ cls: "obsideepseek-input-buttons" });
    this.sendBtn = inputBtns.createEl("button", {
      cls: "obsideepseek-btn obsideepseek-btn-primary",
      text: "\u53D1\u9001"
    });
    this.sendBtn.addEventListener("click", () => this.handleSend());
    this.inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.handleSend();
      }
    });
    await this.plugin.newSession();
  }
  showWelcome() {
    this.messagesEl.empty();
    const w = this.messagesEl.createDiv({ cls: "obsideepseek-welcome" });
    w.innerHTML = `
      <div class="obsideepseek-welcome-icon">\u{1F9E0}</div>
      <div class="obsideepseek-welcome-title">Obsideepseek</div>
      <div class="obsideepseek-welcome-text">
        \u4E0E DeepSeek \u5BF9\u8BDD\uFF0C\u81EA\u52A8\u4FDD\u5B58\u5230 <code>.obsideepseek/sessions/</code><br>
        \u901A\u8FC7\u8BBE\u7F6E\u9875\u7684\u300C\u5BFC\u51FA\u5230\u77E5\u8BC6\u5E93\u300D\u529F\u80FD\u5F52\u6863\u5230\u6307\u5B9A\u76EE\u5F55\u3002
      </div>
      <div class="obsideepseek-welcome-tips">
        <div>\u{1F4A1} Enter \u53D1\u9001 \xB7 Shift+Enter \u6362\u884C</div>
        <div>\u{1F4E4} \u70B9\u51FB\u300C\u5BFC\u51FA\u300D\u6216\u4F7F\u7528\u547D\u4EE4\u9762\u677F</div>
      </div>
    `;
  }
  async newSession() {
    await this.plugin.newSession();
    this.messagesEl.empty();
    this.showWelcome();
    this.inputEl.value = "";
    this.inputEl.focus();
    this.updateStatus("\u65B0\u5EFA\u5BF9\u8BDD");
  }
  async handleSend() {
    if (this.isLoading) return;
    const text = this.inputEl.value.trim();
    if (!text) return;
    let session = this.plugin.getCurrentSession();
    if (!session) session = await this.plugin.newSession();
    const userMsg = { role: "user", content: text, timestamp: Date.now() };
    session.messages.push(userMsg);
    session.updatedAt = Date.now();
    this.renderMessage(userMsg);
    this.inputEl.value = "";
    this.scrollBottom();
    this.isLoading = true;
    this.sendBtn.setText("\u53D1\u9001\u4E2D...");
    this.sendBtn.addClass("disabled");
    this.updateStatus("\u{1F914} DeepSeek \u601D\u8003\u4E2D...");
    this.showLoading();
    try {
      const response = await this.plugin.sendMessage(
        session.messages.filter((m) => m.role !== "system")
      );
      const assistantMsg = { role: "assistant", content: response, timestamp: Date.now() };
      session.messages.push(assistantMsg);
      session.updatedAt = Date.now();
      if (session.messages.filter((m) => m.role === "user").length === 1) {
        const first = session.messages.find((m) => m.role === "user")?.content || "";
        session.title = first.length > 40 ? first.substring(0, 40) + "\u2026" : first;
      }
      this.removeLoading();
      this.renderMessage(assistantMsg);
      this.scrollBottom();
      this.updateStatus("\u5C31\u7EEA");
      await this.plugin.autoSaveSession();
      if (this.plugin.settings.autoSave) this.updateStatus("\u2705 \u5DF2\u4FDD\u5B58");
    } catch (err) {
      this.removeLoading();
      const msg = err.message || "\u672A\u77E5\u9519\u8BEF";
      this.renderError(msg);
      this.updateStatus("\u274C \u9519\u8BEF");
      new import_obsidian.Notice(`Obsideepseek \u9519\u8BEF: ${msg}`);
    } finally {
      this.isLoading = false;
      this.sendBtn.setText("\u53D1\u9001");
      this.sendBtn.removeClass("disabled");
      this.inputEl.focus();
    }
  }
  renderMessage(msg) {
    const isUser = msg.role === "user";
    const div = this.messagesEl.createDiv({ cls: `obsideepseek-message ${isUser ? "user" : "assistant"}` });
    div.createDiv({ cls: "obsideepseek-avatar" }).textContent = isUser ? "\u{1F464}" : "\u{1F9E0}";
    const bubble = div.createDiv({ cls: "obsideepseek-bubble" });
    bubble.createDiv({ cls: "obsideepseek-bubble-header" }).textContent = `${isUser ? "You" : "DeepSeek"} \xB7 ${msg.timestamp ? (0, import_obsidian.moment)(msg.timestamp).format("HH:mm") : ""}`;
    const content = bubble.createDiv({ cls: "obsideepseek-bubble-content" });
    content.innerHTML = this.formatMessage(msg.content);
  }
  renderError(text) {
    const div = this.messagesEl.createDiv({ cls: "obsideepseek-message error" });
    div.createDiv({ cls: "obsideepseek-avatar" }).textContent = "\u26A0\uFE0F";
    const bubble = div.createDiv({ cls: "obsideepseek-bubble error" });
    bubble.createEl("strong", { text: "\u9519\u8BEF" });
    bubble.createEl("br");
    bubble.createSpan({ text });
  }
  showLoading() {
    const div = this.messagesEl.createDiv({ cls: "obsideepseek-message assistant" });
    div.id = "obsideepseek-loading";
    div.createDiv({ cls: "obsideepseek-avatar" }).textContent = "\u{1F9E0}";
    div.createDiv({ cls: "obsideepseek-bubble" }).innerHTML = '<div class="obsideepseek-loading"><span></span><span></span><span></span></div>';
  }
  removeLoading() {
    document.getElementById("obsideepseek-loading")?.remove();
  }
  formatMessage(text) {
    let s = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    s = s.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    s = s.replace(/\n/g, "<br>");
    return s;
  }
  scrollBottom() {
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  }
  updateStatus(t) {
    this.statusEl.textContent = t;
  }
};
var ObsideepseekSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "\u{1F9E0} Obsideepseek \u8BBE\u7F6E" });
    containerEl.createEl("p", {
      text: "DeepSeek API \u96C6\u6210 \u2014 \u5BF9\u8BDD\u81EA\u52A8\u4FDD\u5B58\u5728 .obsideepseek/sessions/\uFF0C\u901A\u8FC7\u5BFC\u51FA\u529F\u80FD\u5F52\u6863\u5230\u77E5\u8BC6\u5E93\u3002",
      cls: "setting-item-description"
    });
    new import_obsidian.Setting(containerEl).setName("API Key").setDesc("DeepSeek API \u5BC6\u94A5 (https://platform.deepseek.com)").addText(
      (t) => t.setPlaceholder("sk-...").setValue(this.plugin.settings.apiKey).onChange(async (v) => {
        this.plugin.settings.apiKey = v;
        await this.plugin.saveSettings();
      })
    );
    this.containerEl.querySelectorAll(".setting-item input").forEach((el) => {
      const input = el;
      if (input.placeholder === "sk-...") input.type = "password";
    });
    new import_obsidian.Setting(containerEl).setName("\u6A21\u578B").setDesc("DeepSeek \u6A21\u578B\u9009\u62E9").addDropdown(
      (d) => d.addOption("deepseek-chat", "DeepSeek V3 (deepseek-chat)").addOption("deepseek-reasoner", "DeepSeek R1 (deepseek-reasoner)").setValue(this.plugin.settings.model).onChange(async (v) => {
        this.plugin.settings.model = v;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Temperature").setDesc("\u521B\u610F\u7A0B\u5EA6 (0.0\u20132.0)").addSlider(
      (sl) => sl.setLimits(0, 200, 5).setValue(Math.round(this.plugin.settings.temperature * 100)).setDynamicTooltip().onChange(async (v) => {
        this.plugin.settings.temperature = v / 100;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("\u6700\u5927 Token \u6570").addText(
      (t) => t.setPlaceholder("4096").setValue(String(this.plugin.settings.maxTokens)).onChange(async (v) => {
        const n = parseInt(v);
        if (!isNaN(n) && n > 0) {
          this.plugin.settings.maxTokens = n;
          await this.plugin.saveSettings();
        }
      })
    );
    containerEl.createEl("h3", { text: "\u{1F4BE} \u81EA\u52A8\u4FDD\u5B58" });
    new import_obsidian.Setting(containerEl).setName("\u81EA\u52A8\u4FDD\u5B58\u4F1A\u8BDD").setDesc("\u6BCF\u6B21\u5BF9\u8BDD\u540E\u81EA\u52A8\u4FDD\u5B58\u5230 .obsideepseek/sessions/").addToggle(
      (t) => t.setValue(this.plugin.settings.autoSave).onChange(async (v) => {
        this.plugin.settings.autoSave = v;
        await this.plugin.saveSettings();
      })
    );
    containerEl.createEl("h3", { text: "\u{1F4E4} \u5BFC\u51FA\u5230\u77E5\u8BC6\u5E93" });
    containerEl.createEl("p", {
      text: "\u5C06\u4F1A\u8BDD\uFF08JSON\uFF09\u5BFC\u51FA\u4E3A Markdown \u6587\u4EF6\u5230\u77E5\u8BC6\u5E93\u6307\u5B9A\u76EE\u5F55\u3002",
      cls: "setting-item-description"
    });
    new import_obsidian.Setting(containerEl).setName("\u5BFC\u51FA\u8DEF\u5F84").setDesc("Markdown \u6587\u4EF6\u7684\u4FDD\u5B58\u76EE\u5F55\uFF08\u76F8\u5BF9\u4ED3\u5E93\u6839\u8DEF\u5F84\uFF09").addText(
      (t) => t.setPlaceholder("11_Raw/Journal").setValue(this.plugin.settings.exportPath).onChange(async (v) => {
        this.plugin.settings.exportPath = v;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("\u9886\u57DF\u81EA\u52A8\u5206\u7C7B").setDesc("\u5BFC\u51FA\u65F6\u6839\u636E\u5173\u952E\u8BCD\u81EA\u52A8\u5206\u914D\u5230\u5BF9\u5E94\u9886\u57DF\u76EE\u5F55").addToggle(
      (t) => t.setValue(this.plugin.settings.enableDomainClassification).onChange(async (v) => {
        this.plugin.settings.enableDomainClassification = v;
        await this.plugin.saveSettings();
      })
    );
    const exportSection = containerEl.createDiv({ cls: "obsideepseek-export-section" });
    new import_obsidian.Setting(exportSection).setName("\u5BFC\u51FA\u5F53\u524D\u5BF9\u8BDD").setDesc("\u5C06\u5F53\u524D\u804A\u5929\u7684\u5185\u5BB9\u5BFC\u51FA\u4E3A Markdown").addButton(
      (btn) => btn.setButtonText("\u{1F4E4} \u5BFC\u51FA").setCta().onClick(() => this.plugin.exportCurrentSession())
    );
    new import_obsidian.Setting(exportSection).setName("\u6279\u91CF\u5BFC\u51FA\u6240\u6709\u4F1A\u8BDD").setDesc("\u5C06 .obsideepseek/sessions/ \u4E2D\u6240\u6709\u5386\u53F2\u4F1A\u8BDD\u5BFC\u51FA").addButton(
      (btn) => btn.setButtonText("\u{1F4E4} \u5168\u90E8\u5BFC\u51FA").onClick(() => this.plugin.exportAllSessions())
    );
    containerEl.createEl("h3", { text: "\u{1F3F7}\uFE0F \u9886\u57DF\u76EE\u5F55\u6620\u5C04" });
    containerEl.createEl("p", {
      text: "\u5F00\u542F\u9886\u57DF\u5206\u7C7B\u540E\uFF0C\u5BFC\u51FA\u65F6\u5C06\u81EA\u52A8\u5339\u914D\u4EE5\u4E0B\u76EE\u5F55",
      cls: "setting-item-description"
    });
    const tbl = containerEl.createEl("table", { cls: "obsideepseek-domain-table" });
    tbl.createEl("thead").innerHTML = "<tr><th>\u4EE3\u7801</th><th>\u9886\u57DF</th><th>\u8DEF\u5F84</th></tr>";
    const tb = tbl.createEl("tbody");
    for (const [code, info] of Object.entries(DOMAINS)) {
      const r2 = tb.insertRow();
      r2.insertCell().textContent = code;
      r2.insertCell().textContent = info.label;
      r2.insertCell().textContent = info.path;
    }
    const r = tb.insertRow();
    r.insertCell().textContent = "99";
    r.insertCell().textContent = "General";
    r.insertCell().textContent = "\uFF08\u5BFC\u51FA\u8DEF\u5F84\u8BBE\u7F6E\uFF09";
    containerEl.createEl("h3", { text: "\u2699\uFE0F \u7CFB\u7EDF\u63D0\u793A\u8BCD" });
    new import_obsidian.Setting(containerEl).setName("System Prompt").setDesc("\u8BBE\u5B9A DeepSeek \u7684\u89D2\u8272\u548C\u884C\u4E3A").addTextArea(
      (t) => t.setPlaceholder("You are a helpful assistant...").setValue(this.plugin.settings.systemPrompt).onChange(async (v) => {
        this.plugin.settings.systemPrompt = v;
        await this.plugin.saveSettings();
      })
    );
    containerEl.createEl("h3", { text: "\u{1F4C2} \u6570\u636E\u76EE\u5F55" });
    containerEl.createEl("p", {
      text: "\u4F1A\u8BDD JSON \u6587\u4EF6\u4FDD\u5B58\u5728\u4ED3\u5E93\u6839\u76EE\u5F55\u7684 .obsideepseek/sessions/ \u4E2D\uFF08\u7C7B\u4F3C .claudian \u7ED3\u6784\uFF09",
      cls: "setting-item-description"
    });
  }
};
function generateId() {
  return `${(0, import_obsidian.moment)().format("YYYYMMDDHHmmss")}-${Math.random().toString(36).substring(2, 10)}`;
}
