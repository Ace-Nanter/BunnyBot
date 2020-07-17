import { MessageReaction, User, Message, TextChannel } from "discord.js";
import { BotModule } from "../bot-module";
import { Bot } from "../../bot";
import { Logger } from "../../logger/logger";

export class GamesRolesModule extends BotModule {

    private static targetChannelID : string;
    private static targetMessageID : string;
    private static fetchFrequency : number;

    private fetchTimer : any;

    constructor(params : any) {
        super(params);

        this.callbacks = new Map();
        this.callbacks.set('messageReactionAdd', GamesRolesModule.onMessageReactionAdd);
        this.callbacks.set('messageReactionRemove', GamesRolesModule.onMessageReactionRemove);

        if(params) {
            this.init(params);
        }
    }
    
    private fetchMessage() {

        Bot.getClient().channels.fetch(GamesRolesModule.targetChannelID).then(c => {
            const channel = c as TextChannel;
            channel.messages.fetch(GamesRolesModule.targetMessageID)
                .catch(e => Logger.warn(`Games-Roles Module: Unable to find target message! ${e}`));
        });
    }

    private static onMessageReactionAdd(messageReaction: MessageReaction, user: User) {

        const clientId = Bot.getClient().user.id;

        if(user.id !== Bot.getClient().user.id && messageReaction.message.id === GamesRolesModule.targetMessageID) {
            
            // Get roles, if user is newcomer then remove role
            
            Logger.log(`Reaction ${messageReaction.emoji.name} added on channel ${messageReaction.message.channel.id} by ${user.username}`);
            messageReaction.message.react(messageReaction.emoji);
        }
    }

    private static onMessageReactionRemove(messageReaction: MessageReaction, user: User) {

        const clientId = Bot.getClient().user.id;

        if(user.id !== clientId) {
            Logger.log(`Reaction ${messageReaction.emoji.name} removed on channel ${messageReaction.message.channel.id} by ${user.username}`);
            const reaction = messageReaction.message.reactions.cache.find(e => {
                return (e.emoji.name === messageReaction.emoji.name &&
                    e.emoji.client.user.id === clientId);
            });
            if(reaction) reaction.remove();
        }
    }

    private init(params: any[]) {
        GamesRolesModule.targetChannelID = params['targetChannel']? params['targetChannel'] : null;
        GamesRolesModule.targetMessageID = params['targetMessage']? params['targetMessage'] : null;
        GamesRolesModule.fetchFrequency = params['fetchingFrequency']? params['fetchingFrequency'] : null;

        this.fetchMessage();
        this.fetchTimer = setInterval(() => { this.fetchMessage(); }, GamesRolesModule.fetchFrequency);

        // TODO : Build role table from BDD
    }

    private stop() {
        clearInterval(this.fetchTimer);
    }
}