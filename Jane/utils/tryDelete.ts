import { Message } from "discord.js";

function tryDelete(message: Message) {
    return new Promise((resolve, reject) => {
        const channel = message?.channel;
        if (!channel)
            return reject(<ErrorMessage>{
                message: "Channel does not exist",
                code: "NULL_CHANNEL",
                id: 904,
            });

        channel.messages.fetch(message.id).then(
            (fetchedMessage) => {
                fetchedMessage.delete().catch((error) => {
                    if (error)
                        return reject(<ErrorMessage>{
                            message: error,
                            code: "UNEXPECTED_ERR",
                            id: 900,
                        });
                });
            },

            (error) => {
                return error.httpStatus === 404
                    ? {
                          message: "Not Found",
                          code: "NOT_FOUND",
                          id: 1404,
                      }
                    : {
                          message: error,
                          code: "UNEXPECTED_ERR",
                          id: 900,
                      };
            }
        );
    });
}
