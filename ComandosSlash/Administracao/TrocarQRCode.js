const Discord = require("discord.js");
const axios = require('axios');
const path = require('path');
const fs = require('fs').promises;
const { obterEmoji } = require("../../Handler/EmojiFunctions");
const donoFilePath = path.resolve(__dirname, '..', '..', 'dono.json');

// Função para obter permissões do arquivo dono.json
async function getPermissions() {
    try {
        const data = await fs.readFile(donoFilePath, 'utf8');
        const json = JSON.parse(data);
        return [json.dono]; // Retorna o ID do dono como um array
    } catch (error) {
        console.error('Erro ao ler o arquivo dono.json:', error);
        return [];
    }
}

module.exports = {
    name: "trocarqrcode",
    description: "[🛠|💎 Vendas PREMIUM] Trocar QRCode",
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'novafoto',
            description: 'Qual foto ficará no seu QRCode?',
            type: Discord.ApplicationCommandOptionType.Attachment,
            required: true
        },
    ],

    run: async (client, interaction) => {
        await interaction.reply({ content: `<a:ed2:1269298061906284647> Aguarde...`, ephemeral: true });

        try {
            const perm = await getPermissions();
            if (!perm.includes(interaction.user.id)) {
                return interaction.editReply({ content: `❌ | Você não possui permissão para usar esse comando.`, ephemeral: true });
            }

            const arq = interaction.options.getAttachment('novafoto');
            const mimeTypesPermitidos = ['image/png'];

            if (!mimeTypesPermitidos.includes(arq.contentType)) {
                return interaction.editReply({ content: `❌ | O arquivo precisa ser .png`, ephemeral: true });
            }

            const nomeDoDiretorioLib = 'Lib';
            const nomeDoDiretorioHandler = 'Handler';
            const caminhoDoDiretorioLib = path.resolve(__dirname, '..', '..', nomeDoDiretorioLib);
            const caminhoDoDiretorioHandler = path.resolve(__dirname, '..', '..', nomeDoDiretorioHandler);

            const response = await axios.get(arq.attachment, { responseType: 'arraybuffer' });

            // Salvando na pasta Lib
            const caminhoNoComputadorLib = path.join(caminhoDoDiretorioLib, 'aaaaa.png');
            await fs.writeFile(caminhoNoComputadorLib, Buffer.from(response.data));

            // Salvando na pasta Handler
            const caminhoNoComputadorHandler = path.join(caminhoDoDiretorioHandler, 'aaaaa.png');
            await fs.writeFile(caminhoNoComputadorHandler, Buffer.from(response.data));

            const arquivo = new Discord.AttachmentBuilder(caminhoNoComputadorLib);

            await interaction.editReply({ content: `<:checklist:1279905108896911471> | QRCode trocado com sucesso!`, ephemeral: true });
            await interaction.followUp({ content: `Aqui está o novo QRCode:`, files: [arquivo], ephemeral: true });
        } catch (error) {
            console.error(error);
            interaction.editReply({ content: `❌ | Erro ao trocar o QRCode.`, ephemeral: true });
        }
    }
};
