import { fetch } from "undici";
import { LessonTimes } from "../../data/timetables";
import {
    SchoolDayType,
    DayOfCycle,
    LessonTimeType,
    Subjects,
} from "../../types/enums";
import { TimetableSection } from "./lesson";

export class SchoolDay implements TimetableDay {
    readonly type: SchoolDayType;
    cycleId: number;
    dayOfCycle: DayOfCycle;
    timetable: TimetableSection[];

    constructor(
        cycleId: number,
        dayOfCycle: DayOfCycle,
        timetable: LessonTimeType = LessonTimeType.DEFAULT
    ) {
        this.type = SchoolDayType.SCHOOL_DAY;
        this.cycleId = cycleId;
        this.dayOfCycle = dayOfCycle;
        this.timetable = LessonTimes[timetable];
    }

    async getLessons(classId: ClassId) {
        // const classTimetablesJSON = await import(
        //     "../../data/classTimetables.json"
        // );
        let lessonNames: string[];
        // if (classId in classTimetablesJSON) {
        //     lessonNames = classTimesJson[classId][
        //         this.dayOfCycle
        //     ] as Subjects[];
        // } else {
        const res = await fetch("https://iot.spyc.hk/timetable");
        const apiResults = (await res.json()) as {
            [key in ClassId]: {
                [key in DayOfCycle]: {
                    subject: string;
                    venue: string;
                }[];
            };
        };
        const lessonCodes = apiResults[classId][this.dayOfCycle].map((i) =>
            i.subject
                .split("/")
                .map((i) =>
                    i
                        .replace(/^LS$/g, "LIBS")
                        .replace(/^L&S$/g, "LS")
                        .replace(/^SCI\.A$/g, "BIO")
                        .replace(/^SCI\.B$/g, "CHEM")
                        .replace(/^SCI\.C$/g, "PHY")
                        .replace(/^([1-3])X$/g, "X$1")
                )
                .join("/")
        );
        lessonNames = lessonCodes.map((i) =>
            i
                .split("/")
                .map((subj) => Subjects[subj as keyof typeof Subjects])
                .join("/")
        );
        // }
        return { a: apiResults[classId][this.dayOfCycle], lessonNames };
    }
}

export function Test() {
    (async () => {
        outer: for (const day of ["F", "G", "H"]) {
            for (const grade of ["4", "6"]) {
                for (const cls of ["A", "B", "C", "D"]) {
                    const tmp = await new SchoolDay(
                        13,
                        DayOfCycle[day as keyof typeof DayOfCycle]
                    ).getLessons(`${grade}${cls}` as ClassId);
                    if (
                        tmp.lessonNames.filter(
                            (i) => i === undefined || i === ""
                        ).length
                    ) {
                        console.log(tmp.a);
                        console.log(`${grade}${cls}`, tmp);
                        break outer;
                    }
                    console.log(tmp.lessonNames);
                    console.log(
                        `Test passed for case class ${grade}${cls} - ${day}`
                    );
                }
            }
        }
    })();
}
