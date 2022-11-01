import { JaneGeneralError } from "../../core/classes/errors";
import { ButtonInitiator } from "../../core/commandInitiator";
import { initLogger } from "../../core/logger";
import { ErrorCode } from "../../types/enums";
import { JaneClient } from "../../core/client";

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
        const [date, cls] = args as [TimetableDateResolvable, ClassId];
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
}
