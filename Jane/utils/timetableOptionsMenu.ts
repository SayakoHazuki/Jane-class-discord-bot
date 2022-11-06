// ! This won't be developed until
// ! Discord implements select menus in modals.

// import { ModalBuilder } from "@discordjs/builders";
// import {
//     ActionRowBuilder,
//     ButtonBuilder,
//     SelectMenuBuilder,
//     TextInputBuilder,
//     TextInputStyle,
// } from "discord.js";

// import * as Enum from "../types/enums";
// import { JaneInteractionIdBuilder } from "./utility-functions";

// export class TimetableOptionsMenuBuilder extends ModalBuilder {
//     constructor() {
//         super();
//         this.setCustomId(
//             new JaneInteractionIdBuilder(
//                 Enum.JaneInteractionType.MODAL,
//                 Enum.JaneInteractionGroup.NORMAL_FOLLOW_UP,
//                 Enum.JaneInteractionNormalFollowUpSubgroups.timetable_actions,
//                 "UPDATESETTINGS"
//             ).toString()
//         );
//         this.setTitle("時間表指令設定");

//         const RatShortcutEnabled = new SelectMenuBuilder()
//             .setCustomId("RatShortcutEnabled")
//             .setPlaceholder("是否啟用 Rat 指令快捷鍵")
//             .addOptions([
//                 {
//                     label: "是",
//                     value: "true",
//                 },
//                 {
//                     label: "否",
//                     value: "false",
//                 },
//             ]);

//         const firstActionRow =
//             new ActionRowBuilder<TextInputBuilder>().addComponents(classInput);

//         this.addComponents(firstActionRow);
//     }
// }
