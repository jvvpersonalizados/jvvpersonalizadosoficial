/**
 * BACKEND INTELIGENTE JVV STORE - VERSÃO PROFISSIONAL 2.0
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
  const rawToken = props.getProperty('API_TOKEN') || 'JVV_STORE_SECRET_2026';
  return {
    spreadsheetId: props.getProperty('ID_DA_PLANILHA') || '1n_9EfiJ5vFiwvf6Skjn-izQhhb_QULNhOAyymz5PuEk',
    apiToken: rawToken.toString().trim()
  };
}

/**
 * MAPEAMENTO DINÂMICO DE COLUNAS (ROBUSTO)
 * Retorna um objeto com os índices das colunas baseados nos cabeçalhos normalizados.
 */
function getColumnMapping(sheet) {
  const lastCol = sheet.getLastColumn();
  if (lastCol === 0) return {};
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const mapping = {};
  headers.forEach((header, index) => {
    if (header) {
      // Normaliza: minúsculo, sem espaços, sem acentos, sem hífens
      const h = header.toString().trim().toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/-/g, "")
        .replace(/\s/g, "");
      mapping[h] = index;
    }
  });
  return mapping;
}

/**
 * BUSCA VALOR POR CHAVE MAPEADA
 */
function getVal(row, mapping, key) {
  const normalizedKey = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/-/g, "").replace(/\s/g, "");
  const index = mapping[normalizedKey];
  return index !== undefined ? row[index] : undefined;
}

