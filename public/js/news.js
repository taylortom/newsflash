class Feed extends HTMLElement {
  constructor() {
    super();
    this.init();
  }
  async init() {
    this.config = await this.fetch('config');
    this.settings = await this.fetch('settings');
    this.userSettings = this.getStoredSettings();

    this.attachShadow({ mode: 'open' });
    await this.renderPage();
    await this.renderItems();
    // start render loop
    setInterval(() => this.renderItems(), this.config.updateInterval ?? 300000);
  }
  getStoredSettings() {
    try {
      return JSON.parse(localStorage.getItem('newsflash-settings') || '{}');
    } catch {
      return {};
    }
  }
  saveSettings(settings) {
    localStorage.setItem('newsflash-settings', JSON.stringify(settings));
  }
  async renderPage() {
    const urlTheme = new URLSearchParams(window.location.search).get('theme') || '';
    const activeTheme = urlTheme || this.userSettings.theme || '';
    this.page = this.createEl({
      type: 'div',
      attributes: { class: `page ${activeTheme}`.trim() },
      html: `
        <style>@import "css/news.css";</style>
        <header>
          <div class="inner">
            <span class="title">${this.config.name}</span>
            <span id="date" class="date">Updated at <span id="timestamp"></span></span>
            <div id="loading" class="display-none"><div></div><div></div><div></div><div></div></div>
            <button id="settings-btn" class="settings-btn" title="Settings"><span class="fa-solid fa-gear"></span></button>
          </div>
        </header>
      `
    });
    this.shadowRoot.append(this.page);
    this.page.querySelector('#settings-btn').addEventListener('click', () => this.openSettings());

    this.settingsPanel = this.createEl({
      type: 'div',
      attributes: { class: 'settings-overlay display-none' }
    });
    this.settingsPanel.innerHTML = `
      <div class="settings-panel">
        <div class="settings-header">
          <span>Settings</span>
          <button class="settings-close"><span class="fa-solid fa-xmark"></span></button>
        </div>
        <div class="settings-body">
          ${this.renderSettingsContent()}
        </div>
      </div>
    `;
    this.page.append(this.settingsPanel);
    this.settingsPanel.querySelector('.settings-close').addEventListener('click', () => this.closeSettings());
    this.settingsPanel.addEventListener('click', e => { if (e.target === this.settingsPanel) this.closeSettings(); });
    this.setupSettingsListeners();
  }
  renderSettingsContent() {
    const { themes = [], categories = [], feeds = [] } = this.settings || {};
    const { disabledCategories = [], disabledFeeds = [], theme: storedTheme = '' } = this.userSettings;
    const themeOptions = themes.map(t =>
      `<option value="${t.value}"${storedTheme === t.value ? ' selected' : ''}>${t.label}</option>`
    ).join('');
    const categoryItems = categories.map(c =>
      `<label class="settings-item">
        <input type="checkbox" name="category" value="${c}"${!disabledCategories.includes(c) ? ' checked' : ''}>
        <span>${this.capitalize(c)}</span>
      </label>`
    ).join('');
    const feedItems = feeds.map(f =>
      `<label class="settings-item">
        <input type="checkbox" name="feed" value="${f.name}"${!disabledFeeds.includes(f.name) ? ' checked' : ''}>
        <span>${f.name}</span>
      </label>`
    ).join('');
    return `
      <section class="settings-section">
        <h3 class="settings-section-title">Theme</h3>
        <select id="settings-theme" class="settings-select">${themeOptions}</select>
      </section>
      <section class="settings-section">
        <h3 class="settings-section-title">Categories</h3>
        <div class="settings-list">${categoryItems}</div>
      </section>
      <section class="settings-section">
        <h3 class="settings-section-title">Feeds</h3>
        <div class="settings-list">${feedItems}</div>
      </section>
    `;
  }
  setupSettingsListeners() {
    const themeSelect = this.settingsPanel.querySelector('#settings-theme');
    if (themeSelect) {
      themeSelect.addEventListener('change', e => {
        this.userSettings.theme = e.target.value;
        this.saveSettings(this.userSettings);
        this.page.className = `page ${this.userSettings.theme}`.trim();
      });
    }
    this.settingsPanel.querySelectorAll('input[name="category"]').forEach(cb => {
      cb.addEventListener('change', () => {
        this.userSettings.disabledCategories = Array.from(
          this.settingsPanel.querySelectorAll('input[name="category"]:not(:checked)')
        ).map(el => el.value);
        this.saveSettings(this.userSettings);
        if (this._newsData) this._applyFiltersAndRender(this._newsData);
      });
    });
    this.settingsPanel.querySelectorAll('input[name="feed"]').forEach(cb => {
      cb.addEventListener('change', () => {
        this.userSettings.disabledFeeds = Array.from(
          this.settingsPanel.querySelectorAll('input[name="feed"]:not(:checked)')
        ).map(el => el.value);
        this.saveSettings(this.userSettings);
        if (this._newsData) this._applyFiltersAndRender(this._newsData);
      });
    });
  }
  openSettings() {
    this.settingsPanel.classList.remove('display-none');
  }
  closeSettings() {
    this.settingsPanel.classList.add('display-none');
  }
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  async renderItems() {
    this.showLoading();
    const data = await this.fetch('news');
    if(!data) {
      return;
    }
    this._newsData = data;
    this._applyFiltersAndRender(data);
  }
  _applyFiltersAndRender(data) {
    const { disabledCategories = [], disabledFeeds = [] } = this.userSettings;
    const filteredItems = data.items.filter(item =>
      !disabledCategories.includes(item.type) && !disabledFeeds.includes(item.feed)
    );
    // clear out previous items before rendering
    this.shadowRoot.getElementById('items')?.remove();

    const items = this.createEl({ type: 'div', attributes: { id: 'items', class: 'items' } });
    filteredItems.forEach(({ title, description, feed, published, created, link, type }) => {
      let extraHtml = '';
      if(feed === 'Hacker News') {
        const match = description?.match(`href="(.+)"`);
        if (match) extraHtml = `<a href="${match[1]}" target="_blank">Comments</a>`;
      }
      items.appendChild(this.createEl({
        type: 'div',
        attributes: { class: `feed-item ${type}` },
        html: `
          <div class="title"><a href="${link}" target="_blank">${title}</a></div>
          <div class="metadata">
            <span class="icon fa-solid fa-${this.typeToIcon(type)}"></span>
            <div class="feed">${feed}</div>
            <div class="date">${this.formatDate(published ?? created)}</div>
            ${extraHtml}
          </div>
        `
      }));
    });
    const timestamp = this.shadowRoot.getElementById('timestamp');
    if(timestamp) timestamp.innerHTML = this.formatDate(Date.now());

    this.showLoading(false);

    this.page.append(items);
  }
  createEl({ type, attributes={}, html }) {
    const el = document.createElement(type);
    Object.entries(attributes).forEach(([k,v]) => el.setAttribute(k,v));
    if(html) el.innerHTML = html;
    return el;
  }
  showLoading(showLoading = true) {
    const date = this.shadowRoot.getElementById('date');
    const loader = this.shadowRoot.getElementById('loading');
    const hiddenClass = 'display-none';
    date.classList[showLoading ? 'add' : 'remove'](hiddenClass);
    loader.classList[showLoading ? 'remove' : 'add'](hiddenClass);
  }
  formatDate(d) {
    if(Number.isInteger(d)) d = new Date(d);
    return `${d.toDateString()}, ${d.toTimeString().slice(0,5)}`;
  }
  typeToIcon(type) {
    switch(type) {
      case 'code': return 'code';
      case 'coffee': return 'mug-hot';
      case 'gaming': return 'gamepad';
      case 'guitar': return 'guitar';
      case 'movies': return 'ticket';
      case 'music': return 'headphones-simple';
      case 'skate': return 'circle-dot';  
      case 'sport': return 'futbol';
      case 'watches': return 'clock';
      case 'world': return 'earth';
      default: return 'bullhorn';
    }
  }
  async fetch(endpoint) {
    const res = await fetch(`${window.location.origin}/api/${endpoint}`);
    const data = await res.json();
    if(res.status > 299) {
      return console.error(res.statusText, data.message);
    }
    return data;
  }
}

customElements.define('news-feed', Feed);
