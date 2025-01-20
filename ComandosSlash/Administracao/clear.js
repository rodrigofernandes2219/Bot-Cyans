const Discord = require("discord.js");
const config = require("../../config.json");
const { getPermissions } = require("../../Functions/PermissionsCache.js");

module.exports = {
    name: "clear",
    description: "Limpar Mensagens",
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'quantidade',
            description: 'Quer Apagar Quantas Mensagens?',
            type: Discord.ApplicationCommandOptionType.Number,
            required: true,
        }
    ],

    run: async (client, interaction) => {
        let numero = interaction.options.getNumber('quantidade');

        const perm = await getPermissions(client.user.id);
        if (perm === null || !perm.includes(interaction.user.id)) {
            return interaction.reply({ content: `❌ | Você não possui permissão para usar esse comando.`, ephemeral: true });
        } else {
            if (parseInt(numero) > 100 || parseInt(numero) <= 0) {
                let embed = new Discord.MessageEmbed()
                    .setColor(config.color)
                    .setDescription(`\`/clear [1 - 99]\``);

                interaction.reply({ embeds: [embed], ephemeral: true });
                setTimeout(() => { interaction.deleteReply(); }, 3000);
            } else {
                interaction.channel.bulkDelete(parseInt(numero))
                    .then(messages => {
                        interaction.reply({ content: `Apaguei ${messages.size} Mensagens Com Sucesso`, ephemeral: true });
                        setTimeout(() => { interaction.deleteReply(); }, 5000);
                    })
                    .catch(error => {
                        console.error('Erro ao apagar mensagens:', error);
                        interaction.reply({ content: `Ocorreu um erro ao tentar apagar mensagens.`, ephemeral: true });
                    });
            }
        }
    }
};
