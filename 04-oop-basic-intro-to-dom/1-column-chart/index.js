export default class ColumnChart {
  chartHeight = 50;

  constructor({data = [], label = '', value = "", link = '', formatHeading = (data) => data} = {}) {
    this.data = data;
    this.label = label;
    this.value = value,
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
          ${this.formatHeading(Number(this.value).toLocaleString('en-US'))}
          </div>
          <div data-element="body" class="column-chart__chart">
          </div>
        </div>
      </div>
    `;
  }
    
  getBarElementsAsString(barArray) {
    return this.getNormalizedBarArray(barArray)
    .map(normalizedValue => `<div style="--value: ${normalizedValue.value}" data-tooltip="${normalizedValue.percent}"></div>`)
    .join('');
  }

  getLink() {
    return this.link
      ? `<a class="column-chart__link" href="${this.link}">View all</a>`
      : "";
  }
    
  getNormalizedBarArray(barArray) {
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
    
    if(this.data.length) {
      this.element.classList.remove("column-chart_loading");
      this.update(this.data);
    }
  }
    
  update(data) {
    this.element.querySelector('.column-chart__chart').innerHTML = this.getBarElementsAsString(data);
  }
    
  remove() {
    this.element.remove();
  }
    
  destroy() {
    this.remove();
  }
}
