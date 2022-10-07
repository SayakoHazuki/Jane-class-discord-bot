import * as math from "mathjs";
import { JqlFormulaRandom } from "./interfaces";

import { JQLMath } from "../../utils/maths/index";

export class FormulaParser {
    vars: string[];
    randoms: number[];
    unknowns: string[];

    constructor(randoms: JqlFormulaRandom[], vars: string[]) {
        this.vars = [];
        this.unknowns = "abcdefghjklmnpqrstuvwxyz".split("").sort(function () {
            return 0.5 - Math.random();
        });
        this.randoms = randoms.map((exp) => {
            if (exp.type === "int") {
                return (
                    Math.floor(
                        Math.random() * (exp.range[1] - exp.range[0] + 1)
                    ) + exp.range[0]
                );
            }
            return 0;
        });
        for (let i = 0; i < vars.length; i++) {
            if (vars[i]) this.vars.push(this.parse(vars[i]));
        }
    }

    private replaceVars(text: string) {
        return text
            .replace(/(?<!\\)((?:\\\\)*)%([0-9])/g, (_, $1, $2) => {
                if (isNaN($2)) return _;
                const n = Number($2);
                return `${$1}${this.vars[n]}`;
            })
            .replace(/(?<!\\)((?:\\\\)*)%N([0-9])/g, (_, $1, $2) => {
                if (isNaN($2)) return _;
                const n = Number($2);
                return `${$1}${this.unknowns[n]}`;
            })
            .replace(/(?<!\\)((?:\\\\)*)%R([0-9])/g, (_, $1, $2) => {
                if (isNaN($2)) return _;
                const n = Number($2);
                return `${$1}${this.randoms[n]}`;
            });
    }

    parse(text: string) {
        return this.replaceVars(
            text
                .replace(/%JQLFN\[([^\],]*), ([^\]]*)\]/g, (_, $1, $2) => {
                    return (
                        JQLMath?.[$1 as keyof typeof JQLMath]?.(
                            //@ts-ignore
                            ...this.replaceVars($2).split(/(?: )?,/).map(a => isNaN(a) ? a : Number(a))
                        )?.toString() ?? ""
                    );
                })
                .replace(/%EVAL\[([^\]]*)\]/g, (_, $1) => {
                    console.warn($1);
                    return math.evaluate(this.replaceVars($1));
                })
        );
    }
}
