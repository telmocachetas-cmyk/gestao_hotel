# Solar do Mar — Gestão Hoteleira

Aplicação web demonstrativa para gerir os quartos e as reservas do hotel fictício Solar do Mar, em Portimão. A interface funciona no navegador e não necessita de instalação de dependências.

## Funcionalidades

- **Gestão de quartos:** consulta dos quartos, filtragem por tipo e estado, alteração do estado e adição de quartos de exemplo.
- **Reservas:** listagem e cancelamento de reservas, criação de novas reservas e cálculo do preço estimado por estadia.
- **Tarifas sazonais:** ajuste do preço por noite conforme a época alta, normal ou baixa.
- **Disponibilidade:** calendário de consulta no formulário de reserva.
- **Dashboard:** indicadores de ocupação, reservas e receitas, gráficos mensais, resumo de quartos e exportação dos dados do dashboard para CSV.
- **Informação do hotel:** secção com detalhes e galeria do Solar do Mar.
- **Interface adaptável:** apresentação ajustada a ecrãs de diferentes dimensões.

## Tecnologias

- HTML5
- CSS3
- JavaScript (sem frameworks)
- Canvas API para os gráficos do dashboard

## Executar localmente

É necessário um navegador moderno. Não é preciso instalar pacotes ou dependências.

1. Clona o repositório e entra na pasta do projeto:

   ```bash
   git clone https://github.com/telmocachetas-cmyk/gestao_hotel.git
   cd gestao_hotel
   ```

2. Inicia um servidor web local:

   ```bash
   py -m http.server 8000
   ```

   Se o comando `py` não estiver disponível, experimenta `python -m http.server 8000`.

3. Abre [http://localhost:8000](http://localhost:8000) no navegador. Para parar o servidor, usa `Ctrl+C` no terminal.

Também podes abrir o ficheiro `index.html` diretamente no navegador; o servidor local é recomendado para uma experiência mais consistente.

## Publicar com GitHub Pages

Como o `index.html` está na raiz e o projeto é estático, pode ser publicado sem um processo de build:

1. No GitHub, abre **Settings → Pages** do repositório.
2. Em **Build and deployment**, escolhe **Deploy from a branch**.
3. Seleciona a branch `main` e a pasta `/(root)`, e guarda.
4. Quando a publicação terminar, abre o endereço indicado na página do GitHub Pages.

## Dados de demonstração

Os quartos, tarifas e reservas iniciais estão definidos em `js/data.js`. A aplicação não tem backend nem base de dados: as alterações feitas durante a utilização ficam apenas na memória do navegador e são repostas ao atualizar a página. O formulário de datas está limitado ao ano de 2025.
