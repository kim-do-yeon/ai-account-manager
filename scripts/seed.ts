import { Redis } from '@upstash/redis';
import { createHash } from 'crypto';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

async function seed() {
  // Set site entry password: 1q2w3e4r
  await redis.set('settings:site_password', hashPassword('1q2w3e4r'));
  console.log('Site password set: 1q2w3e4r');

  // Set admin password: 930901
  await redis.set('settings:admin_password', hashPassword('930901'));
  console.log('Admin password set: 930901');

  console.log('Seed complete!');
}

seed().catch(console.error);
