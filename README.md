# Breu Character Roller

Um gerador de personagens RPG para Breu construído com SvelteKit e implantado no Cloudflare Workers. Possui geração automática de atributos, detecção de morte com cronômetro regressivo e observabilidade abrangente.

[Compre o Seu Breu](https://luznegraeditora.com.br)

## Funcionalidades

- 🎲 **Geração Automática de Personagens**: Gera 6 atributos de RPG (FOR, DES, CON, INT, SAB, CAR) usando a regra 2d4.
- ⚰️ **Banner de Morte**: Mostra aviso quando os atributos do personagem estão muito baixos com cronômetro de regeneração automática
- 📊 **Monitoramento de Web Vitals**: Rastreia Core Web Vitals e métricas customizadas de RPG
- 🐛 **Rastreamento de Erros**: Monitoramento de erros no lado do cliente com Sentry (compatível com Cloudflare Workers)
- ♿ **Acessibilidade**: Suporte completo ao ARIA e compatibilidade com leitores de tela
- 🧪 **Testes Abrangentes**: Testes unitários e de integração com estratégias de mock

## Stack Tecnológica

- **Framework**: SvelteKit com Svelte 5 runes
- **Runtime**: Cloudflare Workers
- **Linguagem**: TypeScript
- **Testes**: Vitest
- **Observabilidade**: Sentry + Web Vitals
- **Qualidade de Código**: ESLint + Prettier + Husky pre-commit hooks

## Início Rápido

```bash
# Instalar dependências
bun install

# Iniciar servidor de desenvolvimento
bun run dev

# Executar testes
bun run test

# Build para produção
bun run build

# Deploy para Cloudflare Workers
bun run deploy
```

## Desenvolvimento

### Configuração do Ambiente

Copie `.env.example` para `.env` e configure:

```bash
# Opcional: DSN do Sentry para rastreamento de erros
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### Testes

```bash
# Executar todos os testes
bun run test

# Executar testes em modo watch
bun run test:watch

# Executar testes com cobertura
bun run test:coverage
```

### Qualidade de Código

Os pre-commit hooks executam automaticamente:
- ESLint para linting de código
- Prettier para formatação de código
- Verificação de tipos

## Arquitetura

### Separação Limpa de Responsabilidades

- **`src/lib/character-generator.ts`**: Lógica de negócio principal
- **`src/lib/types.ts`**: Definições TypeScript
- **`src/lib/web-vitals.ts`**: Monitoramento de performance
- **`src/routes/+page.svelte`**: Camada de apresentação
- **`src/tests/`**: Suíte de testes abrangente

### Compatibilidade com Cloudflare Workers

Este projeto é otimizado para deploy no Cloudflare Workers:
- Integração Sentry apenas no lado do cliente (lado do servidor não suportado em Workers)
- Configuração de runtime compatível com edge
- Bundle mínimo e cold starts rápidos

## Documentação

- [Especificação de Testes](docs/test-specification.md) - Estratégia de testes abrangente
- [Web Vitals](docs/web-vitals.md) - Detalhes do monitoramento de performance
- [Sentry + Cloudflare Workers](docs/sentry-cloudflare-workers.md) - Configuração de rastreamento de erros

## Deploy

Implantado no Cloudflare Workers com CI/CD automático. A aplicação inclui:
- Otimização de assets estáticos
- Cache de edge
- Distribuição CDN global
- Rastreamento de erros e monitoramento de performance em tempo real
