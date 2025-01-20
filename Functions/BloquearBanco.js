const { configuracao } = require("../DataBaseJson");
const axios = require('axios');

async function BloquearBanco(client, bank, id, yy, msg) {
    const nomeAmigavel = {
        // Fintechs e Instituições de Pagamento
        'Nu Pagamentos S.A.': 'nu',
    'Mercadopago.com Representações Ltda.': 'mp',
    'Neon Pagamentos S.A.': 'neon',
    'PagSeguro Internet S.A.': 'pagseguro',
    'Picpay Serviços S.A.': 'picpay_servicos',
    'Banco Inter S.A.': 'inter',
    'Next': 'next',
    'C6 Bank S.A.': 'c6', // C6 Bank S.A.
    'Banco C6 S.A.': 'c6_s.a.', // Banco C6 S.A.
    'PagBank': 'pagbank',
    'Banco Digio': 'digio',
    'Banco Original S.A.': 'original',
    'Banco Modalmais': 'modalmais',
    'Banco BS2': 'bs2',
    'Banco Pottencial': 'pottencial',
    'Banco Neon': 'neon',
    'Banco Digital': 'digital',
    'Banco Intermedium S.A.': 'intermedium',

    // Bancos Tradicionais
    'Banco do Brasil S.A.': 'bdb',
    'Caixa Econômica Federal': 'caixa',
    'Banco Itaú Unibanco S.A.': 'itau',
    'Banco Bradesco S.A.': 'bradesco',
    'Banco Santander (Brasil) S.A.': 'santander',
    'Banco Votorantim S.A.': 'votorantim',
    'Banco Safra S.A.': 'safra',
    'Banco de Brasília S.A. (BRB)': 'brb',
    'Banco da Amazônia S.A.': 'amazonia',
    'Banco do Nordeste do Brasil S.A.': 'nordeste',
    'Banco Cooperativo do Brasil S.A. (Bancoob)': 'bancoob',
    'Banco de Crédito do Brasil S.A.': 'credic',
    'Banco Crefisa S.A.': 'crefisa',
    'Banco Bonsucesso': 'bonsucesso',
    'Banco BMG': 'bmg',
    'Banco Daycoval S.A.': 'daycoval',
    'Banco Fibra': 'fibra',
    'Banco Rendimento': 'rendimento',
    'Banco GMAC': 'gmac',
    'Banco Mercantil do Brasil': 'mercantil',
    'Banco Paulista S.A.': 'paulista',
    'Banco Pine S.A.': 'pine',
    'Banco de Investimento': 'investimento',
    'Banco Sistema': 'sistema',
    'Banco Central do Brasil': 'central',
    'Banco Alfa': 'alfa',
    'Banco Múltiplo': 'multiplo',
    'Banco de Crédito Real': 'credito_real',
    'Banco Itaú BBA': 'itau_bba',
    'Banco Santander Brasil': 'santander_brasil',
    'Banco do Estado de São Paulo': 'banco_sp',
    'Banco Nossa Caixa': 'nossa_caixa',

    // Cooperativas de Crédito
    'Sicoob': 'sicoob',
    'Sicredi': 'sicredi',

    // Outros
    'Banco da China': 'chinabank',
    'Banco Banrisul': 'banrisul',
    'Banco Banorte': 'banorte',
    'Banco J. Safra': 'j_safra',
    'Banco J.P. Morgan': 'jpmorgan',
    'Banco HSBC': 'hsbc',
    'Banco Modal': 'modal',
    'Banco Neon Pagamentos': 'neon_pagamentos',
    'Banco Bradesco Cartões': 'bradesco_cartoes',
    'Banco Alfa S.A.': 'alfa_s.a.',
    'Banco de Desenvolvimento de Minas Gerais (BDMG)': 'bdmg',
    
    // Novos Participantes e Outros
    'Banco Agibank': 'agibank',
    'Banco de Brasília': 'brb',
    'Banco de Crédito do Sul': 'creditosul',
    'Banco Pan': 'pan',
    'Banco RCI Brasil': 'rci',
    'Banco do Estado do Rio Grande do Sul (Banrisul)': 'banrisul',
    'Banco Cruzeiro do Sul': 'cruzeiro',
    'Banco Topázio': 'topazio',
    'Banco Maxinvest': 'maxinvest',
    'Banco Pine': 'pine',
    'Banco Mercantil do Brasil': 'mercantil',
    'Banco Modalmais': 'modalmais'
};

    function obterNomeSimplificado(entidade) {
        return nomeAmigavel[entidade] || entidade;
    }

    const ggggggg = configuracao.get('pagamentos.BancosBloqueados')
    const arrayLowerCase = ggggggg.map(item => item.toLowerCase());
    const nomeSimplificadoPayer = obterNomeSimplificado(bank)

    if (arrayLowerCase.includes(nomeSimplificadoPayer) == true) {

        await axios.post(`https://api.mercadopago.com/v1/payments/${id}/refunds`, {}, {
            headers: {
                'Authorization': `Bearer ${configuracao.get('pagamentos.MpAPI')}`
            }
        });

        return { status: 400, message: `Banco Bloqueado` }

    }
}

module.exports = { BloquearBanco }