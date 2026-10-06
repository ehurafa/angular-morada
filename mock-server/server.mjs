import express from 'express';
import { extname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createApp } from './app.mjs';
import { PROPERTIES } from './data/properties.mjs';
import { createPropertyAvailabilityServer } from './realtime/property-availability-server.mjs';

const port = Number(process.env.PORT ?? 3000);

const app = createApp({
  properties: PROPERTIES,
});

const browserDirectory = fileURLToPath(new URL('../dist/morada/browser/', import.meta.url));

app.use(express.static(browserDirectory));

app.get(/^\/(?!api(?:\/|$)).*/, (request, response, next) => {
  if (extname(request.path)) {
    next();
    return;
  }

  response.sendFile('index.html', { root: browserDirectory });
});

const hostname = process.env.HOST ?? '127.0.0.1';

const server = app.listen(port, hostname, () => {
  console.log(`Morada disponível em ${hostname}:${port}`);
  console.log('Atualizações disponíveis em /api/property-availability');
});

const availabilityServer = createPropertyAvailabilityServer({
  server,
  properties: PROPERTIES,
});

let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  console.log(`\n${signal} recebido. Encerrando a API...`);

  try {
    await availabilityServer.close();

    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    console.log('API encerrada.');
  } catch (error) {
    console.error('Não foi possível encerrar a API corretamente.', error);
    process.exitCode = 1;
  }
}

process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));
