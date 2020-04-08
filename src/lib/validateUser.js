const { RicherEmbed } = require("richer-embed");
const { colors } = require("../../config");

exports.validateUser = async function(db, userId, channel, logging) {
    const search = await db.findAll({
        where: {
            Id: userId
        }
    });

    if (!search.length && logging) {
        await new RicherEmbed(channel, { color: colors.bad }).setContent("Error", "User " + userId + " not registered.").send();
    }

    return search.length ? search : false;
};