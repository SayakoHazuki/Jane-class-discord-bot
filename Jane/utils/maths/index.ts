import { crossMethod } from "./quadEquation/crossMethod";
import { quadTrinomial } from "./quadEquation/quadTrinomial";

import { factors } from "./factorization/factors";
import { factorsWithPosAndNeg } from "./factorization/factorsWithPosAndNeg";
import { round } from "./formatting/round";

export const JQLMath = {
    XM: crossMethod,
    QuadT: quadTrinomial,
    Ftrs: factors,
    SignnedFtrs: factorsWithPosAndNeg,
    Rnd: round,
};
