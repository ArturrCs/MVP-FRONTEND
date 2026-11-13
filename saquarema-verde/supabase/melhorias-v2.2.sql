-- =====================================================================
-- Saquarema Verde Online — melhorias do backend (v2.2)
-- Como usar: Supabase > SQL Editor > New query > cole este arquivo > Run.
-- Rode DEPOIS do schema.sql. É seguro rodar mais de uma vez.
--
--   1. Validações no banco (dados inválidos são recusados mesmo fora do site)
--   2. Histórico de alterações (auditoria): quem criou, alterou ou apagou o quê
--   3. Proteção contra spam nos relatos de visitantes
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. VALIDAÇÕES
-- "not valid" = vale para tudo que for criado ou alterado daqui em diante,
-- sem travar a instalação caso já exista algum registro antigo fora do padrão.
-- ---------------------------------------------------------------------
alter table public.attractions drop constraint if exists attractions_nome_ok;
alter table public.attractions add constraint attractions_nome_ok
  check (char_length(btrim(name)) between 1 and 200) not valid;
alter table public.attractions drop constraint if exists attractions_status_ok;
alter table public.attractions add constraint attractions_status_ok
  check (status in ('Aberta', 'Atenção', 'Fechada')) not valid;
alter table public.attractions drop constraint if exists attractions_dificuldade_ok;
alter table public.attractions add constraint attractions_dificuldade_ok
  check (difficulty in ('Fácil', 'Moderada', 'Difícil', 'Variada')) not valid;
alter table public.attractions drop constraint if exists attractions_tipo_ok;
alter table public.attractions add constraint attractions_tipo_ok
  check (type in ('Trilha', 'Cachoeira', 'Biodiversidade', 'Parque', 'Mirante', 'Praia')) not valid;

alter table public.events drop constraint if exists events_titulo_ok;
alter table public.events add constraint events_titulo_ok
  check (char_length(btrim(title)) between 1 and 200) not valid;
alter table public.events drop constraint if exists events_status_ok;
alter table public.events add constraint events_status_ok
  check (status in ('Aberto', 'Lotado', 'Cancelado')) not valid;

alter table public.seasons drop constraint if exists seasons_nome_ok;
alter table public.seasons add constraint seasons_nome_ok
  check (char_length(btrim(name)) between 1 and 200) not valid;
alter table public.seasons drop constraint if exists seasons_datas_ok;
alter table public.seasons add constraint seasons_datas_ok
  check (date_to >= date_from) not valid;

alter table public.news drop constraint if exists news_titulo_ok;
alter table public.news add constraint news_titulo_ok
  check (char_length(btrim(title)) between 1 and 200) not valid;
alter table public.news drop constraint if exists news_texto_ok;
alter table public.news add constraint news_texto_ok
  check (char_length(body) <= 5000) not valid;

alter table public.alerts drop constraint if exists alerts_mensagem_ok;
alter table public.alerts add constraint alerts_mensagem_ok
  check (char_length(btrim(message)) between 1 and 300) not valid;

alter table public.reports drop constraint if exists reports_status_ok;
alter table public.reports add constraint reports_status_ok
  check (status in ('Novo', 'Resolvido')) not valid;

-- ---------------------------------------------------------------------
-- 2. HISTÓRICO DE ALTERAÇÕES (AUDITORIA)
-- Cada criação, alteração ou exclusão feita no conteúdo do site gera uma
-- linha aqui, automaticamente, por gatilho (trigger). Ninguém escreve nesta
-- tabela pela API: só o gatilho. Só o administrador lê.
-- ---------------------------------------------------------------------
create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  table_name text not null,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  row_id bigint,
  label text not null default '',
  user_email text not null default '',
  changes jsonb,
  changed_at timestamptz not null default now()
);
create index if not exists audit_log_changed_idx on public.audit_log (changed_at desc);

create or replace function public.log_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  old_j jsonb;
  new_j jsonb;
  src jsonb;
  diff jsonb;
