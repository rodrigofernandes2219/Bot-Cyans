const { ChannelType, Permissions, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const schedule = require('node-schedule');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const automaticosPath = path.resolve(__dirname, '../../DataBaseJson/msgauto.json');

module.exports = {
    name: "ready",
    run: async (client) => {
        let msgData = [];
        const lastSentTimes = new Map(); // Armazena o tempo da última mensagem enviada
        const messageTimers = new Map(); // Armazena os temporizadores para deleção
        const scheduledMessages = new Set(); // Armazena mensagens agendadas para envio

        const loadMsgData = () => {
            if (fs.existsSync(automaticosPath)) {
                try {
                    msgData = JSON.parse(fs.readFileSync(automaticosPath));
                } catch (error) {
                    msgData = [];
                }
            }
        };

        const deleteOldMessages = async () => {
            for (const data of msgData) {
                for (const chatId of data.chatIds) {
                    const channel = client.channels.cache.get(chatId);
                    if (channel && channel.isTextBased()) {
                        try {
                            const messages = await channel.messages.fetch({ limit: 100 });
                            messages.forEach(async (message) => {
                                const components = message.components;
                                if (components.length > 0) {
                                    const button = components[0].components[0];
                                    if (button.disabled) {
                                        try {
                                            await message.delete();
                                        } catch (error) {
                                            //console.error('Erro ao deletar a mensagem:', error);
                                        }
                                    }
                                }
                            });
                        } catch (error) {
                           // console.error('Erro ao buscar mensagens:', error);
                        }
                    }
                }
            }
        };

        const sendAutoMessages = async () => {
            const now = Date.now();

            for (const data of msgData) {
                const lastSentTime = lastSentTimes.get(data.id) || 0;
                if (now - lastSentTime >= data.repostTime * 1000 && !scheduledMessages.has(data.id)) { // Verifica se o tempo de repostagem passou e se não está agendado
                    scheduledMessages.add(data.id); // Marca como agendado

                    await deleteOldMessages(); // Deleta mensagens antigas antes de enviar novas

                    for (const chatId of data.chatIds) {
                        const channel = client.channels.cache.get(chatId);
                        if (channel) {
                            // Cria o botão desativado
                            const disabledButton = new ButtonBuilder()
                                .setCustomId('system_message')
                                .setLabel('Mensagem Do Sistema')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true);

                            const row = new ActionRowBuilder().addComponents(disabledButton);

                            const message = await channel.send({
                                content: data.message,
                                components: [row]
                            });

                            // Deletar mensagem após deleteTime
                            if (data.deleteTime > 0) {
                                const deleteTimeout = setTimeout(async () => {
                                    try {
                                        const fetchedMessage = await channel.messages.fetch(message.id);
                                        if (fetchedMessage) {
                                            await fetchedMessage.delete();
                                        }
                                    } catch (error) {
                                        //console.error('Erro ao deletar a mensagem:', error);
                                    }
                                    messageTimers.delete(message.id); // Limpar temporizador após deleção
                                }, data.deleteTime * 1000);

                                messageTimers.set(message.id, deleteTimeout); // Armazena o temporizador
                            }

                            // Atualiza o tempo da última mensagem enviada
                            lastSentTimes.set(data.id, now);
                            scheduledMessages.delete(data.id); // Remove do agendado após enviar
                        }
                    }
                }
            }
        };

        // Carregar dados de mensagens automáticas inicialmente
        loadMsgData();

        // Agendar tarefa para enviar mensagens automáticas a cada segundo
        schedule.scheduleJob('* * * * * *', sendAutoMessages); // Executa a cada segundo

        // Observar mudanças no arquivo de configuração
        chokidar.watch(automaticosPath).on('change', () => {
            loadMsgData();
            // Limpar temporizadores de mensagens
            messageTimers.forEach((timer) => clearTimeout(timer));
            messageTimers.clear();
            lastSentTimes.clear();
            scheduledMessages.clear();
        });
    }
};
