# Context binding benchmark

This directory contains a simple benchmarking to measure the performance of two
context bindings.

1. Use provider class

```ts
/**
 * First option - use a provider class
 */
class GreetingProvider implements Provider<string> {
  @inject('user')
  private user: string;

  value() {
    return `Hello, ${this.user}`;
  }
}
```

2. Use dynamic value

```ts
/**
 * Second option - use a factory function
 */
const factory: ValueFactory = _ctx => {
  const user = _ctx.getSync('user');
  return `Hello, ${user}`;
};
```

3. Set up bindings

```ts
function setupContextBindings() {
  const ctx = new Context();
  ctx.bind('user').to('John');
  ctx.bind('greeting1').toDynamicValue(factory);
  ctx.bind('greeting2').toProvider(GreetingProvider);
  return ctx;
}
```

## Basic use

```sh
npm run -s benchmark:context // default to 1000 runs
```

For example:

```
npm run -s benchmark:context -- 1000
```

## Base lines

| name     | duration (ns) | count  |
| -------- | ------------- | ------ |
| factory  | 0,1168336     | 100    |
| provider | 0,3134085     | 100    |
| factory  | 0,6276707     | 1000   |
| provider | 0,28293889    | 1000   |
| factory  | 0,22999109    | 5000   |
| provider | 0,54420139    | 5000   |
| factory  | 0,29685651    | 10000  |
| provider | 0,62901844    | 10000  |
| factory  | 0,91520844    | 100000 |
| provider | 0,186124524   | 100000 |
