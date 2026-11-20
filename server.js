const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Serve os arquivos estáticos da pasta (incluindo index.html)
app.use(express.static(__dirname));

// Conexão com o banco SQLite criado pelo ingestor.js
const db = new sqlite3.Database(path.join(__dirname, 'alphavolts.db'), (err) => {
  if (err) {
    console.error('Erro ao conectar ao alphavolts.db:', err.message);
  } else {
    console.log('API conectada ao banco SQLite (alphavolts.db)!');
  }
});

// Rota 1: Última leitura registrada
app.get('/api/telemetria/ultima', (req, res) => {
  const sql = `
    SELECT id, tensao_v, corrente_a, potencia_w, consumo_kwh, rele_status, data_hora
    FROM telemetria_tomada
    ORDER BY id DESC
    LIMIT 1
  `;

  db.get(sql, [], (err, row) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }
    res.json(row || null);
  });
});

// Rota 2: Histórico das últimas N leituras (padrão: 30 registros)
app.get('/api/telemetria/historico', (req, res) => {
  const limite = parseInt(req.query.limite, 10) || 30;

  const sql = `
    SELECT id, tensao_v, corrente_a, potencia_w, consumo_kwh, rele_status, data_hora
    FROM telemetria_tomada
    ORDER BY id DESC
    LIMIT ?
  `;

  db.all(sql, [limite], (err, rows) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }
    // Inverte para ficar em ordem cronológica (mais antigo -> mais recente)
    res.json(rows.reverse());
  });
});

// Rota 3: Resumo / métricas acumuladas e médias
app.get('/api/telemetria/resumo', (req, res) => {
  const sql = `
    SELECT
      COUNT(*) AS total_leituras,
      MAX(consumo_kwh) AS consumo_max_kwh,
      AVG(potencia_w) AS potencia_media_w,
      MAX(potencia_w) AS potencia_max_w
    FROM telemetria_tomada
  `;

  db.get(sql, [], (err, row) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }
    res.json(row);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor API Alphavolts rodando em http://localhost:${PORT}`);
  console.log(`Rotas disponíveis:`);
  console.log(`  - http://localhost:${PORT}/api/telemetria/ultima`);
  console.log(`  - http://localhost:${PORT}/api/telemetria/historico?limite=30`);
  console.log(`  - http://localhost:${PORT}/api/telemetria/resumo`);
});