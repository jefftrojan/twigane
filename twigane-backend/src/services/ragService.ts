import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';
import { Document } from '@langchain/core/documents';

export class RAGService {
  private pinecone: Pinecone;
  private embeddings: OpenAIEmbeddings;
  private index;

  constructor() {
    if (!process.env.PINECONE_API_KEY) {
      throw new Error('Pinecone API key not set');
    }

    // New Pinecone SDK (v3.x) initialization
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    
    // Get the index using the new syntax
    this.index = this.pinecone.index('twigane');

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not set');
    }
    
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }

  async addDocument(text: string, metadata: any) {
    try {
      const vectorStore = await PineconeStore.fromExistingIndex(
        this.embeddings,
        {
          pineconeIndex: this.index,
          namespace: 'default'
        }
      );
      await vectorStore.addDocuments([
        new Document({
          pageContent: text,
          metadata: metadata,
        }),
      ]);
    } catch (error) {
      console.error('RAG Service Error:', error);
      throw new Error('Failed to add document to vector store');
    }
  }

  async queryKnowledge(query: string, k: number = 3) {
    try {
      const vectorStore = await PineconeStore.fromExistingIndex(
        this.embeddings,
        {
          pineconeIndex: this.index,
          namespace: 'default'
        }
      );
      const results = await vectorStore.similaritySearch(query, k);
      return results;
    } catch (error) {
      console.error('RAG Service Error:', error);
      throw new Error('Failed to query knowledge base');
    }
  }
}