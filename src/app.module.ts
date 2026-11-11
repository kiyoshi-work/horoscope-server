import { Module } from '@nestjs/common';
import { ApiModule } from '@/api';

// Tạm thời chỉ chạy phần Tử Vi (lá số + luận giải). Database / VectorStore / AI
// được tách khỏi app và loại khỏi build (xem tsconfig.build.json).
@Module({
  imports: [ApiModule],
})
export class AppModule {}
