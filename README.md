# Código de portfólio

Coleção de exemplos em JavaScript voltados a recursos comuns em aplicações de comunidade: economia virtual, ranking de atividade e atendimento por tickets.

Os módulos foram separados da camada de interface para destacar regras de negócio, validações e contratos simples de integração. Eles não dependem de IDs de servidores, tokens, variáveis de ambiente ou dados de usuários.

## Exemplos

- [`examples/economy-service.js`](examples/economy-service.js): carteira, banco, recompensa diária, transferências e compra de itens.
- [`examples/ranking-service.js`](examples/ranking-service.js): XP com cooldown, níveis, ranking paginado e distribuição de posições.
- [`examples/ticket-service.js`](examples/ticket-service.js): abertura, atribuição e encerramento de tickets com regras de acesso.
- [`docs/coverage.md`](docs/coverage.md): mapa completo dos domínios cobertos no portfólio.

## Executar os testes

```bash
npm test
```

---

[GitHub](https://github.com/frsttw) · [Website](https://frstt.dev) · [Email](mailto:joao141-2012@hotmail.com)
