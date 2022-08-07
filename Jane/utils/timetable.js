import daysJson from "../data/sd.json";
import timetableJson from "../data/tt.json";
import classTimesJson from "../data/classTimes.json";
import lessonLinksJson from "../data/classlink.json";

import path from "path";
const logger = new (require("./terminal"))(__filename);
import { readFileSync } from "fs";
import { EmbedBuilder } from "discord.js";

const monthNumber = (m: any) =>
    new Date(Date.parse(`${m} 1, 2012`)).getMonth() + 1;
const toTwoDigit = (i: any) => `0${i}`.slice(-2);

const numberEmojis = [":one:", ":two:", ":three:", ":four:", ":five:", ":six:"];
const divider = "━━━━━━━━━━━━━━━━";

module.exports = class TimetableEmbed {
    class: string | undefined;
    date: string;
    dateDay: string | undefined;
    dateMonth: number | undefined;
    isSchoolDay: boolean | undefined;
    day: any;
    embed: any;
    isOddCycle: boolean | undefined;
    lessons: never[] | undefined | undefined;
    lessonsList: string | undefined;
    options: { showTime: boolean, showLinks: true };
    timeList: any;

    constructor(
        date: string,
        timetable = "ONLINE",
        showLinks = true,
        sClass: string
    ) {
        // timetable = "HALFDAYLONG";
        // this.date = date;
        // this.options = {
        // showTime: true,
        // showLinks: showLinks || true,
        // };

        // if (!["3A", "3B", "3C", "3D"].includes(sClass)) return;
        // this.class = sClass;

        // if (!(date in daysJson)) return;
        // const [w1, cycle, w2, day] =
        // daysJson[date as keyof typeof daysJson].split(" ");

        this.isSchoolDay = w1 === "Cycle" && w2 === "Day";
        if (!this.isSchoolDay) throw this.getHolidayEmbed();

        if (isNaN(cycle)) {
            return Logger.error(
                `Cycle is ${typeof cycle} (${cycle}), expected Number.`
            );
        }

        this.isOddCycle = Number(cycle) % 2 === 1;

        this.dateMonth = monthNumber(date.replace(/[0-9]/g, ""));
        this.dateDay = date.replace(/[a-zA-Z]/g, "");

        this.day = day;

        if (this.day.includes("[")) {
            this.lessons = [];
            for (const lessonCode of day.split("+")) {
                const [_day, _sessNumber] = lessonCode
                    .replace("]", "")
                    .split("[");
                let [_from, _to] = _sessNumber.split("-");
                _to ??= Number(_from);

                for (let i = Number(_from) - 1; i < Number(_to); i++) {
                    this.lessons.push(
                        timetableJson[sClass][_day].split(" ")[i]
                    );
                }
            }
        } else {
            this.lessons = timetableJson[sClass][this.day].split(" ");
        }

        if (date in classTimesJson) {
            this.timeList = classTimesJson[date];
        } else {
            this.timeList = classTimesJson[timetable];
        }
        this.timeList ??= classTimesJson.NORMAL;

        this.lessonsList = "";
        for (let i = 0; i < this.lessons.length; i++) {
            this.addLesson(i);
        }

        this.embed = this.getEmbed();
    }

    getEmbed() {
        const footerList = [
            "請記得準備所需教材喔",
            "請記得檢查功課是不是做完了喔",
            "明天也要加油喔",
        ];
        const footer =
            footerList[Math.floor(Math.random() * footerList.length)];

        const discordTimestamp = `<t:${Math.round(
            new Date(
                `2021-${toTwoDigit(this.dateMonth)}-${toTwoDigit(
                    this.dateDay
                )}T12:00:00`
            ).getTime() / 1000
        )}:D>`;

        const dayOfWeek = `[${
            daysJson[this.date].split("(")[1].replace(/[()]/g, "") || ""
        }]`;

        const dayDescription = `${
            daysJson[this.date].split("(")[0] || daysJson[this.date]
        }`;

        return new EmbedBuilder()
            .setAuthor({
                name: `[${this.class}] 日期資訊 Date info`,
                iconURL: "https://i.imgur.com/wMfgtoW.png?1",
            })
            .setDescription(
                `${divider}\n:exclamation: 請記得每日填寫\n<:googleforms:970686916938858536> [21-22 學生快速抗原測試紀錄](https://forms.gle/Q1PexxyeJb5KJ46r8)\n(https://forms.gle/Q1PexxyeJb5KJ46r8)\n${divider}\n${discordTimestamp} ${dayOfWeek}\n${dayDescription}\n\u2800`
            )
            .setColor("#ACE9A6")
            .setFooter({
                text: "簡 Jane",
                iconURL:
                    "https://cdn.discordapp.com/avatars/801354940265922608/daccb38cb0e479aa002ada8d2b2753df.webp?size=1024",
            })
            .addField("課堂列表", this.lessonsList + `${divider}\n${footer}`)
            .setTimestamp();
    }

    getHolidayEmbed() {
        const footerList = [
            "趁著難得的假期好好放鬆一下吧",
            "請好好享受假期吧",
            "最近真是辛苦了，休閒的度過假期吧",
            "會有特別的假期安排嗎？",
        ];

        const discordTimestamp = `<t:${Math.round(
            new Date(
                `2021-${toTwoDigit(this.dateMonth)}-${toTwoDigit(
                    this.dateDay
                )}T12:00:00`
            ).getTime() / 1000
        )}:D>`;

        const footer =
            footerList[Math.floor(Math.random() * footerList.length)];

        return new EmbedBuilder()
            .setAuthor({
                name: "日期資訊 Date info",
                iconURL: "https://i.imgur.com/wMfgtoW.png?1",
            })
            .setDescription(`${discordTimestamp}是假期喔 ${footer}`)
            .setColor("#ACE9A6")
            .setFooter(
                "簡 Jane",
                "https://cdn.discordapp.com/avatars/801354940265922608/daccb38cb0e479aa002ada8d2b2753df.webp?size=1024"
            )
            .setTimestamp();
    }

    addLesson(i: number) {
        const lessonPrefix = this.options.showTime
            ? `${this.timeList[i]}\n`
            : `${numberEmojis[i]} `;

        const lessonArrangements = JSON.parse(
            readFileSync(
                path.join(
                    __dirname,
                    "../commands/info/data/lessonArrangements.json"
                ),
                "utf8"
            )
        );

        let displayLink;

        if (this.options.showLinks) {
            const links = this.getLinks(i);
            displayLink = markdownLink(
                links,
                this.class,
                this.lessons[i].replace(
                    "MUS/DE",
                    `${this.isOddCycle ? "DE" : "MUS"}`
                )
            );
        } else {
            displayLink = "";
        }

        if (this.date in lessonArrangements[this.class]) {
            for (const arrangement of lessonArrangements[this.class][
                this.date
            ]) {
                Logger.info("Lesson Arrangement detected.");
                if (lessonArrangements.period === i) {
                    this.lessons[
                        i
                    ] = `~~${arrangement.from}~~ **${arrangement.to}**`;
                    displayLink = this.options.showLinks
                        ? `[按此進入 ${arrangement.to} 課室](${arrangement.link})\n`
                        : "";
                }
            }
        }

        this.lessonsList += `${lessonPrefix}${
            this.lessons.map((i: string) =>
                i.replace("MUS/DE", `${this.isOddCycle ? "DE" : "MUS"}`)
            )[i]
        } ${displayLink}\n`;
    }

    getLinks(i: string | number) {
        let links;

        let lessonCode = this.lessons[i];
        switch (lessonCode) {
            case "MUS/DE":
                lessonCode = this.isOddCycle ? "DE" : "MUS";
                break;

            case "PE":
                links = [
                    lessonLinksJson[this.class]["PE-boys"],
                    lessonLinksJson[this.class]["PE-girls"],
                ];
                break;

            case "SPEAK":
                links = [
                    lessonLinksJson[this.class].ENG,
                    lessonLinksJson[this.class].NET,
                ];
                break;
        }

        links ??= [lessonLinksJson[this.class][lessonCode]];
        return links;
    }
};

