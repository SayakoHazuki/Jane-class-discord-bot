import { JaneGeneralError } from "../core/classes/errors";
import {
    ErrorCode,
    JaneInteractionGroup,
    JaneInteractionType,
} from "../types/enums";

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
    "Sep",
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

/**
 * Force a number to be in the type of a string of an n-digit number
 * @param input Number to be formatted
 * @param digit Number of digits for the result
 * @returns Formatted number
 */
export function forceNumberDigits(input: number | `${number}`, digit = 2) {
    return Number(input).toLocaleString(["en-HK", "en-US"], {
        minimumIntegerDigits: Number(digit),
    });
}

export function getNextDayOfTheWeek(
    dayName: string,
    excludeToday = true,
    refDate = new Date()
) {
    const dayOfWeek = DayArr.findIndex((i) =>
        i.toLowerCase().trim().startsWith(dayName.toLowerCase())
    );
    if (dayOfWeek < 0) return new Date();
    refDate.setHours(0, 0, 0, 0);
    refDate.setDate(
        refDate.getDate() +
            +!!excludeToday +
            ((dayOfWeek + 7 - refDate.getDay() - +!!excludeToday) % 7)
    );
    return refDate;
}

/**
 * **Format a Date Object**
 * | option | data | remarks |
 * | :---: | :---: | :--- |
 * | `d` | *date* |
 * | `dd` | *date* | 2-digit |
 * | `ddd` | *day of week* | short |
 * | `dddd` | *day of week* | full |
 * | `M` | *month* | number |
 * | `MM` | *month* | 2-digit |
 * | `MMM` | *month* | short |
 * | `MMMM` | *month* | full  |
 * | `yy` | *year* | 2-digit |
 * | `yyyy` | *year* | full |
 * | `h` | *hour* | 12h |
 * | `hh` | *hour* | 12h, 2-digit |
 * | `H` | *hour* | 24h |
 * | `HH` | *hour* | 24h, 2-digit |
 * | `m` | *minute* |
 * | `mm` | *minute* | 2-digit |
 * | `s` | *seconds* |
 * | `ss` | *seconds* | 2-digit |
 * | `ms` | *milliseconds* | 3-digit |
 * | `MS` | *milliseconds* | 2-digit |
 * | `tt` | `"am"` \| `"pm"` |
 * | `t` | `"a"` \| `"p"` |
 * | `Z` | *timezone* |
 * @param {Date} date Time to be formatted (in JS Date Object)
 * @param {string} format The format
 */
