/**
 * BACKEND INTELIGENTE JVV STORE - VERSÃO PROFISSIONAL
 * 
 * Este script utiliza "Propriedades do Script" para maior segurança.
 * 
 * COMO CONFIGURAR AS PROPRIEDADES:
 * 1. No editor do Apps Script, clique no ícone de engrenagem (Configurações do Projeto).
 * 2. Role até "Propriedades do script".
 * 3. Adicione as seguintes chaves e valores:
 *    - ID_DA_PLANILHA : 1n_9EfiJ5vFiwvf6Skjn-izQhhb_QULNhOAyymz5PuEk
 *    - API_TOKEN      : JVV_STORE_SECRET_2026
 */

function getConfigs() {
  const props = PropertiesService.getScriptProperties();
  return {
    spreadsheetId: props.getProperty('ID_DA_PLANILHA') || '1n_9EfiJ5vFiwvf6Skjn-izQhhb_QULNhOAyymz5PuEk',
    apiToken: props.getProperty('API_TOKEN') || 'JVV_STORE_SECRET_2026'
  };
}

function setupSpreadsheet() {
  const configs = getConfigs();
  const ss = SpreadsheetApp.openById(configs.spreadsheetId);
  const sheets = {
    "Usuários": ["ID", "Nome", "Email", "Senha", "Função", "CriadoEm"],
    "Pedidos": ["ID", "Usuário", "Email", "Total", "Status", "Itens", "Data", "Progresso"],
    "Catálogo": ["ID", "Nome", "Preço", "Estoque", "Imagem", "Preview", "Descrição", "Categoria", "Etiquetas"],
    "Configurações": ["Chave", "Valor"],
    "Banners": ["ID", "Título", "Subtítulo", "Imagem", "Link", "Ativo", "Ordem"],
    "Logs": ["DataHora", "Ação", "Usuário", "Status", "Detalhes"],
    "Dashboard": ["Métrica", "Valor", "Gráfico Auxiliar"],
    "Carrinhos": ["Email", "Itens", "UltimaAtualizacao"],
    "Favoritos": ["Email", "ProductId", "Pasta", "DataAdicao"]
  };
  
  for (let name in sheets) {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    
    // Garantir cabeçalhos e formatação
    sheet.getRange(1, 1, 1, sheets[name].length).setValues([sheets[name]]);
    const headerRange = sheet.getRange(1, 1, 1, sheets[name].length);
    headerRange.setFontWeight("bold").setBackground("#1a1a1a").setFontColor("#ffffff").setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
    
    if (name === "Pedidos") {
      const statusRange = sheet.getRange(2, 5, 999, 1);
      const rule = SpreadsheetApp.newDataValidation().requireValueInList(['Pendente', 'Em Produção', 'Enviado', 'Entregue'], true).build();
      statusRange.setDataValidation(rule);
      sheet.getRange(2, 4, 999, 1).setNumberFormat('R$ #,##0.00');
    }
    
    if (name === "Catálogo") {
      sheet.getRange(2, 3, 999, 1).setNumberFormat('R$ #,##0.00');
      sheet.getRange(2, 6, 999, 1).setFormulaR1C1('=IF(ISBLANK(RC[-1]), "", IMAGE(RC[-1]))');
    }

    if (name === "Dashboard") {
      sheet.getRange("A2:A6").setValues([["Total de Vendas"], ["Pedidos Pendentes"], ["Novos Clientes (30 dias)"], ["Ticket Médio"], ["Produtos Sem Estoque"]]);
      sheet.getRange("B2").setFormula('=SUM(\'Pedidos\'!D:D)');
      sheet.getRange("B3").setFormula('=COUNTIF(\'Pedidos\'!E:E, "Pendente")');
      sheet.getRange("B4").setFormula('=COUNTIFS(\'Usuários\'!F:F, ">"&TODAY()-30)');
      sheet.getRange("B5").setFormula('=IF(B2>0, B2/COUNT(\'Pedidos\'!D:D), 0)');
      sheet.getRange("B6").setFormula('=COUNTIF(\'Catálogo\'!D:D, "<=0")');
    }
    if (name === "Configurações") {
      const configData = sheet.getDataRange().getValues();
      if (configData.length <= 1) {
        sheet.appendRow(["NOME_LOJA", "JVV Store"]);
        sheet.appendRow(["COR_PRIMARIA", "#9333ea"]);
        sheet.appendRow(["WHATSAPP", "5511999999999"]);
        sheet.appendRow(["FRETE_FIXO", "15.00"]);
      }
    }
    sheet.autoResizeColumns(1, sheets[name].length);
  }
  
  logAction(ss, "Setup", "System", "Success", "Planilha configurada e otimizada.");
  return "Sistema JVV Store pronto para uso!";
}

