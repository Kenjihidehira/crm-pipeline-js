# CRM Funil de Vendas JS

[![CI](https://github.com/Kenjihidehira/crm-pipeline-js/actions/workflows/ci.yml/badge.svg)](https://github.com/Kenjihidehira/crm-pipeline-js/actions/workflows/ci.yml)

CRM comercial com funil de vendas, previsão e movimentação por arrastar e soltar.

## Persistência local segura

O módulo `storage.js` centraliza leitura e escrita no `localStorage`, valida o formato salvo, recupera JSON corrompido sem derrubar a interface e trata falhas de quota. Os cenários negativos são executados por `npm test` e pela CI.

## Funcionalidades

- Cadastro de oportunidades
- Funil com 5 etapas comerciais
- Arrastar e soltar entre etapas
- Probabilidade ajustada conforme avanço no funil
- Previsão ponderada por probabilidade
- Métricas do funil, previsão, ganhos e probabilidade média
- Filtros por responsável, segmento e busca
- Ordenação por valor, data de acompanhamento ou probabilidade
- Agenda de acompanhamentos críticos
- Exportação CSV
- Persistência com `localStorage`

## Como rodar

Abra o arquivo `index.html` no navegador.

## Tecnologias

- HTML5
- CSS3
- JavaScript
- API de arrastar e soltar
- localStorage
- Blob API
