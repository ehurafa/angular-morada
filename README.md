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
Quando a API voltar, novas atualizações são recebidas sem recarregar a página.
