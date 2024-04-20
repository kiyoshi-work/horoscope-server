import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database';
import { TuviController } from '@/api/controllers';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from '@/api/services';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [],
    }),
  ],
  controllers: [TuviController],
  providers: [AuthService],
})
export class ApiModule {}
