export function hcf(a: number, b: number): number {
    if (b == 0) {
        return a;
    }
    return hcf(b, a % b);
}