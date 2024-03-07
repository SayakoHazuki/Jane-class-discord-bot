import Calendar from "../data/calendar.json";
import * as Database from "../core/classes/database";
import {
    dateFromDateString,
    DiscordTimestamp,
    formatTimeString,
    JaneInteractionIdBuilder,
} from "./utility-functions";
import { Holiday, SchoolDay } from "../core/classes/dayTypes";
import {
    DayOfCycle,
    ErrorCode,
    JaneInteractionGroup,
    JaneInteractionNormalFollowUpSubgroups,
    JaneInteractionType,
    LessonTimeType,
    LessonType,
    SchoolDayType,
} from "../types/enums";
import { JaneEmbedBuilder } from "./embedBuilder";
import { fetchWeatherData, HkoApiData } from "./hkoUtils";
import { initLogger } from "../core/logger";
import { JaneGeneralError } from "../core/classes/errors";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { textDivider } from "../core/consts";
import {
    ellipsis,
    gear,
    chevron_up,
    pycnet,
    calendar,
} from "../data/config/emojis.json";

const Logger = initLogger(__filename);

function calculateCycleNumber(date: Date, cycleDay: DayOfCycle): number {
    const filtered = Object.keys(Calendar).filter(
        (k) => Calendar[k as keyof typeof Calendar] == cycleDay
    );
    return (
        filtered.findIndex(
            (k) => k === formatTimeString(date, "ddd MMM dd yyyy")
        ) + 1
    );
}

export class Timetable {
    cls: ClassId;
    date: Date;
    day: TimetableDay;
    initiator: CommandInitiator;
    dbUser?: Database.User;
    weatherInfo?: HkoApiData;
    // options: Partial<TimetableOptions>;

    /**
     * Creates a new Timetable object.
     * @param cls The class ID of the timetable to be fetched.
     * @param date The date of the timetable to be fetched.
     * @param initiator The initiator of the command.
     * @param dbUser The user (database) who initiated the command.
     */
    constructor(
        cls: ClassId,
        date: TimetableDateResolvable,
        initiator: CommandInitiator,
        dbUser?: Database.User
        // options: Partial<TimetableOptions>
    ) {
        Logger.info(
            `Constructing Timetable Class of date ${dateFromDateString(date)}`
        );
        if (!/^(?:[1-6][ABCD])|(?:4E)$/.test(cls)) {
            Logger.error(`Invalid class ${cls}`);
            throw new JaneGeneralError(
                "Invalid class",
                ErrorCode.UNEXPECTED_INPUT_VALUE
            );
        }

        Logger.info(
            "DateFromDateString:",
            formatTimeString(dateFromDateString(date), "ddd MMM dd yyyy")
        );
        Logger.info(
            "Current date:",
            formatTimeString(new Date(), "ddd MMM dd yyyy")
        );

        const formattedDate = formatTimeString(
            dateFromDateString(date),
            "ddd MMM dd yyyy"
        );

        if (!(formattedDate in Calendar)) {
            Logger.error(`Unexpected date ${formattedDate}`);
            throw new JaneGeneralError(
                `Unexpected date ${formattedDate}`,
                ErrorCode.UNEXPECTED_INPUT_VALUE,
                {
                    displayMessage: `資料庫中找不到 ${formattedDate} 的時間表`,
                }
            );
        }

        this.cls = cls;
        this.initiator = initiator;
        this.dbUser = dbUser;
        // this.options = options;

        this.date = dateFromDateString(date);
        Logger.info("Locale DateString:", this.date.toLocaleDateString());
        const cycleDay = Calendar[
            formatTimeString(
                this.date,
                "ddd MMM dd yyyy"
            ) as keyof typeof Calendar
        ] as DayOfCycle | "/";

        if (cycleDay === "/") {
            this.day = new Holiday("", "");
        } else {
            this.day = new SchoolDay(
                calculateCycleNumber(this.date, cycleDay),
                cycleDay,
                LessonTimeType.NORMAL // TODO: Migrate config
            );
        }
    }

