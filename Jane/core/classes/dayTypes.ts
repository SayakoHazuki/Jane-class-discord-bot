import { fetch, request } from "undici";
import { LessonTimes } from "../../data/timetables";
import {
    SchoolDayType,
    DayOfCycle,
    LessonTimeType,
    Subjects,
    ErrorCode,
} from "../../types/enums";
import { wrapString } from "../../utils/utility-functions";
import { JaneGeneralError, JaneHTTPError } from "./errors";
import { TimetableSection } from "./timetableSection";
import electivesClassesInfo from "../../data/electiveClassesInfo.json";
import { initLogger } from "../logger";

const Logger = initLogger(__filename);

function getSubjCode(subj: apiSubjectName) {
    subj = subj.trim() as apiSubjectName;
    if (toJaneSubjectsEnumKey(subj) in Subjects) {
        return Subjects[toJaneSubjectsEnumKey(subj)];
    } else {
        Logger.warn("Subject code not found", subj);
        return subj;
    }
}

function lessonClassesToString(
    c: string,
    s: { subject: string; venue: string }
) {
    const subjects = s.subject.split("/").map((s) => s.trim());

    if (subjects.length >= 3 && ["4", "5", "6"].includes(c) && `S${c}` in electivesClassesInfo) {
        // Elective Class
        Logger.info("Looking for corresponding elective class", subjects);
        for (const { name, identifier } of electivesClassesInfo[
            `S${c}` as keyof typeof electivesClassesInfo
        ]) {
            if (subjects.includes(identifier)) {
                Logger.info("Found corresponding elective class", name);
                return `選修課 ${name}`;
            }
        }
    }

    return `${subjects
        .map((subj) => getSubjCode(subj as apiSubjectName))
        .join("/")} ${s.venue}`;
}

type apiSubjectName =
    | keyof typeof Subjects
    | "LS"
    | "L&S"
    | "SCI.A"
    | "SCI.B"
    | "SCI.C"
    | "1X"
    | "2X"
    | "3X";

function toJaneSubjectsEnumKey(apiSubjectName: apiSubjectName) {
    return apiSubjectName
        .replace(/^LS$/g, "LIBS")
        .replace(/^L&S$/g, "LS")
        .replace(/^THS$/g, "TH")
        .replace(/^SCI\.A$/g, "BIO")
        .replace(/^SCI\.B$/g, "CHEM")
        .replace(/^SCI\.C$/g, "PHY")
        .replace(/^([1-3])X$/g, "X$1") as keyof typeof Subjects;
}

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

    async getLessonStrings(classId: ClassId) {
        const apiClassTimetablesJson = await import(
            "../../data/apiClassTimetables.json"
        );
        const localClassTimetablesJson = await import(
            "../../data/localClassTimetables.json"
        );
        const classTimetablesJson = {
            ...apiClassTimetablesJson,
            ...localClassTimetablesJson,
        } as {
            [k in ClassId]: {
                [k in DayOfCycle]: {
                    subject: string;
                    venue: string;
                }[];
            };
        };

        const lessons = classTimetablesJson[classId][this.dayOfCycle] as {
            subject: string;
            venue: string;
        }[];

        const lessonStrings = lessons.map((i) => {
            let thisLessonString = "";
            thisLessonString = lessonClassesToString(classId.charAt(0), i);
            return thisLessonString;
        });

        return lessonStrings;
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

    async getLessonStrings(classId: ClassId) {
        const apiClassTimetablesJson = await import(
            "../../data/apiClassTimetables.json"
        );
        const localClassTimetablesJson = await import(
            "../../data/localClassTimetables.json"
        );
        const classTimetablesJson = {
            ...apiClassTimetablesJson,
            ...localClassTimetablesJson,
        } as {
            [k in ClassId]: {
                [k in DayOfCycle]: {
                    subject: string;
                    venue: string;
                }[];
            };
        };

        const electiveClasses = await import(
            "../../data/electiveClassesInfo.json"
        );

        const lessons = classTimetablesJson[classId][this.dayOfCycle] as {
            subject: string;
            venue: string;
        }[];

        const lessonStrings = lessons.map((i) => {
            let thisLessonString = "";
            thisLessonString = lessonClassesToString(classId.charAt(0), i);
            return thisLessonString;
        });

        return lessonStrings;
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
                    ).getLessonStrings(`${grade}${cls}` as ClassId);
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
