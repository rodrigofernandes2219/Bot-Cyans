
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder } = require("discord.js")
const { produtos, carrinhos, pagamentos, configuracao } = require("../DataBaseJson")
const { QuickDB } = require("quick.db");
const mercadopago = require("mercadopago");
const db = new QuickDB();


async function DentroCarrinhoPix(interaction, client) {
    interaction.deferUpdate()
    await interaction.message.edit({ content: `<a:ed2:1269298061906284647> Aguarde...`, ephemeral: true, components: [] }).then(async tt => {



        const yy = await carrinhos.get(interaction.channel.id)

        const hhhh = produtos.get(`${yy.infos.produto}.Campos`)
        const gggaaa = hhhh.find(campo22 => campo22.Nome === yy.infos.campo)


        let valor = 0

        if (yy.cupomadicionado !== undefined) {
            const valor2 = gggaaa.valor * yy.quantidadeselecionada

            const hhhh2 = produtos.get(`${yy.infos.produto}.Cupom`)
            const gggaaaawdwadwa = hhhh2.find(campo22 => campo22.Nome === yy.cupomadicionado)
            valor = valor2 * (1 - gggaaaawdwadwa.desconto / 100);
        } else {
            valor = gggaaa.valor * yy.quantidadeselecionada
        }


        const aaaa = Number(valor).toFixed(2)


        var agora = new Date();
        agora.setMinutes(agora.getMinutes() + 10);
        agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset() + 240);
        agora.setHours(agora.getHours() - 5)
        var novaDataFormatada = agora.toISOString().replace('Z', '-04:00');



        var payment_data = {
            transaction_amount: Number(aaaa),
            description: `${interaction.guild.name} | ${interaction.user.username} | ${yy.quantidadeselecionada}x  ${yy.infos.campo}`,
            date_of_expiration: `${novaDataFormatada}`,
            payment_method_id: 'pix',
            payer: {
                email: `${interaction.user.id}@gmail.com`,
                first_name: `Victor André`,
                last_name: `Ricardo Almeida`,
                identification: {
                    type: 'CPF',
                    number: '15084299872'
                },

                address: {
                    zip_code: '86063190',
                    street_name: 'Rua Jácomo Piccinin',
                    street_number: '971',
                    neighborhood: 'Pinheiros',
                    city: 'Londrina',
                    federal_unit: 'PR'
                }
            }
        }
        mercadopago.configurations.setAccessToken(configuracao.get('pagamentos.MpAPI'));
        await mercadopago.payment.create(payment_data)
            .then(async function (data) {



                const { qrGenerator } = require('../Lib/QRCodeLib')
                const qr = new qrGenerator({ imagePath: './Lib/aaaaa.png' })
                const qrcode = await qr.generate(data.body.point_of_interaction.transaction_data.qr_code)


                const buffer = Buffer.from(qrcode.response, "base64");
                const attachment = new AttachmentBuilder(buffer, { name: "payment.png" });

                const embed = new EmbedBuilder()
                    .setColor(`${configuracao.get(`Cores.Principal`) == null ? '2b2d31' : configuracao.get('Cores.Principal')}`)
                    .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })

                    .setTitle(`Pagamento via PIX criado`)
                    .addFields(
                        { name: `Código copia e cola`, value: `\`\`\`${data.body.point_of_interaction.transaction_data.qr_code}\`\`\`` }
                    )
                    .setFooter(
                        { text: `${interaction.guild.name} - Pagamento expira em 10 minutos.` }
                    )
                    .setTimestamp()
                    .setImage(`https://cdn.discordapp.com/attachments/1179498681481830542/1179499043777429615/qr_code.png?ex=657a0116&is=65678c16&hm=83a7242c9f6a72f9128da76b14ede8ee1df01f5ba0ed0799f8c753b92fa8ede0&`)



                const row3 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("codigocopiaecola")
                            .setLabel('Código copia e cola')
                            .setEmoji(`1192868868784394381`)
                            .setStyle(2),

                    )



                embed.setImage('attachment://payment.png')

                carrinhos.set(`${interaction.channel.id}.pagamentos`, { id: data.body.id, cp: data.body.point_of_interaction.transaction_data.qr_code, method: 'pix' })
                pagamentos.set(`${interaction.channel.id}.pagamentos`, { id: data.body.id, cp: data.body.point_of_interaction.transaction_data.qr_code, method: 'pix', data: Date.now() })

                await tt.edit({ embeds: [embed], files: [attachment], content: ``, components: [row3] })

                interaction.channel.setName(`💱・${yy.user.username}・${yy.user.id}`)


           const mandanopvdocara = new EmbedBuilder()
           .setColor(`${configuracao.get(`Cores.Processamento`) == null ? `#fcba03` : configuracao.get(`Cores.Processamento`)}`)
           .setAuthor({ name: `Pedido solicitado`, iconURL: `https://images-ext-1.discordapp.net/external/aHWfkQlfuHIGJ8RviUI1ZTPoUVcNkyNbeV17Cc3QdWU/%3Fsize%3D2048/https/cdn.discordapp.com/emojis/1249486397610659850.png?format=webp&quality=lossless` })
           .setFooter(
               { text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) }
           )
           .setTimestamp()
           .setDescription(`Seu pedido foi criado e agora está aguardando a confirmação do pagamento`)
           .addFields(
               { name: '**Detalhes**', value: `\`${yy.quantidadeselecionada}x ${yy.infos.produto} - ${yy.infos.campo} | R$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`` },
               { name: '**ID do Pedido**', value: `\`${data.body.id}\`` }
           )

                try {
                    await interaction.user.send({ embeds: [mandanopvdocara] })
                } catch (error) {

                }



                const dsfjmsdfjnsdfj = new EmbedBuilder()
                    .setColor(`${configuracao.get(`Cores.Processamento`) == null ? `#fcba03` : configuracao.get(`Cores.Processamento`)}`)
                    //.setAuthor({ name: `Pedido #${data.body.id}` })
                    .setTitle(`<:eutambmtenho14:1279904903518748844> Pedido solicitado`)
                    .setDescription(`Usuário ${interaction.user} solicitou um pedido`)
                    .addFields(
                        { name: `**Detalhes**`, value: `\`${yy.quantidadeselecionada}x ${yy.infos.produto} - ${yy.infos.campo} | R$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`` },
                        { name: '**ID do Pedido**', value: `\`${data.body.id}\`` },
                        { name: `**Forma de pagamento**`, value: '<:ed14:1277857216824741928> `Pix - Mercado Pago`'}
                    )
                    .setFooter(
                        { text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) }
                    )
                    .setTimestamp()





                try {
                    const channela = await client.channels.fetch(configuracao.get(`ConfigChannels.logpedidos`));
                    await channela.send({ embeds: [dsfjmsdfjnsdfj] }).then(yyyyy => {
                        carrinhos.set(`${interaction.channel.id}.replys`, { channelid: yyyyy.channel.id, idmsg: yyyyy.id })
                    })
                } catch (error) {

                }




            })
            .catch(function (error) {
                const row3 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("pagarpix")
                            .setLabel('Pix')
                            .setEmoji('<:pix:1189533337426083931>')
                            .setStyle(3),

                        new ButtonBuilder()
                            .setCustomId("pagarcrypto")
                            .setLabel('Crypto')
                            .setStyle(1)
                            .setEmoji('1193427302311264318')
                            .setDisabled(true),

                        new ButtonBuilder()
                            .setCustomId("voltarcarrinho")
                            .setLabel('Voltar')
                            .setEmoji('1178068047202893869')
                            .setStyle(2)
                    )

                tt.edit({ content: `Selecione uma forma de pagamento.`, ephemeral: true, components: [row3] })
                interaction.followUp({ content: `❌ | Ocorreu um erro ao criar o pagamento, tente novamente.\nError: ${error}`, ephemeral: true })
            })

    })
}

