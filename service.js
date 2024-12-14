const errorTexts = {
    0: "CORS or network error",
    400: "Bad request",
    401: "Unauthorized",
    404: "Not found",
    503: "Service unavailable",
    504: "Response took too long"
}

const urls = {
    "https://voxiom.io": "Voxiom.io",
    "https://api.cryzen.io": "Cryzen.io",
    "https://api.vectaria.io": "Vectaria.io",
    "https://api.kirka.io": "Kirka.io"
}

const list = {
    "https://voxiom.io/profile/player": "Player",
    "https://voxiom.io/clan/info/full": "Clan",
    "https://voxiom.io/match": "Match",
    "https://voxiom.io/profile/leaderboard": "Leaderboard",
    "https://voxiom.io/market/price_history": "Skin",

    "https://api.cryzen.io/v2/users/profile": "Player",
    "https://api.cryzen.io/v2/leaderboard": "Leaderboard",

    "https://api.vectaria.io/v2/users/profile": "Player",
    "https://api.vectaria.io/v2/games": "Server",

    "https://api.kirka.io/api/user/getProfile": "Player",
    "https://api.kirka.io/api/clans": "Clan",
    "https://api.kirka.io/api/leaderboard": "Leaderboard"
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
        return this.fetchData(url, options)
    }

    async fetchData(url, options) {
        try {
            if (url.includes("voxiom.io/profile/leaderboard")) {
                const { searchParams } = new URL(url)
                const type = url.includes("leaderboard_clan") ? "clan" : (searchParams.get("game_mode") || "all")
                if (!sorts[type] ||
                    (type !== "all" && !ranges.includes(searchParams.get("range") || "")) ||
                    !sorts[type].includes(searchParams.get("sort"))) {
                    throw 400
                }
            }

            if (url.includes("voxiom.io/market/price_history")) {
                const { item_type } = JSON.parse(options.body)
                if (item_type < 1 || item_type > 531) throw 400
            }

            const response = await fetch(url, options)
            let data = await response.text()

            if (data.includes("Gateway time-out")) throw 504

            data = JSON.parse(data)

            if (data.success === false) throw 404
            if (data.statusCode) throw data.statusCode

            return data
        }
        catch (code) {
            return {
                success: false,
                code: code || "[???]",
                text: errorTexts[code] || "[???]",
                game: urls["https://" + new URL(url).host] || "[???]",
                type: list[Object.keys(list).find(key => url.includes(key))] || "[???]"
            }
        }
    }
}

// Use
// const url = "https://voxiom.io/profile/player/a"
// const options = { method: "POST" }
// const response = await new Service(url, options)  // await is mandatory because it is a promise
// console.log(response)                             // the response will return an error object since the player "a" does not exist in Voxiom.io
//
// Result
// {
//     "success": false,
//     "code": 404,
//     "text": "Not found",
//     "game": "Voxiom.io",
//     "type": "Player"
// }
