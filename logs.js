const blackList = [
    "@ss", "ass", "bitch", "b1tch", "bltch", "bastard", "boob", "cock",
    "c0ck", "cum", "cunt", "dick", "fuck", "megaballs",
    "nigga", "niga", "nigger", "niger", "reggin", "pussy",
    "sex", "slut", "shit",
    "bigmonkeyballs",
    "freepalestine", "freeukraine",
    "hitler", "gitler", "adolfhtler",
    "ibusttokids", "ihitkids",
    "kkk"
]
const whiteList = [
    "assault", "assassin", "assasin", "moisassin", "bassalion",
    "lasso", "passion", "class", "massive", "solasso", "ericasso",
    "cocktail", "shitai", "peacock", "cockatoo",
    "wasssa", "alibassill", "lasse", "hassa",
    "assister", "mass", "aaasss", "eduararias",
    "assion", "wassup", "seabass", "yassin", "plass"
]
// arrays will be supplemented later

const webhooks = {      // Discord webhook IDs
    "Cryzen.io": "",
    "Kirka.io": "",
    "Vectaria.io": "",
    "Voxiom.io": "",
}

const urlMap = {
    "Voxiom.io": {
        Player: "https://voxiom.io/player",
        Clan: "https://voxiom.io/clans/view"
    },
    "Cryzen.io": {
        Player: null
    },
    "Vectaria.io": {
        Player: null
    },
    "Kirka.io": {
        Player: "https://kirka.io/profile",
        Clan: null
    }
}

const sendWebhook = (name, game, mode, type, p) => {
    const url = urlMap[game][mode] || null

    const dataField = [
        `Name: \`${name}\``,
        `Game: \`${game}\``,
        `Mode: \`${mode}\``,
        `Type: \`${type}\``,
        `Time: <t:${Math.ceil(Date.now() / 1000)}:R>`
    ]

    const linkField = [
        `${game}: ${url ? `${url}/${encodeURIComponent(p)}` : "`No Data`"}`,
        `Tricko: https://tricko.pro/${game.split(".")[0].toLowerCase()}/${mode.toLowerCase()}/${p}`
    ]

    fetch(`https://discord.com/api/webhooks/${webhooks[game]}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            embeds: [{
                title: "Violation Detected",
                fields: [
                    { name: "Data", value: dataField.join("\n") },
                    { name: "Links", value: linkField.join("\n") },
                ],
                color: 16747520,
                footer: { text: "Powered by Tricko", icon_url: "https://bot.tricko.pro/bot_icon.webp" },
            }]
        })
    })
}

export const checkNname = (...args) => {
    if (typeof args[0] !== "string") return
    const f = word => args[0].toLowerCase().includes(word)
    if (blackList.some(f) && !whiteList.some(f)) sendWebhook(...args)
}

export const checkBrActivity = (name, array) => {
    if (typeof name !== "string") return
    const farmMatches = array.filter(el =>
        el.deaths !== 0 &&                                               // player has no deaths
        el.rank !== 1 &&                                                 // player has not won the match
        el.survival_time < 60 &&                                         // player played less than 60 seconds
        new Date(el.time) > new Date(Date.now() - 2500000000)            // match wass earlier than ~30 days ago (relatively new)
    ).length
    if (array.length >= 5 && (farmMatches.length / array.length) >= 0.7) // sends a webhook if 7 and more "farming" matches
        sendWebhook(name, "Voxiom.io", "Player", "BR Gem Farming", name)
}

export const checkDuplicates = (name, array) => {
    const map = array.reduce((acc, el) => {
        if (el.item.name) acc[el.item.name] = (acc[el.item.name] || 0) + 1
        return acc
    }, {})
    const isDupe = Object.values(map).some(i => i >= 2)
    if (isDupe) sendWebhook(name, "Vectaria.io", "Player", "Skin Dupe")
}

// Use
// checkName(badName, "Voxiom.io", "Player", "Name", badName)
// checkBrActivity(name, array)                               // Voxiom.io BR only
// checkDuplicates(name, array)                               // useless function
