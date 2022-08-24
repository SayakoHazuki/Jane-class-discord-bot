import { APIInteractionGuildMember } from "discord-api-types/v10";
import {
  Attachment,
  Client,
  Collection,
  ChatInputCommandInteraction,
  Guild,
  GuildMember,
  Message,
  Snowflake,
  Sticker,
  InteractionReplyOptions,
  MessagePayload,
  ReplyMessageOptions,
  ButtonInteraction,
} from "discord.js";

import { JaneClient } from "./client";

export class MessageCommandInitiator implements CommandInitiator {
  private __message: Message;
  private __initialReply?: Message;
  public initiator: Message;
  public replied: boolean;
  public readonly client: Client;
  public readonly createdAt: Date;
  public readonly createdTimestamp: number;
  public readonly guild?: Guild | null;
  public readonly member?: GuildMember | null;
  public readonly token?: string | null;
  public readonly url?: string | null;
  public readonly initiatorType: "Message";

  public constructor(initiator: Message) {
    this.__message = initiator;
    this.initiator = initiator;
    this.client = initiator.client;
    this.createdAt = initiator.createdAt;
    this.createdTimestamp = initiator.createdTimestamp;
    this.guild = initiator.guild;
    this.member = initiator.member;
    this.token = null;
    this.url = initiator.url;
    this.initiatorType = "Message";
    this.replied = false;
  }

  public get attachments() {
    return this.__message.attachments;
  }

  public get user() {
    return this.__message.author;
  }

  public get channel() {
    return this.__message.channel;
  }

  public get channelId() {
    return this.__message.channelId;
  }

  public get components() {
    return this.__message.components;
  }

  public get content() {
    return this.__message.content;
  }

  public get deferred() {
    return false;
  }

  public get ephemeral() {
    return false;
  }

  public get embeds() {
    return this.__message.embeds;
  }

  public get guildId() {
    return this.__message.guildId ?? undefined;
  }

  public get id() {
    return this.__message.id;
  }

  public get replyInteraction() {
    return this.__message.interaction ?? undefined;
  }

  public get pinned() {
    return this.__message.pinned;
  }

  public get reactions() {
    return this.__message.reactions;
  }

  public get stickers() {
    return this.__message.stickers;
  }

  public get type() {
    return this.__message.type;
  }

  public fetchReply(): Promise<Message<boolean> | undefined> {
    return new Promise((resolve) => {
      resolve(this.__initialReply);
    });
  }

  public async reply(
    options: string | MessagePayload | ReplyMessageOptions
  ): Promise<Message<boolean>> {
    if (this.replied) {
      throw new Error("Already replied!");
    }
    this.replied = true;
    return this.__message.reply(options).then((message) => {
      this.__initialReply = message;
      return message;
    });
  }

  public async followUp(
    options: string | MessagePayload | ReplyMessageOptions
  ): Promise<Message> {
    return await this.__message.reply(options);
  }

  public async strictReply(
    options: (string | MessagePayload | ReplyMessageOptions) &
      JaneEphemeralSupport
  ): Promise<Message> {
    delete options.ephemeral;
    return await this.__message.reply(options);
  }
}

export class ChatInputCommandInitiator implements CommandInitiator {
  private __interaction: ChatInputCommandInteraction;
  public readonly initiator: ChatInputCommandInteraction;
  public readonly client: Client;
  public readonly createdAt: Date;
  public readonly createdTimestamp: number;
  public readonly guild?: Guild | null;
  public readonly member?: GuildMember | APIInteractionGuildMember | null;
  public readonly token?: string | null;
  public readonly url?: string | null;
  public readonly initiatorType: "CommandInteraction";

  public constructor(initiator: ChatInputCommandInteraction) {
    this.__interaction = initiator;
    this.initiator = initiator;
    this.client = initiator.client;
    this.createdAt = initiator.createdAt;
    this.createdTimestamp = initiator.createdTimestamp;
    this.guild = initiator.guild;
    this.member = initiator.member;
    this.token = null;
    this.url = null;
    this.initiatorType = "CommandInteraction";
  }

  public get attachments() {
    return new Collection<Snowflake, Attachment>();
  }

  public get user() {
    return this.__interaction.user;
  }

  public get channel() {
    return this.__interaction.channel;
  }

  public get channelId() {
    return this.__interaction.channelId;
  }

  public get components() {
    return [];
  }

