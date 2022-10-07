import { factors } from "./factors";

export function factorsWithPosAndNeg(n: number) {
    const ftrs = factors(n);
    const res = ftrs.reduce<number[]>((list, elem, i) => {
        if (i < ftrs.length / 2) {
            list.push(elem);
            list.push(-1 * elem);
        } else {
            list.push(-1 * elem);
            list.push(elem);
        }
        return list;
    }, []);
    return res;
}
