const Discord = require("discord.js");
const config = require("../../config.json");
const { getPermissions } = require("../../Functions/PermissionsCache.js");

module.exports = {
    name: "say",
    description: "Enviar Mensagem",
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'texto',
            description: 'O que deseja enviar?.',
            type: Discord.ApplicationCommandOptionType.String,
            required: true,
        }
    ],
    run: async (Client, interaction) => {
        const perm = await getPermissions(Client.user.id);
        if (perm === null || !perm.includes(interaction.user.id)) {
            return interaction.reply({ content: `❌ | Você não possui permissão para usar esse comando.`, ephemeral: true });
        } else {
            const dados = interaction.options.getString('texto');
            const reply = await interaction.reply({ content: `<:checklist:1279905108896911471> | Mensagem enviada com êxito. Verifique agora mesmo!`, ephemeral: true });
            interaction.channel.send({ content: `${dados}` });
            setTimeout(async () => { 
                try {
                    await reply.delete(); 
                } catch (error) {
                    console.error('Erro ao deletar a resposta:', error);
                }
            }, 5000);
        }
    }
};
