import axios from 'axios';

const GAS_URL = process.argv[2] || process.env.GAS_WEBAPP_URL;
const GAS_TOKEN = process.argv[3] || process.env.GAS_API_TOKEN || "SEGREDO_GALÁCTICO_2026";

async function analyze() {
  if (!GAS_URL) {
    console.error("ERRO: URL do GAS não fornecida.");
    process.exit(1);
  }

  console.log(`--- INICIANDO ANÁLISE PROFUNDA ---`);
  console.log(`URL: ${GAS_URL}`);

  try {
    const response = await axios.post(GAS_URL, {
      action: "ai_read_data",
      token: GAS_TOKEN
    }, { timeout: 30000 });

    if (response.data.success) {
      const data = response.data.data;
      console.log("\n--- RESULTADOS DA ANÁLISE ---");
      for (const sheetName in data) {
        const rows = data[sheetName];
        console.log(`\nABA: [${sheetName}] - ${rows.length} linhas encontradas.`);
        if (rows.length > 0) {
          console.log(`Cabeçalhos: ${JSON.stringify(rows[0])}`);
          // Mostrar as primeiras 2 linhas de dados se existirem
          if (rows.length > 1) console.log(`Exemplo 1: ${JSON.stringify(rows[1])}`);
          if (rows.length > 2) console.log(`Exemplo 2: ${JSON.stringify(rows[2])}`);
        }
      }
    } else {
      console.error("FALHA NA API:", response.data.message);
    }
  } catch (error: any) {
    console.error("ERRO DE CONEXÃO:", error.message);
    if (error.response) console.error("RESPOSTA DO SERVIDOR:", error.response.data);
  }
}

analyze();
