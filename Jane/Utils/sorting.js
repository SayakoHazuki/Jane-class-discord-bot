module.exports = class Sort {
  constructor () {
    this.name = 'sorter'
  }

  /**
   * Sort object by value
   * @param {{}} obj Object to sort
   * @returns {{}} Sorted object
   */
  static objectByValue (obj) {
    const sortable = []
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sortable.push([key, obj[key]])
      }
      sortable.sort(function (a, b) {
        const x = a[1].toLowerCase()
        const y = b[1].toLowerCase()
        return x < y ? -1 : x > y ? 1 : 0
      })
    }
    const finalobj = {}
    for (const ind in sortable) {
      const n = sortable[ind][0]
      const v = sortable[ind][1]
      finalobj[n] = v
    }
    return finalobj
  }
}
