const {
  JsonDatabase,
} = require("wio.db");

const produtos = new JsonDatabase({
  databasePath: "./DataBaseJson/produtos.json"
});

const automaticos = new JsonDatabase({
  databasePath: "./DataBaseJson/configautos.json"
});

const carrinhos = new JsonDatabase({
  databasePath: "./DataBaseJson/carrinhos.json"
});

const pagamentos = new JsonDatabase({
  databasePath: "./DataBaseJson/pagamentos.json"
});

const pedidos = new JsonDatabase({
  databasePath: "./DataBaseJson/pedidos.json"
});

const estatisticas = new JsonDatabase({
  databasePath: "./DataBaseJson/estatisticas.json"
});

const configuracao = new JsonDatabase({
  databasePath: "./DataBaseJson/configuracao.json"
});

const tickets = new JsonDatabase({
  databasePath: "./DataBaseJson/tickets.json"
});

const perms = new JsonDatabase({
  databasePath: "./DataBaseJson/perms.json"
});









module.exports = {
  produtos,
  carrinhos,
  pagamentos,
  pedidos,
  configuracao,
  estatisticas,
  tickets,
  perms
}