    /**
     * Generates the embed for the timetable.
     * @returns The embed of the timetable.
     */
    async getEmbed() {
        Logger.info("Generating embed for timetable");
        const fdate = formatTimeString(this.date, "d/M/yyyy");

        const weather = await fetchWeatherData();

        if (
            this.day.type === SchoolDayType.SCHOOL_DAY ||
            this.day.type === SchoolDayType.SPECIAL_SCHOOL_DAY
        ) {
            /* Title section */
            const day = this.day as SchoolDayTypes;
            const subjects = await day.getLessonStrings(this.cls);
            const dateDescription = `Day ${day.dayOfCycle}`;

            const titleSect = `${fdate} (${dateDescription})`;

            const sections = day.timetable;
            const schoolStartTimeStr = sections[0].time.start.string;
            const lastSectionIndex =
                sections.length - 1 - (subjects.length === 7 ? 0 : 1); // If there is not a 7th lesson, exclude last section while calculating the end time.
            const schoolEndTimeStr = sections[lastSectionIndex].time.end.string;

            const schoolTimeSect = `:school: ${schoolStartTimeStr} - ${schoolEndTimeStr}`;

            /* Basic Info section */
            // TODO: Weather forecast instead of current weather if the day is not the current day.
            const temp = weather.getTemp();
            const tempSect = `:thermometer: ${temp.value}\u00b0${temp.unit}`;

            const toUnderscores = (str: string) => str.replace(/ /g, "_");
            const icons = weather
                .getWeatherIcons()
                .map((i) => i.emojiStr + " " + i.caption)
                .join(" and ");
            const basicInfoSect = `${schoolTimeSect}\n${tempSect} | ${icons}`;

            /* Timetable section */
            const ttHeader = this.cls + " 課堂時間表";

            const ttBodyArray = [];
            let i = 0;
            for (const section of sections) {
                const sectionDateObj = new Date(this.date);
                sectionDateObj.setHours(
                    Number(section.time.start.string.slice(0, 2)) - 8
                );
                sectionDateObj.setMinutes(
                    Number(section.time.start.string.slice(3, 5))
                );

                if (
                    section.type === LessonType.LESSON ||
                    (section.type === LessonType.EXTRA_LESSON &&
                        subjects.length >= 7)
                ) {
                    ttBodyArray.push(
                        `${new DiscordTimestamp(sectionDateObj, "t")} ${
                            subjects[i]
                        }`
                    );
                    i++;
                    continue;
                }

                if (section.type === LessonType.CTP) {
                    ttBodyArray.push(textDivider + " 早會 " + textDivider);
                    continue;
                }

                if (section.type === LessonType.RECESS) {
                    ttBodyArray.push(textDivider + " 小息 " + textDivider);
                    continue;
                }

                if (section.type === LessonType.LUNCH) {
                    ttBodyArray.push(textDivider + " 午膳 " + textDivider);
                    continue;
                }
            }
            ttBodyArray.push(textDivider + " 放學 " + textDivider);

            const ttBody = ttBodyArray.join("\n");

            return new JaneEmbedBuilder(
                "reply",
                titleSect,
                `${basicInfoSect}`,
                {
                    authorPrefix: this.dbUser?.studentClass
                        ? this.dbUser?.studentClass + " "
                        : "",
                },
                this.initiator
            ).addFields([
                {
                    name: ttHeader,
                    value: ttBody,
                },
            ]);
        } else {
            /* Basic Info section */
            // TODO: Weather forecast instead of current weather if the day is not the current day.
            const temp = weather.getTemp();
            const tempSect = `:thermometer: ${temp.value}\u00b0${temp.unit}`;
            const icons = weather
                .getWeatherIcons()
                .map((i) => i.emojiStr + " " + i.caption)
                .join(" and ");
            const basicInfoSect = `🍫 學校假期\n${tempSect} | ${icons}`;

            return new JaneEmbedBuilder(
                "reply",
                `${fdate} (學校假期)`,
                `${basicInfoSect}`,
                {
                    authorPrefix: this.dbUser?.studentClass
                        ? this.dbUser?.studentClass + " "
                        : "",
                },
                this.initiator
            );
        }
    }

    /**
     * Finds the next school day of the next lesson of the specified subject.
     * @not_implemented This function is not implemented yet.
     * @param subject The subject to find.
     */
    async findNext(subject: unknown) {}
}

/**
 * Generates action row for the timetable command.
 * @param inputDate Initial date of the embed
 * @param inputClass Initial class of the embed
 * @returns ActionRow containing actions for the timetable command
 */
