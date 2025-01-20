const { EmbedBuilder } = require("discord.js");
const { carrinhos, pagamentos, configuracao } = require("../DataBaseJson");

function CloseThreds(client) {
    client.guilds.cache.forEach((guild) => {
        const hilos = guild.channels.cache.filter((channel) => {
            return channel.isThread() && channel.name.includes('🛒');
        });

        hilos.forEach(async element => {
            const dataOriginal = new Date(element._createdTimestamp);
            const novoTimestamp = dataOriginal.getTime() + 10 * 60 * 1000;

            if (Date.now() > novoTimestamp) {
                // Verifica o pagamento antes de excluir o carrinho
                const pagamento = pagamentos.get(element.id);

                if (!pagamento || (pagamento.data.pagamentos.method === 'pix' && pagamento.data.pagamentos.id === 'Aprovado Manualmente')) {
                    try {
                        await element.delete();
                        //console.log(`Thread ${element.id} deletada com sucesso.`); // Log de sucesso

                        const texto = element.name;
                        const partes = texto.split("・");
                        const ultimoNumero = partes[partes.length - 1];
                        pagamentos.delete(element.id);
                        carrinhos.delete(element.id);

                        try {
                            const member = await client.users.fetch(ultimoNumero);

                            const embed = new EmbedBuilder()
                                .setColor(configuracao.get(`Cores.Erro`) || `#ff0000`)
                                .setAuthor({ name: `Carrinho expirado.`, iconURL: `https://media.discordapp.net/attachments/1273480562774118410/1273480992509657139/ed17.png?ex=66d485d8&is=66d33458&hm=b82da0e7728ca691f07116341428c58ce7278161a41adfdeb87ab2391f01afae&=&format=webp&quality=lossless` })
                                .setDescription(`Seu carrinho foi fechado por inatividade.`);

                            await member.send({ embeds: [embed] });
                        } catch (error) {
                            console.error(`Erro ao enviar mensagem para o usuário ${ultimoNumero}:`, error);
                        }

                        try {
                            const channela = await client.channels.fetch(configuracao.get('ConfigChannels.logpedidos'));

                            const embed = new EmbedBuilder()
                                .setColor(configuracao.get(`Cores.Erro`) || `#ff0000`)
                                .setAuthor({ name: `Carrinho expirado.`, iconURL: `https://media.discordapp.net/attachments/1273480562774118410/1273480992509657139/ed17.png?ex=66d485d8&is=66d33458&hm=b82da0e7728ca691f07116341428c58ce7278161a41adfdeb87ab2391f01afae&=&format=webp&quality=lossless` })
                                .setDescription(`O carrinho de <@!${ultimoNumero}> foi fechado por inatividade (\`10 Minutos\`).`);

                            await channela.send({ embeds: [embed] });
                        } catch (error) {
                            console.error(`Erro ao enviar mensagem para o canal de logs:`, error);
                        }

                    } catch (error) {
                        console.error(`Erro ao deletar o thread ${element.id}:`, error);
                    }
                }
            }
        });
    });
}

module.exports = {
    CloseThreds
}