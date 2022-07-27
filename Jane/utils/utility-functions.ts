const DayArr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DayFullArr = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thuuday",
    "Friday",
    "Saturday",
];
const MonthArr = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Oct",
    "Nov",
    "Dec",
];
const MonthFullArr = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

export class Utilities {
    /**
     * Force a number to be in the type of a string of an n-digit number
     * @param input Number to be formatted
     * @param digit Number of digits for the result
     * @returns Formatted number
     */
    static forceNumberDigits(input: number | `${number}`, digit = 2) {
        return Number(input).toLocaleString(["en-HK", "en-US"], {
            minimumIntegerDigits: Number(digit),
        });
    }

    /**
     * Format a Date Object
     * @param {Date} date Time to be formatted (in JS Date Object)
     * @param {string} format The format
     */
    static formatTimeString(date: Date, format: string) {
        return format.replace(
            /"[^"]*"|'[^']|\b(?:d{1,4}|M{1,4}|yy(?:yy)?|([hHmstT])\1?|ms|MS|[Z])\b/g,
            function ($0) {
                switch ($0) {
                    case "d":
                        return date.getDate().toString();
                    case "dd":
                        return Utilities.forceNumberDigits(date.getDate());
                    case "ddd":
                        return DayArr[date.getDay()];
                    case "dddd":
                        return DayFullArr[date.getDay()];

                    case "M":
                        return (date.getMonth() + 1).toString();
                    case "MM":
                        return Utilities.forceNumberDigits(date.getMonth() + 1);
                    case "MMM":
                        return MonthArr[date.getMonth()];
                    case "MMMM":
                        return MonthFullArr[date.getMonth()];

                    case "yy":
                        return date.getFullYear.toString().substr(2);
                    case "yyyy":
                        return date.getFullYear().toString();

                    case "h":
                        return (date.getHours() % 12 || 12).toString();
                    case "hh":
                        return Utilities.forceNumberDigits(date.getHours() % 12 || 12);
                    case "H":
                        return date.getHours().toString();
                    case "HH":
                        return Utilities.forceNumberDigits(date.getHours());

                    case "m":
                        return date.getMinutes().toString();
                    case "mm":
                        return Utilities.forceNumberDigits(date.getMinutes());

                    case "s":
                        return date.getSeconds().toString();
                    case "ss":
                        return Utilities.forceNumberDigits(date.getSeconds());

                    case "ms":
                        return Utilities.forceNumberDigits(date.getMilliseconds(), 3);
                    case "MS":
                        return Utilities.forceNumberDigits(
                            Math.round(date.getMilliseconds() / 10)
                        );

                    case "tt":
                        return date.getHours() < 12 ? "am" : "pm";
                    case "t":
                        return date.getHours() < 12 ? "a" : "p";
                    case "TT":
                        return date.getHours() < 12 ? "AM" : "PM";
                    case "T":
                        return date.getHours() < 12 ? "A" : "P";

                    case "Z":
                        return date.toUTCString().match(/[A-Z]+$/)?.[0] ?? "";

                    default:
                        return $0.substring(1, $0.length - 1);
                }
            }
        );
    }

    static splitMessage(content: string) {
        const splitRegex = /[\s\S]{1,1960}/g;
        const splitted = content.match(splitRegex);
        return splitted;
    }

    static addCodeBlock(content: string, code: string = "") {
        return "```" + code + "\n" + content + "```";
    }

    /**
     * Sort object by value
     */
    static sortObjectByValue(object: { [key: string]: any }) {
        const enumeratedArray = [];
        for (const key in object) {
            if (Object.prototype.hasOwnProperty.call(object, key)) {
                enumeratedArray.push([key, object[key]]);
            }
            enumeratedArray.sort(function (a, b) {
                const x = a[1].toLowerCase();
                const y = b[1].toLowerCase();
                return x < y ? -1 : x > y ? 1 : 0;
            });
        }
        const results: { [key: string]: any } = {};
        for (const key in enumeratedArray) {
            const k = enumeratedArray[key][0];
            const v = enumeratedArray[key][1];
            results[k] = v;
        }
        return results;
    }

    /**
     * Sorts array of object by object property
     */
    static sortArrayOfObjectByProp(
        array: { [key: string]: any }[],
        propToSort: string
    ) {
        return array.sort((a, b) =>
            a[propToSort] > b[propToSort]
                ? 1
                : b[propToSort] > a[propToSort]
                ? -1
                : 0
        );
    }
}
