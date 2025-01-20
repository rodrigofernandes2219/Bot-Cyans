const Discord = require("discord.js");
const ms = require("ms");
const config = require("../../config.json");
const { getPermissions } = require("../../Functions/PermissionsCache.js");

module.exports = {
  name: "sorteio",
  description: "crie um sorteio",
  options: [
    {
      name: "premio",
      type: Discord.ApplicationCommandOptionType.String,
      description: "qual será o prêmio?",
      required: true,
    },
    {
      name: "regras",
      type: Discord.ApplicationCommandOptionType.String,
      description: "descrição do sorteio",
      required: true,
    },
    {
      name: "tempo",
      type: Discord.ApplicationCommandOptionType.String,
      description: "escolha o tempo do sorteio",
      required: true,
      choices: [
        { name: "30 Segundos", value: "30s" },
        { name: "1 Minuto", value: "1m" },
        { name: "5 Minutos", value: "5m" },
        { name: "10 Minutos", value: "10m" },
        { name: "15 Minutos", value: "15m" },
        { name: "30 Minutos", value: "30m" },
        { name: "45 Minutos", value: "45m" },
        { name: "1 Hora", value: "1h" },
        { name: "2 Horas", value: "2h" },
        { name: "5 Horas", value: "5h" },
        { name: "12 Horas", value: "12h" },
        { name: "24 Horas", value: "24h" },
        { name: "1 Dia", value: "1d" },
        { name: "3 Dias", value: "72h" },
        { name: "1 Semana", value: "168h" },
      ],
    },
  ],

  run: async (client, interaction) => {
    // Verificar permissões
    const perm = await getPermissions(client.user.id);
    if (perm === null || !perm.includes(interaction.user.id)) {
      return interaction.reply({
        content: `❌ | Você não possui permissão para usar esse comando.`,
        ephemeral: true,
      });
    }

    let premio = interaction.options.getString("premio");
    let tempo = interaction.options.getString("tempo");
    let desc = interaction.options.getString("regras");

    let duracao = ms(tempo);
    if (!duracao) {
      return interaction.reply({
        content: "❌ **Tempo inválido!**",
        ephemeral: true,
      });
    }

    const participantes = [];

    const buttonParticipar = new Discord.ButtonBuilder()
      .setCustomId("participar")
      .setEmoji("<a:interao:1130986851293986888>") // Verifique se este emoji está disponível no servidor
      .setStyle(2);

    const buttonMostrar = new Discord.ButtonBuilder()
      .setCustomId("mostrar")
      .setLabel(`Mostrar Participantes (0)`) // Inicialmente com 0 participantes
      .setStyle(1);

    const row = new Discord.ActionRowBuilder()
      .addComponents(buttonParticipar, buttonMostrar);

    const embed = new Discord.EmbedBuilder()
      .setAuthor({ name: `Sorteio`, iconURL: `https://cdn.discordapp.com/emojis/1260046185360789604.gif?size=96&quality=lossless` })
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setDescription(
        `> - *Sorteio enviado por* ${interaction.user}\n\n > - *Prêmio:* **${premio}**\n\n > - *Regras do sorteio:* **${desc}** \n\n\ > - *Duração:* **${tempo}**  \n\n\ *Clique no botão abaixo para participar!*`
      )
      .setFooter({ text: `Sorteio terminará em ${ms(duracao, { long: true })}` })
      .setColor(`#2b2d31`);

    const erro = new Discord.EmbedBuilder()
      .setColor("#2b2d31")
      .setDescription(`Não foi possível iniciar o sorteio!`);

    const msg = await interaction
      .reply({
        embeds: [embed],
        components: [row],
      })
      .catch((e) => {
        interaction.reply({ embeds: [erro] });
      });

    const coletor = msg.createMessageComponentCollector({
      time: duracao,
    });

    coletor.on("end", () => {
      interaction.editReply({
        components: [],
      });
    });

    coletor.on("collect", async (i) => {
      if (i.customId === "participar") {
        if (participantes.includes(i.user.id)) {
          return i.reply({
            content: `- *Olá ${i.user}, Você já está participando do sorteio!*`,
            ephemeral: true,
          });
        }
        participantes.push(i.user.id);
        i.reply({
          content: `- *Olá ${i.user}, Você acaba de entrar no sorteio e concorre ao ${premio}*`,
          ephemeral: true,
        });
        interaction.editReply({
          embeds: [embed],
          components: [row.setComponents(
            new Discord.ButtonBuilder()
              .setCustomId("participar")
              .setEmoji("<a:interao:1130986851293986888>")
              .setStyle(2),
            new Discord.ButtonBuilder()
              .setCustomId("mostrar")
              .setLabel(`Mostrar Participantes (${participantes.length})`)
              .setStyle(1)
          )]
        });
      } else if (i.customId === "mostrar") {
        let listaParticipantes = participantes.length
          ? participantes.map(id => `<@${id}>`).join("\n")
          : "Nenhum participante.";

        const embedParticipantes = new Discord.EmbedBuilder()
          .setAuthor({ name: `Participantes`, iconURL: `https://media.discordapp.net/attachments/1273480562774118410/1273481053490909184/ed39.png?ex=66d33467&is=66d1e2e7&hm=1376c88df88cd252d231d777ac732ca4738cc981323026adbeda5a6b7695c359&=&format=webp&quality=lossless` })
          .setDescription(`Participantes (${participantes.length}):\n${listaParticipantes}`)
          .setColor("#2b2d31");

        i.reply({
          embeds: [embedParticipantes],
          ephemeral: true,
        });
      }
    });

    setTimeout(() => {
      let ganhador = participantes[Math.floor(Math.random() * participantes.length)];

      if (participantes.length === 0) {
        let cancelado = new Discord.EmbedBuilder()
          .setTitle('❌ **Cancelado**')
          .setDescription(`❌ *O sorteio foi cancelado pois não houve participantes o suficiente*`)
          .setColor("#FF0000");

        return interaction.channel.send({ embeds: [cancelado] });
      }

      let embedGanhador = new Discord.EmbedBuilder()
        .setAuthor({ name: `Parabéns`, iconURL: `https://cdn.discordapp.com/emojis/1274968996625780819.gif?size=96&quality=lossless` })
        .setDescription(`🎉 *Parabéns <@${ganhador}>, você acaba de ganhar um* **${premio}**`)
        .setColor("#2b2d31")
        .setThumbnail('https://gifs.eco.br/wp-content/uploads/2022/09/gifs-de-presentes-9.gif');

      interaction.channel.send({ embeds: [embedGanhador] });
      client.users.cache.get(ganhador)?.send({ embeds: [embedGanhador] });

    }, duracao);
  },
};
