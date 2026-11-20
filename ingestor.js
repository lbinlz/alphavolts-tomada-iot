const mqtt = require('mqtt');
const sqlite3 = require('sqlite3').verbose();

// 1. Cria e conecta ao banco de dados SQLite local (arquivo alphavolts.db)
const db = new sqlite3.Database('./alphavolts.db', (err) => {
  if (err) {
    console.error('Erro ao abrir o banco SQLite:', err.message);
  } else {
    console.log('Banco de dados SQLite (alphavolts.db) conectado com sucesso!');
  }
});

// 2. Cria a tabela automaticamente se ela ainda não existir
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS telemetria_tomada (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tensao_v REAL NOT NULL,
      corrente_a REAL NOT NULL,
      potencia_w REAL NOT NULL,
      consumo_kwh REAL NOT NULL,
      rele_status TEXT NOT NULL,
      data_hora DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Erro ao criar tabela:', err.message);
    } else {
      console.log('Tabela "telemetria_tomada" pronta para receber dados!');
    }
  });
});

// 3. Conecta ao Broker MQTT público usado no Wokwi
const mqttClient = mqtt.connect('ws://broker.hivemq.com:8000/mqtt');

mqttClient.on('connect', () => {
  console.log('Ingestor conectado ao Broker MQTT público!');
  mqttClient.subscribe('alphavolts/tomada/telemetria', (err) => {
    if (!err) {
      console.log('Aguardando dados do ESP32 no tópico: alphavolts/tomada/telemetria...\n');
    }
  });
});
mqttClient.on('error', (err) => {
  console.error('Erro na conexão MQTT:', err.message);
});
// 4. Recebe a mensagem do Wokwi e grava no SQLite
mqttClient.on('message', (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());
    console.log('Dados recebidos:', payload);

    const sql = `
      INSERT INTO telemetria_tomada (tensao_v, corrente_a, potencia_w, consumo_kwh, rele_status)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
      payload.tensao_V,
      payload.corrente_A,
      payload.potencia_W,
      payload.consumo_kWh,
      payload.rele_status
    ];

    db.run(sql, params, function(err) {
      if (err) {
        console.error('Erro ao inserir no SQLite:', err.message);
      } else {
        console.log(`Registro #${this.lastID} salvo no banco de dados com sucesso!\n`);
      }
    });
  } catch (e) {
    console.error('Erro ao processar JSON:', e.message);
  }
});