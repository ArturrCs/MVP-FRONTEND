# Saquarema Verde Online

Site de turismo verde de Saquarema (RJ), com informações sobre parques, trilhas, cachoeiras e biodiversidade, e um painel para administradores.

## Integrantes

- Nome do integrante 1
- Nome do integrante 2
- Nome do integrante 3

> Substitua pelos nomes reais da equipe.

## Situação-Problema escolhida

**Situação-Problema #3: Circuito Saquarema Verde.**
Divulgar e organizar a visitação ao Parque Estadual da Costa do Sol (PECS) e à Reserva Ecológica Estadual de Jacarepiá (REE), com gestão de disponibilidade, desempenho rápido, interface intuitiva, segurança dos dados e login para administradores.

## Tecnologias utilizadas

| Tecnologia | Para que serve |
|---|---|
| **React 18** | Construção das telas e componentes |
| **Vite 5** | Servidor de desenvolvimento e build rápido |
| **React Router 6** | Navegação entre as páginas, com carregamento sob demanda (lazy) das telas de login e painel |
| **CSS próprio** | Layout responsivo (celular e computador), efeito de vidro (blur), modo de alto contraste e ajuste do tamanho da fonte |
| **Supabase** (Postgres, Auth e Storage) | Banco de dados, login de administrador e fotos. Veja `supabase/LEIA-ME.md` |
| **Open-Meteo** | Previsão do tempo em cada atração (API gratuita) |
| **Google Fonts e Google Maps** | Fonte do site e links "Abrir no Google Maps" |

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

### Ativar o banco de dados e o login de administrador (opcional)

Siga o passo a passo de `supabase/LEIA-ME.md`: criar o projeto no Supabase, rodar `supabase/schema.sql`, criar o usuário administrador e copiar `.env.example` para `.env` com a URL e a chave `anon public`.

## Informações adicionais

- **Segurança:** o painel só aceita contas com papel `admin`. As regras do banco (Row Level Security) impedem que visitantes alterem conteúdo ou leiam relatos. Cadastro público de usuários deve ficar desligado. A chave `service_role` nunca deve ser usada no site, e o arquivo `.env` não vai para o GitHub.
- **Acessibilidade:** botão no canto inferior direito para alto contraste e tamanho da fonte.
- **Desempenho:** fotos reduzidas antes do envio, páginas administrativas carregadas só quando necessárias, cabeçalho que se oculta ao rolar no celular.
- **Dados das atrações:** foram pesquisados em fontes públicas (decreto de criação do PECS, INEA e guias de turismo), com as fontes listadas no perfil de cada atração. Horários, distâncias e regras marcados como "A confirmar" ou "Consulte a administração" devem ser validados com o INEA e a Prefeitura. As imagens atuais são ilustrações; devem ser trocadas por fotos com direito de uso.
- **Dados de exemplo:** `supabase/demo-data.sql` traz eventos e novidades inventados, só para teste.
- **Favoritos e inscrição em eventos:** ficam guardados apenas no navegador do visitante.

## MVP definido

O MVP é o **frontend do portal** com as funções mínimas para validar a ideia:

- Página inicial com destaques, avisos, novidades e próximos eventos.
- Lista de atrações com filtros por área e tipo, e perfil de cada uma (galeria, dificuldade, previsão do tempo, dicas, regras, fontes, mapa e compartilhamento no WhatsApp).
- Eventos com botão de participar, que levam o evento para "Meu roteiro".
- "Meu roteiro" com atrações e eventos favoritos.
- Relato de problemas na trilha pelo visitante.
- Login de administrador e painel para gerenciar atrações, avisos, eventos, temporadas, novidades, fotos e relatos, com painel de números.

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
