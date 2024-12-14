export const output = (v, e) => `${v} ${v !== 1 ? e + "s" : e}`

export const time = t => `${(t / 3600).toFixed(2)}h`

export const creationTime = t => `<t:${Math.ceil(new Date(t).getTime() / 1000)}:R>`

export const isNum = (a, b) => isNaN(a / b) ? 0 : +(a / b).toFixed(2)

export const table = (data, headers) => {
    if (data.length === 0) return "`No Data`"
    const keys = Object.keys(data[0])
    const maxLen = keys.reduce((acc, key) => ({
        ...acc,
        [key]: Math.max(...data.map(row => String(row[key.toLowerCase()]).length), headers ? headers[key].length : 0)
    }), {})
    const rows = data.map(row => keys.map(key => String(row[key.toLowerCase()]).padEnd(maxLen[key])).join("  "))
    if (!headers) return "```" + rows.join("\n") + "```"
    const header = keys.map(key => String(headers[key]).padEnd(maxLen[key])).join("  ")
    const line = Object.values(maxLen).map(len => "-".repeat(len)).join("--")
    return "```" + [header, line, ...rows].join("\n") + "```"
}

export const notFound = interaction => new Builder(interaction)   // import Builder class
    .setError("Command not found.")

export const notAllowed = interaction => new Builder(interaction) // import Builder class
    .setWarning("Command is not allowed on this server. Contact your server Staff or Tricko Staff for more information.")

export const processError = (error, interaction) => {
    const { commandName, options } = interaction
    const optionsMap = options._hoistedOptions?.map(el => `${el.name} = ${el.value}`).join("|") || null

    fetch(webhook, {      // Discord webhook
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: `Command Name: \`/${commandName}\` Options: \`${optionsMap}\` \`\`\`${error.stack}\`\`\`` })
    })

    interaction.editReply({
        embeds: [{
            title: "ERROR",
            description: `An error occurred while executing \`${commandName}\` command with parameters \`${optionsMap}\`. The error has been logged. Please try again later.`,
            color: 16711680,
            footer: { text: "Powered by Tricko", icon_url: "https://tricko.pro/icon.png" }
        }]
    })
}

export const val = (obj, path) => path.split(".").reduce((acc, key) => acc[key], obj)

export const reduceHelper = (array = [], params = {}) => array.reduce((acc, el) => {
    Object.entries(params).forEach(([key, value]) => acc[key] += typeof value === "string" ? +val(el, value) || 0 : value(el) ? 1 : 0)
    return acc
}, Object.fromEntries(Object.keys(params).map(key => [key, 0])))
