// Web Speech API Host Synthesis for "The Board Room"

type SpeechListener = (isSpeaking: boolean) => void;

class HostSpeechEngine {
  private enabled: boolean = true;
  private isSpeaking: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeners: Set<SpeechListener> = new Set();
  private selectedVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.selectBestVoice();
      };
      this.selectBestVoice();
    }
  }

  private selectBestVoice() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    // Prefer clear American English voices reminiscent of classic TV hosts
    const preferredVoices = [
      'Google US English',
      'Daniel',
      'Alex',
      'Fred',
      'Samantha',
      'en-US',
    ];

    for (const name of preferredVoices) {
      const found = voices.find(
        (v) => v.name.includes(name) || v.lang === name || v.lang.startsWith('en-US')
      );
      if (found) {
        this.selectedVoice = found;
        return;
      }
    }

    // Fallback to first English voice
    this.selectedVoice = voices.find((v) => v.lang.startsWith('en')) || voices[0];
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (!val) {
      this.stop();
    }
  }

  public getEnabled(): boolean {
    return this.enabled;
  }

  public subscribe(listener: SpeechListener): () => void {
    this.listeners.add(listener);
    listener(this.isSpeaking);
    return () => this.listeners.delete(listener);
  }

  private notify(speaking: boolean) {
    this.isSpeaking = speaking;
    this.listeners.forEach((l) => l(speaking));
  }

  /**
   * Speak a clue or announcement
   */
  public speak(text: string, onEnd?: () => void) {
    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    this.stop();

    // Clean text of quotes or bracketed hints for pronunciation
    const cleanText = text.replace(/[[\]]/g, '').replace(/_+/g, 'blank');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    utterance.rate = 1.02; // Energetic, crisp TV host pacing
    utterance.pitch = 0.98; // Authoritative TV host baritone/timbre
    utterance.volume = 0.9;

    utterance.onstart = () => {
      this.notify(true);
    };

    utterance.onend = () => {
      this.notify(false);
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.notify(false);
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  /**
   * Immediately stops speech (e.g. when a contestant buzzes in)
   */
  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore synthesis abort errors
      }
    }
    this.notify(false);
    this.currentUtterance = null;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const hostSpeech = new HostSpeechEngine();
