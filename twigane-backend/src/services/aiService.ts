import { ChatOpenAI } from '@langchain/openai'; 
import { RAGService } from './ragService.js';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import dotenv from 'dotenv';

dotenv.config();

interface AIResponse {
  content: string;
  type: 'text' | 'flipcard' | 'quiz';
  metadata?: {
    cardFront?: string;
    cardBack?: string;
    category?: string;
    points?: number;
    correctAnswer?: string;
  };
}

export class AIService {
  private llm: ChatOpenAI;  // Update type
  private ragService: RAGService;
  private outputParser: StringOutputParser;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }

    this.llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4',
      temperature: 0.7,
    });

    this.outputParser = new StringOutputParser();
    this.ragService = new RAGService();
  }

  async generateResponse(prompt: string, type: string = 'text'): Promise<AIResponse> {
    try {
      const contextDocs = await this.ragService.queryKnowledge(prompt);
      const context = contextDocs.map(doc => doc.pageContent).join('\n');

      const promptTemplate = ChatPromptTemplate.fromTemplate(
        `Context: {context}\n\nQuestion: {question}\n\nAnswer:`
      );

      const chain = promptTemplate.pipe(this.llm).pipe(this.outputParser);
      const response = await chain.invoke({
        context,
        question: prompt
      });

      if (type === 'flipcard') {
        return {
          content: response,
          type: 'flipcard',
          metadata: {
            cardFront: prompt,
            cardBack: response,
            points: 10
          }
        };
      } else if (type === 'quiz') {
        return {
          content: response,
          type: 'quiz',
          metadata: {
            correctAnswer: response,
            points: 20
          }
        };
      }

      return {
        content: response,
        type: 'text'
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to generate response');
    }
  }

  async addLearningMaterial(content: string, metadata: any) {
    await this.ragService.addDocument(content, metadata);
  }
}