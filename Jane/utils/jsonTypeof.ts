const stringConstructor = "".constructor;
const arrayConstructor = [].constructor;
const objectConstructor = {}.constructor;

export function jsonTypeof(thing: any) {
    try {
        JSON.parse(thing);
        return "jsonString";
    } catch (e) {}
    if (thing === null) {
        return "null";
    }
    if (thing === undefined) {
        return "undefined";
    }
    if (thing.constructor === stringConstructor) {
        return "String";
    }
    if (thing.constructor === arrayConstructor) {
        return "Array";
    }
    if (thing.constructor === objectConstructor) {
        return "Object";
    }
    return "unknown";
};
