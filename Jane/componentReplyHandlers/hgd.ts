import {
    ButtonInteraction,
    InteractionReplyOptions,
} from "discord.js";
import { getHgdLbMessagePayload } from "../commands/好感度/hgdLeaderboard";
import { JaneGeneralError } from "../core/classes/errors";
import { ButtonInitiator } from "../core/commandInitiator";
import * as Enum from "../types/enums";

export async function handleHgdButton(
    client: JaneClient,
    interaction: ButtonInteraction,
    k: string,
    v: string
) {
    if (Number(k) === Enum.JaneHgdButtonActions.RUN) {
        const commandConfig = client.hgdCommandConfigList.find(
            (i) => i.runCode === Number(v)
        );
        if (!commandConfig) {
            throw new JaneGeneralError(
                `Could not find the corresponding hgd action with runCode ${v}`,
                Enum.ErrorCode.UNEXPECTED_UNDEFINED
            );
        }

        const command = client.commands.get(commandConfig.commandName);
        if (!command) {
            throw new JaneGeneralError(
                `Could not find the corresponding hgd action with runCode ${v}`,
                Enum.ErrorCode.UNEXPECTED_UNDEFINED
            );
        }

        await command.callback(client, new ButtonInitiator(interaction));
    }

    if (Number(k) === Enum.JaneHgdButtonActions.SHOW_LB) {
        const initiator = new ButtonInitiator(interaction);
        await initiator.strictReply(
            (await getHgdLbMessagePayload(
                client,
                initiator,
                Number(v)
            )) as InteractionReplyOptions
        );
    }
}
