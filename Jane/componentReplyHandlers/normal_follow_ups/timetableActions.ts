import { JaneGeneralError } from "../../core/classes/errors";
import { ButtonInitiator } from "../../core/commandInitiator";
import { initLogger } from "../../core/logger";
import { ErrorCode } from "../../types/enums";
import { JaneClient } from "../../core/client";
import {
    getExpandedTimetableActions,
    getNormalTimetableActions,
} from "../../utils/timetableUtils";
import { ModalBuilder } from "discord.js";
import { formatTimeString } from "../../utils/utility-functions";

const Logger = initLogger(__filename);

export async function handleTimetableAction(
    initiator: ButtonInitiator,
    v: string
) {
    const [action, ...args] = v.split("-");

    const client = JaneClient.getClient();
    if (!client)
        throw new JaneGeneralError(
            "Could not find the client",
            ErrorCode.UNEXPECTED_UNDEFINED,
            {
                displayMessage: "Something went wrong. Please try again later.",
            }
        );

    const timetableCommand = client.commands.find(
        (c) => c.options.command === "timetable"
    );

    if (action === "SELDATE") {
        const [date, cls] = args as [
            TimetableDateResolvable | "TODAY",
            ClassId
        ];

        if (date === "TODAY") {
            const today = formatTimeString(new Date(), "dd/MM");
            await timetableCommand?.callback(client, initiator, today, cls, {
                editMessage: true,
                message: initiator.initiator.message,
            });
            await initiator.initiator.deferUpdate();
            return;
        }

        await timetableCommand?.callback(client, initiator, date, cls, {
            editMessage: true,
            message: initiator.initiator.message,
        });
        await initiator.initiator.deferUpdate();
    }

    if (action === "DATE") {
        if (!initiator.initiator.deferred)
            await initiator.initiator.deferReply();
    }

    if (action === "EXPAND") {
        const [date, cls] = args as [TimetableDateResolvable, ClassId];
        await initiator.initiator.deferUpdate();
        await initiator.initiator.message.edit({
            embeds: initiator.initiator.message.embeds,
            components: [
                getNormalTimetableActions(date, cls, true),
                getExpandedTimetableActions(date, cls),
            ],
        });
    }

    if (action === "COLLAPSE") {
        const [date, cls] = args as [TimetableDateResolvable, ClassId];
        await initiator.initiator.deferUpdate();
        await initiator.initiator.message.edit({
            embeds: initiator.initiator.message.embeds,
            components: [getNormalTimetableActions(date, cls)],
        });
    }

    if (action === "CALENDAR") {
        // const [date, cls] = args as [TimetableDateResolvable, ClassId];
        await initiator.initiator.deferUpdate();
        await client.commands
            .find((c) => c.options.command === "calendar")
            ?.callback(client, initiator);
        // TODO: Chagne command behaviour: Edit message instead of sending another message
        // TODO: Change command behaviour: Add a "back" button
    }

    if (action === "SETTINGS") {
        await initiator.initiator.deferUpdate();
        // TODO: Add settings
    }
}
