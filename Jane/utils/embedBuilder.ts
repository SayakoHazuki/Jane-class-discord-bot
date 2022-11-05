import { EmbedBuilder, HexColorString, Message } from "discord.js";
import { JaneClient } from "../core/client";
import * as Consts from "../core/consts";
const embedTypes: { [type: string]: JaneEmbedBuilderOptions } = {
  reply: {
    color: Consts.themeColor as HexColorString,
    titlePrefix: "",
    titleSuffix: "",
    contentPrefix: "",
    contentSuffix: "",
    showAuthor: true,
    showTimestamp: true,
    showBotFooter: false,
  },
  info: {
    color: Consts.colors.blue as HexColorString,
    titlePrefix: "\u2139 ",
    titleSuffix: "",
    contentPrefix: "",
    contentSuffix: "",
    showAuthor: true,
    showBotFooter: true,
    showTimestamp: true,
  },
  error: {
    color: Consts.colors.red as HexColorString,
    titlePrefix: "\u274c ",
    titleSuffix: "",
    contentPrefix: "",
    contentSuffix: "",
    showAuthor: true,
    showBotFooter: true,
    showTimestamp: true,
  },
};

export class JaneEmbedBuilder extends EmbedBuilder {
  constructor(
    type: "reply" | "info" | "error",
    title: string,
    content: string,
    options: JaneEmbedBuilderOptions,
    referer?: CommandInitiator
  ) {
    const embedOptions = { ...embedTypes[type], ...options };
    super();
    this.setTitle(
      `${embedOptions.titlePrefix}${title}${embedOptions.titleSuffix}`
    );
    this.setDescription(
      `${embedOptions.contentPrefix}${content}${embedOptions.contentSuffix}`
    );
    if (embedOptions.showAuthor && referer) {
      this.setAuthor({
        name:
          (options.authorPrefix ?? "") +
          (referer.user?.tag || "") +
          (options.authorSuffix ?? ""),
        iconURL: referer.user?.displayAvatarURL(),
      });
    }
    if (embedOptions.showTimestamp) {
      this.setTimestamp(new Date());
    }
    if (options.showBotFooter) {
      this.setFooter({
        text: "簡 Jane",
        iconURL: JaneClient.getClient(false)?.user?.displayAvatarURL(),
      });
    }
    this.setColor(embedOptions.color ?? null);
  }
}

// async function MultiEmbed(
//     msg,
//     pages,
//     emojiList = ["⏪", "⏩"],
//     timeout = 120000
// ) {
//     if (!msg && !msg.channel) throw new Error("Channel is inaccessible.");
//     if (!pages) throw new Error("Pages are not given.");
//     if (emojiList.length !== 2) throw new Error("Need two emojis.");
//     let page = 0;
//     const curPage = await msg.channel.send({ embeds: [pages[page]] });
//     for (const emoji of emojiList) await curPage.react(emoji);
//     const f = (reaction, user) =>
//         emojiList.includes(reaction.emoji.name) && !user.bot;
//     const reactionCollector = curPage.createReactionCollector({
//         f,
//         time: timeout,
//     });
//     reactionCollector.on("collect", (reaction) => {
//         reaction.users.remove(msg.author);
//         switch (reaction.emoji.name) {
//             case emojiList[0]:
//                 page = page > 0 ? --page : pages.length - 1;
//                 break;
//             case emojiList[1]:
//                 page = page + 1 < pages.length ? ++page : 0;
//                 break;
//             default:
//                 break;
//         }
//         curPage.edit({ embeds: [pages[page]] });
//     });
//     reactionCollector.on("end", () => {
//         if (!curPage.deleted) {
//             curPage.reactions.removeAll();
//         }
//     });
//     return curPage;
// }
