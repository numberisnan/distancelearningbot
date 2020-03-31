const { RicherEmbed } = require("richer-embed");
const { color } = require("../config");
const discord = require("discord.js");
const sqlite3 = require('sqlite3').verbose();
const { reportError } = require("./lib/reportErr");
const { notImplementedYet } = require("./lib/notImplemented");

async function init(client) {
    const db = await new sqlite3.Database("./.data/data.db", (err) => {
        if (err) {
            console.error(err.message);
            reportError(client, err);
        } else {
            console.log('Connected to the database.');
        }
    });

    return [
        // Chat Commands
        {
            name: ["ping"],
            description: "Check if the bot is online",
            execute: function (message) {
                return message.channel.send("pong");
            }
        },
        {
            name: ["register"],
            description: "Sign up for schedule updates and more distance learning features!",
            execute: function (message) {
                return notImplementedYet(message.channel, "Schedule");
            }
        }
    ];
}

exports.init = init;