import { Module } from '@nestjs/common';
import { TuviApiController, TuviController } from '@/api/controllers';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [],
    }),
  ],
  controllers: [TuviController, TuviApiController],
  providers: [],
})
export class ApiModule {}
