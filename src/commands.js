const { RicherEmbed } = require("richer-embed");
const config  = require("../config");
const discord = require("discord.js");
const { reportError } = require("./lib/reportErr");
const { notImplementedYet } = require("./lib/notImplemented");
const { validateUser } = require("./lib/validateUser");
const { DataTypes } = require('sequelize');
const moment = require("moment");
const model = require("../.data/models/users");
const { nDigits, format12to24hour } = require("./lib/dateFunctions");

var db, sq;
async function init(client, s) {
    db = model(s, DataTypes);
    return [
        // Chat Commands
        {
            name: ["ping"],
            description: "Check if the bot is online",
            format: "ping",
            sudo: false,
            execute: function (message) {
                return message.channel.send("pong");
            }
        },
        {
            name: ["register"],
            format: "register",
            sudo: false,
            description: "Sign up for schedule updates and more distance learning features!",
            execute: async function (message) {
                 await db.findAll({
                     where: {
                         id: message.author.id
                     }
                 })
                 .then(result => {
                     if (!result.length) {
                         return db.create({
                             Id: message.author.id,
                             Name: message.author.username
                         })
                     } else {
                         db.update({
                             Name: message.author.username
                         }, {
                             where: {
                                 Id: message.author.id
                             }
                         });
                     }
                 })
                 .then(async result => {
                     await db.sync();
                     console.log(`A user ` + message.author.id + " has been registered.");
                     return new RicherEmbed(message.channel, { color: config.colors.normal }).setContent("User " + message.author.username + " registered!", "You will now have access to all of the features this bot has to offer.").send();
                 }).catch(err => {
                     console.log(err.message);
                     return new RicherEmbed(message.channel, { color: config.colors.bad }).setContent("Error", "User could not be made.").send();
                 });
            }
        },
        {
            name: ["sch"],
            description: "Schedule a class at a given time",
            format: "sch time class",
            sudo: false,
            execute: async function(message, command) {
                if (!await validateUser(db, message.author.id, message.channel, true)) {
                    return;
                }

                var time = command.split(" ")[1];
                if (time.split(":")[0].length <= 1) { // e.g. 9:40
                    time = "0" + time;
                }

                if (time.length > 5) {
                    //In AM/PM format
                    time = format12to24hour(time); //Convert to 24 hour format
                }

                if (Number.isNaN(+time[0] + time[1]) || Number.isNaN(+time[3] + time[4])) { // not a valid time
                    return;
                }
                const className = command.split(" ")[2];

                const schObject = await db.findAll({
                    where: {
                        Id: message.author.id
                    }
                });
                const schString = schObject[0].dataValues.ShedObj;

                var sch = JSON.parse(schString ? schString : "{}");

                sch[className] = {
                    time: time
                };

                await db.update({
                    ShedObj: JSON.stringify(sch)
                }, {
                    where: {
                        Id: message.author.id
                    }
                });

                return message.channel.send("Event '" + className + "' created!");
            }
        },
        {
            name: ["remindme", "rem"],
            description: "Send alert when your next scheduled class starts, or a specific event",
            format: "remindme | remindme eventName",
            sudo: false,
            execute: async function(message, command) {
                const args = command.split(" ");
                if (!await validateUser(db, message.author.id, message.channel, true)) {
                    return;
                }

                // Retrieve data from database
                const schObject = await db.findAll({
                    where: {
                        Id: message.author.id
                    }
                });
                const schString = schObject[0].dataValues.ShedObj;

                const sch = JSON.parse(schString ? schString : "{}");

                const currentTimeObj = moment();
                const dateString = currentTimeObj.year() + "-" + nDigits(+currentTimeObj.month()+1, 2) + "-" + nDigits(+currentTimeObj.date(), 2) + " ";

                //console.log(dateString);
                //const currentTimeString = currentTimeObj.hour() + ":" + currentTimeObj.minute();

                // find closest next class
                if (args.length <= 1) {
                    var minDuration = moment.duration(-24, 'hours');
                    var event;
                    for (var key of Object.keys(sch)) {
                        var diff = moment.duration(currentTimeObj.diff(moment(dateString + sch[key].time)));
                        //console.log(key, diff.asMinutes());
                        if (diff.asMinutes() < 0 && diff.asMinutes() > minDuration.asMinutes()) {
                            minDuration = diff;
                            event = key;
                        }
                    }
                } else {
                    const eventArg = args[1];
                    if (sch[eventArg]) {
                        const minDuration = moment.duration(currentTimeObj.diff(moment(dateString + sch[eventArg].time)));
                        const event = eventArg;
                    } else {
                        return message.channel.send("Event '" + eventArg + "' does not exist!")
                    }
                }

                if (event) {
                    setTimeout(function () {
                        message.author.send("Time for '" + event + "'!");
                        console.log("Reminded " + message.author.username + " of " + event);
                    }, -diff.asMilliseconds())

                    return message.channel.send("Will remind you for '" + event + "' in " + Math.round(-diff.asMinutes()) + " minutes!");
                } else {
                    return message.channel.send("Nothing to remind you of!");
                }
            }
        },
        {
            name: ["purge"],
            description: "Delete a user's stored data",
            format: "purge name",
            sudo: true,
            execute: async function(message, command) {
                const user = command.split(" ")[1];
                await db.destroy({
                    where: {
                        name: user
                    }
                });

                return message.channel.send("User '" + user + "' purged!");
            }
        },
        {
            name: ["close", "exit"],
            format: "close",
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