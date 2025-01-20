const { EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, ModalBuilder, TextInputBuilder, TextInputStyle, ApplicationCommandOptionType } = require("discord.js");
const { getPermissions } = require("../../Functions/PermissionsCache.js");
const { ChannelType } = require('discord-api-types/v10');
const { Client } = require("discord.js");

module.exports = {
    name: 'anunciar',
    description: '[⚒ | Moderação] Sistema de anuncios',
    Permissions: [PermissionFlagsBits.ManageMessages],
    options: [
        {
            name: 'channel',
            description: 'Qual canal será enviado?',
            type: ApplicationCommandOptionType.Channel,
            required: true
        },
    ],
    run: async (client, interaction) => {
        // Verificação de permissões
        const perm = await getPermissions(client.user.id);
        if (perm === null || !perm.includes(interaction.user.id)) {
            return interaction.reply({ content: `❌ | Você não possui permissão para usar esse comando.`, ephemeral: true });
        }

        // Obter o canal
        const channel = interaction.options.getChannel('channel');
        if (!channel || channel.type !== ChannelType.GuildText) {
            return interaction.reply({ content: `❌ | O canal fornecido é inválido.`, ephemeral: true });
        }

        // Configuração do embed inicial
        const embed = new EmbedBuilder()
            .setTitle("Configure abaixo os campos da embed que deseja configurar.")
            .setFooter({ text: "Clique em cancelar para cancelar o anúncio." })
            .setColor("Blue");

        const send = new EmbedBuilder();

        // Envio da mensagem inicial com botões
        const message = await interaction.reply({
            embeds: [embed],
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder().setCustomId('title').setLabel('⠀Título').setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId('desc').setLabel('Descrição').setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId('image').setLabel('Imagem').setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId('tumb').setLabel('Miniatura').setStyle(ButtonStyle.Secondary),
                    ),
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder().setCustomId('autor').setLabel('⠀Autor⠀').setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId('footer').setLabel('⠀Rodapé⠀').setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId('date').setLabel('⠀Data⠀').setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId('cor').setLabel('⠀Cor⠀').setStyle(ButtonStyle.Secondary),
                    ),
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder().setCustomId('cancelar').setLabel('Cancelar').setStyle(ButtonStyle.Danger),
                        new ButtonBuilder().setCustomId('send').setLabel('⠀⠀⠀⠀⠀Enviar⠀⠀⠀⠀⠀').setStyle(ButtonStyle.Success),
                        new ButtonBuilder().setCustomId('previw').setLabel('⠀Preview⠀').setStyle(ButtonStyle.Primary),
                    ),
            ]
        });

        // Coletor de interações com os botões
        const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 360_000 });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({ content: `Você não tem permissão para usar este botão.`, ephemeral: true });
            }

            switch (i.customId) {
                case 'cancelar':
                    await i.deferUpdate();
                    await i.deleteReply();
                    break;

                case 'previw':
                    await i.reply({ embeds: [send], ephemeral: true });
                    break;

                case 'send':
                    try {
                        await i.deferUpdate();
                        await i.deleteReply();
                        await channel.send({ embeds: [send] });
                    } catch (err) {
                        await i.reply({ content: `${obterEmoji(2)} **|** Houve um erro ao processar o anúncio`, ephemeral: true });
                    }
                    break;

                case 'title':
                case 'desc':
                case 'image':
                case 'tumb':
                case 'autor':
                case 'footer':
                case 'cor':
                    await handleModals(i, interaction, send);
                    break;

                case 'date':
                    send.setTimestamp();
                    await i.deferUpdate();
                    break;

                default:
                    await i.reply({ content: `Ação desconhecida.`, ephemeral: true });
                    break;
            }
        });

        collector.on('end', collected => {
            //console.log(`Coletor de componentes terminado após ${collected.size} interações.`);
        });
    }
};

// Função para lidar com modais
async function handleModals(interaction, parentInteraction, embed) {
    const modalId = 'edit_' + Date.now();
    const collectorFilter = i => i.user.id === parentInteraction.user.id && i.customId === modalId;

    let modal;
    switch (interaction.customId) {
        case 'title':
            modal = new ModalBuilder()
                .setCustomId(modalId)
                .setTitle('Título')
                .addComponents(
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('text')
                                .setLabel("Qual seria o título?")
                                .setStyle(TextInputStyle.Short)
                        )
                );
            break;

        case 'desc':
            modal = new ModalBuilder()
                .setCustomId(modalId)
                .setTitle('Descrição')
                .addComponents(
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('text')
                                .setLabel("Qual seria a descrição?")
                                .setStyle(TextInputStyle.Paragraph)
                        )
                );
            break;

        case 'image':
            modal = new ModalBuilder()
                .setCustomId(modalId)
                .setTitle('Imagem')
                .addComponents(
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('text')
                                .setLabel("Qual seria a imagem? Coloque link")
                                .setStyle(TextInputStyle.Short)
                        )
                );
            break;

        case 'tumb':
            modal = new ModalBuilder()
                .setCustomId(modalId)
                .setTitle('Miniatura')
                .addComponents(
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('text')
                                .setLabel("Qual seria a miniatura? Coloque link")
                                .setStyle(TextInputStyle.Short)
                        )
                );
            break;

        case 'autor':
            modal = new ModalBuilder()
                .setCustomId(modalId)
                .setTitle('Autor')
                .addComponents(
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('text')
                                .setLabel("Qual seria o autor?")
                                .setStyle(TextInputStyle.Short)
                        )
                );
            break;

        case 'footer':
            modal = new ModalBuilder()
                .setCustomId(modalId)
                .setTitle('Rodapé')
                .addComponents(
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('text')
                                .setLabel("Qual seria o rodapé?")
                                .setStyle(TextInputStyle.Short)
                        )
                );
            break;

        case 'cor':
            modal = new ModalBuilder()
                .setCustomId(modalId)
                .setTitle('Cor')
                .addComponents(
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('text')
                                .setLabel("Coloque a cor com hexadecimal")
                                .setStyle(TextInputStyle.Short)
                        )
                );
            break;

        default:
            return interaction.reply({ content: `Ação desconhecida.`, ephemeral: true });
    }

    await interaction.showModal(modal);

    try {
        const submittedInteraction = await interaction.awaitModalSubmit({ time: 600_000, filter: collectorFilter });
        await submittedInteraction.deferUpdate();

        const value = submittedInteraction.fields.getTextInputValue('text');
        switch (interaction.customId) {
            case 'title':
                embed.setTitle(value);
                break;
            case 'desc':
                embed.setDescription(value);
                break;
            case 'image':
                embed.setImage(value);
                break;
            case 'tumb':
                embed.setThumbnail(value);
                break;
            case 'autor':
                embed.setAuthor({ name: value });
                break;
            case 'footer':
                embed.setFooter({ text: value });
                break;
            case 'cor':
                embed.setColor(value);
                break;
        }
    } catch (err) {
        console.error(err);
        await interaction.reply({ content: `${obterEmoji(2)} **|** Houve um erro ao processar o modal`, ephemeral: true });
    }
}
