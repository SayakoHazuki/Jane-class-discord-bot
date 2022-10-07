import { hcf } from "./hcf";
export function hcfOfList(a: number[]) {
    return a.reduce(hcf);
}
