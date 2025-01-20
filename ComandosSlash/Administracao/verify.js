const Discord = require("discord.js");
const config = require("../../config.json");

module.exports = {
    name: "verify",
    description: "Enviar Botão de Verificação",
    type: Discord.ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {
        if (!interaction.member.permissions.has("Administrator")) {
            interaction.reply({ content: `Você não possui permissão para utilizar este comando. 🔴`, ephemeral: true });
            setTimeout(() => { interaction.deleteReply(); }, 3000);
        } else {
            
            const botao = new Discord.ButtonBuilder()
                .setLabel("Verificar-se")
                .setURL("https://restorecord.com/verify/Verificaçao2")
                .setStyle("Link");
            const botao2 = new Discord.ButtonBuilder()
                .setCustomId('faq')
                .setLabel('Por que se verificar?')
                .setStyle("Secondary");
            let row = new Discord.ActionRowBuilder().addComponents(botao, botao2);
            
            // Adicione o URL da imagem desejada no conteúdo da mensagem
            await interaction.channel.send({ content: "# __Verificação Cyber Shop__\n - Sua verificação é crucial para garantir a segurança do servidor e manter nossa comunidade protegida.\n - Também é essencial concluir a verificação para realizar compras no servidor e não perder o acesso aos nossos serviços.", 
                                             components: [row],
                                             files: ["https://media.discordapp.net/attachments/1140283668292702268/1274789456993452032/cyberverificacao.png?ex=66c4d932&is=66c387b2&hm=8eb3731ca865482e757d13273ed5fd242ebfca9ca37e57689531f1edef16d2d4&=&format=webp&quality=lossless"] }); // Substitua "URL_DA_IMAGEM_AQUI" pelo URL real da imagem
            interaction.reply({ content: `<:checklist:1279905108896911471>`, ephemeral: true });
        }
    }
};