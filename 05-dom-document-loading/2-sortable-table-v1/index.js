export default class SortableTable {
  subElements = {};
  headers = {}

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = [...data];
    this.sortedBy = null;

    this.render();
  }

  getTemplate() {
    return `
    <div data-element="productsContainer" class="products-list__container">
      <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.renderHeaderElements().join('')}
        </div>
        <div data-element="body" class="sortable-table__body">
        ${this.renderTableBodyElements().join('')}
        </div>
      </div>
    </div>  
    `;
  }

  getSubElements(key) {
    const result = {};
    const elements = this.element.querySelectorAll(`[data-${key}]`);

    for (const subElement of elements) {
      const name = subElement.dataset[key];
      result[name] = subElement;
    }

    return result;
  }

  renderTableBodyElements() {
    return this.data.map(item =>`
      <a href="/products/${item.id}" class="sortable-table__row">
        ${this.renderRowElements(item).join('')}
      </a>`);
  }

  renderRowElements(item) {
    return this.headerConfig.map(header => {
      return (header.template) ?
        header.template(item[header.id]) :
        `<div class="sortable-table__cell">${item[header.id]}</div>`; 
      }
    ); 
  }

  renderHeaderElements() {
    return this.headerConfig
    .map(header => `
      <div class="sortable-table__cell" data-id=${header.id} data-sortable=${header.sortable}>
        <span>${header.title}</span>
      </div>`
      );
  }

  renderArrowElement() {
    return `<span data-element="arrow" class="sortable-table__sort-arrow">
              <span class="sort-arrow"></span>
            </span>`
  }

  sort(sortKey = '', order= 'asc') {
    const sortColumn = this.headerConfig.find(header => header.id === sortKey);

    if(sortColumn && sortColumn.sortable && (order === 'asc' || order === 'desc')) {
      this.sortData(sortKey, order, sortColumn.sortType);
      this.subElements.body.innerHTML = this.renderTableBodyElements().join('');
      this.editHeadersAfterSort(sortKey, order); 
    }
  }

  sortData(sortKey, order, type) {
    const directions = {
      asc: 1,
      desc: -1
    };
    const orderAsNum = directions[order];

    this.data.sort((a,b) => {
      switch(type) {
        case 'number' : return orderAsNum * (a[sortKey] - b[sortKey]);
        case 'string' : return orderAsNum * a[sortKey].localeCompare(b[sortKey], ['ru', 'en'], {caseFirst: 'upper'});
        default : return;
        }
      }
    );
  }

  editHeadersAfterSort(sortKey, order) {
    if(this.sortedBy) {
      delete this.headers[this.sortedBy].dataset.order; 
      this.headers[this.sortedBy].lastChild.remove();
    } 

    const newHeaderWithArrow = this.headers[sortKey];
    newHeaderWithArrow.dataset.order = order;
    newHeaderWithArrow.insertAdjacentHTML('beforeend', this.renderArrowElement());    
    this.sortedBy = sortKey;    
  }
  
  render() {
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements("element");
    this.headers =  this.getSubElements("id");
  }
    
  remove() {
    this.element.remove();
  }
    
  destroy() {
    this.remove();
    this.subElements = {};
    this.headers = {};
  }
}