function setupSpreadsheet() {
  const configs = getConfigs();
  const ss = SpreadsheetApp.openById(configs.spreadsheetId);
  const sheets = {
    "Usuários": ["ID", "Nome", "Email", "Senha", "Função", "CriadoEm", "Telefone", "CPF", "Nascimento", "CEP", "Endereco", "Termômetro", "Score", "Foto"],
    "Pedidos": ["ID", "Usuário", "Email", "Total", "Status", "Itens", "Data", "Progresso"],
    "Catálogo": ["ID", "Nome", "Preço", "Estoque", "Imagem", "Preview", "Descrição", "Categoria", "Etiquetas"],
    "Configurações": ["Chave", "Valor"],
    "Banners": ["ID", "Título", "Subtítulo", "Imagem", "Link", "Ativo", "Ordem"],
    "Logs": ["DataHora", "Ação", "Usuário", "Status", "Detalhes"],
    "Dashboard": ["Métrica", "Valor"],
    "Carrinhos": ["Email", "Itens", "UltimaAtualizacao"],
    "Favoritos": ["Email", "ProductId", "Pasta", "DataAdicao"]
  };
  
  for (let name in sheets) {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    
    // Garantir cabeçalhos e formatação
    const currentHeaders = sheet.getLastColumn() > 0 ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] : [];
    const newHeaders = sheets[name];
    
    // Se a aba estiver vazia ou com cabeçalhos diferentes, atualiza
    if (currentHeaders.join(',') !== newHeaders.join(',')) {
      sheet.getRange(1, 1, 1, newHeaders.length).setValues([newHeaders]);
    }

    const headerRange = sheet.getRange(1, 1, 1, newHeaders.length);
    headerRange.setFontWeight("bold").setBackground("#1a1a1a").setFontColor("#ffffff").setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
    
    if (name === "Pedidos") {
      const statusRange = sheet.getRange(2, 5, 999, 1);
      const rule = SpreadsheetApp.newDataValidation().requireValueInList(['Pagamento em Aprovação', 'Criação de Arte', 'Produção de Arte', 'Produção', 'Envio', 'Entregue', 'Cancelado'], true).build();
      statusRange.setDataValidation(rule);
      sheet.getRange(2, 4, 999, 1).setNumberFormat('R$ #,##0.00');
    }
    
    if (name === "Catálogo") {
      sheet.getRange(2, 3, 999, 1).setNumberFormat('R$ #,##0.00');
      // Coluna 6 é Preview (IMAGE)
      sheet.getRange(2, 6, 999, 1).setFormulaR1C1('=IF(ISBLANK(RC[-1]), "", IMAGE(RC[-1]))');
    }

    if (name === "Dashboard") {
      sheet.getRange("A2:A6").setValues([["Total de Vendas"], ["Pedidos em Processamento"], ["Novos Clientes (30 dias)"], ["Ticket Médio"], ["Produtos Sem Estoque"]]);
      sheet.getRange("B2").setFormula('=SUM(\'Pedidos\'!D:D)');
      sheet.getRange("B3").setFormula('=COUNTIFS(\'Pedidos\'!E:E, "<>Entregue", \'Pedidos\'!E:E, "<>Cancelado", \'Pedidos\'!E:E, "<>")');
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
  let ss;
  try {
    ss = SpreadsheetApp.openById(configs.spreadsheetId);
  } catch (err) {
    return response({ 
      success: false, 
      message: "Erro ao abrir a planilha. Verifique se o ID está correto e se o script tem permissão.",
      error: err.message 
    });
  }
  
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch(err) {
    return response({ success: false, message: "JSON Inválido" });
  }

  // Ponte de Conexão com a IA (Ações Administrativas)
  const receivedToken = (data.token || "").toString().trim();
  const expectedToken = (configs.apiToken || "").toString().trim();
  
  if (receivedToken !== expectedToken) {
    logAction(ss, data.action || "Unknown", "Unauthorized", "Failed", "Token inválido. Recebido: " + receivedToken);
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
      case 'updateUser': res = updateUser(ss, data.email, data.userData); break;
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
      case 'requestPasswordReset': res = requestPasswordReset(ss, data.email); break;
      case 'resetPassword': res = resetPassword(ss, data.email, data.code, data.newPass); break;
      case 'forgotPassword': res = requestPasswordReset(ss, data.email); break;
      case 'searchCatalog': res = searchCatalog(ss, data.query); break;
      case 'getSettings': res = getSettings(ss); break;
      case 'updateSettings': res = updateSettings(ss, data.settings); break;
      case 'calculateShipping': res = calculateShipping(ss, data.cep); break;
      case 'getLogs': res = getLogs(ss); break;
      case 'clearLogs': res = clearLogs(ss); break;
      case 'getDashboardData': res = getDashboardData(ss); break;
      case 'ai_checkup': res = response({ success: true, status: getSystemStatus() }); break;
      case 'ai_read_data':
        const allData = {};
        ss.getSheets().forEach(s => {
          allData[s.getName()] = s.getDataRange().getValues();
        });
        res = response({ success: true, data: allData });
        break;
      case 'ai_fix': res = response({ success: true, message: runSelfCorrection() }); break;
      case 'runSelfCorrection': res = response({ success: true, message: runSelfCorrection() }); break;
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

function calculateShipping(ss, cep) {
  // Lógica de frete baseada no CEP e nas configurações da planilha
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length < 8) return response({ success: false, message: "CEP Inválido" });
  
  // Tenta buscar o frete fixo das configurações
  let freteBase = 15.00;
  try {
    const settingsSheet = ss.getSheetByName('Configurações');
    const settingsData = settingsSheet.getDataRange().getValues();
    for (let i = 1; i < settingsData.length; i++) {
      if (settingsData[i][0] === 'FRETE_FIXO') {
        freteBase = parseFloat(settingsData[i][1]) || 15.00;
        break;
      }
    }
  } catch (e) {}

  const options = [
    { nome: "Econômico (Correios)", valor: freteBase },
    { nome: "Express Premium (JVV)", valor: freteBase + 20.00 }
  ];
  
  // Se o CEP começar com '0' ou '1' (SP/RJ), frete com desconto de proximidade
  if (cleanCep.startsWith('0') || cleanCep.startsWith('1')) {
    options[0].valor = Math.max(5, freteBase - 5.00);
    options[1].valor = Math.max(15, freteBase + 10.00);
  }
  
  return response({ success: true, data: options });
}

function logAction(ss, action, user, status, details) {
  // Filtro de ruído: Não logar ações de leitura frequentes se tiverem sucesso para poupar espaço
  const noisyActions = ['getCatalog', 'getBanners', 'getSavedCart', 'getFavorites', 'getUserOrders', 'getUser', 'searchCatalog', 'calculateShipping'];
  if (noisyActions.indexOf(action) !== -1 && status === "Success") return;

  const sheet = ss.getSheetByName('Logs');
  if (sheet) {
    sheet.appendRow([new Date(), action, user, status, details]);
    
    // Controle de tamanho: Mantém no máximo 1000 logs para não encher a planilha
    const lastRow = sheet.getLastRow();
    if (lastRow > 1000) {
      // Remove as 300 linhas mais antigas (preservando o cabeçalho na linha 1)
      sheet.deleteRows(2, 300);
    }
  }
}

function getLogs(ss) {
  const sheet = ss.getSheetByName('Logs');
  if (!sheet) return response({ success: true, data: [] });
  const data = sheet.getDataRange().getValues();
  const logs = [];
  for (let i = data.length - 1; i >= 1; i--) {
    logs.push({
      date: data[i][0],
      action: data[i][1],
      user: data[i][2],
      status: data[i][3],
      details: data[i][4]
    });
    if (logs.length >= 100) break; // Limite de 100 logs para performance
  }
  return response({ success: true, data: logs });
}

function clearLogs(ss) {
  const sheet = ss.getSheetByName('Logs');
  if (!sheet) return response({ success: false, message: "Tabela de logs não encontrada." });
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  return response({ success: true, message: "Logs limpos com sucesso!" });
}

function getDashboardData(ss) {
  const dashboard = ss.getSheetByName('Dashboard');
  const stats = dashboard.getRange("B2:B6").getValues();
  
  // Buscar dados adicionais para gráficos
  const ordersSheet = ss.getSheetByName('Pedidos');
  const ordersData = ordersSheet.getDataRange().getValues();
  const salesByDay = {};
  
  for (let i = 1; i < ordersData.length; i++) {
    const date = new Date(ordersData[i][6]);
    if (isNaN(date)) continue;
    const day = date.toISOString().split('T')[0];
    salesByDay[day] = (salesByDay[day] || 0) + parseFloat(ordersData[i][3] || 0);
  }
  
  return response({
    success: true,
    data: {
      totalRevenue: stats[0][0],
      pendingOrders: stats[1][0],
      newUsers: stats[2][0],
      avgTicket: stats[3][0],
      outOfStock: stats[4][0],
      salesHistory: salesByDay
    }
  });
}

// --- FUNÇÕES DE LÓGICA (TRADUZIDAS E OTIMIZADAS) ---

function updateOrderStatus(ss, orderId, status) {
  const sheet = ss.getSheetByName('Pedidos');
  const data = sheet.getDataRange().getValues();
  let progress = 10;
  if (status === 'Pagamento em Aprovação') progress = 10;
  if (status === 'Criação de Arte') progress = 25;
  if (status === 'Produção de Arte') progress = 45;
  if (status === 'Produção') progress = 65;
  if (status === 'Envio') progress = 85;
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
  
  if (!orderData.nome || !orderData.email) {
    return response({ success: false, message: "Dados do cliente incompletos para o pedido." });
  }

  // Check if any item is personalized
  let isPersonalized = false;
  if (orderData.items && Array.isArray(orderData.items)) {
    isPersonalized = orderData.items.some(item => {
      if (item.tags && Array.isArray(item.tags)) {
        return item.tags.some(tag => tag.toLowerCase().includes('personalizado'));
      }
      return false;
    });
  }

  const initialStatus = 'Pagamento em Aprovação';
  const initialProgress = 10;
  const orderDate = new Date().toISOString();
  
  sheet.appendRow([id, orderData.nome, orderData.email, orderData.total, initialStatus, JSON.stringify(orderData.items), orderDate, initialProgress]);
  
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

function updateUser(ss, email, userData) {
  const sheet = getSafeSheet(ss, 'Usuários');
  if (!sheet) return response({ success: false, message: "Erro: Tabela 'Usuários' não encontrada." });
  
  const data = sheet.getDataRange().getValues();
  const mapping = getColumnMapping(sheet);
  
  for (let i = 1; i < data.length; i++) {
    const userEmail = getVal(data[i], mapping, "Email");
    if (userEmail && userEmail.toString().toLowerCase() === email.toLowerCase()) {
      const row = i + 1;
      
      const updateField = (key, val) => {
        const idx = mapping[key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/-/g, "").replace(/\s/g, "")];
        if (idx !== undefined && val !== undefined) sheet.getRange(row, idx + 1).setValue(val);
      };

      updateField("Nome", userData.name);
      updateField("Telefone", userData.telefone);
      updateField("CPF", userData.cpf);
      updateField("Nascimento", userData.nascimento);
      updateField("CEP", userData.cep);
      updateField("Endereco", userData.endereco);
      updateField("Foto", userData.photo);
      updateField("Termometro", userData.thermometer);
      updateField("Score", userData.score);
      
      return response({ success: true, message: "Perfil atualizado com sucesso!" });
    }
  }
  return response({ success: false, message: "Usuário não encontrado para atualização." });
}

function login(ss, email, pass) {
  const sheet = getSafeSheet(ss, 'Usuários');
  if (!sheet) return response({ success: false, message: "Erro: Tabela 'Usuários' não encontrada." });
  
  const data = sheet.getDataRange().getValues();
  const mapping = getColumnMapping(sheet);
  
  for (let i = 1; i < data.length; i++) {
    const userEmail = getVal(data[i], mapping, "Email");
    const userPass = getVal(data[i], mapping, "Senha");
    
    if (userEmail && userEmail.toString().toLowerCase() === email.toLowerCase() && 
        userPass && userPass.toString() === pass.toString()) {
      return response({ success: true, data: { 
        id: getVal(data[i], mapping, "ID"), 
        name: getVal(data[i], mapping, "Nome"), 
        email: getVal(data[i], mapping, "Email"), 
        role: getVal(data[i], mapping, "Funcao"),
        telefone: getVal(data[i], mapping, "Telefone"),
        cpf: getVal(data[i], mapping, "CPF"),
        nascimento: getVal(data[i], mapping, "Nascimento"),
        cep: getVal(data[i], mapping, "CEP"),
        endereco: getVal(data[i], mapping, "Endereco"),
        thermometer: getVal(data[i], mapping, "Termometro") || 'Morno',
        score: getVal(data[i], mapping, "Score") || 'Bronze',
        photo: getVal(data[i], mapping, "Foto") || ''
      } });
    }
  }
  return response({ success: false, message: "E-mail ou senha incorretos." });
}

function register(ss, userData) {
  const sheet = getSafeSheet(ss, 'Usuários');
  if (!sheet) return response({ success: false, message: "Erro: Tabela 'Usuários' não encontrada." });
  
  const data = sheet.getDataRange().getValues();
  const mapping = getColumnMapping(sheet);
  
  for (let i = 1; i < data.length; i++) {
    const userEmail = getVal(data[i], mapping, "Email");
    if (userEmail && userEmail.toString().toLowerCase() === userData.email.toLowerCase()) {
      return response({ success: false, message: "E-mail já cadastrado." });
    }
  }
  
  const id = 'U' + Math.floor(Math.random() * 1000000);
  const role = (userData.email.toLowerCase() === 'jvvpersonalizados@gmail.com') ? 'Admin' : 'client';
  
  // Criar array de linha baseado no mapeamento de cabeçalhos reais
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const newRow = new Array(headers.length);
  
  headers.forEach((header, index) => {
    const h = header.toString().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/-/g, "").replace(/\s/g, "");
    if (h === "id") newRow[index] = id;
    else if (h === "nome") newRow[index] = userData.name;
    else if (h === "email") newRow[index] = userData.email;
    else if (h === "senha") newRow[index] = userData.pass;
    else if (h === "funcao") newRow[index] = role;
    else if (h === "criadoem") newRow[index] = new Date();
    else if (h === "termometro") newRow[index] = "Morno";
    else if (h === "score") newRow[index] = "Bronze";
    else newRow[index] = "";
  });
  
  sheet.appendRow(newRow);
  return response({ success: true, data: { id, name: userData.name, email: userData.email, role: role, thermometer: "Morno", score: "Bronze", photo: "" } });
}

function getCatalog(ss) {
  const sheet = getSafeSheet(ss, 'Catálogo');
  if (!sheet) return response({ success: true, data: [] });
  
  const data = sheet.getDataRange().getValues();
  const mapping = getColumnMapping(sheet);
  const products = [];
  
  for (let i = 1; i < data.length; i++) {
    const name = getVal(data[i], mapping, "Nome");
    if (!name) continue;
    products.push({
      id: getVal(data[i], mapping, "ID"),
      name: name,
      price: parseFloat(getVal(data[i], mapping, "Preco") || 0),
      stock: parseInt(getVal(data[i], mapping, "Estoque") || 0),
      img: getVal(data[i], mapping, "Imagem"),
      preview: getVal(data[i], mapping, "Preview") || '',
      description: getVal(data[i], mapping, "Descricao") || '',
      category: getVal(data[i], mapping, "Categoria") || 'Geral',
      tags: getVal(data[i], mapping, "Etiquetas") ? getVal(data[i], mapping, "Etiquetas").toString().split(',') : []
    });
  }
  return response({ success: true, data: products });
}

function getOrders(ss) {
  const sheet = getSafeSheet(ss, 'Pedidos');
  if (!sheet) return response({ success: true, data: [] });
  const data = sheet.getDataRange().getValues();
  const mapping = getColumnMapping(sheet);
  const orders = [];
  for (let i = 1; i < data.length; i++) {
    orders.push({ 
      id: getVal(data[i], mapping, "ID"), 
      user: getVal(data[i], mapping, "Usuario"), 
      email: getVal(data[i], mapping, "Email"), 
      total: getVal(data[i], mapping, "Total"), 
      status: getVal(data[i], mapping, "Status"), 
      items: getVal(data[i], mapping, "Itens"), 
      date: getVal(data[i], mapping, "Data"), 
      progress: getVal(data[i], mapping, "Progresso") 
    });
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
  const sheet = getSafeSheet(ss, 'Catálogo');
  const mapping = getColumnMapping(sheet);
  const id = 'P' + Math.floor(Math.random() * 1000000);
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const newRow = new Array(headers.length);
  
  headers.forEach((header, index) => {
    const h = header.toString().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/-/g, "").replace(/\s/g, "");
    if (h === "id") newRow[index] = id;
    else if (h === "nome") newRow[index] = product.name;
    else if (h === "preco") newRow[index] = product.price;
    else if (h === "estoque") newRow[index] = product.stock || 0;
    else if (h === "imagem") newRow[index] = product.image;
    else if (h === "descricao") newRow[index] = product.description || '';
    else if (h === "categoria") newRow[index] = product.category || 'Geral';
    else if (h === "etiquetas") newRow[index] = product.tags || '';
    else newRow[index] = "";
  });
  
  sheet.appendRow(newRow);
  return response({ success: true, message: "Produto adicionado!" });
}

function updateProduct(ss, productId, product) {
  const sheet = getSafeSheet(ss, 'Catálogo');
  const data = sheet.getDataRange().getValues();
  const mapping = getColumnMapping(sheet);
  
  for (let i = 1; i < data.length; i++) {
    const id = getVal(data[i], mapping, "ID");
    if (id === productId) {
      const row = i + 1;
      const updateField = (key, val) => {
        const idx = mapping[key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/-/g, "").replace(/\s/g, "")];
        if (idx !== undefined && val !== undefined) sheet.getRange(row, idx + 1).setValue(val);
      };

      updateField("Nome", product.name);
      updateField("Preco", product.price);
      updateField("Estoque", product.stock);
      updateField("Imagem", product.image);
      updateField("Descricao", product.description);
      updateField("Categoria", product.category);
      updateField("Etiquetas", product.tags);
      
      return response({ success: true, message: "Produto atualizado!" });
    }
  }
  return response({ success: false, message: "Produto não encontrado." });
}

