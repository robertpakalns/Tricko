export class Builder {
    constructor(interaction = Object) {
        this.interaction = interaction
        this.servicePromise = this.interaction.deferReply().then(() => Promise.resolve())
        this.hasError = false
        this.messageID = null
    }

    formatEmbed(embed = Object) {
        return {
            ...embed,
            color: embed.color || 16777215,
            footer: { text: "Powered By Tricko", icon_url: "https://tricko.pro/icon.png" }
        }
    }

    setService(url = String, options = Object) {
        this.servicePromise = this.servicePromise.then(async () => {
            const response = await fetch(url, options)
            const data = await response.json()

            if (data.success === false) {
                this.hasError = true
                const { code, text, game, type } = data
                const errorEmbed = {
                    title: "ERROR",
                    description: `Code: \`${code}\`\nText: \`${text}\`\nGame: \`${game}\`\nType: \`${type}\``,
                    color: 16711680
                }
                await this.interaction.editReply({ embeds: [this.formatEmbed(errorEmbed)] })
            }
            else return data
        })

        return this
    }

    do(callback = Function) {
        this.servicePromise.then(data => { if (data != undefined) callback(data, this) })
        return this
    }

    async setMessage({ embeds = Array, attachments = Array, urls = [] }) {
        await this.servicePromise
        if (this.hasError === true) return this

        const formattedEmbeds = embeds.map(embed => this.formatEmbed(embed))

        let page = 0
        const maxPage = formattedEmbeds.length

        const setRow = max => ({
            type: 1,
            components: (embeds.length > 1 ? [
                { type: 2, custom_id: "back", label: "Back", style: 2, disabled: page === 0 },
                { type: 2, custom_id: "next", label: "Next", style: 2, disabled: page === max - 1 },
            ] : []).concat(urls.map(url => ({ type: 2, label: url.name, style: 5, url: url.value })))
        })

        const updateMessage = async page => await this.interaction.editReply({
            embeds: [formattedEmbeds[page]],
            components: setRow(maxPage).components.length > 0 ? [setRow(maxPage)] : [],
            files: attachments[page] ? [attachments[page]] : []
        })

        this.messageID = (await updateMessage(page)).id

        if (maxPage > 1) {
            this.interaction.channel.createMessageComponentCollector({ filter: i => i.user.id === this.interaction.user.id && i.message.id === this.messageID, time: 60000 })
                .on("collect", async i => {
                    if (i.customId === "back") page--
                    if (i.customId === "next") page++

                    await updateMessage(page)
                    i.deferUpdate()
                })
                .on("end", async () => {
                    const newRow = setRow(maxPage)
                    newRow.components.filter(i => i.style !== 5).forEach(i => i.disabled = true)
                    await this.interaction.editReply({ components: [newRow] })
                })
        }

        return this
    }
}

//use
// new Builder(interaction)
//   .setService(url, options) //optional
//   .do((data, builder) => { //in case setService was used and you have to work with fetched data
//     // your code goes here
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
//   * if more than 1 embed in embeds, then two grey buttons (back and next) appear 
//   * style buttons (optional)
