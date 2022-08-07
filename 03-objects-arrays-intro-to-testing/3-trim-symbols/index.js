/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  let duplicateCharCounter = 0;
  if(size == 0) return '';  
  if(size === undefined) size = string.length;

  return [...string].reduce((trimmedStr, nextChar) => {
    if(trimmedStr[trimmedStr.length - 1] === nextChar) {
      return (duplicateCharCounter++ < size) ? trimmedStr += nextChar : trimmedStr;   
    } else {
      duplicateCharCounter = 1;        
      return trimmedStr += nextChar;
    }
  }, '');
}
