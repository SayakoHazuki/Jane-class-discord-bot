import { Message } from "discord.js";
import { JaneGeneralError, JaneHTTPError } from "../core/classes/errors";
import { ErrorCode } from "../types/enums";

function tryDelete(message: Message) {
    return new Promise((resolve, reject) => {
        const channel = message?.channel;
        if (!channel)
            return reject(
                new JaneGeneralError(
                    "Channel is null/falsy",
                    ErrorCode.UNEXPECTED_NULL_OR_FALSY
                )
            );

        channel.messages.fetch(message.id).then(
            (fetchedMessage) => {
                fetchedMessage.delete().catch((error) => {
                    if (error)
                        return reject(
                            new JaneGeneralError(
                                error.message,
                                ErrorCode.UNEXPECTED_ERR
                            )
                        );
                });
            },

            (error) => {
                return reject(
                    new JaneHTTPError(
                        error.httpStatus === 404
                            ? "Not Found"
                            : "Unexpected HTTP Error",
                        error.httpStatus === 404
                            ? ErrorCode.HTTP_NOT_FOUND
                            : ErrorCode.HTTP_UNEXPECTED_STATUS
                    )
                );
            }
        );
    });
}
