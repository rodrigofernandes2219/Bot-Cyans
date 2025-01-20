const { ActionRowBuilder, EmbedBuilder, ButtonBuilder } = require('discord.js');
const { configuracao, estatisticas } = require('../DataBaseJson');
const axios = require('axios');
const { JsonDatabase } = require('wio.db');
const schedule = require('node-schedule'); // Importa o node-schedule

async function enviarMensagem(channel, embed) {
    const row222 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('asSs')
                .setLabel('Mensagem do Sistema')
                .setStyle(2)
                .setDisabled(true)
        );

    try {
        await channel.send({ components: [row222], embeds: [embed] });
    } catch (error) {
        console.error('Erro ao enviar a mensagem:', error);
    }
}

async function Varredura(client) {
    const systemLogsChannelId = configuracao.get('ConfigChannels.logpedidos');
    const mpApiToken = configuracao.get('pagamentos.MpAPI');

    if (!systemLogsChannelId || !mpApiToken) {
        console.error('Canal de logs do sistema ou token da API do Mercado Pago não configurados.');
        return;
    }

    const systemLogsChannel = await client.channels.fetch(systemLogsChannelId);
    if (!systemLogsChannel) {
        console.error('Canal de logs do sistema não encontrado.');
        return;
    }

    const embedAntiFraude = new EmbedBuilder()
        .setColor('#1c44ff')
        .setAuthor({ name: `Sistema Anti-Fraude`, iconURL: `https://media.discordapp.net/attachments/1273480562774118410/1273480969160233073/ed5.png?ex=66e10c13&is=66dfba93&hm=5950c916382ae436d06d82e28fa52e066a846dfb9748a3355123a05e35dd00ae&=&format=webp&quality=lossless` })
        .setDescription(`Seu BOT está realizando uma varredura nos pagamentos para verificar a existência de quaisquer reembolsos suspeitos.`)
        .setFooter({ text: `Atenciosamente, Equipe Cyber Shop - Updates`, iconURL: `https://cdn.discordapp.com/attachments/1249858017567051867/1249858131165450290/icon.png?ex=6668d497&is=66678317&hm=9232307575203adda76441b5ff12b94f421989b2b91f0befe0d0bf1c53cece69&` })
        .setTimestamp();

    await enviarMensagem(systemLogsChannel, embedAntiFraude);

    try {
        const refundResponse = await axios.get('https://api.mercadopago.com/v1/payments/search', {
            params: {
                'access_token': mpApiToken,
                'status': 'refunded'
            }
        });

        const refundData = refundResponse.data.results;

        if (refundData.length > 0) {
            const refounds = new JsonDatabase({
                databasePath: "./DataBaseJson/refounds.json"
            });

            for (const element of refundData) {
                const isRefunded = await refounds.get(`${element.id}`);
                if (!isRefunded) {
                    await refounds.set(`${element.id}`, `Reembolsado`);

                    let id = element.external_reference || 'Não encontrado';

                    const embedReembolso = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle(`🚨 Reembolso Detectado`)
                        .setDescription(`Um reembolso foi detectado no sistema de pagamentos.`)
                        .addFields(
                            { name: `**ID do pagamento**`, value: `\`${element.id}\``, inline: true },
                            { name: `**ID do usuário**`, value: `\`${id}\``, inline: true },
                            { name: `**Valor**`, value: `\`${element.transaction_amount}\``, inline: true },
                            { name: `**Data**`, value: `<t:${Math.ceil(Date.now() / 1000)}:R>`, inline: true },
                            { name: `**Status**`, value: `\`${element.status}\``, inline: true },
                            { name: `**Tipo de pagamento**`, value: `\`${element.payment_type_id}\``, inline: true },
                            { name: `**Tipo de operação**`, value: `\`${element.operation_type}\``, inline: true },
                        );

                    await enviarMensagem(systemLogsChannel, embedReembolso);

                    const estatisticasData = estatisticas.fetchAll();
                    for (const element2 of estatisticasData) {
                        if (element2.data.idpagamento === element.id) {
                            estatisticas.delete(element2.ID);
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Erro ao verificar reembolsos:', error);
    }
}


module.exports = {
    Varredura,
};