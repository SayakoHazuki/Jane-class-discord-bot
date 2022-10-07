import { crossMethod } from "./quadEquation/crossMethod";
import { quadTrinomial } from "./quadEquation/quadTrinomial";

import { factors } from "./factorization/factors";
import { factorsWithPosAndNeg } from "./factorization/factorsWithPosAndNeg";

export const JQLMath = {
    XM: crossMethod,
    QuadT: quadTrinomial,
    Ftrs: factors,
    SignnedFtrs: factorsWithPosAndNeg,
};
