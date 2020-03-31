const { RicherEmbed } = require("richer-embed");
const config = require("../../config");

function notImplementedYet(channel, featureName) {
    return new RicherEmbed(channel, { color: config.colors.bad}).setContent("Feature '" + featureName + "' not implemented yet.", "Please try again later").send();
}

exports.notImplementedYet = notImplementedYet;