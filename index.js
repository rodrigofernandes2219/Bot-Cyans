const { GatewayIntentBits, Client, Collection, ChannelType, EmbedBuilder, Partials } = require("discord.js")
const { AtivarIntents } = require("./Functions/StartIntents");
const express = require("express");
const app = express();
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages,
        Object.keys(GatewayIntentBits),
    ],
    partials: [ Object.keys(Partials) ]
});

const estatisticasStormInstance = require("./Functions/VariaveisEstatisticas");
const EstatisticasStorm = new estatisticasStormInstance();
module.exports = { EstatisticasStorm }

AtivarIntents()

const config = require("./config.json");
const events = require('./Handler/events')
const slash = require('./Handler/slash');

slash.run(client)
events.run(client)

client.slashCommands = new Collection();

client.on('guildCreate', guild => {


    if (client.guilds.cache.size > 2) {
        guild.leave()
    }

})

 process.on('unhandRejection', (reason, promise) => {
 });
 process.on('uncaughtException', (error, origin) => {
 });
 process.on('uncaughtExceptionMonitor', (error, origin) => {
 });

 const login = require("./routes/login");
 app.use("/", login);
 
 const callback = require("./routes/callback");
 app.use("/", callback);
 
 try {
   app.listen({
     host: "0.0.0.0",
     port: process.env.PORT ? Number(process.env.PORT) : 8080
   });
 } finally {
 }

 client.on("messageCreate", async (message) => {
  if (message.channel.id === '1249716704963989578') { // ID CANAIS
    message.react("<a:Green_check:1256130516760002591>") // EMOJI PARA REAGIR
  }
})

client.on("ready", async () => {
  const activities = [
    { name: `vendas automáticas`, type: 1, url: 'https://www.twitch.tv/discord'},
  ];
  
  let i = 0;
  setInterval(() => {
    if (i >= activities.length) i = 0;
    client.user.setActivity(activities[i]);
    i++;
  }, 5 * 1000 ); 
});

client.login(config.token);

client.on("interactionCreate", async (interaction) => {
  if (interaction.isButton()) {
    if (interaction.customId === "faq") {
      const messageContent = `<:eutambmtenho3:1260808987629064255> Sua verificação é essencial para reforçar a segurança do servidor e manter nossa comunidade protegida.\n<:eutambmtenho3:1260808987629064255> Além disso, em casos raros de queda do servidor, a verificação nos permite trazê-lo de volta rapidamente para que você não perca nenhum momento importante.\n<:eutambmtenho3:1260808987629064255> Isso também ajuda a evitar contas falsas.`;

      interaction.reply({
        content: messageContent,
        components: [
          {
            type: 1, // ActionRow
            components: [
              {
                type: 2, // Button
                style: 5, // Success style
                label: "Verificar-se",
                url: `https://restorecord.com/verify/Verificaçao2`
              }
            ]
          }
        ],
        ephemeral: true
      });
    }
  }
});
