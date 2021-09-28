const DayArr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DayFullArr = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thuuday',
  'Friday',
  'Saturday'
]
const MonthArr = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Oct',
  'Nov',
  'Dec'
]
const MonthFullArr = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]
class formatter {
  static numDigit (input, digit = 2) {
    if (isNaN(input) || isNaN(digit)) return
    return Number(input).toLocaleString(['en-HK', 'en-US'], {
      minimumIntegerDigits: Number(digit)
    })
  }

  /**
   * Format a Date Object
   *
   * @param {Date} date Time to be formatted (in JS Date Object)
   * @param {string} format The format
   *
   *
   *
   *
   *
   *
   */
  static time (date, format) {
    return format.replace(
      /"[^"]*"|'[^']|\b(?:d{1,4}|M{1,4}|yy(?:yy)?|([hHmstT])\1?|ms|MS|[Z])\b/g,
      function ($0) {
        switch ($0) {
          case 'd':
            return date.getDate()
          case 'dd':
            return formatter.numDigit(date.getDate())
          case 'ddd':
            return DayArr[date.getDay()]
          case 'dddd':
            return DayFullArr[date.getDay()]

          case 'M':
            return date.getMonth() + 1
          case 'MM':
            return formatter.numDigit(date.getMonth() + 1)
          case 'MMM':
            return MonthArr[date.getMonth()]
          case 'MMMM':
            return MonthFullArr[date.getMonth()]

          case 'yy':
            return date.getFullYear.toString().substr(2)
          case 'yyyy':
            return date.getFullYear()

          case 'h':
            return date.getHours() % 12 || 12
          case 'hh':
            return formatter.numDigit(date.getHours() % 12 || 12)
          case 'H':
            return date.getHours()
          case 'HH':
            return formatter.numDigit(date.getHours())

          case 'm':
            return date.getMinutes()
          case 'mm':
            return formatter.numDigit(date.getMinutes())

          case 's':
            return date.getSeconds()
          case 'ss':
            return formatter.numDigit(date.getSeconds())

          case 'ms':
            return formatter.numDigit(date.getMilliseconds(), 3)
          case 'MS':
            return formatter.numDigit(Math.round(date.getMilliseconds() / 10))

          case 'tt':
            return date.getHours() < 12 ? 'am' : 'pm'
          case 't':
            return date.getHours() < 12 ? 'a' : 'p'
          case 'TT':
            return date.getHours() < 12 ? 'AM' : 'PM'
          case 'T':
            return date.getHours() < 12 ? 'A' : 'P'

          case 'Z':
            return date.toUTCString().match(/[A-Z]+$/)

          default:
            return $0.substr(1, $0.length - 2)
        }
      }
    )
  }
}

module.exports = formatter
