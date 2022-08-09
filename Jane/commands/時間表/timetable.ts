import { JaneClient } from "../../core/client";
import { CommandBuilder } from "../../core/commandBuilder";
import { Database } from "../../core/classes/database";
import { initLogger } from "../../core/logger";
import { Timetable } from "../../utils/timetable";
import { formatTimeString } from "../../utils/utility-functions";

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
    let [inputDate, inputClass] = args as [TimetableDateResolvable?, ClassId?];
    const user = await Database.getUser(initiator.user.id);
    if (!inputDate)
        inputDate = formatTimeString(
            new Date(),
            "dd/MM"
        ) as TimetableDateResolvable;
    if (!inputClass) {
        if (user.studentClass) {
            inputClass = user.studentClass;
        } else {
            inputClass = "1A";
        }
    }
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
