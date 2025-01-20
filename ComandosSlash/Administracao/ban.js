const Discord = require("discord.js");
const { EmbedBuilder } = require('discord.js');
const { getPermissions } = require("../../Functions/PermissionsCache.js");
const configuracao = require('../../DataBaseJson/configuracao.json'); // Ajuste o caminho conforme necessário

module.exports = {
  name: "ban",
  description: "[⚒ | Moderação] Execute para banir algum usuário",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'member',
      description: 'Quem vai ser banido?',
      type: Discord.ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: 'motivo',
      description: 'Por qual motivo?',
      type: Discord.ApplicationCommandOptionType.String,
      required: false,
    }
  ],

  run: async (client, interaction) => {
    const perm = await getPermissions(client.user.id);
    if (!perm || !perm.includes(interaction.user.id)) {
      return interaction.reply({ content: '❌ | Você não possui permissão para usar esse comando.', ephemeral: true });
    }

    const member = interaction.options.getUser('member');
    const user = interaction.guild.members.cache.get(member.id);
    const motivo = interaction.options.getString('motivo') || 'Nenhum motivo fornecido';

    if (!user) {
      return interaction.reply({ content: '❌ | Membro não encontrado.', ephemeral: true });
    }

    try {
      // Enviar mensagem para o usuário banido
      const embedMessage = new EmbedBuilder()
        .setColor('Red')
        .setTitle('Você foi BANIDO!')
        .setAuthor({ name: 'Sistema de Moderação', iconURL: 'https://media.discordapp.net/attachments/1273480562774118410/1273481040689631303/ed34.png?ex=66d33464&is=66d1e2e4&hm=b347466e699e1da7eee5cc5b1a9d279064082ef72bfaed2095860ccab420279b&=&format=webp&quality=lossless' })
        .setDescription(`Você foi banido do servidor por **${interaction.user.tag}** (${interaction.user.id}).`)
        .addFields(
          { name: 'Motivo', value: motivo },
          { name: 'Data do Banimento', value: new Date().toLocaleString() }
        )
        .setFooter({ text: 'Se você acha que isso foi um erro, entre em contato com a administração do servidor.' });

      await member.send({ embeds: [embedMessage] });

      // Banir o usuário
      await user.ban({ reason: `Banido por: ${interaction.user.username}` });

      // Responder ao comando
      await interaction.reply({ content: `O membro ${member} foi banido com sucesso.`, ephemeral: true });

      // Enviar mensagem de log para o canal configurado
      const channelID = configuracao.ConfigChannels.mensagens; // Canal de logs configurado
      const channel = await client.channels.fetch(channelID);

      if (channel) {
        const logEmbed = new EmbedBuilder()
          .setColor('Red')
          .setTitle('Usuário Banido')
          .setAuthor({ name: 'Sistema de Moderação', iconURL: 'https://media.discordapp.net/attachments/1273480562774118410/1273481040689631303/ed34.png?ex=66d33464&is=66d1e2e4&hm=b347466e699e1da7eee5cc5b1a9d279064082ef72bfaed2095860ccab420279b&=&format=webp&quality=lossless' })
          .setDescription(`O usuário **${member.tag}** (${member.id}) foi banido.`)
          .addFields(
            { name: 'Banido por', value: `${interaction.user.tag} (${interaction.user.id})` },
            { name: 'Motivo', value: motivo },
            { name: 'Data do Banimento', value: new Date().toLocaleString() }
          )
          .setTimestamp();

        await channel.send({ embeds: [logEmbed] });
      } else {
        console.error(`Canal de log com ID ${channelID} não encontrado.`);
      }

    } catch (error) {
      console.error(error);
      interaction.reply({ content: '❌ | Ocorreu um erro ao tentar banir o membro.', ephemeral: true });
    }
  }
};
