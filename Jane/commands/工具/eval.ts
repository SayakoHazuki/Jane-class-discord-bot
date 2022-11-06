// @importsNotUsedAsValues: preserve

import { Formatters } from "discord.js";
import { JaneClient } from "../../core/client";
import { CommandBuilder } from "../../core/commandBuilder";
import { initLogger } from "../../core/logger";

import * as EmbedBuilder from "../../utils/embedBuilder";
import * as Hko from "../../utils/hkoUtils";
import * as JsonTypeOf from "../../utils/jsonTypeof";
import * as Timetable from "../../utils/timetableUtils";
import * as UtilityFunctions from "../../utils/utility-functions";

import * as Database from "../../core/classes/database";
import * as DayTypes from "../../core/classes/dayTypes";
import * as JaneErrors from "../../core/classes/errors";
import * as TimetableSection from "../../core/classes/timetableSection";

import * as HgdActionRow from "../../core/classes/hgd/hgdActionRow";
import * as HgdEmbedBuilder from "../../core/classes/hgd/hgdEmbedBuilder";
import * as HgdLevelData from "../../core/classes/hgd/leveldata";

import * as JC from "../../core/client";
import * as Enums from "../../types/enums";

const Logger = initLogger(__filename);

const commandOptions: CommandOptions = {
    name: "eval",
    command: "eval",
    aliases: [],
    category: "工具",
    description: "eval",
    usage: "eval",
    args: [
        {
            name: "code",
            type: "string",
            description: "code to evaluate",
            required: true,
        },
    ],
    messageOnly: true,
    devOnly: true,
};

async function commandCallback(
    client: JaneClientT,
    initiator: CommandInitiator,
    ...args: string[]
) {
    if (
        initiator.user.id !== "690822196972486656" &&
        initiator.user.id !== "726439536401580114" &&
        initiator.user.id !== "794181749432778753"
    ) {
        return;
    }
    const code = args.join?.(" ") ?? args ?? "";
    try {
        void EmbedBuilder;
        void Hko;
        void JsonTypeOf;
        void Timetable;
        void UtilityFunctions;
        void Database;
        void DayTypes;
        void JaneErrors;
        void TimetableSection;
        void HgdActionRow;
        void HgdEmbedBuilder;
        void HgdLevelData;
        void JC;
        void Enums;
        const modules = [
            "EmbedBuilder",
            "Hko",
            "JsonTypeOf",
            "Timetable",
            "UtilityFunctions",
            "Database",
            "DayTypes",
            "JaneErrors",
            "TimetableSections",
            "HgdActionRow",
            "HgdEmbedBuilder",
            "HgdLevelData",
            "Enums",
        ];
        void modules;
        let ev = eval(code);
        let highlightCode = null;
        let typeOfEv;
        Logger.info(ev);
        try {
            typeOfEv = JsonTypeOf.jsonTypeof(JSON.stringify(ev));
        } catch (e) {
            typeOfEv = JsonTypeOf.jsonTypeof(ev);
        }
        Logger.info(`typeOfEv: ${typeOfEv}`);
        if (typeOfEv === "jsonString") {
            try {
                ev = JSON.stringify(ev, null, 2);
            } catch (e) {}
            highlightCode = "json";
        }
        if (typeOfEv === "String") highlightCode = "js";
        if (typeOfEv === "Object" || typeOfEv === "Array") {
            highlightCode = "json";
            ev = JSON.stringify(ev);
        }
        if (typeOfEv === "null" || typeOfEv === "undefined")
            highlightCode = "fix";
        if (highlightCode === null) highlightCode = "xl";
        Logger.info(highlightCode);
        await initiator.strictReply(Formatters.codeBlock(highlightCode, ev));
        return;
    } catch (err) {
        if (!("stack" in (err as any))) return;
        await initiator.strictReply(
            Formatters.codeBlock("xl", (err as { stack: any }).stack)
        );
        return;
    }
}

export const command = class TestCommand extends CommandBuilder {
    constructor() {
        super(commandOptions, commandCallback);
    }
};
