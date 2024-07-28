export const output = (v, e) => `${v} ${v !== 1 ? e + "s" : e}` // simple plural -s endings

export const time = t => `${(t / 3600).toFixed(2)}h` // from seconds to hours

export const creationTime = t => `<t:${Math.ceil(new Date(t).getTime() / 1000)}:R>` // Discord relative time format

export const isNum = (a, b) => isNaN(a / b) ? 0 : (a / b).toFixed(2) // when you have to divide two numbers where the second one might be 0 

export const table = (data, headers) => { // a table for messages including Discord formatting
    if (data.length < 1) return "`No Data`"
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

export const handleError = async (error, interaction) => { // sends a webhook and changes a message in case of broken message. use try...catch
    const title = `Command Name: \`/${interaction.commandName}\``
    const optionsList = `Options: \`${interaction.options._hoistedOptions?.map(el => `${el.name} = ${el.value}`).join("|") || null}\``
    await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: `${title}; ${optionsList} \`\`\`${error.stack}\`\`\`` })
    })
    await interaction.editReply({ // in case you use Builder (developed by me) class
        embeds: [{
            title: "ERROR",
            description: "An error occurred. Please try again later.",
            color: 16711680
        }]
    })
}
