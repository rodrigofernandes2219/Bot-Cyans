const Discord = require("discord.js");
const { EmbedBuilder } = require('discord.js');
const { getPermissions } = require("../../Functions/PermissionsCache.js");
const configuracao = require('../../DataBaseJson/configuracao.json'); // Ajuste o caminho conforme necessário

module.exports = {
  name: "cleardm",
  description: 'Deletar um número específico de mensagens no DM com um usuário.',
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'usuário',
      description: 'Mencione um usuário.',
      type: Discord.ApplicationCommandOptionType.User,
      required: true
    },
    {
      name: 'quantidade',
      description: 'Número de mensagens a serem deletadas.',
      type: Discord.ApplicationCommandOptionType.Integer,
      required: true
    }
  ],

  run: async (client, interaction) => {
    const perm = await getPermissions(client.user.id);
    if (!perm || !perm.includes(interaction.user.id)) {
      return interaction.reply({ content: '❌ | Você não possui permissão para usar esse comando.', ephemeral: true });
    }

    const member = interaction.options.getUser('usuário');
    const quantidade = interaction.options.getInteger('quantidade');

    if (quantidade <= 0) {
      return interaction.reply({ content: '❌ | A quantidade deve ser um número positivo.', ephemeral: true });
    }

    const channelID = configuracao.ConfigChannels.mensagens; // Canal para logs

    let logChannel;
    try {
      logChannel = await client.channels.fetch(channelID);
      if (!logChannel || !logChannel.isTextBased()) {
        throw new Error('Canal de log não encontrado ou não é um canal de texto.');
      }
    } catch (error) {
      console.error('Erro ao obter canal de log:', error.message); // Imprime mensagem de erro no console
      logChannel = null; // Define logChannel como null para checar mais tarde
    }

    let replyMessage;
    try {
      replyMessage = await interaction.reply({
        content: `<a:ed2:1269298061906284647> | Iniciando a exclusão de mensagens...`,
        ephemeral: true,
        fetchReply: true
      });
    } catch (error) {
      return;
    }

    try {
      const dmChannel = await member.createDM();
      let remaining = quantidade;
      let deletedCount = 0;

      while (remaining > 0) {
        const fetchLimit = Math.min(remaining, 100);

        const messages = await dmChannel.messages.fetch({ limit: fetchLimit });
        if (messages.size === 0) {
          break;
        }

        const botMessages = messages.filter(msg => msg.author.id === client.user.id);

        if (botMessages.size === 0) {
          await replyMessage.edit({ content: `<:checklist:1279905108896911471> | Nenhuma mensagem do bot encontrada para exclusão.` });
          break;
        }

        for (const msg of botMessages.values()) {
          try {
            await msg.fetch();
            await msg.delete();
            deletedCount++;
          } catch (error) {
            if (error.code === 50003) {
              // Erro de permissão
            } else if (error.code === 10008) {
              // Mensagem desconhecida
            } else {
              // Outro erro
            }
          }
        }

        remaining -= botMessages.size;

        try {
          await replyMessage.edit({ content: `<:checklist:1279905108896911471> | Deletando mensagens: ${deletedCount}/${quantidade}` });
        } catch (error) {
          if (error.code === 10008) {
            break;
          }
          break;
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      try {
        await replyMessage.edit({ content: `<:checklist:1279905108896911471> | ${deletedCount} mensagens foram deletadas no DM com ${member}.` });
      } catch (error) {
        if (error.code === 10008) {
          try {
            await interaction.followUp({ content: `<:checklist:1279905108896911471> | ${deletedCount} mensagens foram deletadas no DM com ${member}.`, ephemeral: true });
          } catch (error) {}
        } else {
          try {
            await interaction.followUp({ content: `<:checklist:1279905108896911471> | ${deletedCount} mensagens foram deletadas no DM com ${member}.`, ephemeral: true });
          } catch (error) {}
        }
      }

      // Log de comando cleardm (só se logChannel estiver disponível)
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setColor('#2b2d31')
          .setAuthor({ name: `Comando cleardm Utilizado`, iconURL: `https://media.discordapp.net/attachments/1273480562774118410/1273481039116763166/ed27.png?ex=66d485e3&is=66d33463&hm=8f3855f05e451297c744784911a93416a4c1c02aa17afa3f52f5545e067e39d2&=&format=webp&quality=lossless` })
          .setDescription('O comando `/cleardm` foi utilizado.')
          .addFields(
            { name: 'Quem Utilizou', value: interaction.user.toString(), inline: true },
            { name: 'Quem Recebeu', value: member.toString(), inline: true },
            { name: 'Quantidade de Mensagens Deletadas', value: `${deletedCount}`, inline: true }
          )
          .setTimestamp();

        try {
          await logChannel.send({ embeds: [logEmbed] });
        } catch (error) {
          console.error('Erro ao enviar log para o canal:', error.message);
        }
      } else {
        console.warn('Canal de log não disponível, não será possível registrar o log.');
      }

    } catch (error) {
      console.error('Erro ao tentar deletar mensagens:', error);
      await interaction.reply({ content: '❌ | Ocorreu um erro ao tentar deletar mensagens.', ephemeral: true });
    }
  }
};