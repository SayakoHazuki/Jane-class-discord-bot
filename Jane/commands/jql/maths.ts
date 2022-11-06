import { AttachmentBuilder } from "discord.js";
import { JaneClient } from "../../core/client";
import { CommandBuilder } from "../../core/commandBuilder";
import { getLatexImageBuffer } from "../../core/jql/api";
import { JqlQuestionImage } from "../../core/jql/canvas";
import { QuestionsLib } from "../../core/jql/questionsLib";
import { initLogger } from "../../core/logger";
import { JaneEmbedBuilder } from "../../utils/embedBuilder";

const Logger = initLogger(__filename);
const alphabets = "ABCDEFGHIJK".split("");

const commandOptions: CommandOptions = {
    name: "maths",
    command: "jql-maths",
    aliases: [],
    category: "jql",
    description: "generate maths question",
    usage: "jql-maths",
    args: [],
};

async function commandCallback(
    client: JaneClientT,
    initiator: CommandInitiator
) {
    return;
    const jqlQuestion = QuestionsLib.getRandom((q) => q.id === 3);

    const equationImage = await getLatexImageBuffer(
        jqlQuestion.question,
        ...jqlQuestion.options.map(
            (q, i) => `${alphabets[i]}.\\:\\:${q.formula}`
        )
    );
    const embedImage = await new JqlQuestionImage({
        type: "latex",
        captions: "",
        equationImage,
    }).load();

    const imageBuffer = embedImage.buffer
    if (imageBuffer == undefined || !(imageBuffer instanceof Buffer)) return;
    const attachmentName = `${encodeURIComponent(jqlQuestion.refCode)}.png`;
    const file = new AttachmentBuilder(imageBuffer, {
        name: attachmentName,
    });

    const replyEmbed = new JaneEmbedBuilder(
        "reply",
        "JQL (beta)",
        `Reference: ${jqlQuestion.cedseRef}`,
        {},
        initiator
    ).setImage(`attachment://${attachmentName}`);

    await initiator.strictReply({ embeds: [replyEmbed], files: [file] });
}

export const command = class TestCommand extends CommandBuilder {
    constructor() {
        super(commandOptions, commandCallback);
    }
};
