import { Canvas, createCanvas, loadImage } from "canvas";
import { AttachmentBuilder } from "discord.js";
import { LatexImage } from "./api";

interface JqlQuestionImageOptions {
    type: "latex";
    captions: string;
    equationImage: LatexImage;
}

export class JqlQuestionImage {
    options: JqlQuestionImageOptions;
    canvas: Canvas;
    buffer?: Buffer;

    constructor(options: JqlQuestionImageOptions) {
        this.options = options;
        this.canvas = createCanvas(800, 450);
    }

    async load(): Promise<JqlQuestionImage> {
        const image = await loadImage(this.options.equationImage.buffer);

        let dh, dw;
        const maxW = 700;
        const autoH = (maxW / image.width) * image.height;
        if (autoH > 250) {
            dh = 250;
            dw = (250 / image.height) * image.width;
        } else {
            dw = maxW;
            dh = autoH;
        }

        this.canvas = createCanvas(800, dh + 50);

        const ctx = this.canvas.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, 800, dh + 50);
        ctx.drawImage(image, 50, 25, dw, dh);

        this.buffer = this.canvas.toBuffer();
        return this;
    }
}