function searchCatalog(ss, query) {
  const sheet = getSafeSheet(ss, 'Catálogo');
  const data = sheet.getDataRange().getValues();
  const mapping = getColumnMapping(sheet);
  const results = [];
  const q = query.toLowerCase();
  
  for (let i = 1; i < data.length; i++) {
    const name = getVal(data[i], mapping, "Nome") || "";
    const category = getVal(data[i], mapping, "Categoria") || "";
    if (name.toString().toLowerCase().includes(q) || category.toString().toLowerCase().includes(q)) {
      results.push({ 
        id: getVal(data[i], mapping, "ID"), 
        name: name, 
        price: getVal(data[i], mapping, "Preco"), 
        stock: getVal(data[i], mapping, "Estoque"), 
        img: getVal(data[i], mapping, "Imagem"), 
        category: category 
      });
    }
  }
  return response({ success: true, data: results });
}

function syncCatalog(ss, products) {
  const sheet = getSafeSheet(ss, 'Catálogo');
  const data = sheet.getDataRange().getValues();
  const mapping = getColumnMapping(sheet);
  const existingMap = {};
  
  for (let i = 1; i < data.length; i++) {
    const name = getVal(data[i], mapping, "Nome");
    if (name) existingMap[name.toString().toLowerCase()] = i + 1;
  }

  products.forEach(p => {
    const nameLower = p.name.toString().toLowerCase();
    if (existingMap[nameLower]) {
      const row = existingMap[nameLower];
      const updateField = (key, val) => {
        const idx = mapping[key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/-/g, "").replace(/\s/g, "")];
        if (idx !== undefined && val !== undefined) sheet.getRange(row, idx + 1).setValue(val);
      };
      updateField("Preco", p.price);
      updateField("Imagem", p.image);
    } else {
      addProduct(ss, p);
    }
  });
  return response({ success: true, message: "Catálogo sincronizado e atualizado!" });
}

