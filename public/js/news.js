class Feed extends HTMLElement {
  constructor() {
    super();
    this.init();
  }
  async init() {
    this.config = await this.fetch('config');

    this.attachShadow({ mode: 'open' });
    await this.renderPage();
    await this.renderItems();
    // start render loop
    setInterval(() => this.renderItems(), this.config.updateInterval ?? 300000);
  }
  async renderPage() {
    const query = new URLSearchParams(window.location.search);
    this.page = this.createEl({
      type: 'div',
      attributes: { class: `page ${query.get('theme') || ''}` },
      html: `
        <style>@import "css/news.css";</style>
        <header>
          <div class="inner">
            <span class="title">${this.config.name}</span>
            <span id="date" class="date">Updated at <span id="timestamp"></span></span>
            <div id="loading" class="display-none"><div></div><div></div><div></div><div></div></div>
          </div>
        </header>
      `
    });
    this.shadowRoot.append(this.page);
  }
  async renderItems() {
    this.showLoading();

    const data = await this.fetch('news');
    // clear out previous items before rendering
    this.shadowRoot.getElementById('items')?.remove();

    const items = this.createEl({ type: 'div', attributes: { id: 'items', class: 'items' } });
    data.forEach(({ title, description, feed, created, link }) => {
      let extraHtml = '';
      if(feed === 'Hacker News') {
        extraHtml = `<a href="${description.match(`href="(.+)"`)[1]}" target="_blank">Comments</a>`;
      }
      items.appendChild(this.createEl({
        type: 'div',
        attributes: { class: 'feed-item' },
        html: `
          <div class="title"><a href="${link}" target="_blank">${title}</a></div>
          <div class="metadata">
            <div class="feed">${feed}</div>
            <div class="date">${this.formatDate(created)}</div>
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
    return `${d.toDateString()}, ${d.toLocaleTimeString().slice(0,5)}`;
  }
  async fetch(endpoint) {
    try {
      return (await fetch(`${window.location.origin}/api/${endpoint}`)).json();
    } catch(e) {
      console.log(e);
    }
  }
}

customElements.define('news-feed', Feed);
