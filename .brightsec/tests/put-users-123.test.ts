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

test('PUT /users/123', { signal: AbortSignal.timeout(timeout) }, async () => {
  await runner
    .createScan({
      tests: [
        {
          name: 'broken_access_control',
          options: {
            auth: 'tBYWfUAwC6dR4Qy92ZPWrR'
          }
        },
        'bopla',
        'sqli',
        'xss',
        'csrf',
        'unvalidated_redirect'
      ],
      attackParamLocations: [AttackParamLocation.BODY],
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
      method: HttpMethod.PUT,
      url: `${baseUrl}/users/123`,
      body: {
        email: 'user@example.com',
        password: 'securepassword',
        password_digest: '$2a$12$KIXQ1Y1I1O1O1O1O1O1O1O1O1O1O1O1O1O1O1O1O1O1O1O1O1O1O1O1O1O1',
        admin: false
      },
      headers: { 'Content-Type': 'application/json' }
    });
});