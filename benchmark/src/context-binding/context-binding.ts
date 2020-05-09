// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/benchmark
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, inject, Provider, ValueFactory} from '@loopback/context';

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

/**
 * Second option - use a factory function
 */
const factory: ValueFactory = _ctx => {
  const user = _ctx.getSync('user');
  return `Hello, ${user}`;
};

setupContextBindings();

function setupContextBindings() {
  const ctx = new Context();
  ctx.bind('user').to('John');
  ctx.bind('greeting1').toDynamicValue(factory);
  ctx.bind('greeting2').toProvider(GreetingProvider);
  return ctx;
}

function runBenchmark(ctx: Context, count = 1000) {
  let result1 = process.hrtime();

  for (let i = 0; i < count; i++) {
    ctx.getSync('greeting1');
  }

  result1 = process.hrtime(result1);

  let result2 = process.hrtime();

  for (let i = 0; i < count; i++) {
    ctx.getSync('greeting2');
  }

  result2 = process.hrtime(result2);

  console.log(
    '%s %s %s',
    'name'.padEnd(12),
    'duration'.padStart(16),
    'count'.padStart(8),
  );
  for (const r of [
    {name: 'factory', duration: result1},
    {name: 'provider', duration: result2},
  ]) {
    console.log(
      '%s %s %s',
      `${r.name}`.padEnd(12),
      `${r.duration}`.padStart(16),
      `${count}`.padStart(8),
    );
  }
}

if (require.main === module) {
  let tests = process.argv.slice(2);
  if (!tests.length) {
    tests = ['1000'];
  }
  const ctx = setupContextBindings();
  tests.forEach(n => {
    runBenchmark(ctx, +n);
    console.log('\n');
  });
}
