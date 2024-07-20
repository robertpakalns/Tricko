const errorTexts = {
    0: "CORS or network error",
    400: "Bad request",
    404: "Not found",
    504: "Response took too long"
}

const urls = {
    "https://voxiom.io": "Voxiom.io",
    "https://api.cryzen.io": "Cryzen.io"
}

const list = {
    "https://voxiom.io/profile/player": "Player",
    "https://voxiom.io/clan/info/full": "Clan",
    "https://voxiom.io/match": "Match",
    "https://voxiom.io/profile/leaderboard": "Leaderboard",
    "https://voxiom.io/market/price_history": "Skin",
    "https://api.cryzen.io/v2/users/profile": "Player",
    "https://api.cryzen.io/v2/leaderboard": "Leaderboard"
}

const ranges = ["day", "week", "all"]

const sorts = {
    all: ["score", "level"],
    ctg: ["total_score", "total_games_won", "total_kills", "total_captures"],
    br: ["total_score", "total_games_won", "total_kills", "total_survival_time"],
    clan: ["total_score", "total_games_won", "total_kills", "total_power"]
}

export class Service {
    constructor(url, options) {
        return fetch(url, options)
            .then(r => r.text())
            .then(data => {
                if (data.includes("Gateway time-out")) throw { code: 504 }
                if (url.includes("https://voxiom.io/profile/leaderboard")) {
                    const { searchParams } = new URL(url)
                    const type = url.includes("leaderboard_clan") ? "clan" : (searchParams.get("game_mode") || "all")
                    const range = searchParams.get("range") || ""
                    const sort = searchParams.get("sort")
                    if (!sorts[type] || (type !== "all" && !ranges.includes(range)) || !sorts[type].includes(sort)) throw { code: 400 }
                }
                data = JSON.parse(data)
                if (url.includes("https://voxiom.io") && data.success === false) throw { code: 404 }
                if (url.includes("https://voxiom.io/market/price_history")) {
                    const { item_type } = JSON.parse(options.body)
                    if (item_type < 1 || item_type > 531) throw { code: 400 }
                }
                if (url.includes("https://api.cryzen.io") && data.statusCode) throw { code: data.statusCode }
                return data
            })
            .catch(error => ({
                success: false,
                code: error.code || "[???]",
                text: errorTexts[error.code] || "[???]",
                game: urls[Object.keys(urls).find(key => url.includes(key))] || "[???]",
                type: list[Object.keys(list).find(key => url.includes(key))] || "[???]"
            }))
    }
}

// use
// const response = await new Service(https://voxiom.io/profile/player/a, { method: "POST" })
// console.log(response)
// the response will return an error object since the player "a" does not exist in Voxiom.io
// {
//     "success": false,
//     "code": 404,
//     "text": "Not found",
//     "game": "Voxiom.io",
//     "type": "Player"
// }
