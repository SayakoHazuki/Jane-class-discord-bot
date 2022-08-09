import { fetch, request } from "undici";
import { LessonTimes } from "../../data/timetables";
import {
    SchoolDayType,
    DayOfCycle,
    LessonTimeType,
    Subjects,
    ErrorCode,
} from "../../types/enums";
import { JaneGeneralError, JaneHTTPError } from "./errors";
import { TimetableSection } from "./timetableSection";

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
        let lessonNames: string[];
        const classTimetablesJson = (await import(
            "../../data/classTimetables.json"
        )) as {
            [k in ClassId]: {
                [k in DayOfCycle]: {
                    subject: string;
                    venue: string;
                }[];
            };
        };
        const lessonCodes = classTimetablesJson[classId][this.dayOfCycle].map(
            (i) =>
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
        return lessonNames;
    }
}

export class SpecialSchoolDay implements TimetableDay {
    readonly type: SchoolDayType;
    cycleId: number;
    dayOfCycle: DayOfCycle;
    timetable: TimetableSection[];
    remarks: string;

    constructor(
        cycleId: number,
        dayOfCycle: DayOfCycle,
        timetable: TimetableSection[],
        remarks: string
    ) {
        this.type = SchoolDayType.SPECIAL_SCHOOL_DAY;
        this.cycleId = cycleId;
        this.dayOfCycle = dayOfCycle;
        this.timetable = timetable;
        this.remarks = remarks;
    }

    async getLessons(classId: ClassId) {
        let lessonNames: string[];
        const classTimetablesJson = (await import(
            "../../data/classTimetables.json"
        )) as {
            [k in ClassId]: {
                [k in DayOfCycle]: {
                    subject: string;
                    venue: string;
                }[];
            };
        };
        const lessonCodes = classTimetablesJson[classId][this.dayOfCycle].map(
            (i) =>
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
        return lessonNames;
    }
}

export class Holiday implements TimetableDay {
    readonly type: SchoolDayType;
    title: string;
    description: string;

    constructor(title: string, description: string) {
        this.type = SchoolDayType.HOLIDAY;
        this.title = title;
        this.description = description;
    }
}

export class UnspecifiedTimetableDay implements TimetableDay {
    readonly type: SchoolDayType;
    title: string;
    description: string;

    constructor(title: string, description: string) {
        this.type = SchoolDayType.UNSPECIFIED;
        this.title = title;
        this.description = description;
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
                    if (tmp.filter((i) => i === undefined || i === "").length) {
                        console.log(tmp);
                        console.log(`${grade}${cls}`, tmp);
                        break outer;
                    }
                    console.log(tmp);
                    console.log(
                        `Test passed for case class ${grade}${cls} - ${day}`
                    );
                }
            }
        }
    })();
}
