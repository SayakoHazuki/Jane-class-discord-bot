import { JQLQuestion } from "./question";
import S4Maths from "../../data/db/jql/maths/s4.json";
import { JQLQuestionData } from "./interfaces";
const QUESTIONS = [...S4Maths];

export class QuestionsLib {
    constructor() {}

    static getRandom(
        filter: (predicateValue: JQLQuestionData) => boolean
    ): JQLQuestion {
        const filteredQuestions = (QUESTIONS as JQLQuestionData[]).filter(
            filter
        );
        return new JQLQuestion(
            filteredQuestions[
                Math.floor(Math.random() * filteredQuestions.length)
            ]
        );
    }
}