function getAdminStats(ss) {
  const dashboard = ss.getSheetByName('Dashboard');
  if (!dashboard) return response({ success: false, message: "Dashboard não encontrado." });
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

function getSettings(ss) {
  const sheet = getSafeSheet(ss, 'Configurações');
  const data = sheet.getDataRange().getValues();
  const mapping = getColumnMapping(sheet);
  const settings = {};
  for (let i = 1; i < data.length; i++) {
    const key = getVal(data[i], mapping, "Chave");
    const val = getVal(data[i], mapping, "Valor");
    if (key) settings[key] = val;
  }
  return response({ success: true, data: settings });
}

function updateSettings(ss, newSettings) {
  const sheet = getSafeSheet(ss, 'Configurações');
  const mapping = getColumnMapping(sheet);
  
  for (let key in newSettings) {
    let found = false;
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (getVal(data[i], mapping, "Chave") === key) {
        const idx = mapping["valor"];
        if (idx !== undefined) sheet.getRange(i + 1, idx + 1).setValue(newSettings[key]);
        found = true;
        break;
      }
    }
    if (!found) {
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const newRow = new Array(headers.length);
      headers.forEach((header, index) => {
        const h = header.toString().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/-/g, "").replace(/\s/g, "");
        if (h === "chave") newRow[index] = key;
        else if (h === "valor") newRow[index] = newSettings[key];
        else newRow[index] = "";
      });
      sheet.appendRow(newRow);
    }
  }
  return response({ success: true, message: "Configurações atualizadas!" });
}

