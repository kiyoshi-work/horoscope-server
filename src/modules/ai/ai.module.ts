import { Inject, Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@/database';
import { VectorStoreModule } from "@/vectorstore-db/vector-store.module";
import { configAI } from './configs/ai';
import { AiService } from './services/ai.service';
import { TestTool } from './tools/test.tool';
import { DocumentRepository } from '@/vectorstore-db/repositories/document.repository';
import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import path from 'path';
import * as fs from 'fs';

const tools = [TestTool];
@Module({
  imports: [
    DatabaseModule,
    VectorStoreModule,
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [configAI],
    }),
  ],
  controllers: [],
  // @ts-ignore
  providers: [AiService, ...tools],
  exports: [AiService, ...tools],
})
export class AiModule implements OnApplicationBootstrap {
  constructor(
    private aiService: AiService,
    private testTool: TestTool,
    @Inject('TEXT_EMBEDDING_3_LARGE')
    public embeddingModel: OpenAIEmbeddings,
    private documentRepository: DocumentRepository,
  ) { }

  async handleMockDataTopic(docs: any, keyTopicId: string) {
    console.log("🚀 ~ VectorStoreModule ~ handleMockDataTopic ~ keyTopicId:", keyTopicId)
    let data = [];
    try {
      data = await this.documentRepository.queryOrmVector('', 10, {
        keyTopicId: keyTopicId,
      });
      console.log(
        '[onApplicationBootstrap] [EveVectorStore] [DONE]: ',
        data.length,
      );
    } catch (e) {
      console.log('[ERROR] [handleMockDataTopic] :', e);
    }
    if (data.length === 0) {
      await this.documentRepository.ormAddDocuments(docs);
    }
  }


  async onApplicationBootstrap() {

    // const loader = new PDFLoader(path.join(__dirname, '../../files/58_TU_VI_THUC_HANH.pdf'), {
    //   splitPages: false,
    // });
    // const docs = await loader.load();
    // const textSplitter = new RecursiveCharacterTextSplitter({
    //   chunkSize: 1000,
    //   chunkOverlap: 0,
    // });
    // const splitDocs = await textSplitter.splitDocuments(docs);
    // console.log("🚀 ~ splitDocs:", splitDocs[0], splitDocs[1], splitDocs[2])


    // const fileContent = fs.readFileSync(path.join(__dirname, '../../files/58_TU_VI_THUC_HANH.txt'), 'utf-8');
    // const richTexts = fileContent?.split('\n\n').map(rT => ({
    //   pageContent: rT.split('\n').filter((t) => t.length > 40).join(),
    //   metadata: {}
    // })).filter((t) => t?.pageContent.length > 40)
    // console.log("🚀 ~ richText:", richTexts[0], richTexts.length)
    // await this.handleMockDataTopic(richTexts, 'TU_VI_THUC_HANH');
    const question = 'Mệnh gặp được Thiên Cơ Miếu, Vượng thì sao';
    await this.aiService.chatModel(question);

  }
}
