const { EmbedBuilder, ApplicationCommandType, ActionRowBuilder, ButtonBuilder, ChannelType } = require("discord.js");
const { DentroCarrinho1 } = require("./DentroCarrinho");
const { carrinhos } = require("../DataBaseJson");

const REQUIRED_ROLE_ID = '1182037557094129774'; // Substitua pelo ID do cargo requerido
const VERIFICATION_LINK = 'https://restorecord.com/verify/Verificaçao2'; // Substitua pelo link de verificação

function VerificaçõesCarrinho(infos) {
    if (infos.estoque <= 0) return { error: 400, message: `Sem Stock Dísponivel` }
    return { status: 202 }
}

async function CreateCarrinho(interaction, infos) {
    // Verifica se o usuário possui o cargo necessário
    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (!member.roles.cache.has(REQUIRED_ROLE_ID)) {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setURL(VERIFICATION_LINK)
                    .setLabel('Clique aqui para se verificar')
                    .setStyle(5)
            );

        await interaction.reply({ 
            content: `Este servidor requer que os membros estejam verificados para abrir carrinhos. Por favor, clique no botão abaixo e autorize para continuar.`,
            components: [row],
            ephemeral: true 
        });
        return;
    }

    await interaction.reply({ content: `<a:ed2:1269298061906284647> Aguarde...`, ephemeral: true }).then(async msg => {
        const thread2222 = interaction.channel.threads.cache.find(x => x.name === `🛒・${interaction.user.username}・${interaction.user.id}`);
        if (thread2222 !== undefined) {
            const row4 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setURL(`https://discord.com/channels/${interaction.guild.id}/${thread2222.id}`)
                        .setLabel('Ir para o carrinho')
                        .setStyle(5)
                );

            interaction.editReply({ content: `❌ Você já possuí um carrinho aberto.`, components: [row4] });
            return;
        }

        const thread = await interaction.channel.threads.create({
            name: `🛒・${interaction.user.username}・${interaction.user.id}`,
            autoArchiveDuration: 60,
            type: ChannelType.PrivateThread,
            reason: 'Needed a separate thread for moderation',
            members: [interaction.user.id],
        });

        const row4 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setURL(`https://discord.com/channels/${interaction.guild.id}/${thread.id}`)
                    .setLabel('Ir para o carrinho')
                    .setStyle(5)
            );

        msg.edit({ content: `<:checklist:1279905108896911471> Carrinho criado!`, components: [row4] });

        await carrinhos.set(thread.id, { user: interaction.user, guild: interaction.guild, threadid: thread.id, infos: infos });

        DentroCarrinho1(thread);
    });
}

module.exports = {
    VerificaçõesCarrinho,
    CreateCarrinho
}
