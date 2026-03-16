export type SpeechUpdate = {
  transcript: string;
  isFinal: boolean;
};

type UpdateHandler = (update: SpeechUpdate) => void;
type StatusHandler = (listening: boolean, message?: string) => void;
type BrowserSpeechRecognitionCtor = new () => SpeechRecognition;

declare global {
  interface Window {
    webkitSpeechRecognition?: BrowserSpeechRecognitionCtor;
    SpeechRecognition?: BrowserSpeechRecognitionCtor;
  }
}

export class BrowserSpeechRecognizer {
  private recognition: SpeechRecognition | null = null;
  private onUpdate: UpdateHandler;
  private onStatus: StatusHandler;

  constructor(onUpdate: UpdateHandler, onStatus: StatusHandler) {
    this.onUpdate = onUpdate;
    this.onStatus = onStatus;
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  start(): void {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      this.onStatus(false, 'Speech recognition not supported in this browser.');
      return;
    }

    this.recognition = new SpeechRecognitionClass();
    this.recognition.lang = 'ar-SA';
    this.recognition.interimResults = true;
    this.recognition.continuous = true;

    this.recognition.onstart = () => this.onStatus(true, 'Listening...');
    this.recognition.onerror = (event) => this.onStatus(false, `Speech error: ${event.error}`);
    this.recognition.onend = () => this.onStatus(false, 'Stopped listening.');

    this.recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
      }

      this.onUpdate({
        transcript,
        isFinal: event.results[event.results.length - 1]?.isFinal ?? false,
      });
    };

    this.recognition.start();
  }

  stop(): void {
    this.recognition?.stop();
    this.recognition = null;
  }
}
