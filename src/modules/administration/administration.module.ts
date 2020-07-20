import { BotModule } from "../bot-module";
import { Message } from "discord.js";
import { Bot } from "../../bot";

export class AdministrationModule extends BotModule {

    constructor(params : any) {
        super(params);

        this.callbacks = new Map();
        this.callbacks.set('message', AdministrationModule.onMessageReceived);

        /*
        if(params) {
            this.init(params);
        }*/
    }

    private static onMessageReceived(message: Message) {
        // Bot.getClient().user.set
    }
}