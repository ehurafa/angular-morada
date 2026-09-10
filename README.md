# Morada

Aplicação web de busca de imóveis desenvolvida com Angular.

> ⚠️ Este projeto está em desenvolvimento. Algumas funcionalidades ainda não estão disponíveis e podem sofrer alterações.

## Funcionalidades atuais

- Busca de imóveis com filtros
- Listagem responsiva de resultados
- API local com dados demonstrativos
- Suporte para execução como aplicação Angular e microfrontend single-spa
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

A conexão ainda não possui reconexão automática. Caso a API seja reiniciada,
recarregue a página para conectar novamente.
