-- =====================================================================
-- DADOS DE EXEMPLO (opcional): atrações, eventos, temporadas, novidades e aviso INVENTADOS
-- para testar o site. NÃO publique estes dados: apague-os pelo painel admin.
-- Rode UMA vez, depois do schema.sql.
-- =====================================================================

insert into public.attractions (id, name, area, type, difficulty, distance, hours, status, trail_condition, description, tips, rules, image, location, address, gallery, sources) values
  (1, 'Trilha da Restinga', 'PECS', 'Trilha', 'Fácil', '3 km', '08h–16h', 'Aberta', 'Seca e bem sinalizada', 'Caminhada leve entre vegetação de restinga, ideal para observar aves e plantas nativas.', 'Leve água, protetor solar e use calçado fechado.', 'Proibido deixar lixo, alimentar animais ou retirar plantas.', '/img/trilha.svg', 'Parque Estadual da Costa do Sol, Saquarema, RJ', '', '[]'::jsonb, '[]'::jsonb),
  (2, 'Mirante da Serra', 'REE Jacarepiá', 'Trilha', 'Moderada', '6 km', '07h–15h', 'Atenção', 'Trecho escorregadio após chuva', 'Subida com vista panorâmica das lagoas e do litoral de Saquarema.', 'Evite dias de chuva e inicie cedo para voltar antes do fim da tarde.', 'Visitação com registro na portaria. Grupos de até 10 pessoas.', '/img/trilha.svg', 'Reserva Ecológica Estadual de Jacarepiá, Saquarema, RJ', '', '[]'::jsonb, '[]'::jsonb),
  (3, 'Cachoeira do Vale', 'REE Jacarepiá', 'Cachoeira', 'Moderada', '4 km', '08h–15h', 'Aberta', 'Boa, com volume de água médio', 'Queda d''água cercada de Mata Atlântica, com poço para contemplação.', 'Não pule nas pedras; a superfície é lisa.', 'Não é permitido som alto nem sabão/repelente na água.', '/img/cachoeira.svg', 'Reserva Ecológica Estadual de Jacarepiá, Saquarema, RJ', '', '[]'::jsonb, '[]'::jsonb),
  (4, 'Observação de Aves', 'PECS', 'Biodiversidade', 'Fácil', '2 km', '06h–10h', 'Aberta', 'Ótima para observação pela manhã', 'Roteiro curto para registrar aves, borboletas e outros animais da região.', 'Fale baixo, use roupas de cores neutras e leve binóculos.', 'Proibido o uso de drones.', '/img/biodiversidade.svg', 'Parque Estadual da Costa do Sol, Saquarema, RJ', '', '[]'::jsonb, '[]'::jsonb)
on conflict (id) do nothing;

insert into public.events (title, event_date, event_time, place, status) values
  ('Mutirão de Limpeza da Restinga', '2026-11-21', '08h–12h', 'PECS', 'Aberto'),
  ('Caminhada Noturna com Guia', '2026-12-05', '18h–21h', 'REE Jacarepiá', 'Lotado'),
  ('Oficina de Observação de Aves', '2026-12-12', '06h–09h', 'PECS', 'Aberto');

insert into public.seasons (name, date_from, date_to, hours) values
  ('Alta temporada (verão)', '2026-12-15', '2027-03-15', '07h–17h'),
  ('Baixa temporada', '2027-03-16', '2027-12-14', '08h–16h');

insert into public.news (title, body) values
  ('Trilha do Mirante com trecho em manutenção', 'Equipe do parque faz reparos na escadaria. Use o acesso alternativo.'),
  ('Novas regras de visitação', 'Grupos acima de 10 pessoas precisam agendar com antecedência.');

insert into public.alerts (message, active) values
  ('Trilha do Mirante com trecho em manutenção: use o acesso alternativo.', true);