function DentroCarrinho2(interaction) {

    const yd = carrinhos.get(interaction.channel.id)

    const hhhh = produtos.get(`${yd.infos.produto}.Campos`)
    const gggaaa = hhhh.find(campo22 => campo22.Nome === yd.infos.campo)


    if (yd.quantidadeselecionada > gggaaa.condicao?.valormaximo) return interaction.reply({ content: `❌ | Você não pode comprar mais de \`${gggaaa.condicao.valormaximo}x ${yd.infos.produto} - ${yd.infos.campo}\``, ephemeral: true })
    if (yd.quantidadeselecionada < gggaaa.condicao?.valorminimo) return interaction.reply({ content: `❌ | Você não pode comprar mais de \`${gggaaa.condicao.valorminimo}x ${yd.infos.produto} - ${yd.infos.campo}\``, ephemeral: true })
    interaction.deferUpdate()

    // content: `Selecione uma forma de pagamento.`


    const row3 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("pagarpix")
                .setLabel('Pix')
                .setEmoji('<:pix:1189533337426083931>')
                .setStyle(3),

            new ButtonBuilder()
                .setCustomId("pagarcrypto")
                .setLabel('Crypto')
                .setEmoji('1193427302311264318')
                .setStyle(1)
                .setDisabled(true),

            new ButtonBuilder()
                .setCustomId("voltarcarrinho")
                .setLabel('Voltar')
                .setEmoji('1178068047202893869')
                .setStyle(2)
        )

    interaction.message.edit({ content: `Selecione uma forma de pagamento.`, components: [row3], embeds: [] })
}

