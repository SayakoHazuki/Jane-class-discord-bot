import { JQLQuestion } from "./question";
import { parseJqlData } from "./jqldParser";

import fs from "fs";
import { JQLQuestionData } from "./interfaces";

/* Under the directory ( join this directory and ../../data/db/jql/maths), read all the files with the extension .jqld and parse them using parseJqlData. */
/* use import for imports */

const dataDir = __dirname + "/../../data/db/jql/maths";
const files = fs.readdirSync(dataDir);
const questions: JQLQuestionData[] = [];
for (const file of files) {
    if (file.endsWith(".jqld")) {
        const data = fs.readFileSync(`${dataDir}/${file}`, "utf8");
        // split the data by \n~~~\n and create question using data
        const questionData = data.split("\n~~~\n");
        for (const q of questionData) {
            questions.push(parseJqlData(q));
        }
        // write questionData to a file
        fs.writeFileSync(
            `${dataDir}/${file.slice(0, file.length - 5)}.json`,
            JSON.stringify(questions)
        );
        
    }
}

export class QuestionsLib {
    constructor() {}

    static getRandom(
        filter: (predicateValue: JQLQuestionData) => boolean
    ): JQLQuestion {
        const filteredQuestions = (questions as JQLQuestionData[]).filter(
            filter
        );
        return new JQLQuestion(
            filteredQuestions[
                Math.floor(Math.random() * filteredQuestions.length)
            ]
        );
    }
}
