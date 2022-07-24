import JaneClient from "./client"

export default class Event {
    client: JaneClient;
    eventName: string;
    callback: EventCallback

    constructor(client: JaneClient, eventName: string, callback: (args: any[]) => Promise<void>) {
        this.client = client
        this.eventName = eventName
        this.callback = callback
    }
}