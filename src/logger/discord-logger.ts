import { TextChannel, MessageEmbed } from "discord.js";

export class DiscordLogger implements LoggerInterface {

    private channel: TextChannel;

    public constructor(channel : any) {
        if(channel && channel instanceof TextChannel) {
            this.channel = channel as TextChannel;
        }
        else {
            console.error('Wrong argument given to DiscordLogger!');
        }
    }

    public log(msg: string) {
        console.log(msg);
        const messageEmbed = new MessageEmbed()
                        .setColor("0xFFFFFF")
                        .setDescription(msg)
                        .setTitle("Log")
        this.channel.send(messageEmbed);
    }

    public info(msg: string) {
        console.info(msg);
        const messageEmbed = new MessageEmbed()
                        .setColor("0x0000FF")
                        .setDescription(msg)
                        .setTitle("Info")
        this.channel.send(messageEmbed);
    }

    public error(msg: string) {
        console.error(msg);
        const messageEmbed = new MessageEmbed()
                        .setColor("0xFF0000")
                        .setDescription(msg)
                        .setTitle("Error")
        this.channel.send(messageEmbed);
    }

    public warn(msg: string) {
        console.warn(msg);
        const messageEmbed = new MessageEmbed()
                        .setColor("0xFFFF00")
                        .setDescription(msg)
                        .setTitle("Warn")
        this.channel.send(messageEmbed);
    }
}
