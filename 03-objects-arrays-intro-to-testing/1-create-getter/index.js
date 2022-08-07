/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
    const pathToProperty = path.split('.');

    return object => pathToProperty.reduce((reducedObj, prop) => {
      if(reducedObj) return reducedObj[prop];
    }, object);
}
