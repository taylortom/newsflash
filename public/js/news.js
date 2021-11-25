class Feed extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
    const i = setInterval(() => window.location = window.location, 300000);
  }
  async render() {
    const data = await this.fetch();
    const page = this.createEl({ 
      type: 'div', 
      attributes: { class: 'page' }, 
      html: `
        <style>@import "css/news.css";</style>
        <header>
          <div class="inner">
            <h1>News</h1>
            <div>Updated at ${this.formatDate(Date.now())}</div>
          </div>
        </header>
      ` 
    });
    const items = this.createEl({ type: 'div', attributes: { class: 'items' } });
    data.forEach(({ title, feed, created, link }) => {
      items.appendChild(this.createEl({
        type: 'div',
        attributes: { class: 'feed-item' },
        html: `
          <div class="title"><a href="${link}" target="_blank">${title}</a></div>
          <div class="metadata">
          <div class="feed"><a href="#" target="_blank">${feed}</a></div>
            <div class="date">${this.formatDate(created)}</div>
          </div>
        `
      }));
    });
    page.append(items);
    this.shadowRoot.append(page);
  }
  createEl({ type, attributes={}, html }) {
    const el = document.createElement(type);
    Object.entries(attributes).forEach(([k,v]) => el.setAttribute(k,v));
    if(html) el.innerHTML = html;
    return el;
  }
  formatDate(d) {
    if(Number.isInteger(d)) d = new Date(d);
    return `${d.toLocaleTimeString().slice(0,5)}, ${d.toDateString()}`;
  }
  async fetch() {
    try {
      return (await fetch(`http://localhost:5000/api/news`)).json();
    } catch(e) {
      console.log(e);
    }
  }
}

customElements.define('news-feed', Feed);