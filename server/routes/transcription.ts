import { Hono } from 'hono';
import { createTranscriptionService } from '../features/transcription/application/services/transcription-service';
import { createGeminiClient } from '../features/transcription/infrastructure/clients/gemini-client';
import { TranscriptionChunk } from '../features/shared/domain/types/api-types';

const transcription = new Hono();

// 関数型サービスを作成
const geminiClient = createGeminiClient({
  apiKey: process.env.GEMINI_API_KEY || '',
  model: 'gemini-2.5-flash-lite',
});

const transcriptionService = createTranscriptionService({
  geminiClient,
});

/**
 * POST /api/transcription
 * 音声データを文字起こし（ストリーミング）
 */
transcription.post('/api/transcription', async (c) => {
  console.log('Transcription route: POST /api/transcription received');
  
  // Server-Sent Eventsでストリーミングレスポンスを返す
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        const body = await c.req.json();
        console.log('Transcription route: Request body received, starting transcription...');

        // ストリーミング文字起こしを実行
        for await (const chunk of transcriptionService.transcribeStream(body)) {
          const data: TranscriptionChunk = {
            text: chunk,
            isComplete: false,
          };
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        }

        // 完了メッセージ
        const completeData: TranscriptionChunk = {
          text: '',
          isComplete: true,
        };
        const completeMessage = `data: ${JSON.stringify(completeData)}\n\n`;
        controller.enqueue(encoder.encode(completeMessage));
        controller.close();
      } catch (error) {
        console.error('Transcription route: Error occurred:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorData: TranscriptionChunk = {
          text: `Error: ${errorMessage}`,
          isComplete: true,
        };
        const errorMessageSSE = `data: ${JSON.stringify(errorData)}\n\n`;
        controller.enqueue(encoder.encode(errorMessageSSE));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
});

export default transcription;
