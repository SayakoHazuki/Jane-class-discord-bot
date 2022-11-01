import { JQLRoundingConfig } from "../../../core/jql/interfaces";
import * as math from "mathjs";

export function round(expression: number | string, config?: JQLRoundingConfig) {
    console.warn(expression)
    if (!isNaN(Number(expression))) {
        if (!config) {
            expression = math.round(Number(expression));
        } else {
            if ("dp" in config) {
                expression = math
                    .round(Number(expression), config.dp)
                    .toString();
            }
            if ("sigfig" in config) {
                expression = math.format(Number(expression), {
                    precision: config.sigfig,
                });
            }
        }
    }
    return expression.toString();
}
