import { factorsWithPosAndNeg } from "../factorization/factorsWithPosAndNeg";
import { hcfOfList } from "../factorization/hcfOfList";

export function crossMethod(
    coefA: number,
    coefB: number,
    coefC: number
): [number, number][];
export function crossMethod(
    coefA: number,
    coefB: number,
    coefC: number,
    returnIndex: number
): number;
export function crossMethod(
    coefA: number,
    coefB: number,
    coefC: number,
    returnIndex?: number
) {
    const hcf = hcfOfList([coefA, coefB, coefC]);
    if (hcf > 1) {
        coefA = coefA / hcf;
        coefB = coefB / hcf;
        coefC = coefC / hcf;
    }
    console.warn(coefA, coefB, coefC);

    const negA = coefA < 0;
    const negC = coefC < 0;

    const factorsA = factorsWithPosAndNeg(Math.abs(coefA));
    const factorsC = factorsWithPosAndNeg(Math.abs(coefC));

    let i = 0;
    let l = 0;
    let res: [number, number][] = [];

    let lenFtrsA = factorsA.length;
    let lenFtrsC = factorsC.length;
    for (i = 0; i < lenFtrsA; i++) {
        const l1 = negA ? -1 * factorsA[i] : factorsA[i];
        const l2 = factorsA[lenFtrsA - i - 1];

        for (l = 0; l < lenFtrsC; l++) {
            const r1 = negC ? -1 * factorsC[l] : factorsC[l];
            const r2 = factorsC[lenFtrsC - l - 1];

            const product1 = l1 * r2;
            const product2 = l2 * r1;

            const sum = product1 + product2;
            if (sum === coefB) {
                res =
                    Math.abs(l1) + Math.abs(r1) > Math.abs(l2) + Math.abs(r2)
                        ? [
                              [l1, r1],
                              [l2, r2],
                          ]
                        : [
                              [l2, r2],
                              [l1, r1],
                          ];
                break;
            }
        }
    }
    return returnIndex !== undefined && !isNaN(returnIndex) && returnIndex <= 3
        ? returnIndex > 1
            ? res[1]?.[returnIndex - 2]
            : res[0]?.[returnIndex]
        : res;
}
