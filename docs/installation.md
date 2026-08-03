---
title: Installation
id: installation
---

You can install TanStack Store with any [NPM](https://npmjs.com) package manager.

## React

```sh
npm install @tanstack/react-store
```

TanStack Store is compatible with React v16.8+ and is currently only compatible with ReactDOM only. If you would like to contribute to the React Native adapter, please reach out to us on [Discord](https://tlinz.com/discord).

## Preact

```sh
npm install @tanstack/preact-store
```

TanStack Store is compatible with Preact 10+.

## Vue

```sh
npm install @tanstack/vue-store
```

TanStack Store is compatible with Vue 2 and 3.

## Angular

```sh
npm install @tanstack/angular-store
```

TanStack Store is compatible with Angular 19+

## SolidJS

```sh
npm install @tanstack/solid-store solid-js @solidjs/web
```

`@tanstack/solid-store` requires **SolidJS 2** (`>=2.0.0-beta.30 <3.0.0`). Solid 1 is
not supported. `@solidjs/web` is a peer dependency, so install it alongside `solid-js`
and keep the two on the same version.

Solid 2 changes when updates become observable — see the
[Solid 2 Guide](./framework/solid/guide/solid-2) for the timing contract.

There is no SolidStart release built on Solid 2 yet, so SolidStart apps are not
currently supported.

## Svelte

```sh
npm install @tanstack/svelte-store
```

TanStack Store is compatible with Svelte 5.

## Lit

```sh
npm install @tanstack/lit-store
```

TanStack Store is compatible with Lit 3.

## Octane

```sh
npm install @tanstack/octane-store
```

TanStack Store is compatible with Octane 0.1.21.
