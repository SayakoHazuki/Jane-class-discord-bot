export interface JqlFormulaRandom {
    type: string;
    range: number[];
}

export interface JQLQuestionOption {
    correct: boolean;
    formula: string;
    simplify?: boolean;
}

export interface JQLQuestionData {
    id: number;
    refCode: string;
    cedseRef: string;
    randoms: JqlFormulaRandom[];
    vars: string[];
    question: string;
    caption: string;
    options: JQLQuestionOption[];
}