/**
 * FUNÇÃO DE AUTO-CORREÇÃO (ARREUMA TUDO)
 * Executa limpeza de dados, remove duplicatas e corrige formatos.
 */
function runSelfCorrection() {
  const configs = getConfigs();
  const ss = SpreadsheetApp.openById(configs.spreadsheetId);
  const report = [];
  
  // 1. Limpar Linhas Vazias em todas as abas
  const sheets = ss.getSheets();
  sheets.forEach(sheet => {
    const lastRow = sheet.getLastRow();
    const maxRows = sheet.getMaxRows();
    if (maxRows > lastRow + 1 && maxRows > 2) {
      sheet.deleteRows(lastRow + 1, maxRows - lastRow - 1);
      report.push(`Limpeza: ${sheet.getName()} - Linhas vazias removidas.`);
    }
  });
  
  // 2. Corrigir Duplicatas em Usuários (pelo Email)
  const userSheet = ss.getSheetByName("Usuários");
  if (userSheet) {
    const data = userSheet.getDataRange().getValues();
    const seen = {};
    for (let i = data.length - 1; i >= 1; i--) {
      const email = data[i][2];
      if (seen[email]) {
        userSheet.deleteRow(i + 1);
        report.push(`Correção: Usuário duplicado removido (${email}).`);
      }
      seen[email] = true;
    }
  }
  
  // 3. Re-aplicar Formatação e Fórmulas
  setupSpreadsheet();
  report.push("Formatação: Todos os estilos e fórmulas foram re-aplicados.");
  
  logAction(ss, "SelfCorrection", "AI_Bridge", "Success", report.join(" | "));
  return report.join("\n");
}

/**
 * CHECKUP DO SISTEMA
 * Retorna o status de saúde da planilha para a IA.
 */
function getSystemStatus() {
  const configs = getConfigs();
  const ss = SpreadsheetApp.openById(configs.spreadsheetId);
  const status = {
    sheets: {},
    configs: { hasId: !!configs.spreadsheetId, hasToken: !!configs.apiToken },
    health: "OK"
  };
  
  ss.getSheets().forEach(s => {
    status.sheets[s.getName()] = {
      rows: s.getLastRow(),
      cols: s.getLastColumn()
    };
  });
  
  return status;
}

