import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  chartHeight = 50;
  subElements = {};

  constructor({url = '', range = {from : new Date(), to : new Date()},
               label = '', link = '', formatHeading = (data) => data} = {}) {
    this.url = url;
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;
      
    this.render();
  }
      
  getTemplate() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: 50">
        <div class="column-chart__title">
          Total ${this.label}
            ${this.getLink()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
          </div>
          <div data-element="body" class="column-chart__chart">
          </div>
        </div>
      </div>
    `;
  }
      
  getBarElementsAsString(barArray) {
    return this.getNormalizeBarArray(barArray)
    .map(normalizedValue => `<div style="--value: ${normalizedValue.value}" data-tooltip="${normalizedValue.percent}"></div>`)
    .join('');
  }
  
  getLink() {
    return this.link
      ? `<a class="column-chart__link" href="${this.link}">View all</a>`
      : "";
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  getNormalizeBarArray(barArray) {
    const maxValue = Math.max(...barArray);
    const scale = this.chartHeight / maxValue;
        
    return barArray.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }
          
  render() {
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();

    this.update(this.range.from, this.range.to);
  }
      
  async update(from, to) {
    const url = new URL(`${BACKEND_URL}/${this.url}?from=${from.toISOString()}&to=${to.toISOString()}`);

    try {
      const response = await fetchJson(url.href);
      const data = Object.values(response);
      this.updateReceivedData(data);
      return response;
    } catch (error) {
      throw new Error(`Unable to fetch data from ${url}`);
    }
  }

  updateReceivedData(data) {
    if(data.length) {
      const value = data.reduce((acc,val) => acc += val, 0);
      this.subElements.header.innerHTML = this.formatHeading(Number(value).toLocaleString('en-US'));
      this.subElements.body.innerHTML = this.getBarElementsAsString(data);
      this.element.classList.remove("column-chart_loading");
    } else {
      this.element.classList.add("column-chart_loading");
    }
  }
      
  remove() {
    if(this.element) {
      this.element.remove();  
    }
  }
      
  destroy() {
    this.remove();
    this.subElements = {};
    this.element = null;
  }
}