  public get content() {
    return `${JaneClient.getClient()?.prefix ?? ""}${
      this.__interaction.commandName
    } ${this.__interaction.options.data.map((d) => d.value).join(" ")}`;
  }

  public get deferred() {
    return this.__interaction.deferred;
  }

  public get ephemeral() {
    return this.__interaction.ephemeral;
  }

  public get embeds() {
    return [];
  }

  public get guildId() {
    return this.__interaction.guildId ?? undefined;
  }

  public get id() {
    return this.__interaction.id;
  }

  public get replyInteraction() {
    return undefined;
  }

  public get pinned() {
    return false;
  }

  public get reactions() {
    return undefined;
  }

  public get stickers() {
    return new Collection<Snowflake, Sticker>();
  }

  public get type() {
    return undefined;
  }

  public get fetchReply() {
    return this.__interaction.fetchReply;
  }

  public async reply(
    options: string | MessagePayload | InteractionReplyOptions
  ): Promise<Message> {
    return (await this.__interaction.reply(options)) as unknown as Message;
  }

  public async followUp(
    options: string | MessagePayload | InteractionReplyOptions
  ): Promise<Message> {
    return await this.__interaction.followUp(options);
  }

  public get replied() {
    return this.__interaction.replied;
  }

  public async strictReply(
    options: (string | MessagePayload | InteractionReplyOptions) &
      JaneEphemeralSupport
  ): Promise<Message> {
    if (!(this.deferred || this.replied)) {
      await this.reply(options);
      return await this.fetchReply();
    }
    if (this.deferred && !this.replied) {
      return await this.__interaction.editReply(options);
    }
    return await this.followUp(options);
  }
}

export class ButtonInitiator implements CommandInitiator {
  private __interaction: ButtonInteraction;
  public readonly initiator: ButtonInteraction;
  public readonly client: Client;
  public readonly createdAt: Date;
  public readonly createdTimestamp: number;
  public readonly guild?: Guild | null;
  public readonly member?: GuildMember | APIInteractionGuildMember | null;
  public readonly token?: string | null;
  public readonly url?: string | null;
  public readonly initiatorType: "ButtonInteraction";

  public constructor(initiator: ButtonInteraction) {
    this.__interaction = initiator;
    this.initiator = initiator;
    this.client = initiator.client;
    this.createdAt = initiator.createdAt;
    this.createdTimestamp = initiator.createdTimestamp;
    this.guild = initiator.guild;
    this.member = initiator.member;
    this.token = null;
    this.url = null;
    this.initiatorType = "ButtonInteraction";
  }

  public get attachments() {
    return new Collection<Snowflake, Attachment>();
  }
  public get user() {
    return this.__interaction.user;
  }

  public get channel() {
    return this.__interaction.channel;
  }

  public get channelId() {
    return this.__interaction.channelId;
  }

  public get components() {
    return [];
  }

  public get content() {
    return this.__interaction.customId;
  }

  public get deferred() {
    return this.__interaction.deferred;
  }

  public get ephemeral() {
    return this.__interaction.ephemeral;
  }

  public get embeds() {
    return [];
  }

  public get guildId() {
    return this.__interaction.guildId ?? undefined;
  }

  public get id() {
    return this.__interaction.id;
  }

  public get replyInteraction() {
    return undefined;
  }

  public get pinned() {
    return false;
  }

  public get reactions() {
    return undefined;
  }

  public get stickers() {
    return new Collection<Snowflake, Sticker>();
  }

  public get type() {
    return undefined;
  }

  public get fetchReply() {
    return this.__interaction.fetchReply;
  }

  public async reply(
    options: (string | MessagePayload | InteractionReplyOptions) &
      JaneEphemeralSupport
  ): Promise<Message> {
    return (await this.__interaction.reply(options)) as unknown as Message;
  }

  public async followUp(
    options: string | MessagePayload | InteractionReplyOptions
  ): Promise<Message> {
    return await this.__interaction.followUp(options);
  }

  public get replied() {
    return this.__interaction.replied;
  }

  public async strictReply(
    options: (string | MessagePayload | InteractionReplyOptions) &
      JaneEphemeralSupport
  ): Promise<Message> {
    delete options.ephemeral;
    if (!(this.deferred || this.replied)) {
      return await this.reply(options);
    }
    if (this.deferred && !this.replied) {
      return await this.__interaction.editReply(options);
    }
    return await this.followUp(options);
  }
}