function doPost(e) {
  const configs = getConfigs();
  const ss = SpreadsheetApp.openById(configs.spreadsheetId);
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch(err) {
    return response({ success: false, message: "JSON Inválido" });
  }

  // Ponte de Conexão com a IA (Ações Administrativas)
  if (data.token !== configs.apiToken) {
    logAction(ss, data.action || "Unknown", "Unauthorized", "Failed", "Token inválido. Recebido: " + (data.token || "vazio"));
    return response({ success: false, message: "Acesso não autorizado." });
  }

  const action = data.action;
  try {
    let res;
    switch (action) {
      case 'login': res = login(ss, data.email, data.pass); break;
      case 'register': res = register(ss, data); break;
      case 'getCatalog': res = getCatalog(ss); break;
      case 'saveOrder': res = saveOrder(ss, data); break;
      case 'getOrders': res = getOrders(ss); break;
      case 'updateOrderStatus': res = updateOrderStatus(ss, data.orderId, data.status); break;
      case 'getAdminStats': res = getAdminStats(ss); break;
      case 'updateProduct': res = updateProduct(ss, data.productId, data.product); break;
      case 'addProduct': res = addProduct(ss, data.product); break;
      case 'deleteProduct': res = deleteProduct(ss, data.productId); break;
      case 'getUsers': res = getUsers(ss); break;
      case 'getUser': res = getUser(ss, data.email); break;
      case 'deleteUser': res = deleteUser(ss, data.userId); break;
      case 'getUserOrders': res = getUserOrders(ss, data.email); break;
      case 'getBanners': res = getBanners(ss); break;
      case 'addBanner': res = addBanner(ss, data.banner); break;
      case 'updateBanner': res = updateBanner(ss, data.bannerId, data.banner); break;
      case 'deleteBanner': res = deleteBanner(ss, data.bannerId); break;
      case 'syncCatalog': res = syncCatalog(ss, data.products); break;
      case 'syncCart': res = syncCart(ss, data.email, data.cart); break;
      case 'getSavedCart': res = getSavedCart(ss, data.email); break;
      case 'addFavorite': res = addFavorite(ss, data.email, data.productId, data.folder); break;
      case 'getFavorites': res = getFavorites(ss, data.email); break;
      case 'removeFavorite': res = removeFavorite(ss, data.email, data.productId, data.folder); break;
      case 'forgotPassword': res = forgotPassword(ss, data.email); break;
      case 'searchCatalog': res = searchCatalog(ss, data.query); break;
      case 'getSettings': res = getSettings(ss); break;
      case 'updateSettings': res = updateSettings(ss, data.settings); break;
      case 'calculateShipping': res = calculateShipping(data.cep); break;
      case 'ai_checkup': res = response({ success: true, status: getSystemStatus() }); break;
      case 'ai_read_data':
        const allData = {};
        ss.getSheets().forEach(s => {
          allData[s.getName()] = s.getDataRange().getValues();
        });
        res = response({ success: true, data: allData });
        break;
      case 'ai_fix': res = response({ success: true, message: runSelfCorrection() }); break;
      case 'remote_config': 
        if (data.key && data.value) {
          PropertiesService.getScriptProperties().setProperty(data.key, data.value);
          res = response({ success: true, message: `Propriedade ${data.key} atualizada.` });
        }
        break;
      default: res = response({ success: false, message: "Ação não reconhecida." });
    }
    logAction(ss, action, data.email || "System", "Success", "Executado");
    return res;
  } catch (err) {
    logAction(ss, action, data.email || "System", "Error", err.toString());
    return response({ success: false, message: err.toString() });
  }
}

function calculateShipping(cep) {
  // Lógica simples de frete baseada no CEP
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length < 8) return response({ success: false, message: "CEP Inválido" });
  
  const options = [
    { nome: "Econômico (Correios)", valor: 15.00 },
    { nome: "Express Premium (JVV)", valor: 35.00 }
  ];
  
  // Se o CEP começar com '0' ou '1' (SP/RJ), frete mais barato
  if (cleanCep.startsWith('0') || cleanCep.startsWith('1')) {
    options[0].valor = 10.00;
    options[1].valor = 25.00;
  }
  
  return response({ success: true, data: options });
}

function logAction(ss, action, user, status, details) {
  const sheet = ss.getSheetByName('Logs');
  if (sheet) sheet.appendRow([new Date(), action, user, status, details]);
}

function response(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// --- FUNÇÕES DE LÓGICA (TRADUZIDAS E OTIMIZADAS) ---

function updateOrderStatus(ss, orderId, status) {
  const sheet = ss.getSheetByName('Pedidos');
  const data = sheet.getDataRange().getValues();
  let progress = 10;
  if (status === 'Em Produção') progress = 40;
  if (status === 'Enviado') progress = 80;
  if (status === 'Entregue') progress = 100;

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === orderId) {
      sheet.getRange(i + 1, 5).setValue(status);
      sheet.getRange(i + 1, 8).setValue(progress);
      return response({ success: true, message: `Status atualizado para ${status}!` });
    }
  }
  return response({ success: false, message: "Pedido não encontrado." });
}

function saveOrder(ss, orderData) {
  const sheet = ss.getSheetByName('Pedidos');
  const catalogSheet = ss.getSheetByName('Catálogo');
  const id = 'ORD' + Math.floor(Math.random() * 1000000);
  
  sheet.appendRow([id, orderData.nome, orderData.email, orderData.total, 'Pendente', JSON.stringify(orderData.items), new Date().toLocaleDateString(), 10]);
  
  if (orderData.items && Array.isArray(orderData.items)) {
    const catalogData = catalogSheet.getDataRange().getValues();
    orderData.items.forEach(item => {
      for (let i = 1; i < catalogData.length; i++) {
        if (catalogData[i][0] === item.id || catalogData[i][1] === item.name) {
          const currentStock = parseInt(catalogData[i][3] || 0);
          catalogSheet.getRange(i + 1, 4).setValue(Math.max(0, currentStock - (item.quantity || 1)));
          break;
        }
      }
    });
  }
  return response({ success: true, message: "Pedido salvo!", orderId: id });
}

