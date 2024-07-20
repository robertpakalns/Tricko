const blackList = ["@ss", "ass", "bitch", "b1tch", "bltch", "bastard", "cock", "c0ck", "cum", "cunt", "dick", "fuck", "nigga", "niga", "nigger", "niger", "pussy", "sex", "shit"]
const whiteList = ["assault"]
// the arrays will supplemented later

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
        Player: { inGame: "`[undefined]`", tricko: "https://tricko.pro/cryzen/player" },
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
    const potentialFarmMatches = array.filter(el => el.deaths !== 0 && // user has no deaths
                                                    el.rank !== 1 && // user has not won the match
                                                    el.survival_time < 60 // user played less than 60 seconds
                                             ).length
    if (potentialFarmMatches / array.length >= 0.7) sendWebhook(name, "Voxiom.io", "Player", "BR Gem Farming") // if 7 or more potentialFarmMatches, then it counts as gem farming (currently)
}

// use
// checkName("someBadWord", "Voxiom.io", "Player", "Name")
// checkBrActivity("nickname", array) //Voxiom.io BR only
