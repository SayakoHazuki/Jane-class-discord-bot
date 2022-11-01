export interface JqlFormulaRandom {
    type: string;
    range: number[];
}

export type JQLRoundingConfig =
    | {
          dp: number;
      }
    | {
          sigfig: number;
      };

export interface JQLQuestionOption {
    correct: boolean;
    formula: string;
    simplify?: boolean;
    eval?: boolean;
    round?: JQLRoundingConfig;
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
    details: { topic: string; difficulty: string };
}