async function DentroCarrinho1(thread, status) {

    let ggg
    if (status == 1) {
        ggg = carrinhos.get(thread.channel.id)
    } else {
        ggg = carrinhos.get(thread.id)
    }



    const hhhh = produtos.get(`${ggg.infos.produto}.Campos`)
    const gggaaa = hhhh.find(campo22 => campo22.Nome === ggg.infos.campo)
    let yy = await carrinhos.get(`${ggg.threadid}.quantidadeselecionada`)
    if (yy == null) {
        await carrinhos.set(`${ggg.threadid}.quantidadeselecionada`, 1)
        yy = 1
    }


    const embed = new EmbedBuilder()
        .setColor(`${configuracao.get(`Cores.Principal`) == null ? '0cd4cc' : configuracao.get('Cores.Principal')}`)
        .setAuthor({ name: ggg.user.username, iconURL: ggg.user.displayAvatarURL })
        .setTitle(`Revisão do Pedido`)

        .setFooter(
            { text: ggg.guild.name, iconURL: ggg.guild.iconURL }
        )
        .setTimestamp()


    const hhhhsdsadasd2 = produtos.get(`${ggg.infos.produto}.Config`)

    if (hhhhsdsadasd2.banner !== undefined || hhhhsdsadasd2.banner !== '') {
        try {
            await embed.setImage(`${hhhhsdsadasd2.banner}`)
        } catch (error) {

        }

    }
    if (hhhhsdsadasd2.icon !== undefined || hhhhsdsadasd2.icon !== '') {
        try {
            await embed.setThumbnail(`${hhhhsdsadasd2.icon}`)
        } catch (error) {

        }

    }



    if (ggg.cupomadicionado !== undefined) {


        const ggg2 = carrinhos.get(thread.channel.id)
        const hhhh2 = produtos.get(`${ggg.infos.produto}.Cupom`)
        const gggaaaawdwadwa = hhhh2.find(campo22 => campo22.Nome === ggg2.cupomadicionado)

        const yyfyfy = gggaaa.valor * yy

        const valorComDesconto = yyfyfy * (1 - gggaaaawdwadwa.desconto / 100);

        const valorOriginalFormatado = Number(yyfyfy).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const valorComDescontoFormatado = Number(valorComDesconto).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });


        embed.addFields(
            {name: `**Valor à vista**`, value: `De ~~\`R$ ${valorOriginalFormatado}\`~~  por \`${valorComDescontoFormatado}\``, inline: true},
            { name: `**Em estoque**`, value: `\`${gggaaa.estoque.length}\``, inline: true },
            { name: `**Cupom**`, value: `\`${ggg2.cupomadicionado}\``, inline: true },
            { name: `**Carrinho**`, value: `\`${yy}x ${ggg.infos.produto} - ${ggg.infos.campo}\``, inline: true },
        )

    } else {

        embed.addFields(
            { name: `**Valor à vista**`, value: `\`R$ ${Number(gggaaa.valor * yy).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\``, inline: true },
            { name: `**Em estoque**`, value: `\`${gggaaa.estoque.length}\``, inline: true },
            { name: `**Carrinho**`, value: `\`${yy}x ${ggg.infos.produto} - ${ggg.infos.campo}\``, inline: false },
        )

    }

    const adminRoleId = configuracao.get('ConfigRoles.cargoadm');

    // Definindo a primeira linha de botões com estilos numéricos originais
    const row1 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("irparapagamento")
                .setLabel('Ir para pagamento')
                .setEmoji('1178076954029731930')
                .setStyle(3),  // Estilo 3 mantém a cor original
    
            new ButtonBuilder()
                .setCustomId("editarquantidade")
                .setLabel('Editar quantidade')
                .setEmoji('1178079212700188692')
                .setStyle(1)   // Estilo 1 mantém a cor original
        );
    
    // Definindo a segunda linha de botões com estilos numéricos originais
    const row2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("usarcupom")
                .setLabel('Usar cupom')
                .setEmoji('1230849204528746607')
                .setStyle(2),  // Estilo 2 mantém a cor original
    
            new ButtonBuilder()
                .setCustomId("deletchannel")
                .setLabel('Cancelar')
                .setEmoji('1178076767567757312')
                .setStyle(4)   // Estilo 4 mantém a cor original
        );
    
    // Atualizando ou enviando a mensagem com as duas linhas de botões
    if (status == 1) {
        thread.deferUpdate();
        thread.message.edit({
            content: `<@${ggg.user.id}> <@&${adminRoleId}>`,
            embeds: [embed],
            components: [row1, row2] // Adiciona ambas as linhas de botões
        });
    } else {
        thread.send({
            content: `<@${ggg.user.id}> <@&${adminRoleId}>`,
            embeds: [embed],
            components: [row1, row2] // Adiciona ambas as linhas de botões
        });
    }}

module.exports = {
    DentroCarrinho1,
    DentroCarrinho2,
    DentroCarrinhoPix
}