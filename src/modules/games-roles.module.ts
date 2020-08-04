import { Guild, MessageReaction, TextChannel, User, GuildMember, Message } from "discord.js";
import { Bot } from "../bot";
import { Dao } from "../dao/dao";
import { Logger } from "../logger/logger";
import { Game } from "../models/game.model";
import { BotModule } from "./common/bot-module";

export class GamesRolesModule extends BotModule {

    private static targetChannelID : string;
    private static targetMessageID : string;
    private static fetchFrequency : number;
    private static scanFrequency : number;

    private gamesTable: Game[];
    private fetchTimer : any;
    private scanTimer : any;
    private guild: Guild;

    private static instance: GamesRolesModule;

    constructor(params : any) {
        super(params);

        this.callbacks = new Map();
        this.callbacks.set('messageReactionAdd', GamesRolesModule.onMessageReactionAdd);
        this.callbacks.set('messageReactionRemove', GamesRolesModule.onMessageReactionRemove);
        this.callbacks.set('guildMemberAdd', GamesRolesModule.onGuildMemberAdd);

        if(params) {
            this.init(params);
        }

        GamesRolesModule.instance = this;
    }
    
    private fetchMessage() {
        Bot.getClient().channels.fetch(GamesRolesModule.targetChannelID).then(c => {
            const channel = c as TextChannel;
            this.guild = channel.guild;             // Helps scan process
            channel.messages.fetch(GamesRolesModule.targetMessageID).then(message => {
                this.addReaction(message);
            }).catch(e => Logger.warn(`Games-Roles Module: Unable to find target message! ${e}`));
        });
    }

    private scanPlayersActivity() {
        this.guild.members.fetch().then(members => {
            members.forEach(member => {
                this.scanPlayer(member);
            });
        });
    }

    private scanPlayer(member: GuildMember) {
        if(member.presence.status != 'offline') {
            const activity = member.presence.activities.find(a => a.applicationID);
            if(activity) {
                const game = this.gamesTable.find(g => g.activityId === activity.applicationID);
                if(game) {
                    this.guild.roles.fetch(game.roleId).then(role => {
                        if(!member.roles.cache.has(role.id)) {
                            member.roles.add(role);
                            Logger.log(`Added role ${role.name} to ${member.user.username}!`);
                        }
                    }).catch(e => Logger.error(`Unable to find role associated to game ${game.gameName}: ${e}`));
                }
            }
        }
    }

    private addReaction(message: Message) {
        if(this.gamesTable && this.gamesTable.length > 0) {
            this.gamesTable.sort((g1,g2) => {
                if(g1.gameName < g2.gameName) { return -1; }
                if(g1.gameName > g2.gameName) { return 1; }
                return 0;
            }).forEach(game => {
                const reaction = message.reactions.cache.find(r => r.emoji.name === game.emojiName && r.me);
                if(!reaction) {
                    const emoji = this.guild.emojis.cache.find(e => e.name === game.emojiName);
                    if(emoji) {
                        message.react(emoji);
                    }
                }
            });
        }
    }

    private static onMessageReactionAdd(messageReaction: MessageReaction, user: User) {

        const clientId = Bot.getId();

        if(user.id !== clientId && messageReaction.message.id === GamesRolesModule.targetMessageID
            && GamesRolesModule.instance && GamesRolesModule.instance.gamesTable) {
            const game = GamesRolesModule.instance.gamesTable.find(g => g.emojiName === messageReaction.emoji.name);
            if(game) {
                const member = messageReaction.message.guild.member(user);
                
                messageReaction.message.guild.roles.fetch(game.roleId).then(role => {
                    if(!member.roles.cache.has(game.roleId)) {
                        member.roles.add(role);
                        Logger.info(`Removed role ${role.name} from ${user.username}`);
                        member.createDM().then(channel => {
                            channel.send(`Je t'ai ajouté le rôle **${role.name}**!`);
                        });
                    }
                }).catch(e => {
                    Logger.warn(`Unable to find role associated to game ${game.gameName}`);
                });
            }
        }
    }

    private static onMessageReactionRemove(messageReaction: MessageReaction, user: User) {

        const clientId = Bot.getId();

        if(user.id !== clientId && messageReaction.message.id === GamesRolesModule.targetMessageID
            && GamesRolesModule.instance && GamesRolesModule.instance.gamesTable) {
            const game = GamesRolesModule.instance.gamesTable.find(g => g.emojiName === messageReaction.emoji.name);
            if(game) {
                const member = messageReaction.message.guild.member(user);
                
                messageReaction.message.guild.roles.fetch(game.roleId).then(role => {
                    if(member.roles.cache.has(game.roleId)) {
                        member.roles.remove(role);
                        Logger.info(`Removed role ${role.name} from ${user.username}`);
                        member.createDM().then(channel => {
                            channel.send(`Je t'ai enlevé le rôle **${role.name}**!`);
                        });
                    }
                }).catch(e => {
                    Logger.warn(`Unable to find role associated to game ${game.gameName}`);
                });
            }
        }
    }

    private static onGuildMemberAdd(member: GuildMember) {
        if(member.user.id !== Bot.getId() && GamesRolesModule.instance) {
            GamesRolesModule.instance.scanPlayer(member);
        }
    }

    private init(params: any[]) {
        GamesRolesModule.targetChannelID = params['targetChannel']? params['targetChannel'] : null;
        GamesRolesModule.targetMessageID = params['targetMessage']? params['targetMessage'] : null;
        GamesRolesModule.fetchFrequency = params['fetchingFrequency']? params['fetchingFrequency'] : 30000;
        GamesRolesModule.scanFrequency = params['fetchingFrequency']? params['scanFrequency'] : 60000;

        this.fetchMessage();
        this.fetchTimer = setInterval(() => { this.fetchMessage(); }, GamesRolesModule.fetchFrequency);

        Dao.getInstance().getGameList().then(gameList => {
            this.gamesTable = gameList;
            this.scanTimer = setInterval(() => { this.scanPlayersActivity(); }, GamesRolesModule.scanFrequency);
        }).catch(e => {
            Logger.error(`Unable to retrieve games table! ${e}`);
        });
    }

    private stop() {
        clearInterval(this.fetchTimer);
        clearInterval(this.scanTimer);
    }
}