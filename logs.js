const blackList = ["@ss", "ass", "bitch", "b1tch", "bltch", "bastard", "cock", "c0ck", "cum", "cunt", "dick", "fuck", "nigga", "niga", "nigger", "niger", "pussy", "sex", "shit"]
const whiteList = ["assault", "lasso", "passion", "class", "massive", "solasso", "ericasso"]
// arrays will be supplemented later

const creationTime = t => `<t:${Math.ceil(new Date(t).getTime() / 1000)}:R>` // Discord relative date format

const webhooks = { // urls to webhooks
    "Cryzen.io": "",
    "Kirka.io": "",
    "Vectaria.io": "",
    "Voxiom.io": "",
}

const urlMap = {
    "Voxiom.io": {
        Player: { inGame: "https://voxiom.io/player", tricko: "https://tricko.pro/voxiom/player" },
        Clan: { inGame: "https://voxiom.io/clans/view", tricko: "https://tricko.pro/clan/player" },
    },
    "Cryzen.io": {
        Player: { inGame: null, tricko: "https://tricko.pro/cryzen/player" },
    }
}

const sendWebhook = (name, game, mode, type) => {
    const urls = urlMap[game]?.[mode] || { inGame: "`[undefined]`", tricko: "`[undefined]`" }
    fetch(`https://discord.com/api/webhooks/${webhooks[game]}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            embeds: [{
                title: "Violation Detected",
                fields: [
                    { name: "Data", value: `Name: \`${name}\`\nGame: \`${game}\`\nMode: \`${mode}\`\nType: \`${type}\`\nTimestamp: ${creationTime(new Date())}` },
                    { name: "Links", value: `In Game URL: ${urls.inGame}/${name}\nTricko URL: ${urls.tricko}/${name}` },
                ],
                color: 16711680,
                footer: { text: "Powered By Tricko", icon_url: "https://tricko.pro/icon.png" }
            }]
        })
    })
}

export const checkName = (name, game, mode, type) => {
    if (typeof name !== "string") return

    const inBlackList = blackList.some(word => name.toLowerCase().includes(word))
    const inWhiteList = whiteList.some(word => name.toLowerCase().includes(word))

    if (inBlackList && !inWhiteList) sendWebhook(name, game, mode, type)
}

export const checkBrActivity = (name, array) => {
    if (typeof name !== "string") return
    const potentialFarmMatches = array.filter(el =>
        el.deaths !== 0 &&                                    // player has no deaths
        el.rank !== 1 &&                                      // player has not won the match
        el.survival_time < 60 &&                              // player played less than 60 seconds
        new Date(el.time) > new Date(Date.now() - 2500000000) // match wass earlier than ~30 days ago (relatively new)
    ).length
    if (potentialFarmMatches / array.length >= 0.7)           // sends a webhook if 7 and more "farming" matches
        sendWebhook(name, "Voxiom.io", "Player", "BR Gem Farming")
}

export const checkDuplicates = (name, array) => {
    const map = array.reduce((acc, el) => {
        if (el.item.name) acc[el.item.name] = (acc[el.item.name] || 0) + 1
        return acc
    }, {})
    const isDupe = Object.values(map).some(i => i >= 2)
    if (isDupe) sendWebhook(name, "Vectaria.io", "Player", "Skin Dupe")
}

// use
// checkName(badName, "Voxiom.io", "Player", "Name")
// checkBrActivity(name, array) //Voxiom.io BR only
// checkDuplicates(name, array) //Vectaria.io only
