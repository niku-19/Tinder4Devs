import Redis from 'ioredis';

const client = new Redis({
  host: 'redis',
  keyPrefix: 'tinder4devs:',
});

export default client;
