import { Injectable } from "@nestjs/common";
import { ChatOpenAI } from '@langchain/openai';
import { ConfigService } from "@nestjs/config";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { AgentExecutor, createOpenAIToolsAgent } from "langchain/agents";
import { DocumentRepository } from "@/vectorstore-db/repositories/document.repository";

@Injectable()
export class AiService {
  private readonly openAIKey: string;
  constructor(
    private readonly configService: ConfigService,
    private documentRepository: DocumentRepository,
  ) {
    this.openAIKey = this.configService.get<string>('ai.open_ai_key');
  }

  async chatModel(question: string) {
    const ds = await this.documentRepository.queryOrmVector(
      question,
      6,
      {}
    );
    console.log("🚀 ~ ds:", ds)
    const instruction = {
      role: 'system',
      content: "Tôi là bot giúp trả lời các câu hỏi về tử vi"
    }
    const prompt = `
    \n Hướng dẫn: ${JSON.stringify(instruction)} \\n
    \n Bối cảnh tử vi học: ${JSON.stringify(ds)} 
    \n Câu hỏi: ${question} 
    `;
    const model = new ChatOpenAI({
      // configuration: {
      //   baseURL: 'http://localhost:1234/v1'
      // },
      openAIApiKey: this.openAIKey,
      // modelName: 'gpt-4-1106-preview',
      modelName: 'gpt-3.5-turbo-16k',
    });
    const stream = await model.stream(prompt);
    const chunks: any[] = [];
    for await (const chunk of stream) {
      console.log("🚀 ~ forawait ~ chunk:", chunk.content)
      chunks.push(chunk);
    }
    let finalChunk: any = chunks[0];
    for (const chunk of chunks.slice(1, chunks.length - 1)) {
      finalChunk = finalChunk.concat(chunk);
    }
    console.log('=========> ASSISTANT:', finalChunk.content);
  }

  async streamAgent(
    question: string,
    modelName: string = 'gpt-3.5-turbo-1106',
    tools = [],
  ) {
    let answer = '';
    const llm = new ChatOpenAI({
      modelName: modelName,
      temperature: 0,
      openAIApiKey: this.openAIKey,
    });
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are a helpful assistant"],
      ["human", "{input}"],
      new MessagesPlaceholder("agent_scratchpad"),
    ]);
    const agent = await createOpenAIToolsAgent({
      llm,
      tools,
      prompt,
    });

    const agentExecutor = new AgentExecutor({
      agent,
      tools,
    });
    // const result = await agentExecutor.invoke({
    //   input: "eth price",
    // })
    // console.log("🚀 ~ result:", result)

    // STREAM: https://js.langchain.com/docs/modules/agents/how_to/streaming
    const eventStream = agentExecutor.streamEvents(
      {
        input: question,
      },
      { version: 'v1' },
    );

    for await (const event of eventStream) {
      const eventType = event.event;
      if (eventType === "on_chain_start") {
        // Was assigned when creating the agent with `.withConfig({"runName": "Agent"})` above
        if (event.name === "Agent") {
          console.log("\n-----");
          console.log(
            `Starting agent: ${event.name} with input: ${JSON.stringify(
              event.data.input
            )}`
          );
        }
      } else if (eventType === "on_chain_end") {
        // Was assigned when creating the agent with `.withConfig({"runName": "Agent"})` above
        if (event.name === "Agent") {
          console.log("\n-----");
          console.log(`Finished agent: ${event.name}\n`);
          console.log(`Agent output was: ${event.data.output}`);
          console.log("\n-----");
        }
      } else if (eventType === "on_llm_stream") {
        const content = event.data?.chunk?.message?.content;
        // Empty content in the context of OpenAI means
        // that the model is asking for a tool to be invoked via function call.
        // So we only print non-empty content
        if (content !== undefined && content !== "") {
          console.log(`| ${content}`);
        }
      } else if (eventType === "on_tool_start") {
        console.log("\n-----");
        console.log(
          `Starting tool: ${event.name} with inputs: ${event.data.input}`
        );
      } else if (eventType === "on_tool_end") {
        console.log("\n-----");
        console.log(`Finished tool: ${event.name}\n`);
        console.log(`Tool output was: ${event.data.output}`);
        console.log("\n-----");
      }
    }
  }
}