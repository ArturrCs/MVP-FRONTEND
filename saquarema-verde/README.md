# Saquarema Verde Online

Site de turismo verde de Saquarema (RJ), com informações sobre parques, trilhas, cachoeiras e biodiversidade, e um painel para administradores.

## Integrantes

   Artur Camelo da Silva

## Situação-Problema escolhida

**Situação-Problema #3: Circuito Saquarema Verde.**
Divulgar e organizar a visitação ao Parque Estadual da Costa do Sol (PECS) e à Reserva Ecológica Estadual de Jacarepiá (REE), com gestão de disponibilidade, desempenho rápido, interface intuitiva, segurança dos dados e login para administradores.

## Tecnologias utilizadas

| Tecnologia | Para que serve |
|---|---|
| **JavaScript (ES6+)** | Linguagem do frontend |
| **React 18** | Construção das telas e componentes |
| **Vite 5** | Servidor de desenvolvimento e build rápido |
| **React Router 6** | Navegação entre as páginas, com carregamento sob demanda (lazy) das telas de login e painel |
| **CSS próprio** | Layout responsivo (celular e computador), efeito de vidro (blur), modo de alto contraste e ajuste do tamanho da fonte |
| **Supabase** (Postgres, Auth e Storage) | Backend: banco de dados, login de administrador, regras de acesso e fotos. Veja `supabase/README.md` |
| **PostgreSQL / SQL** | Linguagem do backend: tabelas, regras de acesso, validações e gatilhos (pasta `supabase/`) |
| **Open-Meteo** | Previsão do tempo em cada atração (API gratuita) |
| **Google Fonts e Google Maps** | Fonte do site e links "Abrir no Google Maps" |
| **WhatsApp (link de compartilhamento)** | Botão para compartilhar uma atração |

## Como executar o MVP

