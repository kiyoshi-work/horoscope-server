import { registerAs } from '@nestjs/config';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export const configLangchain = registerAs('langchain', () => ({
  open_ai_key: process.env.OPEN_AI_API_KEY,
  db: {
    type: 'postgres',
    host: process.env.DB_VECTOR_HOST || 'vector',
    port: Number(process.env.DB_VECTOR_PORT) || 5433,
    username: process.env.DB_VECTOR_USERNAME || 'root',
    password: process.env.DB_VECTOR_PASSWORD || '123456',
    database: process.env.DB_VECTOR_DATABASE || 'vector',
    autoLoadEntities: true,
    // logging: true,
  } as PostgresConnectionOptions,
}));