const lesson1BySubj = (subj: string) =>
    subj === "PE" ? "PE(Boys)" : "Speaking(ENG)";
const lesson2BySubj = (subj: string) =>
    subj === "PE" ? "PE(Girls)" : "Speaking(NET)";

function markdownLink(links: string | any[], _class: any, lessonCode: any) {
    let lesson1Type = "網課";
    if (links[0].includes("zoom")) {
        lesson1Type = "Zoom";
    } else if (links[0].includes("meet")) {
        lesson1Type = "Meet";
    }

    const notFound = (i: number | undefined) =>
        `[找不到${_class} ${
            !i
                ? lessonCode
                : i === 1
                ? lesson1BySubj(lessonCode)
                : lesson2BySubj(lessonCode)
        }的課室連結]`;

    return links?.length === 2
        ? `${
              links[0] === ""
                  ? notFound(1)
                  : `[按此進入${lesson1BySubj(lessonCode)}課室](${links[0]})`
          } / ${
              links[1] === ""
                  ? notFound(2)
                  : `[按此進入${lesson2BySubj(lessonCode)}課室](${links[1]})`
          }\n`
        : !links || !links[0]
        ? `${notFound()}\n`
        : `[按此進入 ${lessonCode} 課室 (${lesson1Type})](${links[0]})\n`;
}
