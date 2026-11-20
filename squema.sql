CREATE TABLE IF NOT EXISTS telemetria_tomada (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tensao_v DECIMAL(5, 2) NOT NULL,
    corrente_a DECIMAL(5, 2) NOT NULL,
    potencia_w DECIMAL(7, 2) NOT NULL,
    consumo_kwh DECIMAL(10, 6) NOT NULL,
    rele_status VARCHAR(5) NOT NULL,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para otimizar consultas do Dashboard por data/hora
CREATE INDEX idx_telemetria_data_hora ON telemetria_tomada(data_hora DESC);