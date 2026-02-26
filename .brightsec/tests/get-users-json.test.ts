import { test, before, after } from 'node:test';
import { SecRunner } from '@sectester/runner';
import { AttackParamLocation, HttpMethod } from '@sectester/scan';

const timeout = 40 * 60 * 1000;
const baseUrl = process.env.BRIGHT_TARGET_URL!;

let runner!: SecRunner;

before(async () => {
  runner = new SecRunner({
    hostname: process.env.BRIGHT_HOSTNAME!,
    projectId: process.env.BRIGHT_PROJECT_ID!
  });

  await runner.init();
});

after(() => runner.clear());

test('GET /users.json', { signal: AbortSignal.timeout(timeout) }, async () => {
  await runner
    .createScan({
      tests: [
        {
          name: 'broken_access_control',
          options: {
            auth: 'iAGWkkjxGm8FkXgSP4s2ff'
          }
        },
        'id_enumeration',
        'sqli',
        'xss',
        'csrf'
      ],
      attackParamLocations: [AttackParamLocation.PATH],
      starMetadata: {
        code_source: 'abright25/star-ruby-example-app:master',
        databases: ['PostgreSQL'],
        user_roles: ['admin']
      },
      poolSize: +process.env.SECTESTER_SCAN_POOL_SIZE || undefined
    })
    .setFailFast(false)
    .timeout(timeout)
    .run({
      method: HttpMethod.GET,
      url: `${baseUrl}/users.json`,
      auth: 'iAGWkkjxGm8FkXgSP4s2ff'
    });
});