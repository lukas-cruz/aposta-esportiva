-- Seed Data: Example bets to populate the database
-- Note: Dates are relative to the current time

INSERT INTO apostas (data, esporte, liga, jogo, tipo_aposta, odd, valor_apostado, resultado, lucro_prejuizo, observacoes)
VALUES 
('2024-03-01', 'Futebol', 'Champions League', 'Real Madrid vs Man City', 'Vencedor 1', 2.10, 100.00, 'ganhou', 110.00, 'Jogo de ida'),
('2024-03-02', 'Basquete', 'NBA', 'Lakers vs Warriors', 'Over 220.5', 1.90, 50.00, 'perdeu', -50.00, 'LeBron fora'),
('2024-03-03', 'Tênis', 'ATP 1000', 'Alcaraz vs Sinner', 'Vencedor 2', 2.50, 30.00, 'ganhou', 45.00, 'Sinner em ótima fase'),
('2024-03-04', 'Futebol', 'Premier League', 'Liverpool vs Arsenal', 'Ambos Marcam', 1.80, 80.00, 'ganhou', 64.00, 'Clássico ofensivo'),
('2024-03-05', 'Futebol', 'La Liga', 'Barcelona vs Atletico', 'Empate', 3.40, 20.00, 'perdeu', -20.00, 'Gol no último minuto'),
('2024-03-06', 'MMA', 'UFC', 'Pereira vs Hill', 'KO Round 1', 4.00, 10.00, 'ganhou', 30.00, 'Mãos de pedra'),
('2024-03-07', 'Futebol', 'Brasileirão', 'Flamengo vs Palmeiras', 'Vencedor 1', 2.00, 150.00, 'ganhou', 150.00, 'Maracanã lotado');
