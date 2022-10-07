import { request } from "undici";
import { JaneHTTPError } from "../classes/errors";
import { ErrorCode } from "../../types/enums";
import { initLogger } from "../logger";

const Logger = initLogger(__filename);

interface LatexImageData {
    base64: string;
    type: string;
    equation: string;
    url: string;
}

const newline = "\\\\";

export class LatexImage {
    buffer: Buffer;

    constructor({ base64, type, equation, url }: LatexImageData) {
        this.buffer = Buffer.from(base64, "base64");
    }
}

export async function getLatexImageBuffer(
    eq: string,
    ...answers: string[]
): Promise<LatexImage> {
    let latexEq = eq;
    if (answers.length) {
        latexEq = `${eq}${newline}${newline}${answers.join(newline)}`;
    }
    latexEq = encodeURIComponent(latexEq)
    Logger.warn(latexEq);
    const res = await request(`https://latex.codecogs.com/png.json?${latexEq}`);

    if (res.statusCode.toString().startsWith("2")) {
        return new LatexImage((await res.body.json()).latex);
    }

    throw new JaneHTTPError(
        "Unknown error while retrieving latex image data",
        ErrorCode.HTTP_UNEXPECTED_STATUS
    );
}
