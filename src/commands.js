const { RicherEmbed } = require("richer-embed");
const config  = require("../config");
const discord = require("discord.js");
const { reportError } = require("./lib/reportErr");
const { notImplementedYet } = require("./lib/notImplemented");
const { DataTypes } = require('sequelize');
const model = require("../.data/models/users");
var db, sq;
async function init(client, s) {
    db = model(s, DataTypes);
    return [
        // Chat Commands
        {
            name: ["ping"],
            description: "Check if the bot is online",
            sudo: false,
            execute: function (message) {
                return message.channel.send("pong");
            }
        },
        {
            name: ["register"],
            sudo: false,
            description: "Sign up for schedule updates and more distance learning features!",
            execute: async function (message, command) {
                 const name = command.split(" ")[1]; /* First arg */
                 await db.findAll({
                     where: {
                         id: message.author.id
                     }
                 })
                 .then(result => {
                     if (!result.length) {
                         return db.create({
                             Id: message.author.id,
                             Name: name
                         })
                     } else {
                         db.update({
                             Name: name
                         }, {
                             where: {
                                 Id: message.author.id
                             }
                         });
                     }
                 })
                 .then(async result => {
                     await db.sync();
                     console.log(`A user ` + name + " has been registered.");
                     return new RicherEmbed(message.channel, { color: config.colors.normal }).setContent("User " + name + " registered!", "You will now have access to all of the features this bot has to offer.").send();
                 }).catch(err => {
                     console.log(err.message);
                     return new RicherEmbed(message.channel, { color: config.colors.bad }).setContent("Error", "User could not be made.").send();
                 });
            }
        },
        {
            name: ["close", "exit"],
            sudo: true,
            description: "Terminate the bot safely through Discord.",
            execute: async function(message) {
                await message.channel.send("Bot shutting down.");
                process.exit(0);
            }
        }
    ];
}

exports.init = init;