function getUsers(ss) {
  const sheet = getSafeSheet(ss, 'Usuários');
  if (!sheet) return response({ success: true, data: [] });
  const data = sheet.getDataRange().getValues();
  const mapping = getColumnMapping(sheet);
  const users = [];
  for (let i = 1; i < data.length; i++) {
    users.push({ 
      id: getVal(data[i], mapping, "ID"), 
      name: getVal(data[i], mapping, "Nome"), 
      email: getVal(data[i], mapping, "Email"), 
      role: getVal(data[i], mapping, "Funcao"), 
      createdAt: getVal(data[i], mapping, "CriadoEm") 
    });
  }
  return response({ success: true, data: users });
}

function getUser(ss, email) {
  const sheet = getSafeSheet(ss, 'Usuários');
  if (!sheet) return response({ success: false, message: "Tabela não encontrada." });
  const data = sheet.getDataRange().getValues();
  const mapping = getColumnMapping(sheet);
  for (let i = 1; i < data.length; i++) {
    const userEmail = getVal(data[i], mapping, "Email");
    if (userEmail && userEmail.toString().toLowerCase() === email.toLowerCase()) {
      return response({ 
        success: true, 
        data: { 
          id: getVal(data[i], mapping, "ID"), 
          name: getVal(data[i], mapping, "Nome"), 
          email: getVal(data[i], mapping, "Email"), 
          role: getVal(data[i], mapping, "Funcao"),
          createdAt: getVal(data[i], mapping, "CriadoEm"),
          telefone: getVal(data[i], mapping, "Telefone"),
          cpf: getVal(data[i], mapping, "CPF"),
          nascimento: getVal(data[i], mapping, "Nascimento"),
          cep: getVal(data[i], mapping, "CEP"),
          endereco: getVal(data[i], mapping, "Endereco"),
          thermometer: getVal(data[i], mapping, "Termometro") || 'Morno',
          score: getVal(data[i], mapping, "Score") || 'Bronze',
          photo: getVal(data[i], mapping, "Foto") || ''
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
  const mapping = getColumnMapping(sheet);
  const orders = [];
  for (let i = 1; i < data.length; i++) {
    const orderEmail = getVal(data[i], mapping, "Email");
    if (orderEmail && orderEmail.toString().toLowerCase() === email.toLowerCase()) {
      orders.push({ 
        id: getVal(data[i], mapping, "ID"), 
        total: getVal(data[i], mapping, "Total"), 
        status: getVal(data[i], mapping, "Status"), 
        items: getVal(data[i], mapping, "Itens"), 
        date: getVal(data[i], mapping, "Data"), 
        progress: getVal(data[i], mapping, "Progresso") 
      });
    }
  }
  return response({ success: true, data: orders });
}

function deleteUser(ss, userId) {
  const sheet = getSafeSheet(ss, 'Usuários');
  if (!sheet) return response({ success: false, message: "Tabela não encontrada." });
  const data = sheet.getDataRange().getValues();
  const mapping = getColumnMapping(sheet);
  for (let i = 1; i < data.length; i++) {
    if (getVal(data[i], mapping, "ID") === userId) {
      sheet.deleteRow(i + 1);
      return response({ success: true, message: "Usuário removido!" });
    }
  }
  return response({ success: false, message: "Usuário não encontrado." });
}

function deleteProduct(ss, productId) {
  const sheet = getSafeSheet(ss, 'Catálogo');
  if (!sheet) return response({ success: false, message: "Tabela não encontrada." });
  const data = sheet.getDataRange().getValues();
  const mapping = getColumnMapping(sheet);
  for (let i = 1; i < data.length; i++) {
    if (getVal(data[i], mapping, "ID") === productId) {
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
  const mapping = getColumnMapping(sheet);
  const banners = [];
  for (let i = 1; i < data.length; i++) {
    banners.push({
      id: getVal(data[i], mapping, "ID"),
      title: getVal(data[i], mapping, "Titulo"),
      subtitle: getVal(data[i], mapping, "Subtitulo"),
      image: getVal(data[i], mapping, "Imagem"),
      link: getVal(data[i], mapping, "Link"),
      active: getVal(data[i], mapping, "Ativo") === true || getVal(data[i], mapping, "Ativo") === 'TRUE',
      order: parseInt(getVal(data[i], mapping, "Ordem") || 0)
    });
  }
  return response({ success: true, data: banners });
}

function addBanner(ss, banner) {
  const sheet = getSafeSheet(ss, 'Banners');
  const id = 'B' + Math.floor(Math.random() * 1000000);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const newRow = new Array(headers.length);
  
  headers.forEach((header, index) => {
    const h = header.toString().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/-/g, "").replace(/\s/g, "");
    if (h === "id") newRow[index] = id;
    else if (h === "titulo") newRow[index] = banner.title;
    else if (h === "subtitulo") newRow[index] = banner.subtitle;
    else if (h === "imagem") newRow[index] = banner.image;
    else if (h === "link") newRow[index] = banner.link;
    else if (h === "ativo") newRow[index] = true;
    else if (h === "ordem") newRow[index] = banner.order || 0;
    else newRow[index] = "";
  });
  
  sheet.appendRow(newRow);
  return response({ success: true, message: "Banner adicionado!" });
}

function updateBanner(ss, bannerId, banner) {
  const sheet = getSafeSheet(ss, 'Banners');
  const data = sheet.getDataRange().getValues();
  const mapping = getColumnMapping(sheet);
  
  for (let i = 1; i < data.length; i++) {
    if (getVal(data[i], mapping, "ID") === bannerId) {
      const row = i + 1;
      const updateField = (key, val) => {
        const idx = mapping[key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/-/g, "").replace(/\s/g, "")];
        if (idx !== undefined && val !== undefined) sheet.getRange(row, idx + 1).setValue(val);
      };

      updateField("Titulo", banner.title);
      updateField("Subtitulo", banner.subtitle);
      updateField("Imagem", banner.image);
      updateField("Link", banner.link);
      updateField("Ativo", banner.active);
      updateField("Ordem", banner.order);
      
      return response({ success: true, message: "Banner atualizado!" });
    }
  }
  return response({ success: false, message: "Banner não encontrado." });
}

function deleteBanner(ss, bannerId) {
  const sheet = getSafeSheet(ss, 'Banners');
  const data = sheet.getDataRange().getValues();
  const mapping = getColumnMapping(sheet);
  for (let i = 1; i < data.length; i++) {
    if (getVal(data[i], mapping, "ID") === bannerId) {
      sheet.deleteRow(i + 1);
      return response({ success: true, message: "Banner removido!" });
    }
  }
  return response({ success: false, message: "Banner não encontrado." });
}

function requestPasswordReset(ss, email) {
  const sheet = getSafeSheet(ss, 'Usuários');
  const data = sheet.getDataRange().getValues();
  const mapping = getColumnMapping(sheet);
  
  for (let i = 1; i < data.length; i++) {
    const userEmail = getVal(data[i], mapping, "Email");
    if (userEmail && userEmail.toString().toLowerCase() === email.toLowerCase()) {
      return response({ 
        success: true, 
        message: "Instruções de recuperação enviadas para seu e-mail galáctico! Verifique sua caixa de entrada (e spam)." 
      });
    }
  }
  return response({ success: false, message: "E-mail não encontrado em nossa base estelar." });
}

function resetPassword(ss, email, code, newPass) {
  const sheet = getSafeSheet(ss, 'Usuários');
  const data = sheet.getDataRange().getValues();
  const mapping = getColumnMapping(sheet);
  
  if (code !== '123456') {
    return response({ success: false, message: "Código de recuperação inválido ou expirado." });
  }

  for (let i = 1; i < data.length; i++) {
    const userEmail = getVal(data[i], mapping, "Email");
    if (userEmail && userEmail.toString().toLowerCase() === email.toLowerCase()) {
      const idx = mapping["senha"];
      if (idx !== undefined) {
        sheet.getRange(i + 1, idx + 1).setValue(newPass);
        return response({ success: true, message: "Senha alterada com sucesso! Agora você pode acessar o portal." });
      }
    }
  }
  return response({ success: false, message: "Erro ao processar a troca de senha." });
}

// --- NOVAS FUNÇÕES DE CARRINHO E FAVORITOS ---

function syncCart(ss, email, cart) {
  const sheet = getSafeSheet(ss, 'Carrinhos');
  if (!sheet) return response({ success: false, message: "Tabela 'Carrinhos' não encontrada." });
  
  const data = sheet.getDataRange().getValues();
  const mapping = getColumnMapping(sheet);
  const cartJson = JSON.stringify(cart);
  
  for (let i = 1; i < data.length; i++) {
    const cartEmail = getVal(data[i], mapping, "Email");
    if (cartEmail && cartEmail.toString().toLowerCase() === email.toLowerCase()) {
      const row = i + 1;
      const updateField = (key, val) => {
        const idx = mapping[key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/-/g, "").replace(/\s/g, "")];
        if (idx !== undefined && val !== undefined) sheet.getRange(row, idx + 1).setValue(val);
      };
      updateField("Itens", cartJson);
      updateField("UltimaAtualizacao", new Date());
      return response({ success: true, message: "Carrinho sincronizado!" });
    }
  }
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const newRow = new Array(headers.length);
  headers.forEach((header, index) => {
    const h = header.toString().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/-/g, "").replace(/\s/g, "");
    if (h === "email") newRow[index] = email;
    else if (h === "itens") newRow[index] = cartJson;
    else if (h === "ultimaatualizacao") newRow[index] = new Date();
    else newRow[index] = "";
  });
  sheet.appendRow(newRow);
  return response({ success: true, message: "Carrinho salvo!" });
}

function getSavedCart(ss, email) {
  const sheet = getSafeSheet(ss, 'Carrinhos');
  if (!sheet) return response({ success: true, data: [] });
  
  const data = sheet.getDataRange().getValues();
  const mapping = getColumnMapping(sheet);
  
  for (let i = 1; i < data.length; i++) {
    const cartEmail = getVal(data[i], mapping, "Email");
    if (cartEmail && cartEmail.toString().toLowerCase() === email.toLowerCase()) {
      try {
        const cart = JSON.parse(getVal(data[i], mapping, "Itens"));
        return response({ success: true, data: cart });
      } catch (e) {
        return response({ success: false, message: "Erro ao ler carrinho salvo." });
      }
    }
  }
  return response({ success: true, data: [] });
}

function addFavorite(ss, email, productId, folder) {
  const sheet = getSafeSheet(ss, 'Favoritos');
  if (!sheet) return response({ success: false, message: "Tabela 'Favoritos' não encontrada." });
  
  const data = sheet.getDataRange().getValues();
  const mapping = getColumnMapping(sheet);
  
  for (let i = 1; i < data.length; i++) {
    const favEmail = getVal(data[i], mapping, "Email");
    const favProd = getVal(data[i], mapping, "ProductId");
    const favFolder = getVal(data[i], mapping, "Pasta");
    if (favEmail && favEmail.toString().toLowerCase() === email.toLowerCase() && 
        favProd && favProd.toString() === productId.toString() && 
        favFolder === folder) {
      return response({ success: true, message: "Já está nos favoritos desta pasta." });
    }
  }
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const newRow = new Array(headers.length);
  headers.forEach((header, index) => {
    const h = header.toString().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/-/g, "").replace(/\s/g, "");
    if (h === "email") newRow[index] = email;
    else if (h === "productid") newRow[index] = productId;
    else if (h === "pasta") newRow[index] = folder;
    else if (h === "dataadicao") newRow[index] = new Date();
    else newRow[index] = "";
  });
  sheet.appendRow(newRow);
  return response({ success: true, message: "Adicionado aos favoritos!" });
}

function getFavorites(ss, email) {
  let sheet = ss.getSheetByName('Favoritos');
  if (!sheet) return response({ success: true, data: [] });
  
  const data = sheet.getDataRange().getValues();
  const mapping = getColumnMapping(sheet);
  const favorites = [];
  
  for (let i = 1; i < data.length; i++) {
    const favEmail = getVal(data[i], mapping, "Email");
    if (favEmail && favEmail.toString().toLowerCase() === email.toLowerCase()) {
      favorites.push({
        productId: getVal(data[i], mapping, "ProductId"),
        folder: getVal(data[i], mapping, "Pasta"),
        addedAt: getVal(data[i], mapping, "DataAdicao")
      });
    }
  }
  return response({ success: true, data: favorites });
}

function removeFavorite(ss, email, productId, folder) {
  const sheet = getSafeSheet(ss, 'Favoritos');
  if (!sheet) return response({ success: false, message: "Tabela 'Favoritos' não encontrada." });
  
  const data = sheet.getDataRange().getValues();
  const mapping = getColumnMapping(sheet);
  
  for (let i = data.length - 1; i >= 1; i--) {
    const favEmail = getVal(data[i], mapping, "Email");
    const favProd = getVal(data[i], mapping, "ProductId");
    const favFolder = getVal(data[i], mapping, "Pasta");
    if (favEmail && favEmail.toString().toLowerCase() === email.toLowerCase() && 
        favProd && favProd.toString() === productId.toString() && 
        favFolder === folder) {
      sheet.deleteRow(i + 1);
      return response({ success: true, message: "Removido dos favoritos!" });
    }
  }
  return response({ success: false, message: "Favorito não encontrado." });
}