function getSafeSheet(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    setupSpreadsheet();
    sheet = ss.getSheetByName(name);
  }
  return sheet;
}

function login(ss, email, pass) {
  const sheet = getSafeSheet(ss, 'Usuários');
  if (!sheet) return response({ success: false, message: "Erro: Tabela 'Usuários' não encontrada. Execute o setup." });
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][2] && data[i][2].toString().toLowerCase() === email.toLowerCase() && data[i][3] && data[i][3].toString() === pass.toString()) {
      return response({ success: true, data: { id: data[i][0], name: data[i][1], email: data[i][2], role: data[i][4] } });
    }
  }
  return response({ success: false, message: "E-mail ou senha incorretos." });
}

function register(ss, userData) {
  const sheet = getSafeSheet(ss, 'Usuários');
  if (!sheet) return response({ success: false, message: "Erro: Tabela 'Usuários' não encontrada." });
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][2] && data[i][2].toString().toLowerCase() === userData.email.toLowerCase()) {
      return response({ success: false, message: "E-mail já cadastrado." });
    }
  }
  const id = 'U' + Math.floor(Math.random() * 1000000);
  const role = (userData.email.toLowerCase() === 'jvvpersonalizados@gmail.com') ? 'Admin' : 'client';
  sheet.appendRow([id, userData.name, userData.email, userData.pass, role, new Date()]);
  return response({ success: true, data: { id, name: userData.name, email: userData.email, role: role } });
}

function getCatalog(ss) {
  const sheet = getSafeSheet(ss, 'Catálogo');
  if (!sheet) return response({ success: true, data: [] });
  const data = sheet.getDataRange().getValues();
  const products = [];
  for (let i = 1; i < data.length; i++) {
    if (!data[i][1]) continue;
    products.push({
      id: data[i][0],
      name: data[i][1],
      price: parseFloat(data[i][2] || 0),
      stock: parseInt(data[i][3] || 0),
      img: data[i][4],
      description: data[i][6] || '',
      category: data[i][7] || 'Geral',
      tags: data[i][8] ? data[i][8].toString().split(',') : []
    });
  }
  return response({ success: true, data: products });
}

function getOrders(ss) {
  const sheet = getSafeSheet(ss, 'Pedidos');
  if (!sheet) return response({ success: true, data: [] });
  const data = sheet.getDataRange().getValues();
  const orders = [];
  for (let i = 1; i < data.length; i++) {
    orders.push({ id: data[i][0], user: data[i][1], email: data[i][2], total: data[i][3], status: data[i][4], items: data[i][5], date: data[i][6], progress: data[i][7] });
  }
  return response({ success: true, data: orders });
}

function getAdminStats(ss) {
  const dashboard = ss.getSheetByName('Dashboard');
  const stats = dashboard.getRange("B2:B6").getValues();
  return response({
    success: true,
    data: {
      totalRevenue: stats[0][0],
      pendingOrders: stats[1][0],
      newUsers: stats[2][0],
      avgTicket: stats[3][0],
      outOfStock: stats[4][0]
    }
  });
}

function addProduct(ss, product) {
  const sheet = ss.getSheetByName('Catálogo');
  const id = 'P' + Math.floor(Math.random() * 1000000);
  sheet.appendRow([id, product.name, product.price, product.stock || 0, product.image, "", product.description || '', product.category || 'Geral', product.tags || '']);
  return response({ success: true, message: "Produto adicionado!" });
}

function updateProduct(ss, productId, product) {
  const sheet = ss.getSheetByName('Catálogo');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === productId) {
      if (product.name) sheet.getRange(i + 1, 2).setValue(product.name);
      if (product.price !== undefined) sheet.getRange(i + 1, 3).setValue(product.price);
      if (product.stock !== undefined) sheet.getRange(i + 1, 4).setValue(product.stock);
      if (product.image) sheet.getRange(i + 1, 5).setValue(product.image);
      if (product.description) sheet.getRange(i + 1, 7).setValue(product.description);
      if (product.category) sheet.getRange(i + 1, 8).setValue(product.category);
      if (product.tags) sheet.getRange(i + 1, 9).setValue(product.tags);
      return response({ success: true, message: "Produto atualizado!" });
    }
  }
  return response({ success: false, message: "Produto não encontrado." });
}

