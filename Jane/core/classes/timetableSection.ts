import { LessonType } from "../../types/enums";

export class TimetableSection {
    type: LessonType;
    time: {
        start: { h: number; m: number; string: string };
        end: { h: number; m: number; string: string };
    };

    constructor(type: LessonType, time: `${number}-${number}`);
    constructor(type: LessonType, from: `${number}`, to: `${number}`);

    constructor(
        type: LessonType,
        time: `${number}-${number}` | `${number}`,
        to?: `${number}`
    ) {
        this.type = type;
        const _from = <RegExpMatchArray>(
            (to ? time.match(/.{1,2}/g) : time.split("-")[0].match(/.{1,2}/g))
        );
        const _to = <RegExpMatchArray>(
            (to ? to.match(/.{1,2}/g) : time.split("-")[1].match(/.{1,2}/g))
        );
        this.time = {
            start: {
                h: Number(_from[0]),
                m: Number(_from[1]),
                string: _from.join(":"),
            },
            end: {
                h: Number(_to[0]),
                m: Number(_to[1]),
                string: _to.join(":"),
            },
        };
    }
}
