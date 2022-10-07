import { crossMethod } from "./crossMethod";

function removeIf1(n: number | string) {
    return n === 1 || n === "1" ? "" : n.toString();
}

function addSign(n: number) {
    return n < 0 ? n.toString() : `+${n}`;
}

export function quadTrinomial(
    coefA: number,
    coefB: number,
    coefC: number,
    replacerX: string,
    replacerY: string
) {
    const [coefGrp1, coefGrp2] = crossMethod(coefA, coefB, coefC);
    return (
        "(" +
        removeIf1(coefGrp1[0]) +
        replacerX +
        addSign(coefGrp1[1]) +
        ")(" +
        removeIf1(coefGrp2[0]) +
        replacerY +
        addSign(coefGrp2[1]) +
        ")"
    );
}
