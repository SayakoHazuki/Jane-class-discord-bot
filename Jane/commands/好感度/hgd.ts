import { Database } from "../../core/classes/database";
import { HgdEmbedBuilder } from "../../core/classes/hgd/hgdEmbedBuilder";
import { JaneClient } from "../../core/client";
import { CommandBuilder } from "../../core/commandBuilder";
import { initLogger } from "../../core/logger";
import { PascalHgdActions } from "../../types/enums";
import Emoji from "../../data/config/emojis.json";
import { DiscordTimestamp } from "../../utils/utility-functions";

const Logger = initLogger(__filename);

const commandOptions: CommandOptions = {
    name: "好感度",
    command: "hgd",
    aliases: ["好感度"],
    category: "好感度",
    description: "查看好感度資訊",
    usage: "hgd",
    args: [],
};

async function commandCallback(
    client: JaneClient,
    initiator: CommandInitiator,
    arg1: string
) {
    const userdata = await Database.getUser(initiator.user.id);

    const hgdData = userdata.hgdData;

    const isOkaasan = initiator.user.id === "726439536401580114";

    /*
      Sect 1
            **等級XX** [🔒 ](XX/XXX) • *排名: X*
      field      1    | 2  |   3   | 4 |   5
    */

    const field1 =
        "**等級" + (isOkaasan ? "MAX" : hgdData?.levelData.level ?? 0) + "** ";

    const locked = isOkaasan
        ? false
        : hgdData?.highLvLocked && hgdData?.hgd >= 45000;
    const field2 = locked ? " 🔒" : "";

    const field3 = isOkaasan
        ? `[-/MAX]`
        : `[${hgdData?.hgd ?? 0}/${
              hgdData?.levelData.levelConfig.upperLimit ?? 0
          }]`;

    const field4 = " • ";

    const field5 =
        "*排名: " + (isOkaasan ? "母親" : await hgdData?.getRank()) + "*";

    const section1 = field1 + field2 + field3 + field4 + field5 + "\u2800\n";

    const section2 =
        userdata.hgdData?.levelData.progressBar +
        "  " +
        `*${Math.floor(hgdData?.levelData.percentage ?? 0)}%*` +
        "\n\n";

    const section3 =
        Object.keys(userdata.hgdData?.actionRecords ?? {})
            .map((k) => {
                const record =
                    userdata.hgdData?.actionRecords?.[k as PascalHgdActionVT] ??
                    0;
                const recordTimestamp =
                    record >= 100000
                        ? new DiscordTimestamp(new Date(record * 1000), "R")
                        : "(沒有紀錄)";
                const actionConfig = client.hgdCommandConfigList.find(
                    (config) =>
                        PascalHgdActions[config.commandCode] ===
                        (k as PascalHgdActions)
                );
                if (!actionConfig) return "";
                const actionAvailable =
                    userdata.hgdData?.actionAvailabilities.find(
                        (a) =>
                            a.actionConfig.commandCode ===
                            actionConfig.commandCode
                    )?.available ?? false;
                return `${
                    actionAvailable ? Emoji.check.full : Emoji.blank.full
                } | ${actionConfig.emoji.fullId} 上次${
                    actionConfig.texts.ACTION_NAME[0] ?? ""
                }: ${recordTimestamp}\n`;
            })
            .join("") + "\n";

    const section4 = `好感度解放碎片: ${
        isOkaasan ? "∞" : userdata.hgdData?.shards ?? 0
    }`;

    let embedBody = section1 + section2 + section3 + section4;

    const hgdEmbed = new HgdEmbedBuilder(
        userdata,
        initiator,
        "好感度",
        embedBody
    );

    await initiator.strictReply({ embeds: [hgdEmbed] });
}

export const command = class TestCommand extends CommandBuilder {
    constructor() {
        super(commandOptions, commandCallback);
    }
};
