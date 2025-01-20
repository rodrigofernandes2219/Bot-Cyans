const Discord = require("discord.js");
const { EmbedBuilder } = require('discord.js');
const { getPermissions } = require("../../Functions/PermissionsCache.js");
const configuracao = require('../../DataBaseJson/configuracao.json'); // Ajuste o caminho conforme necessário

module.exports = {
  name: "dm",
  description: 'Envie uma mensagem no privado de um usuário.',
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'usuário',
      description: 'Mencione um usuário.',
      type: Discord.ApplicationCommandOptionType.User,
      required: true
    },
    {
      name: 'mensagem',
      description: 'Envie algo para ser enviado.',
      type: Discord.ApplicationCommandOptionType.String,
      required: true
    }
  ],

  run: async (client, interaction) => {
    const perm = await getPermissions(client.user.id);
    if (!perm || !perm.includes(interaction.user.id)) {
      return interaction.reply({ content: '❌ | Você não possui permissão para usar esse comando.', ephemeral: true });
    }

    const member = interaction.options.getUser('usuário');
    const msg = interaction.options.getString('mensagem');

    // Use o ID do canal a partir da configuração
    const channelID = configuracao.ConfigChannels.mensagens;

    try {
      const channel = await client.channels.fetch(channelID);

      const logEmbed = new EmbedBuilder()
        .setColor('#2b2d31')
        .setAuthor({
          name: 'Mensagem Enviada',
          iconURL: 'https://media.discordapp.net/attachments/1273480562774118410/1309519435056545832/burbuja-de-dialogo-unscreen.gif?ex=6741e083&is=67408f03&hm=b2a43d9f00ca7c255d7f5b64a157fc38cf5e93d38933a12e967e5cd9c0a78d30&='
        })
        .setDescription('Uma mensagem foi enviada usando o comando /dm')
        .addFields(
          { name: 'Quem Enviou', value: interaction.user.toString(), inline: true },
          { name: 'Quem Recebeu', value: member.toString(), inline: true },
          { name: 'Mensagem', value: `${msg}` }
        );

      await channel.send({ embeds: [logEmbed] });
    } catch (error) {
      console.error('Erro ao enviar mensagem para o canal:', error);
    }

    try {
      const dmEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setAuthor({
          name: 'Nova Mensagem Privada',
          iconURL: 'https://media.discordapp.net/attachments/1273480562774118410/1309519435056545832/burbuja-de-dialogo-unscreen.gif?ex=6741e083&is=67408f03&hm=b2a43d9f00ca7c255d7f5b64a157fc38cf5e93d38933a12e967e5cd9c0a78d30&='
        })
        .setDescription('Você recebeu uma nova mensagem!')
        .addFields(
          { name: 'Conteúdo da Mensagem', value: `${msg}` }
        )
        .setTimestamp()
        .setFooter({
          text: `Enviado por ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL()
        });

      await member.send({ embeds: [dmEmbed] });

      return interaction.reply({
        content: `<:checklist:1279905108896911471> | Mensagem enviada com sucesso para ${member} no privado (DM).`,
        ephemeral: true
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem para o usuário:', error);
      return interaction.reply({
        content: `❌ | A mensagem não foi enviada para ${member}, pois o usuário está com a DM fechada!`,
        ephemeral: true
      });
    }
  }
};
