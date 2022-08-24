import Calendar from "../data/calendar.json";
import {
  dateFromDateString,
  DiscordTimestamp,
  formatTimeString,
} from "./utility-functions";
import { Holiday, SchoolDay } from "../core/classes/dayTypes";
import {
  DayOfCycle,
  ErrorCode,
  LessonTimeType,
  LessonType,
  SchoolDayType,
} from "../types/enums";
import { JaneEmbedBuilder } from "./embedBuilder";
import { fetchWeatherData, HkoApiData } from "./hko";
import { initLogger } from "../core/logger";
import { JaneGeneralError } from "../core/classes/errors";

const Logger = initLogger(__filename);

function calculateCycleNumber(date: Date, cycleDay: DayOfCycle): number {
  const filtered = Object.keys(Calendar).filter(
    (k) => Calendar[k as keyof typeof Calendar] == cycleDay
  );
  return (
    filtered.findIndex((k) => k === formatTimeString(date, "ddd MMM dd yyyy")) +
    1
  );
}

export class Timetable {
  cls: ClassId;
  date: Date;
  day: TimetableDay;
  initiator: CommandInitiator;
  weatherInfo?: HkoApiData;
  // options: Partial<TimetableOptions>;

  constructor(
    cls: ClassId,
    date: TimetableDateResolvable,
    initiator: CommandInitiator
    // options: Partial<TimetableOptions>
  ) {
    if (!/^[34][ABCD]$/.test(cls))
      throw new JaneGeneralError(
        "Invalid class",
        ErrorCode.UNEXPECTED_INPUT_VALUE
      );
    Logger.fatal(`${dateFromDateString(date)}`);
    Logger.fatal(formatTimeString(dateFromDateString(date), "ddd MMM dd yyyy"));
    Logger.fatal(formatTimeString(new Date(), "ddd MMM dd yyyy"));
    const formattedDate = formatTimeString(
      dateFromDateString(date),
      "ddd MMM dd yyyy"
    );
    if (!(formattedDate in Calendar))
      throw new JaneGeneralError(
        `Unexpected date ${formattedDate}`,
        ErrorCode.UNEXPECTED_INPUT_VALUE
      );

    this.cls = cls;
    this.initiator = initiator;
    // this.options = options;

    this.date = dateFromDateString(date);
    Logger.warn(this.date.toLocaleDateString());
    const cycleDay = Calendar[
      formatTimeString(this.date, "ddd MMM dd yyyy") as keyof typeof Calendar
    ] as DayOfCycle | "/";
    if (cycleDay === "/") {
      this.day = new Holiday("", "");
    } else {
      this.day = new SchoolDay(
        calculateCycleNumber(this.date, cycleDay),
        cycleDay,
        LessonTimeType.DEFAULT
      );
    }
  }

  async getEmbed() {
    const fdate = formatTimeString(this.date, "d/M/yyyy");

    const weather = await fetchWeatherData();

    if (
      this.day.type === SchoolDayType.SCHOOL_DAY ||
      this.day.type === SchoolDayType.SPECIAL_SCHOOL_DAY
    ) {
      /* Title section */
      const d = this.day as SchoolDayTypes;
      const subjects = await d.getLessons(this.cls);
      const dateDescription = `Day ${d.dayOfCycle}`;

      const titleSect = `${fdate} (${dateDescription})`;

      const tt = d.timetable;
      const schoolTimeSect = `:school: ${tt[0].time.start.string} - ${
        tt[tt.length - 1 - (subjects.length === 7 ? 0 : 1)].time.end.string
      }`;

      /* Basic Info section */
      const temp = weather.getTemp();
      const tempSect = `:thermometer: ${temp.value}\u00b0${temp.unit}`;
      const icons = weather
        .getIcons()
        .map(
          (i) => `<:${i.caption.replace(/ /g, "_")}:${i.emojiId}> ${i.caption}`
        )
        .join(" and ");
      const basicInfoSect = `${schoolTimeSect}\n${tempSect} | ${icons}`;

      /* Timetable section */
      const ttHeader = "課堂時間表";

      const sections = d.timetable;

      const ttBodyArray = [];
      let i = 0;
      for (const section of sections) {
        if (section.type === LessonType.LESSON) {
          ttBodyArray.push(
            `${new DiscordTimestamp(
              (() => {
                const dd = new Date(this.date);
                dd.setHours(Number(section.time.start.string.slice(0, 2)));
                dd.setMinutes(Number(section.time.start.string.slice(3, 5)));
                return dd;
              })(),
              "t"
            )} ${subjects[i]}`
          );
          i++;
          continue;
        }
        if (section.type === LessonType.CTP) {
          ttBodyArray.push("—".repeat(6) + " 早會 " + "—".repeat(6));
          continue;
        }
        if (section.type === LessonType.RECESS) {
          ttBodyArray.push("—".repeat(6) + " 小息 " + "—".repeat(6));
          continue;
        }
        if (section.type === LessonType.LUNCH) {
          ttBodyArray.push("—".repeat(6) + " 午膳 " + "—".repeat(6));
          continue;
        }
        if (section.type === LessonType.EXTRA_LESSON && subjects.length >= 7) {
          ttBodyArray.push(
            `${new DiscordTimestamp(
              (() => {
                const dd = new Date(this.date);
                dd.setHours(Number(section.time.start.string.slice(0, 2)));
                dd.setMinutes(Number(section.time.start.string.slice(3, 5)));
                return dd;
              })()
            )} ${subjects[i]}`
          );
          i++;
        }
      }

      const ttBody = ttBodyArray.join("\n");

      return new JaneEmbedBuilder(
        "reply",
        titleSect,
        `${basicInfoSect}`,
        {},
        this.initiator
      ).addFields([
        {
          name: ttHeader,
          value: ttBody,
        },
      ]);
    } else {
      throw new JaneGeneralError(`bruh ${this.date}`, ErrorCode.UNEXPECTED_ERR);
    }
  }

  async findNext() {}
}
