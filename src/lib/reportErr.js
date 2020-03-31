const { RicherEmbed } = require("richer-embed");
const Discord = require('discord.js');
const config = require('../../config.json');

function reportError(client, err) {
    return client.users.fetch(config.owner, false)
        .then( async user => {
            const date = new Date();
            console.error(err);
            await new RicherEmbed(user, { color: config.colors.bad }).setContent(err.constructor.name, err.stack)
                .addField("Date", date.toDateString(), true)
                .addField("Time", date.toTimeString(), true)
                .send();
        });
}

exports.reportError = reportError;