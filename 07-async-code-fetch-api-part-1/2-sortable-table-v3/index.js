import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  subElements = {};
  headers = {};
  dataBatchSize = 30;
  scrollOffset = 50;

  constructor(headersConfig = [],  
              {url = '',
              isSortLocally = false,
              sorted = { id: headersConfig.find(header => header.sortable).id,
                         order: 'asc'}} = {})
  {
    this.headerConfig = headersConfig;
    this.url = new URL(url, BACKEND_URL);
    this.isSortLocally = isSortLocally;
    this.sorted = sorted;
    this.start = 0;
    this.end = this.dataBatchSize;
    this.data = [];

    this.render();
  }

  onScroll = async () => {
    const {bottom} = this.element.getBoundingClientRect();

    if (bottom < document.documentElement.clientHeight + this.scrollOffset && !this.loading && !this.isSortLocally) {
      this.start += this.dataBatchSize;
      this.end += this.dataBatchSize;

      this.loading = true;

      await this.getNextDataBatch(this.sorted.id, this.sorted.order, this.start, this.end);

      this.loading = false;
    }
  }

  onHeaderClick = async (event) => {
    const sortColumn = event.target.closest('[data-sortable="true"]');
    if(!sortColumn) return;

    const sortKey = sortColumn.dataset.id;
    const order = (sortColumn.dataset.order === 'asc') ? 'desc' : 'asc'
  
    this.start = 0;
    this.end = this.dataBatchSize;;
    this.subElements.body.innerHTML = '';

    this.element.firstElementChild.classList.add('sortable-table_loading');

    await this.sort(sortKey, order);

    this.editHeaderArrow(sortKey, order);
  }

  getTemplate(data) {
    return `
    <div data-element="productsContainer" class="products-list__container">
      <div class="sortable-table sortable-table_loading">
        <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.renderHeaderElements()}
        </div>
        <div data-element="body" class="sortable-table__body">
        ${this.renderTableBodyElements(data)}
        </div>
        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          <div>
            <p>No products satisfies your filter criteria</p>
            <button type="button" class="button-primary-outline">Reset all filters</button>
          </div>
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

  async sort(sortKey = '', order= 'asc') {
    if (this.isSortLocally) {
      this.sortOnClient(sortKey, order);
    } else {
      await this.sortOnServer(sortKey, order);
    }
  }

  async sortOnServer(sortKey, _order) {
    this.data = [];
    await this.getNextDataBatch({id: sortKey, order: _order});
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
    if(sortKey !== this.sorted.id) {
      this.headers[sortKey].append(this.headers[this.sorted.id].lastElementChild);  
    }    
    this.sorted.id = sortKey;
    this.sorted.order = order;  
  }

  async loadData({id = this.sorted.id, order = this.sorted.order, start = this.start, end = this.end} = {}) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);
    try {
      const data = await fetchJson(this.url);
      return data;
    } catch (error) {
      throw new Error(`Unable to fetch data from ${this.url}`);
    }
  }

  updateTableBodyElements(data) {
    if (data.length) {
      this.element.firstElementChild.classList.remove('sortable-table_empty');
      this.data.push(...data);
      this.subElements.body.insertAdjacentHTML('beforeend', this.renderTableBodyElements(data));
    } else {
      if(!this.element.childElementCount) this.element.firstElementChild.classList.add('sortable-table_empty');
    }
  }

  async getNextDataBatch({id = this.sorted.id, order = this.sorted.order, start = this.start, end = this.end} = {}) {
    const dataBatch = await this.loadData({id, order, start, end});
    this.updateTableBodyElements(dataBatch);

    if(dataBatch.length !== this.dataBatchSize) this.element.firstElementChild.classList.remove('sortable-table_loading');
  }
  
  async render() {
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate(this.data);
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements("element");
    this.headers =  this.getSubElements("id");

    await this.getNextDataBatch();
    this.editHeaderArrow(this.sorted.id, this.sorted.order);

    this.initEventListeners();
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onHeaderClick);
    window.addEventListener('scroll', this.onScroll);
  }
    
  remove() {
    if(this.element) this.element.remove();
  }
    
  destroy() {
    if(Object.keys(this.subElements).length) {
      this.subElements.header.removeEventListener('pointerdown', this.onHeaderClick);
      window.removeEventListener('scroll', this.onScroll);
    }  

    this.remove();
    this.element = null;
    this.subElements = {};
    this.headers = {}; 
  }
}