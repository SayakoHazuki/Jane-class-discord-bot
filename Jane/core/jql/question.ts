import { simplify } from "mathjs";
import { FormulaParser } from "./formulaParser";
import { JQLQuestionData, JQLQuestionOption } from "./interfaces";

export class JQLQuestion {
    id: number;
    refCode: string;
    cedseRef: string;
    question: string;
    caption: string;
    options: JQLQuestionOption[];
    parser: FormulaParser;

    constructor(data: JQLQuestionData) {
        this.parser = new FormulaParser(data.randoms, data.vars);
        this.id = data.id;
        this.refCode = data.refCode;
        this.cedseRef = data.cedseRef;
        this.question = this.parser.parse(data.question);
        this.caption = this.parser.parse(data.caption);
        console.log(this.parser.vars);
        this.options = data.options.map<JQLQuestionOption>((option) => {
            let updatedFormula = this.parser.parse(option.formula);
            if (option.simplify)
                updatedFormula = updatedFormula.replace(
                    /1(?: )?([a-z])/g,
                    "$1"
                );
            return { ...option, formula: updatedFormula };
        });
        console.log(JSON.stringify(this.options));
    }
}
