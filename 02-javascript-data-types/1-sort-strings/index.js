/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  let sortedArr = [...arr];

  switch(param) {
    case 'asc':
      sortedArr.sort((a,b) => {
        return a.localeCompare(b, ['ru', 'en'], {caseFirst: 'upper'});  
      });
      break;
    case 'desc':
      sortedArr.sort((a,b) => {
        return b.localeCompare(a, ['ru', 'en']);
      });
      break;
    default: break;  
  }

  return sortedArr;
}