Requisito: [Node.js](https://nodejs.org) 18 ou superior.

1. Extraia o projeto e abra a pasta `saquarema-verde` no terminal (no Windows, use o Prompt de Comando ou libere scripts no PowerShell).
2. Instale as dependências:
   ```
   npm install
   ```
3. Inicie o site:
   ```
   npm run dev
   ```
4. Abra no navegador o endereço mostrado no terminal (normalmente http://localhost:5173).

Sem configurar nada, o site abre em **modo demonstração**: mostra dados de exemplo e não salva alterações.

Para gerar a versão final: `npm run build` (a pasta `dist` é a que vai para a hospedagem).

### Ativar o backend (banco de dados e login de administrador)

Siga o passo a passo de `supabase/README.md`: criar o projeto no Supabase, rodar `supabase/schema.sql` e depois `supabase/melhorias-v2.2.sql`, criar o usuário administrador e copiar `.env.example` para `.env` com a URL do projeto e a chave `anon public`.

## Backend

O backend usa o Supabase (banco PostgreSQL, autenticação e armazenamento de fotos). Toda a estrutura está em arquivos SQL na pasta `supabase/`:

| Arquivo | O que faz |
|---|---|
| `schema.sql` | Cria as tabelas, as regras de acesso (Row Level Security), o bucket de fotos e as atrações reais |
| `melhorias-v2.2.sql` | Validações no banco, histórico de alterações e proteção contra spam nos relatos |
| `demo-data.sql` | Dados de exemplo (opcional) |

- **Login de administrador:** feito pelo Supabase Auth, com e-mail e senha. Só entram no painel contas com o papel `admin`, e o cadastro público fica desligado.
- **Criar, atualizar e deletar:** pelo painel, o administrador cria, edita e apaga atrações, eventos, temporadas, novidades e avisos, e marca como resolvidos ou apaga os relatos.
- **Regras de acesso no banco:** visitantes só leem o conteúdo e enviam relatos. Qualquer escrita é conferida pelo próprio banco, que só aceita o papel `admin`, mesmo que a requisição não venha do site.
- **Validações:** o banco recusa dados inválidos, como temporada com fim antes do início, status fora da lista ou nome vazio.
- **Histórico de alterações (auditoria):** gatilhos registram quem criou, alterou ou apagou cada item e quando. O painel mostra as 50 ações mais recentes na seção "Histórico".
- **Proteção contra spam nos relatos:** limite de 5 relatos por hora por endereço IP, 60 por hora no total e bloqueio de relato repetido em menos de 10 minutos. O IP não é guardado, apenas um código (hash) usado na contagem.

## Informações adicionais

- **Segurança:** o painel só aceita contas com papel `admin`. As regras do banco (Row Level Security) impedem que visitantes alterem conteúdo ou leiam relatos. Cadastro público de usuários deve ficar desligado. A chave `service_role` nunca deve ser usada no site, e o arquivo `.env` não vai para o GitHub.
- **Acessibilidade:** botão no canto inferior direito para alto contraste e tamanho da fonte.
- **Desempenho:** fotos reduzidas antes do envio, páginas administrativas carregadas só quando necessárias, cabeçalho que se oculta ao rolar no celular.
- **Dados das atrações:** foram pesquisados em fontes públicas (decreto de criação do PECS, INEA e guias de turismo), com as fontes listadas no perfil de cada atração. Horários, distâncias e regras marcados como "A confirmar" ou "Consulte a administração" devem ser validados com o INEA e a Prefeitura.
- **Fotos:** as capas das atrações são enviadas pelo painel e ficam no Storage do Supabase. Atrações sem foto mostram uma ilustração padrão. Em uma publicação aberta ao público, use apenas fotos com direito de uso.
- **Dados de exemplo:** as atrações são reais. Os eventos, temporadas, novidades e o aviso exibidos vêm de `supabase/demo-data.sql` e são fictícios, mantidos apenas para demonstrar as funcionalidades. Devem ser apagados antes de uma publicação aberta ao público.
- **Favoritos e inscrição em eventos:** ficam guardados apenas no navegador do visitante.

## MVP definido

O MVP é o **portal completo, com frontend e backend**, com as funções mínimas para validar a ideia:

- Página inicial com destaques, avisos, novidades e próximos eventos.
- Lista de atrações com filtros por área e tipo, e perfil de cada uma (galeria, dificuldade, previsão do tempo, dicas, regras, fontes, mapa e compartilhamento no WhatsApp).
- Eventos com botão de participar, que levam o evento para "Meu roteiro".
- "Meu roteiro" com atrações e eventos favoritos.
- Relato de problemas na trilha pelo visitante.
- Login de administrador e painel para gerenciar atrações, avisos, eventos, temporadas, novidades, fotos e relatos, com painel de números e histórico de alterações.

## Objetivos e benefícios

**Objetivos**
- Concentrar em um só lugar informações confiáveis sobre o Circuito Saquarema Verde.
- Dar ao gestor uma forma simples de atualizar a disponibilidade das atrações.
- Incentivar a visitação consciente e a conservação das unidades de conservação.

**Benefícios**
- Visitante: planeja o passeio sabendo o que está aberto, a dificuldade, o clima e as regras.
- Gestão: atualiza status, horários, eventos e avisos sem depender de programador, e recebe relatos de problemas nas trilhas.
- Segurança: os avisos e as regras reduzem riscos para quem visita.
- Turismo local: divulga trilhas, cachoeiras e eventos de Saquarema.

## Público-alvo

- Turistas e moradores que gostam de natureza, trilhas e ecoturismo.
- Famílias e grupos que buscam passeios ao ar livre.
- Estudantes e pesquisadores interessados em biodiversidade.
- Gestores e equipes das unidades de conservação e da Prefeitura (administradores do site).

## Dores do público-alvo

**Visitantes**
- Informação espalhada e desatualizada sobre o que está aberto e em que horário.
- Falta de clareza sobre dificuldade, distância, condição da trilha e regras.
- Dificuldade para chegar ao local e para saber o clima antes de ir.
- Poucas formas de relatar problemas encontrados nas trilhas.

**Gestores**
- Dificuldade para comunicar mudanças de última hora (trilha interditada, evento cancelado).
- Falta de uma ferramenta simples e segura para atualizar o conteúdo.
- Pouca visibilidade dos problemas que acontecem nas trilhas.
