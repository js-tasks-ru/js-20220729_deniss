export default class SortableTable {
  subElements = {};
  headers = {};
  isSortLocally = true;

  constructor(headersConfig = [], {data = [], sorted = { 
        id: headersConfig.find(header => header.sortable).id,
        order: 'asc'}} = {})
  {
    this.headerConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;
    this.sortedBy = sorted.id;

    this.render();
    this.initEventListeners();
  }

  onHeaderClick = (event) => {
    const sortColumn = event.target.closest('[data-id]');
    if(!sortColumn || (sortColumn.dataset.sortable === 'false')) return;

    const sortKey = sortColumn.dataset.id;
    const order = (sortColumn.dataset.order === 'asc') ? 'desc' : 'asc'
  
    this.sort(sortKey, order);
    this.editHeaderArrow(sortKey, order);
  }

  getTemplate(data) {
    return `
    <div data-element="productsContainer" class="products-list__container">
      <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.renderHeaderElements()}
        </div>
        <div data-element="body" class="sortable-table__body">
        ${this.renderTableBodyElements(data)}
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

  renderTableBodyElements(data) {
    return data.map(item =>`
      <a href="/products/${item.id}" class="sortable-table__row">
        ${this.renderRowElements(item).join('')}
      </a>`).join('');
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
    return this.headerConfig.map(header =>{
      const order = (this.sorted.id === header.id) ? this.sorted.order : 'asc';
      return `
        <div class="sortable-table__cell" data-id="${header.id}" data-sortable="${header.sortable}" data-order="${order}">
          <span>${header.title}</span>
          ${(this.sorted.id === header.id) ? this.getHeaderSortingArrow() : ''}
        </div>
      `}).join('');    
  }

  getHeaderSortingArrow () {
    return `<span data-element="arrow" class="sortable-table__sort-arrow">
              <span class="sort-arrow"></span>
            </span>`;
  }

  sort(sortKey = '', order= 'asc') {
    if (this.isSortLocally) {
      this.sortOnClient(sortKey, order);
    } else {
      this.sortOnServer();
    }
  }

  sortOnServer() {
    return 'STUB';
  }

  sortOnClient(sortKey, order) {
    const sortedData = this.sortData(sortKey, order);
    this.subElements.body.innerHTML = this.renderTableBodyElements(sortedData);
  }

  sortData(sortKey, order) {
    const column = this.headerConfig.find(header => header.id === sortKey);
    const orderAsNum = (order === 'desc') ? -1 : 1;

    return [...this.data].sort((a,b) => {
      switch(column.sortType) {
        case 'number' : return orderAsNum * (a[sortKey] - b[sortKey]);
        case 'string' : return orderAsNum * a[sortKey].localeCompare(b[sortKey], ['ru', 'en'], {caseFirst: 'upper'});
        default : return orderAsNum * (a[sortKey] - b[sortKey]);;
        }
      }
    );
  }

  editHeaderArrow(sortKey, order) {
    this.headers[sortKey].dataset.order = order;
    if(sortKey !== this.sortedBy) {
      this.headers[sortKey].append(this.headers[this.sortedBy].lastElementChild);  
    }    
    this.sortedBy = sortKey;    
  }
  
  render() {
    const element = document.createElement("div");
    const sortedData = this.sortData(this.sorted.id, this.sorted.order);
    
    element.innerHTML = this.getTemplate(sortedData);
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements("element");
    this.headers =  this.getSubElements("id");

    this.editHeaderArrow(this.sorted.id, this.sorted.order);
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onHeaderClick);
  }
    
  remove() {
    if(this.element) this.element.remove();
  }
    
  destroy() {
    if(Object.keys(this.subElements).length)  
      this.subElements.header.removeEventListener('pointerdown', this.onHeaderClick);

    this.remove();
    this.element = null;
    this.subElements = {};
    this.headers = {}; 
  }
}