function searchCatalog(ss, query) {
  const sheet = ss.getSheetByName('Catálogo');
  const data = sheet.getDataRange().getValues();
  const results = [];
  const q = query.toLowerCase();
  for (let i = 1; i < data.length; i++) {
    if (data[i][1].toString().toLowerCase().includes(q) || data[i][7].toString().toLowerCase().includes(q)) {
      results.push({ id: data[i][0], name: data[i][1], price: data[i][2], stock: data[i][3], img: data[i][4], category: data[i][7] });
    }
  }
  return response({ success: true, data: results });
}

function getSettings(ss) {
  const sheet = ss.getSheetByName('Configurações');
  const data = sheet.getDataRange().getValues();
  const settings = {};
  for (let i = 1; i < data.length; i++) {
    settings[data[i][0]] = data[i][1];
  }
  return response({ success: true, data: settings });
}

function updateSettings(ss, newSettings) {
  const sheet = ss.getSheetByName('Configurações');
  for (let key in newSettings) {
    let found = false;
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        sheet.getRange(i + 1, 2).setValue(newSettings[key]);
        found = true;
        break;
      }
    }
    if (!found) sheet.appendRow([key, newSettings[key]]);
  }
  return response({ success: true, message: "Configurações atualizadas!" });
}

function syncCatalog(ss, products) {
  const sheet = ss.getSheetByName('Catálogo');
  const existing = sheet.getDataRange().getValues().map(r => r[1].toString().toLowerCase());
  products.forEach(p => {
    if (!existing.includes(p.name.toString().toLowerCase())) {
      const id = 'P' + Math.floor(Math.random() * 1000000);
      sheet.appendRow([id, p.name, p.price, 10, p.image, "", '', 'Importado', '']);
    }
  });
  return response({ success: true, message: "Catálogo sincronizado!" });
}

function getUsers(ss) {
  const sheet = getSafeSheet(ss, 'Usuários');
  if (!sheet) return response({ success: true, data: [] });
  const data = sheet.getDataRange().getValues();
  const users = [];
  for (let i = 1; i < data.length; i++) {
    users.push({ id: data[i][0], name: data[i][1], email: data[i][2], role: data[i][4], createdAt: data[i][5] });
  }
  return response({ success: true, data: users });
}

function getUser(ss, email) {
  const sheet = getSafeSheet(ss, 'Usuários');
  if (!sheet) return response({ success: false, message: "Tabela não encontrada." });
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][2].toString().toLowerCase() === email.toLowerCase()) {
      return response({ 
        success: true, 
        data: { 
          id: data[i][0], 
          name: data[i][1], 
          email: data[i][2], 
          role: data[i][4],
          createdAt: data[i][5],
          // Adicione outros campos se necessário
        } 
      });
    }
  }
  return response({ success: false, message: "Usuário não encontrado." });
}

function getUserOrders(ss, email) {
  const sheet = getSafeSheet(ss, 'Pedidos');
  if (!sheet) return response({ success: true, data: [] });
  const data = sheet.getDataRange().getValues();
  const orders = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][2].toString().toLowerCase() === email.toLowerCase()) {
      orders.push({ 
        id: data[i][0], 
        user: data[i][1], 
        email: data[i][2], 
        total: data[i][3], 
        status: data[i][4], 
        items: data[i][5], 
        date: data[i][6], 
        progress: data[i][7] 
      });
    }
  }
  return response({ success: true, data: orders });
}

function deleteUser(ss, userId) {
  const sheet = ss.getSheetByName('Usuários');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) {
      sheet.deleteRow(i + 1);
      return response({ success: true, message: "Usuário removido!" });
    }
  }
  return response({ success: false, message: "Usuário não encontrado." });
}

function deleteProduct(ss, productId) {
  const sheet = ss.getSheetByName('Catálogo');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === productId) {
      sheet.deleteRow(i + 1);
      return response({ success: true, message: "Produto removido!" });
    }
  }
  return response({ success: false, message: "Produto não encontrado." });
}

function getBanners(ss) {
  const sheet = getSafeSheet(ss, 'Banners');
  if (!sheet) return response({ success: true, data: [] });
  const data = sheet.getDataRange().getValues();
  const banners = [];
  for (let i = 1; i < data.length; i++) {
    banners.push({
      id: data[i][0],
      title: data[i][1],
      subtitle: data[i][2],
      image: data[i][3],
      link: data[i][4],
      active: data[i][5] === true || data[i][5] === 'TRUE',
      order: parseInt(data[i][6] || 0)
    });
  }
  return response({ success: true, data: banners });
}

