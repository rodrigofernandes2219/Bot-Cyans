const { EmbedBuilder, ApplicationCommandType } = require("discord.js");
const { pedidos, pagamentos, carrinhos, configuracao, produtos } = require("../../DataBaseJson");
const { getPermissions } = require("../../Functions/PermissionsCache.js");

module.exports = {
  name: "entregar",
  description: "Use para configurar minhas funções",
  type: ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {
    const startTime = Date.now();

    try {
      // Verifica permissões
      const perm = await getPermissions(client.user.id);
      if (!perm || !perm.includes(interaction.user.id)) {
        return interaction.reply({ content: `❌ | Você não possui permissão para usar esse comando.`, ephemeral: true });
      }

      // Verifica se há um carrinho aberto no canal
      if (!carrinhos.has(interaction.channel.id)) {
        return interaction.reply({ content: `❌ Não há um carrinho aberto neste canal.`, ephemeral: true });
      }

      const yy = await carrinhos.get(interaction.channel.id);
      const hhhh = produtos.get(`${yy.infos.produto}.Campos`);
      const gggaaa = hhhh.find(campo22 => campo22.Nome === yy.infos.campo);

      let valor = 0;
      if (yy.cupomadicionado !== undefined) {
        const valor2 = gggaaa.valor * yy.quantidadeselecionada;
        const hhhh2 = produtos.get(`${yy.infos.produto}.Cupom`);
        const gggaaaawdwadwa = hhhh2.find(campo22 => campo22.Nome === yy.cupomadicionado);
        valor = valor2 * (1 - gggaaaawdwadwa.desconto / 100);
      } else {
        valor = gggaaa.valor * yy.quantidadeselecionada;
      }

      // Cria o embed para o usuário
      const mandanopvdocara = new EmbedBuilder()
        .setColor(`${configuracao.get(`Cores.Processamento`) || `#fcba03`}`)
        //.setAuthor({ name: `Pedido #Aprovado Manualmente` })
        .setAuthor({ name: 'Pedido solicitado', iconURL: 'https://media.discordapp.net/attachments/1273480562774118410/1273480992174247979/ed16.png?ex=66dfba98&is=66de6918&hm=e90af73cd93a7fa7d47d10fdb7b603ff9cdf5d92e00c5156d67a91f95156049f&=&format=webp&quality=lossless' })
        .setFooter(
          { text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) }
        )
        .setTimestamp()
        .setDescription(`Seu pedido foi criado e agora está aguardando a confirmação do pagamento`)
        .addFields(
          { name: `**Detalhes**`, value: `\`${yy.quantidadeselecionada}x ${yy.infos.produto} - ${yy.infos.campo} | R$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`` },
          { name: `**id do pedido**`, value: `\`Aprovado Manualmente\`` }
        );

      try {
        await interaction.user.send({ embeds: [mandanopvdocara] });
      } catch (error) {
        console.error("Não foi possível enviar a mensagem direta ao usuário:", error);
      }

      // Cria o embed para o canal de log
      const dsfjmsdfjnsdfj = new EmbedBuilder()
        .setColor(`${configuracao.get(`Cores.Processamento`) || `#fcba03`}`)
        //.setAuthor({ name: `Pedido #Aprovado Manualmente` })
        .setAuthor({ name: 'Pedido solicitado', iconURL: 'https://media.discordapp.net/attachments/1273480562774118410/1273480992174247979/ed16.png?ex=66dfba98&is=66de6918&hm=e90af73cd93a7fa7d47d10fdb7b603ff9cdf5d92e00c5156d67a91f95156049f&=&format=webp&quality=lossless' })
        .setDescription(`Usuário ${interaction.user} solicitou um pedido`)
        .addFields(
          { name: `**Detalhes**`, value: `\`${yy.quantidadeselecionada}x ${yy.infos.produto} - ${yy.infos.campo} | R$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`` },
          { name: `**Forma de pagamento**`, value: `\`Manualmente\`` }
        )
        .setFooter(
          { text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) }
        )
        .setTimestamp();

      try {
        const channela = await client.channels.fetch(configuracao.get(`ConfigChannels.logpedidos`));
        await channela.send({ embeds: [dsfjmsdfjnsdfj] }).then(yyyyy => {
          carrinhos.set(`${interaction.channel.id}.replys`, { channelid: yyyyy.channel.id, idmsg: yyyyy.id });
        });
      } catch (error) {
        console.error("Não foi possível enviar a mensagem ao canal de log:", error);
      }

      pagamentos.set(`${interaction.channel.id}`, { pagamentos: { id: `Aprovado Manualmente`, method: `pix`, data: Date.now() } });
      interaction.reply({ content: `<:eutambmtenho16:1279904781447462953>  Pagamento aprovado manualmente. Aguarde..`, ephemeral: true });

    } catch (error) {
      console.error("Erro ao processar o comando 'entregar':", error);
      interaction.reply({ content: `❌ Ocorreu um erro ao processar o comando.`, ephemeral: true });
    }
  }
};