export function formatTimeString(date: Date, format: string) {
    return format.replace(
        /"[^"]*"|'[^']|\b(?:d{1,4}|M{1,4}|yy(?:yy)?|([hHmstT])\1?|ms|MS|[Z])\b/g,
        function ($0) {
            switch ($0) {
                case "d":
                    return date.getDate().toString();
                case "dd":
                    return forceNumberDigits(date.getDate());
                case "ddd":
                    return DayArr[date.getDay()];
                case "dddd":
                    return DayFullArr[date.getDay()];

                case "M":
                    return (date.getMonth() + 1).toString();
                case "MM":
                    return forceNumberDigits(date.getMonth() + 1);
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
                    return forceNumberDigits(date.getHours() % 12 || 12);
                case "H":
                    return date.getHours().toString();
                case "HH":
                    return forceNumberDigits(date.getHours());

                case "m":
                    return date.getMinutes().toString();
                case "mm":
                    return forceNumberDigits(date.getMinutes());

                case "s":
                    return date.getSeconds().toString();
                case "ss":
                    return forceNumberDigits(date.getSeconds());

                case "ms":
                    return forceNumberDigits(date.getMilliseconds(), 3);
                case "MS":
                    return forceNumberDigits(
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

export function splitMessage(content: string) {
    const splitRegex = /[\s\S]{1,1960}/g;
    const splitted = content.match(splitRegex);
    return splitted;
}

export function addCodeBlock(content: string, code: string = "") {
    return "```" + code + "\n" + content + "```";
}

/**
 * Sort object by value
 */
export function sortObjectByValue(object: { [key: string]: any }) {
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
export function sortArrayOfObjectByProp(
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

const queryTests = {
    tmrStyle: /^t{1,9}mr$/i,
    shortDateStyle: /^([1-9]|0[1-9]|[1-2][0-9]|3[01])[/\-_](0?[1-9]|1[0-2])$/i,
    longDateStyle:
        /^(([1-9])|([0][1-9])|([1-2][0-9])|([3][0-1]))[-_/]?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/i,
    numDateStyle: /^(\d{1,2})(\d{2})$/i,
    daysDiffStyle: /^([01]?[0-9]d|20d)$/i,
    dayOfWeekStyle:
        /^(Sun|Mon|(T(ues|hurs))|Fri)(day|\.)?$|Wed(\.|nesday)?$|Sat(\.|urday)?$|T((ue?)|(hu?r?))\.?$/i,
};

/**
 * Construct a date by relative number of days
 * @param daysDifference relative time difference in days
 * @returns the resulting Date object
 */
export function relativeDate(daysDifference: number) {
    return new Date(new Date().getTime() + (0 + 24 * daysDifference) * 3600000);
}

/**
 * Construct a Date object from a dateString
 * @param dateString the dateString to be converted
 * @returns the constructed date
 */
export function dateFromDateString(dateString: TimetableDateResolvable) {
    if (queryTests.tmrStyle.test(dateString)) {
        return relativeDate(dateString?.match(/t/gi)?.length || 0);
    }
    if (queryTests.daysDiffStyle.test(dateString)) {
        return relativeDate(Number(dateString.replace(/d/i, "")));
    }
    if (queryTests.shortDateStyle.test(dateString)) {
        const [_, day, month] =
            dateString.match(queryTests.shortDateStyle) || [];
        return new Date(
            `${new Date().getFullYear()}-${forceNumberDigits(
                Number(month)
            )}-${forceNumberDigits(Number(day))}T08:00:00.000+0800`
        );
    }
    if (queryTests.longDateStyle.test(dateString)) {
        const [_, day, _2, _3, _4, _5, month] =
            dateString.match(queryTests.shortDateStyle) || [];
        return new Date(
            `${new Date().getFullYear()}-${forceNumberDigits(
                MonthArr.indexOf(month) + 1
            )}-${forceNumberDigits(Number(day))}T08:00:00.000+0800`
        );
    }
    if (queryTests.numDateStyle.test(dateString)) {
        const [_, month, day] = dateString.match(queryTests.numDateStyle) || [];
        return new Date(
            `${new Date().getFullYear()}-${forceNumberDigits(
                Number(month)
            )}-${forceNumberDigits(Number(day))}T08:00:00.000+0800`
        );
    }
    if (queryTests.dayOfWeekStyle.test(dateString)) {
        return getNextDayOfTheWeek(dateString, false);
    }
    throw new JaneGeneralError(
        "Unknown date format",
        ErrorCode.UNEXPECTED_INPUT_FORMAT
    );
}

export class DiscordTimestamp {
    private __string: string;

    constructor(date = new Date(), format = "D") {
        this.__string = `<t:${Math.round(date.getTime() / 1000)}:${format}>`;
    }

    public toString() {
        return this.__string;
    }
}

export function randomFromRange([n1, n2]: [number, number]) {
    if (n1 === n2) return n1;
    let smaller = n1 < n2 ? n1 : n2;
    let larger = smaller === n1 ? n2 : n1;
    return Math.floor(Math.random() * (larger - smaller) + smaller);
}

export function wrapString(
    str: string,
    n = 18,
    splitter = "\\s",
    joiner = "\n"
) {
    return str.replace(
        new RegExp(`(?![^\\n]{1,${n}}$)([^\\n]{1,${n}})${splitter}`, "g"),
        `$1${joiner}`
    );
}

export class JaneInteractionIdBuilder<k, v> {
    type: JaneInteractionType;
    group: JaneInteractionGroup;
    _k: k;
    _v: v;

    constructor(
        type: JaneInteractionType,
        group: JaneInteractionGroup,
        k: k,
        v: v
    ) {
        this.type = type;
        this.group = group;
        this._k = k;
        this._v = v;
    }

    toString(): JaneInteractionId<k, v> {
        return `J-${this.type}-${this.group}-${this._k}-${this._v}` as JaneInteractionId<
            k,
            v
        >;
    }
}