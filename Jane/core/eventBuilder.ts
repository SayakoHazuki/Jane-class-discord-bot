import { JaneClient } from "./client";

export default class EventBuilder {
    eventName: string;
    callback: EventCallback;

    constructor(eventName: string, callback: EventCallback) {
        this.eventName = eventName;
        this.callback = callback;
    }

    get client() {
        return JaneClient.getClient() as JaneClient;
    }
}
