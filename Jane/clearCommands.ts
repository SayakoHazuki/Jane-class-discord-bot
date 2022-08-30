import { REST } from "@discordjs/rest";
import { Routes } from "discord.js";

import * as dotenv from "dotenv";
dotenv.config();

(async () => {
    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    try {
        console.log("Started clearing application (/) commands.");

        await rest.put(Routes.applicationCommands(process.env.BOTID), {
            body: [],
        });

        console.log("Successfully cleared application (/) commands.");
    } catch (error) {
        console.error(error);
    }
})();
