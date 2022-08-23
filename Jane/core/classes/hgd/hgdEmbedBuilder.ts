import { JaneEmbedBuilder } from "../../../utils/embedBuilder";
import { User } from "../database";

export class HgdEmbedBuilder extends JaneEmbedBuilder {
  constructor(
    user: User,
    referer: CommandInitiator,
    title: string,
    content: string
  ) {
    super("reply", title, content, {
      color: "#FB9EFF",
      showTimestamp: true,
    });
    this.setAuthor({
      name: `Lv.${user.hgdData?.levelData.level} | ${referer.user.tag}`,
      iconURL: referer.user.displayAvatarURL(),
    }).setFooter({
      text: ".",
    });
  }
}
