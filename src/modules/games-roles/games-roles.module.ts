import { MessageReaction, User, Message, TextChannel, Role } from "discord.js";
import { BotModule } from "../bot-module";
import { Bot } from "../../bot";
import { Logger } from "../../logger/logger";
import { Game } from "../../models/game.model";
import { Dao } from "../../dao/dao";

export class GamesRolesModule extends BotModule {

    private static targetChannelID : string;
    private static targetMessageID : string;
    private static fetchFrequency : number;

    private fetchTimer : any;

    private static gamesTable: Game[];

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

        if(user.id !== clientId && messageReaction.message.id === GamesRolesModule.targetMessageID) {
            const game = GamesRolesModule.gamesTable.find(g => g.gameName === messageReaction.emoji.name);
            if(game) {
                const member = messageReaction.message.guild.member(user);
                
                messageReaction.message.guild.roles.fetch(game.roleId).then(role => {
                    if(!member.roles.cache.has(game.roleId)) {
                        member.roles.add(role);
                        Logger.info(`Removed role ${role.name} from ${user.username}`);
                        member.createDM().then(channel => {
                            channel.send(`You got the role **${role.name}** added!`);
                        });
                    }
                }).catch(e => {
                    Logger.warn(`Unable to find role associated to game ${game.gameName}`);
                });
            }
        }
    }

    private static onMessageReactionRemove(messageReaction: MessageReaction, user: User) {

        const clientId = Bot.getClient().user.id;

        if(user.id !== clientId && messageReaction.message.id === GamesRolesModule.targetMessageID) {
            const game = GamesRolesModule.gamesTable.find(g => g.gameName === messageReaction.emoji.name);
            if(game) {
                const member = messageReaction.message.guild.member(user);
                
                messageReaction.message.guild.roles.fetch(game.roleId).then(role => {
                    if(member.roles.cache.has(game.roleId)) {
                        member.roles.remove(role);
                        Logger.info(`Removed role ${role.name} from ${user.username}`);
                        member.createDM().then(channel => {
                            channel.send(`You got the role **${role.name}** removed!`);
                        });
                    }
                }).catch(e => {
                    Logger.warn(`Unable to find role associated to game ${game.gameName}`);
                });
            }
        }
    }

    private init(params: any[]) {
        GamesRolesModule.targetChannelID = params['targetChannel']? params['targetChannel'] : null;
        GamesRolesModule.targetMessageID = params['targetMessage']? params['targetMessage'] : null;
        GamesRolesModule.fetchFrequency = params['fetchingFrequency']? params['fetchingFrequency'] : null;

        this.fetchMessage();
        this.fetchTimer = setInterval(() => { this.fetchMessage(); }, GamesRolesModule.fetchFrequency);

        Dao.getInstance().getGameList().then(gameList => {
            GamesRolesModule.gamesTable = gameList;
        }).catch(e => {
            Logger.error(`Unable to retrieve games table! ${e}`);
        });

        // TODO : scan players regularly to put roles based on games they're playing. Don't forget to log
    }

    private stop() {
        clearInterval(this.fetchTimer);
    }
}