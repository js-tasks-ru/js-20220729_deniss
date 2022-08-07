/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
    if(size === 0) return '';  
    if(size === undefined) size = string.length;
  
    return [...string].reduce((trimmedStr, nextChar) => {
      if(!trimmedStr.endsWith(nextChar.repeat(size))) trimmedStr += nextChar;
      return trimmedStr;
  }, '');
}
