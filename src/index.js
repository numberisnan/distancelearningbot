const command = require('./commands');
const { RicherEmbed } = require("richer-embed");
const config = require('../config.json');
const Discord = require('discord.js');
const { reportError } = require("./lib/reportErr");
const { Sequelize } = require('sequelize');

const sq = new Sequelize({
    dialect: "sqlite",
    storage: ".data/data.db"
});


const client = new Discord.Client();
client.login(config.token)
    .then(() => {
        console.log("Logged in.")
    })
    .then(async function driver() {
        await sq
            .authenticate()
            .then(err => {
                console.log('Connected to the database.');
            })
            .catch(err => {
                console.error(err);
            });
        const commands = await command.init(client, sq);
        client.once('ready', () => {
            console.log('Bot up and running!');
        });

        //Generate help messages
        var descriptionString = "";
        var sudoDescriptionString = "";
        for (var i = 0; i < commands.length; i++) {
            var commandObj = commands[i];
            sudoDescriptionString += commandObj.name.join(", ") + "   -   " + commandObj.description + (commandObj.sudo ? " (SUDO)" : "") + "\n";
            if (commandObj.sudo) continue;
            descriptionString += commandObj.name.join(", ") + "   -   " + commandObj.description + "\n";
        }

        client.on('message', message => {
            const args = message.content.split(config.prefix);
            if (args.length > 1) {
                args[0] === "" && args.shift();
                const command = args[0]; //Full command
                const commandName = command.split(" ")[0];
                const userId = String(message.author.id);
                if (commandName === "help" || commandName === "h") {
                    new RicherEmbed(message.channel, { color: config.colors.normal }).setTitle("Help").setDescription(String(message.author.id) === config.owner ? sudoDescriptionString : descriptionString).send();
                    return;
                }
                commands.forEach(async function (v) {
                    if (v.name.includes(commandName)) {
                        console.log(command);
                        if (v.sudo && userId !== config.owner) return;
                        try {
                            await v.execute(message, command, client);
                        } catch (err) {
                            await reportError(client, err);
                        }
                    }
                })
            }
        });
    })
    .catch(err => {
        console.log("Error with logging in", err);
    });

async function cleanTerminate() {
    if (sq) {
        await sq.sync();
        console.log("Database is closed.")
    }
    console.log("Bot terminated cleanly.");
}
process.on("exit", cleanTerminate);
process.on('SIGINT', cleanTerminate);

exports.client = client;