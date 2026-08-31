import { createApp } from './app.mjs';
import { PROPERTIES } from './data/properties.mjs';

const port = Number(process.env.PORT ?? 3000);

const app = createApp({
  properties: PROPERTIES,
});

const server = app.listen(port, '127.0.0.1', () => {
  console.log(`Morada API disponível em http://localhost:${port}`);
});

function shutdown(signal) {
  console.log(`\n${signal} recebido. Encerrando a API...`);

  server.close((error) => {
    if (error) {
      console.error('Não foi possível encerrar a API corretamente.', error);
      process.exitCode = 1;
      return;
    }

    console.log('API encerrada.');
  });
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
