import { AudioUri } from '../../../audio-recording/domain/value-objects/audio-uri';
import { TranscriptionResult } from '../entities/transcription-result';
import { TranscriptionService } from '../services/transcription-service';

/**
 * 音声を文字起こしするユースケース（純粋関数）
 */
export async function transcribeAudioUseCase(
  transcriptionService: TranscriptionService,
  audioUri: AudioUri,
  language: string = 'ja'
): Promise<TranscriptionResult> {
  return await transcriptionService.transcribe(audioUri, language);
}
