import { JaneClient } from "../../core/client";
import { CommandBuilder } from "../../core/commandBuilder";
import { Database } from "../../core/classes/database";
import { initLogger } from "../../core/logger";
import { Timetable } from "../../utils/timetable";
import { formatTimeString } from "../../utils/utility-functions";

const Logger = initLogger(__filename);

const commandOptions: CommandOptions = {
    name: "翌日時間表",
    command: "tomorrow",
    aliases: ["tmr"],
    category: "時間表",
    description: "查看翌日課堂時間表",
    usage: "tmr",
    args: [
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
    ...args: [string]
) {
    const user = await Database.getUser(initiator.user.id);

    let inputClass = args[0] as ClassId;
    if (!inputClass) {
        if (user.studentClass) {
            inputClass = user.studentClass;
        } else {
            inputClass = "1A";
        }
    }

    const dateOfTmr = formatTimeString(
        new Date(new Date().setDate(new Date().getDate() + 1)),
        "dd/MM"
    ) as TimetableDateResolvable;

    const timetable = new Timetable(inputClass, dateOfTmr, initiator);
    const embed = await timetable.getEmbed();
    await initiator.strictReply({ content: "", embeds: [embed] });
    return;
}

export const command = class TestCommand extends CommandBuilder {
    constructor() {
        super(commandOptions, commandCallback);
    }
};
