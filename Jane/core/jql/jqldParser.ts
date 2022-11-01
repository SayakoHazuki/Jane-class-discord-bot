/*
Given input:
@CE-1990-MATH-II-14
#Percentages
*1.0
r[[
    int 7 24;
    int 1 6;
    int 1 4
]]
v[[
    %EVAL[%R0*10000];
    %R1;
    %R2
]]
"\text{Find the amount (correct to the nearest dollar) of\:$%0\:at\:$1%\:p.a., compounded monthly, for\:%2\:years.}"
''
>![[
    %0 * ( 1 + ( %1 / 100 ) / 12 ) ^ ( %2 * 12 )
    | e // evaluates the value //
    | rnd dp 0 // rounds to nearest integer //
]]
>[[
    %0 * ( 1 + ( %1 / 50 ) )
    | e
    | rnd dp 0
]]
>[[
    %0 * ( 1 + ( %1 ^ 2 / 100 ) )
    | e 
    | rnd dp 0
]]
>[[
    %0 * ( 1 + ( %1 / 100 ) / 12 ) * 2
    | e 
    | rnd dp 0
]]

The output is:
 {
        "id": 1,
        "refCode": "DSE-2017-MATH-CP-2-Q1",
        "cedseRef": "2017 HKDSE Math(CP) Paper 2 Q1",
        "details": {
            "topic": "",
            "difficulty": ""
        },
        "randoms": [
            { "type": "int", "range": [2, 8] },
            { "type": "int", "range": [2, 6] }
        ],
        "vars": ["%R0", "%EVAL[%R0+%R1]", "%R1"],
        "question": "%0%N0^2-%1%N0%N1+%2%N1^2+%N0-%N1",
        "caption": "",
        "options": [
            {
                "correct": true,
                "formula": "(%N0-%N1)(%JQLFN[XM, %0, %1, %2, 0]%N0-%JQLFN[XM, %0, %1, %2, 1]%N1+1)",
                "simplify": true
            },
            {
                "correct": false,
                "formula": "(%N0-%N1)(%JQLFN[XM, %0, %1, %2, 0]%N0+%JQLFN[XM, %0, %1, %2, 1]%N1+1)",
                "simplify": true
            },
            {
                "correct": false,
                "formula": "(%N0+%N1)(%JQLFN[XM, %0, %1, %2, 0]%N0-%JQLFN[XM, %0, %1, %2, 1]%N1-1)",
                "simplify": true
            },
            {
                "correct": false,
                "formula": "(%N0+%N1)(%JQLFN[XM, %0, %1, %2, 0]%N0+%JQLFN[XM, %0, %1, %2, 1]%N1-1)",
                "simplify": true
            }
        ]
    }

make parser for the above input
*/

import { JQLQuestionData } from "./interfaces";
import { JQLQuestion } from "./question";
import { FormulaParser } from "./formulaParser";

export function parseJqlData(data: string): JQLQuestionData {
    /* A parser for the above input. Use the functions in formulaParser.ts to parse the formula strings. */
    const lines = data.split("\n");

    const question: JQLQuestionData = {
        id: 0,
        refCode: "",
        cedseRef: "",
        randoms: [],
        vars: [],
        question: "",
        caption: "",
        options: [],
        details: { topic: "", difficulty: "" },
    };

    let line = 0;
    let state = "id";
    while (line < lines.length) {
        const lineData = lines[line].trim().replace(/\/\*.+?\*\//g, "");

        if (lineData.length === 0) {
            line++;
            continue;
        }

        if (lineData.startsWith("@")) {
            state = "refCode";
            question.refCode = lineData.slice(1);

            // generate question id by interpreting refCode as base64 and convert it into decimal.
            // this is not a good way to generate id, but it works for now.

            const base64 =
                "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
            let id = 0;
            for (let i = 0; i < question.refCode.length; i++) {
                id = id * 64 + base64.indexOf(question.refCode[i]);
            }
            question.id = id;
        } else if (lineData.startsWith("#")) {
            (state = "topic"), (question.details.topic = lineData.slice(1));
        } else if (lineData.startsWith("*")) {
            state = "difficulty";
            question.details.difficulty = lineData.slice(1);
        } else if (lineData.startsWith("r[[")) {
            state = "randoms";
            const randoms = lineData.slice(3, lineData.length - 2);
            const randomsData = randoms.split(";");
            for (const random of randomsData) {
                const randomData = random.trim().split(" ");
                const randomType = randomData[0];
                const randomRange = randomData.slice(1).map((x) => parseInt(x));
                question.randoms.push({
                    type: randomType,
                    range: randomRange,
                });
            }
        } else if (lineData.startsWith("v[[")) {
            state = "vars";
            const vars = lineData.slice(3, lineData.length - 2);
            const varsData = vars.split(";");
            for (const varData of varsData) {
                question.vars.push(varData.trim());
            }
        } else if (lineData.startsWith('"')) {
            state = "question";
            question.question = lineData.slice(1, lineData.length - 1);
        } else if (lineData.startsWith("'")) {
            state = "caption";
            question.caption = lineData.slice(1, lineData.length - 1);
        } else if (lineData.startsWith(">")) {
            state = "options";
            const optionData = lineData.slice(1).split("]]");
            const optionFormula = optionData[0].slice(2);
            const optionSimplify = optionData[0].startsWith("| s");
            const optionEval = optionData[0].startsWith("| e");
            const optionRound = optionData[0].startsWith("| rnd")
                ? parseInt(optionData[0].split(" ")[2])
                : undefined;
            const optionCorrect = lineData.startsWith(">!");
            question.options.push({
                correct: optionCorrect,
                formula: optionFormula,
                simplify: optionSimplify,
                eval: optionEval,
            });
        }

        line++;
    }

    return question;
}
