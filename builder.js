export class Builder {
    constructor(interaction) {
        this.interaction = interaction
        this.promise = this.interaction.deferReply()
    }

    formatEmbed(embed) {
        return {
            ...embed,
            color: embed.color || 16777215,
            footer: { text: "Powered by Tricko", icon_url: "https://bot.tricko.pro/bot_icon.webp" }
        }
    }

    handleError(error) {
        const { commandName = null, options = null } = this.interaction
        const optionsMap = options?._hoistedOptions?.map(el => `${el.name} = ${el.value}`).join("|") || null

        this.setError(`An error occurred while executing \`${commandName}\` command with parameters \`${optionsMap}\`. The error has been logged. Please try again later.`)

        fetch(webhook, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: `Builder error. Command name: \`/${commandName}\` Options: \`${optionsMap}\` \`\`\`${error.stack}\`\`\`` })
        })
    }

    setService(path, options) {
        this.promise = fetch(`https://api.tricko.pro${path}${path.includes("?") ? "&" : "?"}log=bot`, options)
            .then(r => r.json())
            .then(data => {
                if (data.success === false) {
                    const { code, text, game, type } = data
                    this.setError(`Code: \`${code}\`\nText: \`${text}\`\nGame: \`${game}\`\nType: \`${type}\``)
                    return null
                }
                return data
            })
        return this
    }

    do(callback) {
        this.promise
            .then(data => data !== null && callback(data, this))
            .catch(error => this.handleError(error))

        return this
    }

    setMessage({ embeds = [], attachments = [], urls = [] }) {
        this.promise.then(data => {
            if (data === null) return

            const formattedEmbeds = embeds.map(el => this.formatEmbed(el))
            const maxPage = embeds.length

            let page = 0
            const setRow = () => ({
                type: 1,
                components: [...(embeds.length > 1 ? [
                    { type: 2, custom_id: "back", label: "Back", style: 2, disabled: page === 0 },
                    { type: 2, custom_id: "next", label: "Next", style: 2, disabled: page === maxPage - 1 }
                ] : []),
                ...urls.map(el => ({ type: 2, label: el.name, style: 5, url: el.value }))]
            })

            const updateMessage = () => this.interaction.editReply({
                embeds: [formattedEmbeds[page]],
                components: [setRow()],
                files: attachments[page] ? [attachments[page]] : []
            })

            updateMessage().then(message => {
                if (maxPage > 1) message.createMessageComponentCollector({ filter: i => i.user.id === this.interaction.user.id, time: 6000 })
                    .on("collect", i => {
                        page += i.customId === "next" ? 1 : i.customId === "back" ? -1 : 0
                        updateMessage().then(() => i.deferUpdate())
                    })
                    .on("end", () => {
                        const newRow = setRow()
                        newRow.components = newRow.components.filter(el => el.style === 5)
                        this.interaction.editReply({ components: [newRow] }).catch(() => { })
                    })
            })
        }).catch(error => this.handleError(error))
    }

    setError(description) {
        this.promise.then(() => this.interaction.editReply({
            embeds: [this.formatEmbed({ title: "ERROR", description, color: 16711680 })],
            attachments: [],
            files: []
        }))
    }

    setWarning(description) {
        this.promise.then(() => this.interaction.editReply({
            embeds: [this.formatEmbed({ title: "WARNING", description, color: 16777060 })],
            attachments: [],
            files: []
        }))
    }
}

// Use
// new Builder(interaction)
//   .setService(url, options)                            // optional
//   .do((data, builder) => {                             // in case setService was used and you have to work with fetched data
//
//     // your code goes here
//
//     builder.setMessage({
//       embeds: [],
//       attachments: [],
//       urls: [{ name: "someName", value: "someUrl" }]
//     })
//   }
// supports:
// * embeds
// * attachments
// * rows with buttons
//   * if more than 1 embed in embeds[], then two pagination buttons appear 
//   * style buttons (optional)
