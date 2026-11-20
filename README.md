# Alphavolts — Sistema IoT de Eficiência Energética e Tomada Inteligente

> **Projeto Integrador Acadêmico — Internet das Coisas (IoT)**  
> Desenvolvido sob a identidade técnica **Alphavolts Soluções Elétricas**.

---

## Sobre o Projeto

O **Sistema de Eficiência Energética e Tomada Inteligente Alphavolts** é uma solução completa de Internet das Coisas (IoT) ponta a ponta projetada para monitorar o consumo elétrico em tempo real, calcular o custo financeiro automático com base na tarifa local (R$/kWh), persistir históricos de medição e permitir o acionamento remoto de cargas elétricas à distância.

### Principais Funcionalidades
- **Telemetria em Tempo Real:** Leitura contínua de Tensão AC (V), Corrente Elétrica (A), Potência Ativa (W) e Consumo Acumulado (kWh).
- **Cálculo Financeiro Dinâmico:** Conversão instantânea do consumo energético em custo financeiro (R$) conforme a tarifa configurável pelo usuário.
- **Acionamento Remoto Bidirecional:** Controle de estado da tomada (`ON` / `OFF`) via interface web com resposta imediata no microcontrolador.
- **Persistência de Dados:** Ingestão automática de mensagens MQTT em banco de dados relacional SQLite (`alphavolts.db`).
- **API REST & Dashboard Interativo:** Visualização gráfica em tempo real, resumo estatístico histórico e tabela de auditoria de leituras.

---

## Arquitetura do Sistema

O projeto é estruturado em quatro camadas integradas:

```text
[ Camada de Borda (Wokwi / ESP32) ]
       │  Publica telemetria (JSON) & Escuta comandos (ON/OFF)
       ▼
[ Broker MQTT Público (broker.hivemq.com) ]
       ├──► Porta 1883 (TCP) ──► [ Ingestor Node.js (ingestor.js) ] ──► [ Banco SQLite (alphavolts.db) ]
       │                                                                          │
       │                                                                  [ API REST (server.js) ]
       │                                                                          │
       └──► Porta 8000 (WebSockets /mqtt) ──► [ Dashboard Web (index.html) ] ◄────┘