export function getNormalTimetableActions(
    inputDate: TimetableDateResolvable,
    inputClass: ClassId,
    expanded: boolean = false
) {
    Logger.info(`input date: ${inputDate}`);

    const prevDay = dateFromDateString(inputDate);
    prevDay.setDate(prevDay.getDate() - 1);
    const prevDayStr = formatTimeString(prevDay, "dd/MM").replace(/\//g, "_");

    const nextDay = dateFromDateString(inputDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = formatTimeString(nextDay, "dd/MM").replace(/\//g, "_");

    Logger.info(`customIds: ${prevDayStr}, ${nextDayStr}`);

    const components = [
        new ButtonBuilder()
            .setLabel("<")
            .setStyle(ButtonStyle.Primary)
            .setCustomId(
                new JaneInteractionIdBuilder(
                    JaneInteractionType.BUTTON,
                    JaneInteractionGroup.NORMAL_FOLLOW_UP,
                    JaneInteractionNormalFollowUpSubgroups.timetable_actions,
                    `SELDATE-${prevDayStr}-${inputClass}`
                ).toString()
            ),
        new ButtonBuilder()
            .setLabel(
                formatTimeString(dateFromDateString(inputDate), "d/MM") +
                    " 週" +
                    ["日", "一", "二", "三", "四", "五", "六"][
                        dateFromDateString(inputDate).getDay()
                    ]
            )
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true)
            // TODO: Date picker
            .setCustomId(
                new JaneInteractionIdBuilder(
                    JaneInteractionType.BUTTON,
                    JaneInteractionGroup.NORMAL_FOLLOW_UP,
                    JaneInteractionNormalFollowUpSubgroups.timetable_actions,
                    "DATE-0-0"
                ).toString()
            ),
        new ButtonBuilder()
            .setLabel(">")
            .setStyle(ButtonStyle.Primary)
            .setCustomId(
                new JaneInteractionIdBuilder(
                    JaneInteractionType.BUTTON,
                    JaneInteractionGroup.NORMAL_FOLLOW_UP,
                    JaneInteractionNormalFollowUpSubgroups.timetable_actions,
                    `SELDATE-${nextDayStr}-${inputClass}`
                ).toString()
            ),
        new ButtonBuilder()
            .setLabel("今日")
            .setStyle(ButtonStyle.Primary)
            .setCustomId(
                new JaneInteractionIdBuilder(
                    JaneInteractionType.BUTTON,
                    JaneInteractionGroup.NORMAL_FOLLOW_UP,
                    JaneInteractionNormalFollowUpSubgroups.timetable_actions,
                    `SELDATE-TODAY-${inputClass}`
                ).toString()
            ),
    ];

    if (!expanded) {
        components.push(
            new ButtonBuilder()
                .setEmoji(ellipsis.id)
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(
                    new JaneInteractionIdBuilder(
                        JaneInteractionType.BUTTON,
                        JaneInteractionGroup.NORMAL_FOLLOW_UP,
                        JaneInteractionNormalFollowUpSubgroups.timetable_actions,
                        `EXPAND-${inputDate}-${inputClass}`
                    ).toString()
                )
        );
    }

    const defaultActions = new ActionRowBuilder<ButtonBuilder>().addComponents(
        components
    );

    return defaultActions;
}

export function getExpandedTimetableActions(
    inputDate: TimetableDateResolvable,
    inputClass: ClassId
) {
    const components = [
        // TODO: Add Settings
        // new ButtonBuilder()
        //     .setEmoji(gear.id)
        //     .setCustomId(`SETTINGS-${inputDate}-${inputClass}`)
        //     .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setLabel("RAT")
            .setStyle(ButtonStyle.Link)
            .setURL(
                "https://accounts.google.com/AccountChooser?continue=https://docs.google.com/forms/d/e/1FAIpQLSeVNSYDIPQPjb7PlVZ6eafpnUagwQxT0BzK3fPxCE6WcQnVLw/viewform"
            ),
        new ButtonBuilder()
            .setEmoji(calendar.id)
            .setLabel("Calendar")
            .setCustomId(
                new JaneInteractionIdBuilder(
                    JaneInteractionType.BUTTON,
                    JaneInteractionGroup.NORMAL_FOLLOW_UP,
                    JaneInteractionNormalFollowUpSubgroups.timetable_actions,
                    `CALENDAR-${inputDate}-${inputClass}`
                ).toString()
            )
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setEmoji(pycnet.id)
            .setStyle(ButtonStyle.Link)
            .setURL("https://www2.pyc.edu.hk/pycnet/index.php"),
        new ButtonBuilder()
            .setEmoji(chevron_up.id)
            .setCustomId(
                new JaneInteractionIdBuilder(
                    JaneInteractionType.BUTTON,
                    JaneInteractionGroup.NORMAL_FOLLOW_UP,
                    JaneInteractionNormalFollowUpSubgroups.timetable_actions,
                    `COLLAPSE-${inputDate}-${inputClass}`
                ).toString()
            )
            .setStyle(ButtonStyle.Secondary),
    ];

    const expandedActions = new ActionRowBuilder<ButtonBuilder>().addComponents(
        components
    );

    return expandedActions;
}
