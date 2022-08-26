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

function getSubjCode(subj: apiSubjectName) {
    return Subjects[toJaneSubjectsEnumKey(subj)];
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

        const electiveClasses = await import(
            "../../data/electiveClassesInfo.json"
        );

        const lessons = classTimetablesJson[classId][this.dayOfCycle] as {
            subject: string;
            venue: string;
        }[];

        const lessonStrings = lessons.map((i) => {
            let thisLessonString = "";
            if (/^S4_[1-3]X$/.exec(i.subject)) {
                let electiveStrings: string[] = [];
                electiveClasses.S4[
                    i.subject.replace(
                        /S4_(..)/,
                        "$1"
                    ) as keyof typeof electiveClasses.S4
                ].forEach((i) =>
                    electiveStrings.push(
                        `${getSubjCode(i.subject as apiSubjectName).replace(
                            /(?: )?\(.+\)/g,
                            ""
                        )} ${i.venue}`
                    )
                );
                thisLessonString = `${i.subject.replace(
                    /S4_(..)/,
                    "$1"
                )}\n\u2800|\u2800 ${wrapString(
                    electiveStrings.join("/"),
                    undefined,
                    "\\/",
                    "\\/\n\u2800|\u2800 "
                )}`;
            } else {
                thisLessonString = `${i.subject
                    .split("/")
                    .map((subj) => getSubjCode(subj as apiSubjectName))
                    .join("/")} ${i.venue}`;
            }
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
            if (/^S4_[1-3]X$/.exec(i.subject)) {
                let electiveStrings: string[] = [];
                electiveClasses.S4[
                    i.subject.replace(
                        /S4_(..)/,
                        "$1"
                    ) as keyof typeof electiveClasses.S4
                ].forEach((i) =>
                    electiveStrings.push(
                        `${getSubjCode(i.subject as apiSubjectName)} ${i.venue}`
                    )
                );
                thisLessonString = `${i.subject.replace(
                    /S4_(..)/,
                    "$1"
                )} (${electiveStrings.join("/")})`;
            } else {
                thisLessonString = `${i.subject
                    .split("/")
                    .map((subj) => getSubjCode(subj as apiSubjectName))
                    .join("/")} ${i.venue}`;
            }
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
