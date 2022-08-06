import { SchoolDay } from "../core/classes/dayTypes";
import { TimetableSection as Sect } from "../core/classes/lesson";
import { LessonTimeType, LessonType } from "../types/enums";

const classTimetablesJson = {
    "3A": [],
};

export const LessonTimes: { [key in LessonTimeType]: Sect[] } = {
    DFLT: [
        new Sect(LessonType.CTP, "0810-0840"),
        new Sect(LessonType.LESSON, "0840-0935"),
        new Sect(LessonType.LESSON, "0935-1030"),
        new Sect(LessonType.RECESS, "1030-1045"),
        new Sect(LessonType.LESSON, "1045-1140"),
        new Sect(LessonType.LESSON, "1140-1235"),
        new Sect(LessonType.LUNCH, "1235-1350"),
        new Sect(LessonType.LESSON, "1350-1445"),
        new Sect(LessonType.LESSON, "1445-1540"),
        new Sect(LessonType.EXTRA_LESSON, "1550-1645"),
    ],
    NORM: [
        new Sect(LessonType.CTP, "0810-0840"),
        new Sect(LessonType.LESSON, "0840-0935"),
        new Sect(LessonType.LESSON, "0935-1030"),
        new Sect(LessonType.RECESS, "1030-1045"),
        new Sect(LessonType.LESSON, "1045-1140"),
        new Sect(LessonType.LESSON, "1140-1235"),
        new Sect(LessonType.LUNCH, "1235-1350"),
        new Sect(LessonType.LESSON, "1350-1445"),
        new Sect(LessonType.LESSON, "1445-1540"),
        new Sect(LessonType.EXTRA_LESSON, "1540-1645"),
    ],
    SMMR: [
        new Sect(LessonType.CTP, "0810-0840"),
        new Sect(LessonType.LESSON, "0840-0930"),
        new Sect(LessonType.LESSON, "0930-1020"),
        new Sect(LessonType.RECESS, "1020-1035"),
        new Sect(LessonType.LESSON, "1035-1025"),
        new Sect(LessonType.LESSON, "1125-1215"),
        new Sect(LessonType.LUNCH, "1215-1320"),
        new Sect(LessonType.LESSON, "1320-1410"),
        new Sect(LessonType.LESSON, "1410-1500"),
        new Sect(LessonType.EXTRA_LESSON, "1505-1555"),
    ],
};


export class ClassTimetables {
    constructor() {}

    static get(classId: ClassId) {}
}
