import daysJson from "../data/sd.json";
import timetableJson from "../data/tt.json";
import classTimesJson from "../data/classTimes.json";
import lessonLinksJson from "../data/classlink.json";

import path from "path";
const logger: JaneLogger = require("../core/logger")(__filename);

import { readFileSync } from "fs";

export class Timetable {
    cls: string;
    date: keyof typeof daysJson;
    cycleDay?: CycleDay;
    lessons?: Lesson[];
    options: Partial<TimetableOptions>;

    constructor(cls: string, date, options: TimetableOptions) {
        if (!/^[34][ABCD]$/.test(cls)) throw {};
        if (!(date in daysJson)) throw {};

        this.cls = cls;
        this.date = date as keyof typeof daysJson;
        this.options = options;
    }

    async getEmbed() {
        
    }
}
