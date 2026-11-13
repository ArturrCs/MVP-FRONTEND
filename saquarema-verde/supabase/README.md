# Backend Supabase — passo a passo

1. Crie uma conta grátis em https://supabase.com e clique em **New project** (guarde a senha do banco).
2. Menu **SQL Editor → New query**, cole todo o conteúdo de `supabase/schema.sql` e clique **Run**.
   Isso cria as tabelas, as regras de segurança (RLS), o bucket de fotos `fotos` e as 12 atrações reais.
   Em seguida rode também `supabase/melhorias-v2.2.sql` (validações, histórico de alterações e proteção contra spam nos relatos).
3. (Opcional) Rode `supabase/demo-data.sql` para ter eventos/novidades de exemplo (dados inventados — apague antes de publicar).
4. Crie o administrador: **Authentication → Users → Add user → Create new user**, com e-mail e senha forte, marcando *Auto Confirm User*.
5. Dê o papel de admin a esse usuário (SQL Editor, trocando o e-mail):
   ```sql
   update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
   where email = 'SEU-EMAIL@exemplo.com';
   ```
6. Impeça cadastros públicos: **Authentication → Providers (ou Sign In / Up) → desligue "Allow new users to sign up"**.
7. Pegue as chaves em **Project Settings → API**: copie *Project URL* e a chave *anon public*.
8. Na pasta `saquarema-verde`, copie `.env.example` para `.env` e preencha as duas variáveis. **Nunca** use a chave `service_role`.
9. `npm install` e `npm run dev`. Sem o `.env`, o site abre em modo demonstração (somente leitura).
10. Na hospedagem (ex.: Vercel), cadastre as mesmas duas variáveis em *Environment Variables*.

Observações: faça login de novo se alterar o papel do usuário; fotos apagadas no painel deixam de aparecer no site, mas o arquivo continua no Storage (pode limpar em Storage → fotos).
