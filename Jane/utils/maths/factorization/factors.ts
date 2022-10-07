export function factors(number: number) {
    if (number % 1 !== 0) return [];
    return [...Array(number + 1).keys()].filter((i) => number % i === 0);
}