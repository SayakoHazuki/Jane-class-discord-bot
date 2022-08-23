import { Formatters } from "discord.js";
import { JaneClient } from "../../core/client";
import { CommandBuilder } from "../../core/commandBuilder";
import { initLogger } from "../../core/logger";

function whatsIt(object: any) {
  try {
    JSON.parse(object);
    return "jsonString";
  } catch (e) {}
  if (object === null) {
    return "null";
  }
  if (object === undefined) {
    return "undefined";
  }
  if (object.constructor === stringConstructor) {
    return "String";
  }
  if (object.constructor === arrayConstructor) {
    return "Array";
  }
  if (object.constructor === objectConstructor) {
    return "Object";
  }
  return "unknown";
}

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
};

async function commandCallback(
  client: JaneClient,
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
    let ev = eval(code);
    let highlightCode = null;
    let typeOfEv;
    Logger.info(ev);
    try {
      typeOfEv = whatsIt(JSON.stringify(ev));
    } catch (e) {
      typeOfEv = whatsIt(ev);
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
    if (typeOfEv === "null" || typeOfEv === "undefined") highlightCode = "fix";
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