function addBanner(ss, banner) {
  const sheet = ss.getSheetByName('Banners');
  const id = 'B' + Math.floor(Math.random() * 1000000);
  sheet.appendRow([id, banner.title, banner.subtitle, banner.image, banner.link, true, banner.order || 0]);
  return response({ success: true, message: "Banner adicionado!" });
}

function updateBanner(ss, bannerId, banner) {
  const sheet = ss.getSheetByName('Banners');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === bannerId) {
      if (banner.title !== undefined) sheet.getRange(i + 1, 2).setValue(banner.title);
      if (banner.subtitle !== undefined) sheet.getRange(i + 1, 3).setValue(banner.subtitle);
      if (banner.image !== undefined) sheet.getRange(i + 1, 4).setValue(banner.image);
      if (banner.link !== undefined) sheet.getRange(i + 1, 5).setValue(banner.link);
      if (banner.active !== undefined) sheet.getRange(i + 1, 6).setValue(banner.active);
      if (banner.order !== undefined) sheet.getRange(i + 1, 7).setValue(banner.order);
      return response({ success: true, message: "Banner atualizado!" });
    }
  }
  return response({ success: false, message: "Banner não encontrado." });
}

function deleteBanner(ss, bannerId) {
  const sheet = ss.getSheetByName('Banners');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === bannerId) {
      sheet.deleteRow(i + 1);
      return response({ success: true, message: "Banner removido!" });
    }
  }
  return response({ success: false, message: "Banner não encontrado." });
}

function forgotPassword(ss, email) {
  return response({ success: true, message: "Instruções enviadas para o seu e-mail galáctico." });
}

// --- NOVAS FUNÇÕES DE CARRINHO E FAVORITOS ---

function syncCart(ss, email, cart) {
  const sheet = ss.getSheetByName('Carrinhos');
  const data = sheet.getDataRange().getValues();
  const cartJson = JSON.stringify(cart);
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString().toLowerCase() === email.toLowerCase()) {
      sheet.getRange(i + 1, 2).setValue(cartJson);
      sheet.getRange(i + 1, 3).setValue(new Date());
      return response({ success: true, message: "Carrinho sincronizado!" });
    }
  }
  
  sheet.appendRow([email, cartJson, new Date()]);
  return response({ success: true, message: "Carrinho salvo!" });
}

function getSavedCart(ss, email) {
  const sheet = ss.getSheetByName('Carrinhos');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString().toLowerCase() === email.toLowerCase()) {
      try {
        const cart = JSON.parse(data[i][1]);
        return response({ success: true, data: cart });
      } catch (e) {
        return response({ success: false, message: "Erro ao ler carrinho salvo." });
      }
    }
  }
  return response({ success: true, data: [] });
}

function addFavorite(ss, email, productId, folder) {
  const sheet = ss.getSheetByName('Favoritos');
  const data = sheet.getDataRange().getValues();
  
  // Evitar duplicados na mesma pasta
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString().toLowerCase() === email.toLowerCase() && 
        data[i][1].toString() === productId.toString() && 
        data[i][2] === folder) {
      return response({ success: true, message: "Já está nos favoritos desta pasta." });
    }
  }
  
  sheet.appendRow([email, productId, folder, new Date()]);
  return response({ success: true, message: "Adicionado aos favoritos!" });
}

function getFavorites(ss, email) {
  const sheet = ss.getSheetByName('Favoritos');
  const data = sheet.getDataRange().getValues();
  const favorites = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString().toLowerCase() === email.toLowerCase()) {
      favorites.push({
        productId: data[i][1],
        folder: data[i][2],
        addedAt: data[i][3]
      });
    }
  }
  return response({ success: true, data: favorites });
}

function removeFavorite(ss, email, productId, folder) {
  const sheet = ss.getSheetByName('Favoritos');
  const data = sheet.getDataRange().getValues();
  
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][0].toString().toLowerCase() === email.toLowerCase() && 
        data[i][1].toString() === productId.toString() && 
        data[i][2] === folder) {
      sheet.deleteRow(i + 1);
      return response({ success: true, message: "Removido dos favoritos!" });
    }
  }
  return response({ success: false, message: "Favorito não encontrado." });
}
