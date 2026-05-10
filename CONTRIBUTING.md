# Contributing

## Runtime choice

This repo starts with plain Node.js CommonJS for speed.

Reason:
- lower setup friction
- easy local execution
- fast prototyping while the contracts and engine are still moving

If the project earns the extra complexity later, it can move to TypeScript.
Not before.

## Working rules

- keep decision logic inside `packages/engine`
- keep adapters dumb and normalization-focused
- do not let Telegram or Home Assistant surfaces fork payload shapes
- every recommendation must be explainable
- test ranking behavior with fixtures before adding UI
