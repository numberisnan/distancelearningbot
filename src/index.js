const command = require('./commands');
const { RicherEmbed } = require("richer-embed");
const config = require('../config.json');
const Discord = require('discord.js');
const { reportError } = require("./lib/reportErr");

const client = new Discord.Client();
client.login(config.token)
    .then(() => {
        console.log("Logged in")
    })
    .then(async function driver() {
        const commands = await command.init(client);
        client.once('ready', () => {
            console.log('Bot up and running!');
        });

        //Generate help message
        var descriptionString = "";
        for (var i = 0; i < commands.length; i++) {
            var commandObj = commands[i];
            descriptionString += commandObj.name.join(", ") + "   -   " + commandObj.description + "\n";
        }

        client.on('message', message => {
            const args = message.content.split(config.prefix);
            if (args.length > 1) {
                args[0] === "" && args.shift();
                const command = args[0]; //Full command
                const commandName = command.split(" ")[0];
                if (commandName === "help" || commandName === "h") {
                    new RicherEmbed(message.channel, { color: config.colors.normal }).setTitle("Help").setDescription(descriptionString).send();
                }
                commands.forEach(async function (v) {
                    if (v.name.includes(commandName)) {
                        console.log(command);
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
        console.log("Error with logging in");
    });

exports.client = client;