begin
  if tg_op = 'INSERT' then
    new_j := to_jsonb(new);
  elsif tg_op = 'UPDATE' then
    old_j := to_jsonb(old);
    new_j := to_jsonb(new);
    -- guarda só os campos que mudaram: {"campo": {"de": ..., "para": ...}}
    select jsonb_object_agg(n.key, jsonb_build_object('de', old_j -> n.key, 'para', n.value))
      into diff
      from jsonb_each(new_j) as n
      where n.value is distinct from old_j -> n.key;
    if diff is null then return null; end if;  -- nada mudou de verdade
  else
    old_j := to_jsonb(old);
  end if;

  src := coalesce(new_j, old_j);
  -- relatos podem ter contato do visitante: não copiamos o texto para o histórico
  if tg_table_name = 'reports' and diff is not null then
    diff := diff - 'body' - 'contact' - 'sender_hash';
  end if;

  insert into public.audit_log (table_name, action, row_id, label, user_email, changes)
  values (
    tg_table_name,
    tg_op,
    (src ->> 'id')::bigint,
    left(coalesce(src ->> 'name', src ->> 'title', src ->> 'message', src ->> 'place', ''), 200),
    coalesce(auth.jwt() ->> 'email', 'Painel do Supabase (SQL)'),
    diff
  );
  return null;
end $$;

do $$
declare t text;
begin
  foreach t in array array['attractions', 'events', 'seasons', 'news', 'alerts'] loop
    execute format('drop trigger if exists audit_%I on public.%I', t, t);
    execute format('create trigger audit_%I after insert or update or delete on public.%I for each row execute function public.log_audit()', t, t);
  end loop;
end $$;

-- Relatos: registra só o que o admin faz (resolver / excluir), não cada envio de visitante.
drop trigger if exists audit_reports on public.reports;
create trigger audit_reports after update or delete on public.reports
  for each row execute function public.log_audit();

alter table public.audit_log enable row level security;
revoke all on public.audit_log from anon, authenticated;
grant select on public.audit_log to authenticated;
drop policy if exists "admin le historico" on public.audit_log;
create policy "admin le historico" on public.audit_log
  for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------
-- 3. PROTEÇÃO CONTRA SPAM NOS RELATOS
-- O formulário "Relatar problema" é público. Este gatilho roda ANTES de
-- cada envio e recusa:
--   - mais de 5 relatos por hora vindos do mesmo endereço (IP);
--   - mais de 60 relatos por hora no total (trava de segurança);
--   - o mesmo relato repetido em menos de 10 minutos.
-- O IP não é guardado: só um código (hash SHA-256) usado para contar.
-- ---------------------------------------------------------------------
alter table public.reports add column if not exists sender_hash text;
create index if not exists reports_sender_idx on public.reports (sender_hash, created_at desc);

create or replace function public.guard_report()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  h json := nullif(current_setting('request.headers', true), '')::json;
  ip text := coalesce(h ->> 'cf-connecting-ip', btrim(split_part(h ->> 'x-forwarded-for', ',', 1)), '');
begin
  new.place := btrim(new.place);
  new.body := btrim(new.body);
  new.contact := btrim(new.contact);

  if public.is_admin() then return new; end if;

  -- o visitante não escolhe estes campos
  new.created_at := now();
  new.sender_hash := case when ip <> '' then encode(sha256(convert_to(ip, 'UTF8')), 'hex') end;

  if new.sender_hash is not null and (
    select count(*) from public.reports r
    where r.sender_hash = new.sender_hash and r.created_at > now() - interval '1 hour'
  ) >= 5 then
    raise exception 'Muitos relatos enviados. Tente novamente mais tarde.';
  end if;

  if (select count(*) from public.reports r where r.created_at > now() - interval '1 hour') >= 60 then
    raise exception 'Muitos relatos enviados. Tente novamente mais tarde.';
  end if;

  if exists (
    select 1 from public.reports r
    where r.place = new.place and r.body = new.body and r.created_at > now() - interval '10 minutes'
  ) then
    raise exception 'Este relato já foi enviado. Obrigado!';
  end if;

  return new;
end $$;

drop trigger if exists guard_report on public.reports;
create trigger guard_report before insert on public.reports
  for each row execute function public.guard_report();

-- Estas funções só servem aos gatilhos: ninguém as chama pela API.
revoke execute on function public.log_audit() from public, anon, authenticated;
revoke execute on function public.guard_report() from public, anon, authenticated;
