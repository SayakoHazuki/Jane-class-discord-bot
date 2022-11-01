import { ButtonInitiator } from "../core/commandInitiator";
import { JaneInteractionNormalFollowUpSubgroups } from "../types/enums";
import { handleRoomStatsNavigation } from "./normal_follow_ups/roomStats";
import { handleTimetableAction } from "./normal_follow_ups/timetableActions";

export async function handleNormalFollowUp(
    client: JaneClient,
    initiator: ButtonInitiator,
    k: JaneInteractionNormalFollowUpSubgroups,
    v: string
) {
    if (
        Number(k) ===
        JaneInteractionNormalFollowUpSubgroups.room_stats_navigation
    ) {
        await handleRoomStatsNavigation(initiator, v);
    }

    if (
        Number(k) === JaneInteractionNormalFollowUpSubgroups.timetable_actions
    ) {
        await handleTimetableAction(initiator, v);
    }
}
