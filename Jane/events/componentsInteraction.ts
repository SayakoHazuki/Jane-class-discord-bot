import { ButtonInteraction, Interaction } from "discord.js";
import { EventBuilder } from "../core/eventBuilder";
import { JaneClient } from "../core/client";
import { initLogger } from "../core/logger";
import { JaneGeneralError } from "../core/classes/errors";
import * as Enum from "../types/enums";
import { ButtonInitiator } from "../core/commandInitiator";

const Logger = initLogger(__filename);

async function eventCallback(client: JaneClient, interaction: Interaction) {
  if (!(interaction.isButton() || interaction.isSelectMenu())) return;
  if (interaction.user.bot || !interaction.guild) return;

  if (!/^J-\w*-\w*-\w*-\w*$/.test(interaction.customId)) return;

  const [full, interactionType, interactionGorup, k, v] = (
    /^J-(\w*)-(\w*)-(\w*)-(\w*)$/.exec(interaction.customId) ?? []
  ).map((i) => (isNaN(Number(i)) ? i : Number(i))) as [
    string,
    Enum.JaneInteractionType,
    Enum.JaneInteractionGroup,
    string,
    string
  ];

  if (full === undefined) {
    throw new JaneGeneralError(
      "Unexpected customId format",
      Enum.ErrorCode.UNEXPECTED_INPUT_FORMAT
    );
  }

  if (interactionType === Enum.JaneInteractionType.BTN) {
    interaction = interaction as ButtonInteraction;
    if (interactionGorup === Enum.JaneInteractionGroup.HGD) {
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
    }
  }
}

export const event = class componentsInteractionHandler extends EventBuilder {
  constructor() {
    super("interactionCreate", eventCallback);
  }
};
