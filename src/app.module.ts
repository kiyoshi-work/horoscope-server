import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database';
import { ApiModule } from '@/api';
import { VectorStoreModule } from '@/vectorstore-db/vector-store.module';
import { AiModule } from '@/ai/ai.module';

@Module({
  imports: [DatabaseModule, ApiModule, VectorStoreModule, AiModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
