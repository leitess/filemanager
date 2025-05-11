import { config } from 'dotenv';

const env = process.env.DASH_ENV;

config({ path: '.env' });

const database = {
  uri: process.env.DATABASE_URI,
};

export { database, env };
