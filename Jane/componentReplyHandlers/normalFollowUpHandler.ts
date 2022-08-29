import { ButtonInitiator } from "../core/commandInitiator";
import { JaneInteractionNormalFollowUpSubgroups } from "../types/enums";
import { handleRoomStatsNavigation } from "./normal_follow_ups/roomStats";

export async function handleNormalFollowUp(
    client: JaneClient,
    initiator: ButtonInitiator,
    k: string,
    v: string
) {
    if (
        Number(k) ===
        JaneInteractionNormalFollowUpSubgroups.room_stats_navigation
    ) {
        await handleRoomStatsNavigation(initiator, v);
    }
}
