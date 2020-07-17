import { ClientEvents } from "discord.js";

export abstract class BotModule {
    
    constructor(params: any) { }

    protected callbacks: Map<keyof ClientEvents, ((...args: ClientEvents[keyof ClientEvents]) => void)>;
    
    getEventsCovered() : (keyof ClientEvents)[] {
        return this.callbacks && this.callbacks.size > 0 ? 
            Array.from(this.callbacks.keys())
            : null;
    }

    getCallback(eventType: (keyof ClientEvents)): ((...args: ClientEvents[keyof ClientEvents]) => void) {
        return this.callbacks.get(eventType);
    }
}