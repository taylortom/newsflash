class Feed extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
    const i = setInterval(() => window.location = window.location, 300000);
  }
  async render() {
    const { name, colour } = await this.fetch('config');
    const data = await this.fetch('news');
    const page = this.createEl({
      type: 'div',
      attributes: { class: 'page' },
      html: `
        <style>@import "css/news.css";</style>
        <header style="background-color:${colour}">
          <div class="inner">
            <h1>${name}</h1>
            <div>Updated at ${this.formatDate(Date.now())}</div>
          </div>
        </header>
      `
    });
    const items = this.createEl({ type: 'div', attributes: { class: 'items' } });
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
