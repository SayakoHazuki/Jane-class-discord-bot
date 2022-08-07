import { JaneClient } from "../../core/client";
import { CommandBuilder } from "../../core/commandBuilder";
import { initLogger } from "../../core/logger";
import { Timetable } from "../../utils/timetable";

const Logger = initLogger(__filename);

const commandOptions: CommandOptions = {
    name: "Timetable",
    command: "timetable",
    aliases: ["t", "tt"],
    category: "時間表",
    description: "查看課堂時間表",
    usage: "t",
    args: [
        {
            name: "日期",
            type: "string",
            description: "要查看的日期, 例如 `14/8`, `tmr`, `wed`, 預設為本日",
            required: false,
        },
        {
            name: "班別",
            type: "string",
            description: "要查看的班別, 預設為已儲存的班別(如有)",
            required: false,
        },
    ],
};

async function commandCallback(
    client: JaneClient,
    initiator: CommandInitiator,
    ...args: [string, string]
) {
    const [inputDate, inputClass] = args as [TimetableDateResolvable, ClassId];
    Logger.info(`d: ${inputDate}, c: ${inputClass}, f:${args}`);
    const timetable = new Timetable(inputClass, inputDate, initiator);
    const embed = await timetable.getEmbed();
    await initiator.strictReply({ content: "", embeds: [embed] });
    return;
}

export const command = class TestCommand extends CommandBuilder {
    constructor() {
        super(commandOptions, commandCallback);
    }
};
