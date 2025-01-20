const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { configuracao } = require("../../DataBaseJson");

module.exports = {
    name: 'guildMemberAdd',
    run: async (member, client) => {
        try {
            // Enviar mensagem para o canal de logs
            const testando = configuracao.get(`ConfigChannels.entradas`);
            const canal_logs = member.guild.channels.cache.get(testando);
            if (!canal_logs) return;

            const nomeUsuario = member.user.username;
            const dataCriacao = new Date(member.user.createdAt.setHours(0, 0, 0, 0));
            const dataAtual = new Date();
            const diffEmMilissegundos = Math.abs(dataAtual - dataCriacao);
            const diffEmDias = Math.floor(diffEmMilissegundos / (1000 * 60 * 60 * 24));
            const tempoNoDiscord = `${diffEmDias} dias no Discord`;

            let tipoLink = "Vanity URL ou convite de uso único.";
            if (nomeUsuario.includes(member.guild.name)) {
                tipoLink = "Vanity URL ou convite de uso único.";
            } else if (member.user.bot) {
                tipoLink = "Convite de bot";
            } else {
                if (nomeUsuario.match(/discord\.gg\/[a-zA-Z0-9]+/i)) {
                    tipoLink = "Convite personalizado.";
                } else if (nomeUsuario.match(/discord.com\/invite\/[a-zA-Z0-9]+/i)) {
                    tipoLink = "Convite personalizado.";
                } else if (nomeUsuario.match(/[a-zA-Z0-9]+#[0-9]{4}/)) {
                    tipoLink = "Convite direto de servidor.";
                }
            }

            let embed = new EmbedBuilder()
                .setColor(`${configuracao.get(`Cores.Sucesso`) || `#00FF00`}`) 
                .setAuthor({ name: `Entrada`, iconURL: `https://images-ext-1.discordapp.net/external/EN-67_isFGxIrMUhiD8AN_m6D-WivYwQS6yxYYjEOoQ/%3Fsize%3D2048/https/cdn.discordapp.com/emojis/1250592060352893000.png?format=webp&quality=lossless` })
                .setDescription(`${member} (${nomeUsuario})\n<:eutambmtenho27:1264775225359466507> ${tempoNoDiscord}\n<:eutambmtenho23:1264775167318425671> ${tipoLink}`)
                .setFooter({ text: member.guild.name, iconURL: member.guild.iconURL({ dynamic: true }) })
                .setTimestamp();

            canal_logs.send({ embeds: [embed] });
        } catch (error) {
            console.error('Erro ao enviar mensagem de entrada:', error);
        }

        try {
            // Atribuir cargo ao novo membro
            const cargoID = configuracao.get(`ConfigRoles.cargomembro`);
            const cargo = member.guild.roles.cache.get(cargoID);
            if (cargo) {
                await member.roles.add(cargo);
            } else {
                console.error("Cargo não encontrado.");
            }
        } catch (error) {
            console.error('Erro ao atribuir cargo:', error);
        }

        try {
            // Enviar mensagem de boas-vindas
            const channelaasdawdw = configuracao.get(`Entradas.channelid`);
            const mensagemBoasVindas = configuracao.get(`Entradas.msg`);
            const tempoDeExclusao = configuracao.get(`Entradas.tempo`) * 1000; // Tempo em milissegundos

            const mapeamentoSubstituicao = {
                "{member}": `<@${member.user.id}>`,
                "{guildname}": `${member.guild.name}`
            };

            const substituirPalavras = (match) => mapeamentoSubstituicao[match] || match;
            const stringNova = mensagemBoasVindas.replace(/{member}|{guildname}/g, substituirPalavras);

            const row222 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('asSs')
                        .setLabel('Mensagem do Sistema')
                        .setStyle(2)
                        .setDisabled(true)
                );

            // Enviar mensagem para múltiplos canais, se configurado
            if (channelaasdawdw && channelaasdawdw.length > 0) {
                for (const element of channelaasdawdw) {
                    try {
                        const channela = client.channels.cache.get(element);
                        if (channela) {
                            await channela.send({ components: [row222], content: `${stringNova}` }).then(msg => {
                                if (tempoDeExclusao > 0) {
                                    setTimeout(async () => {
                                        try {
                                            await msg.delete();
                                        } catch (error) {
                                            console.error('Erro ao deletar mensagem:', error);
                                        }
                                    }, tempoDeExclusao);
                                }
                            });
                        } else {
                          //  console.error(`Canal ${element} não encontrado.`);
                        }
                    } catch (error) {
                      //  console.error('Erro ao enviar mensagem de boas-vindas para o canal:', error);
                    }
                }
            } else {
                // Se não há canais configurados, enviar para o canal padrão
                const canalPadrao = client.channels.cache.get(configuracao.get(`Entradas.entradas`));
                if (canalPadrao) {
                    await canalPadrao.send({ components: [row222], content: `${stringNova}` }).then(msg => {
                        if (tempoDeExclusao > 0) {
                            setTimeout(async () => {
                                try {
                                    await msg.delete();
                                } catch (error) {
                                   // console.error('Erro ao deletar mensagem:', error);
                                }
                            }, tempoDeExclusao);
                        }
                    });
                } else {
                   // console.error("Canal padrão não encontrado.");
                }
            }
        } catch (error) {
           // console.error('Erro ao enviar mensagem de boas-vindas:', error);
        }

        // Processar regras de Anti-Fake
        const nomesAntiFake = configuracao.get(`AntiFake.nomes`);
        if (nomesAntiFake !== null) {
            const contemNome = nomesAntiFake.some(nome => member.user.username.includes(nome));
            if (contemNome) {
                await member.kick();
                const embed = new EmbedBuilder()
                    .setAuthor({ name: `${member.user.username}` })
                    .setTitle(`Anti-Fake`)
                    .setDescription(`Usuário foi expulso por ter o nome \`${member.user.username}\` que está na blacklist.`)
                    .addFields(
                        { name: `User ID`, value: `${member.user.id}`, inline: true },
                        { name: `Data de criação`, value: `<t:${Math.ceil(getCreationDateFromSnowflake(member.user.id) / 1000)}:R>`, inline: true }
                    )
                    .setFooter({ text: `${member.guild.name}` })
                    .setTimestamp()
                    .setColor(`${configuracao.get(`Cores.Principal`) || `#fcba03`}`);

                try {
                    const channela = client.channels.cache.get(configuracao.get(`ConfigChannels.boasvindascoole`));
                    if (channela) {
                        channela.send({ embeds: [embed] });
                    }
                } catch (error) {
                   // console.error('Erro ao enviar mensagem de expulsão por nome:', error);
                }
            }
        }

        const statusAntiFake = configuracao.get(`AntiFake.status`);
        if (statusAntiFake !== null) {
            try {
                await member.fetch(true);
                const presence = member.presence;
                const customStatusActivity = presence.activities.find(activity => activity.type === 4);
                const customStatusState = customStatusActivity ? customStatusActivity.state : null;

                const contemNome = statusAntiFake.some(nome => customStatusState && customStatusState.includes(nome));
                if (contemNome) {
                    await member.kick();
                    const embed = new EmbedBuilder()
                        .setAuthor({ name: `${member.user.username}` })
                        .setTitle(`Anti-Fake`)
                        .setDescription(`Usuário foi expulso por ter o status \`${customStatusState}\` na blacklist.`)
                        .addFields(
                            { name: `User ID`, value: `${member.user.id}`, inline: true },
                            { name: `Data de criação`, value: `<t:${Math.ceil(getCreationDateFromSnowflake(member.user.id) / 1000)}:R>`, inline: true }
                        )
                        .setFooter({ text: `${member.guild.name}` })
                        .setTimestamp()
                        .setColor(`${configuracao.get(`Cores.Principal`) || `#fcba03`}`);

                    try {
                        const channela = client.channels.cache.get(configuracao.get(`ConfigChannels.boasvindascoole`));
                        if (channela) {
                            channela.send({ embeds: [embed] });
                        }
                    } catch (error) {
                       // console.error('Erro ao enviar mensagem de expulsão por status:', error);
                    }
                }
            } catch (error) {
                //console.error('Erro ao verificar status do membro:', error);
            }
        }

        const diasMinimosAntiFake = configuracao.get(`AntiFake.diasminimos`);
        if (diasMinimosAntiFake !== null) {
            const dataCriacaoConta = new Date(getCreationDateFromSnowflake(member.user.id));
            const dataAtual = new Date();
            const diferencaEmMilissegundos = dataAtual - dataCriacaoConta;
            const diasDecorridos = Math.floor(diferencaEmMilissegundos / (1000 * 60 * 60 * 24));

            if (diasDecorridos < diasMinimosAntiFake) {
                await member.kick();
                const embed = new EmbedBuilder()
                    .setAuthor({ name: `${member.user.username}` })
                    .setTitle(`Anti-Fake`)
                    .setDescription(`Usuário foi expulso por ter uma conta com menos de \`${diasDecorridos}\` dias.`)
                    .addFields(
                        { name: `User ID`, value: `${member.user.id}`, inline: true },
                        { name: `Data de criação`, value: `<t:${Math.ceil(getCreationDateFromSnowflake(member.user.id) / 1000)}:R>`, inline: true }
                    )
                    .setFooter({ text: `${member.guild.name}` })
                    .setTimestamp()
                    .setColor(`${configuracao.get(`Cores.Principal`) || `#fcba03`}`);

                try {
                    const channela = client.channels.cache.get(configuracao.get(`ConfigChannels.boasvindascoole`));
                    if (channela) {
                        channela.send({ embeds: [embed] });
                    }
                } catch (error) {
                    //console.error('Erro ao enviar mensagem de expulsão por dias de conta:', error);
                }
            }
        }
    }
};