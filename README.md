# Morada

Aplicação web de busca de imóveis desenvolvida com Angular.

> ⚠️ Este projeto está em desenvolvimento. Algumas funcionalidades ainda não estão disponíveis e podem sofrer alterações.

## Funcionalidades atuais

- Busca de imóveis por localização, finalidade e filtros
- Listagem responsiva e mapa interativo
- Detalhes do imóvel com galeria, comodidades e custos
- Formulário demonstrativo de contato
- Avisos de disponibilidade em tempo real com reconexão automática
- API local com dados demonstrativos
- Execução como aplicação Angular ou microfrontend single-spa
- Testes automatizados, lint e formatação

Os imóveis, preços e contatos apresentados são fictícios e utilizados apenas para demonstração.

## Tecnologias

- Angular
- TypeScript
- SCSS
- Express
- single-spa
- Jasmine e Karma

## Disponibilidade em tempo real

Execute `npm start` para iniciar a aplicação e a API local.

Ao abrir `http://localhost:4200`, a aplicação estabelece uma conexão WebSocket
pelo caminho `/api/property-availability`. O servidor envia uma atualização
na conexão e depois a cada 10 segundos.

A atualização mais recente aparece em um aviso no canto inferior esquerdo.
Os eventos são sintéticos e não representam mudanças reais de disponibilidade.

Se a conexão for encerrada ou falhar, a aplicação tenta se reconectar após 1 segundo.
Após falhas consecutivas, o intervalo aumenta até 30 segundos. Uma atualização recebida
reinicia esse intervalo. Quando a API voltar, novas atualizações são recebidas sem
recarregar a página.

## Filtros na URL

Ao pesquisar, os filtros ficam registrados no endereço da página.
Você pode copiar esse endereço para compartilhar a busca ou abri-la novamente.

A localização, a finalidade, o tipo de imóvel, a quantidade mínima
de quartos e o preço máximo são restaurados ao carregar o endereço.

Os botões Voltar e Avançar do navegador recuperam as buscas anteriores.
Ao abrir um imóvel, o link “Voltar aos resultados” mantém os filtros
da busca de origem.

Valores padrão e campos vazios são omitidos da URL.
Parâmetros de filtro inválidos são tratados com valores padrão seguros.
