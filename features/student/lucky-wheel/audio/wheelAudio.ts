/**
 * Engine âm thanh tổng hợp thuần Web Audio API cho Vòng quay may mắn (Lucky Wheel).
 * Hoàn toàn không phụ thuộc file mp3 bên ngoài, không độ trễ, tối ưu bộ nhớ.
 */

export const AUDIO_CONFIG = {
  // Volume & Master
  defaultVolume: 0.7,
  maxMasterGain: 1.0,
  maxPolyphony: 12,

  // Tiếng Tick va chốt
  tick: {
    clickFreq: 2500, // Bandpass filter Hz cho phần click nhựa
    clickQ: 1.2,
    clickDuration: 0.008, // 8ms burst nhiễu trắng
    bodyFreqBase: 1600, // Tần số gốc cho thân tiếng tick (1400 - 1900Hz)
    bodyDurationHigh: 0.025, // 25ms khi quay nhanh
    bodyDurationLow: 0.055, // 55ms khi quay chậm sắp dừng
    woodBodyFreq: 700, // Thêm âm thân gỗ trầm 700Hz khi sắp dừng
    maxGain: 0.6,
    gainHighSpeed: 0.35,
    gainLowSpeed: 0.6,
    reboundGain: 0.25,
    reboundDelayMs: 90, // 90ms nảy ngược khi dừng sát chốt
    humanizePitch: 0.03, // ±3% ngẫu nhiên
    humanizeGain: 0.08, // ±8% ngẫu nhiên
    lowSpeedVelocityThreshold: 180, // Dưới 180 độ/s (khoảng 4 chốt/s) tính là tốc độ thấp
  },

  // Bắt đầu quay (Whoosh + Thump + Trừ xu)
  spinStart: {
    whooshFilterStart: 400,
    whooshFilterEnd: 2400,
    whooshDuration: 0.55,
    whooshGain: 0.22,
    thumpFreqStart: 120,
    thumpFreqEnd: 60,
    thumpDuration: 0.12,
    thumpGain: 0.32,
    coinDeductNotes: [1568, 1175], // G6 -> D6
    coinDeductDuration: 0.08,
  },

  // Lớp nền vo vo nhẹ trong lúc quay
  spinLoop: {
    maxFilterFreq: 600,
    minFilterFreq: 150,
    maxGain: 0.07,
  },

  // Khi vòng dừng hẳn
  spinEnd: {
    freqStart: 300,
    freqEnd: 180,
    duration: 0.1,
    gain: 0.45,
  },

  // Nhận thưởng (MỘT âm thanh duy nhất cho mọi phần thưởng)
  reward: {
    maxGain: 0.9,
    arpeggioNotes: [1047, 1319, 1568, 2093], // C6, E6, G6, C7
    arpeggioStep: 0.08, // 80ms mỗi nốt
    bellOvertones: [
      { ratio: 1.0, gain: 1.0 },
      { ratio: 2.76, gain: 0.4 },
      { ratio: 5.4, gain: 0.15 },
    ],
    bellDecay: 0.5,
    chordNotes: [523.25, 659.25, 783.99], // Hợp âm nền C5, E5, G5
    chordDuration: 0.5,
    chordGain: 0.25,
    sparkleCount: 5,
    sparkleMinFreq: 2500,
    sparkleMaxFreq: 4500,
    sparkleDuration: 0.08,
    reverbWet: 0.22,
    reverbDuration: 1.0,
  },

  // Âm thanh UI phụ
  ui: {
    clickFreq: 600,
    clickDuration: 0.05,
    errorNotes: [392, 293.66], // G4 -> D4
    errorFilter: 1200,
    errorDuration: 0.12,
  },
} as const;

const STORAGE_KEYS = {
  muted: "wheel_audio_muted",
  volume: "wheel_audio_volume",
};

/**
 * Interface cho đối tượng Voice đang hoạt động
 */
interface ActiveVoice {
  stop: () => void;
  startTime: number;
}

/**
 * Class Singleton quản lý Audio Engine của Lucky Wheel
 */
export class WheelAudioEngine {
  private static instance: WheelAudioEngine | null = null;

  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private reverbBuffer: AudioBuffer | null = null;

  // Spin Loop Nodes
  private spinLoopSource: AudioBufferSourceNode | null = null;
  private spinLoopFilter: BiquadFilterNode | null = null;
  private spinLoopGain: GainNode | null = null;

  // Reward Nodes (để dừng khi đóng modal)
  private currentRewardGain: GainNode | null = null;

  // Active voices tracking (Polyphony control)
  private activeVoices: ActiveVoice[] = [];

  private isMutedState: boolean = false;
  private volumeState: number = AUDIO_CONFIG.defaultVolume;
  private isUnlocked: boolean = false;

  private constructor() {
    this.readStorage();
  }

  public static getInstance(): WheelAudioEngine {
    if (!WheelAudioEngine.instance) {
      WheelAudioEngine.instance = new WheelAudioEngine();
    }
    return WheelAudioEngine.instance;
  }

  /**
   * Đọc trạng thái từ localStorage an toàn
   */
  private readStorage(): void {
    if (typeof window === "undefined") return;
    try {
      const storedMuted = localStorage.getItem(STORAGE_KEYS.muted);
      if (storedMuted !== null) {
        this.isMutedState = storedMuted === "true";
      }
      const storedVol = localStorage.getItem(STORAGE_KEYS.volume);
      if (storedVol !== null) {
        const val = parseFloat(storedVol);
        if (!isNaN(val) && val >= 0 && val <= 1) {
          this.volumeState = val;
        }
      }
    } catch {
      // Bỏ qua lỗi truy cập storage
    }
  }

  /**
   * Ghi trạng thái vào localStorage an toàn
   */
  private writeStorage(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.muted, this.isMutedState ? "true" : "false");
      localStorage.setItem(STORAGE_KEYS.volume, this.volumeState.toString());
    } catch {
      // Bỏ qua
    }
  }

  /**
   * Khởi tạo AudioContext lười (Lazy initialization)
   */
  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") return null;

    if (!this.ctx) {
      try {
        const AudioCtxClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtxClass) return null;

        this.ctx = new AudioCtxClass();

        // 1. Tạo DynamicsCompressor nhẹ ở cuối chuỗi chống méo âm
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(10, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(4, this.ctx.currentTime);
        this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
        this.compressor.release.setValueAtTime(0.1, this.ctx.currentTime);
        this.compressor.connect(this.ctx.destination);

        // 2. Tạo Master Gain chung
        this.masterGain = this.ctx.createGain();
        this.updateMasterGain();
        this.masterGain.connect(this.compressor);

        // 3. Khởi tạo sẵn impulse response cho Reverb (sinh bằng thuật toán)
        this.reverbBuffer = this.generateReverbImpulse(this.ctx, AUDIO_CONFIG.reward.reverbDuration);
      } catch {
        return null;
      }
    }

    return this.ctx;
  }

  /**
   * Mở khóa AudioContext trong handler của người dùng (bắt buộc cho Safari / iOS)
   */
  public unlock(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    this.isUnlocked = true;
  }

  /**
   * Cập nhật âm lượng Master
   */
  private updateMasterGain(): void {
    if (!this.masterGain || !this.ctx) return;
    const effectiveGain = this.isMutedState ? 0 : this.volumeState * AUDIO_CONFIG.maxMasterGain;
    try {
      this.masterGain.gain.setValueAtTime(effectiveGain, this.ctx.currentTime);
    } catch {
      this.masterGain.gain.value = effectiveGain;
    }
  }

  public isMuted(): boolean {
    return this.isMutedState;
  }

  public setMuted(muted: boolean): void {
    this.isMutedState = muted;
    this.updateMasterGain();
    this.writeStorage();
    if (muted) {
      this.stopAllSounds();
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMutedState);
    return this.isMutedState;
  }

  public getVolume(): number {
    return this.volumeState;
  }

  public setVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    this.volumeState = clamped;
    this.updateMasterGain();
    this.writeStorage();
  }

  /**
   * Đăng ký một Voice để kiểm soát Polyphony
   */
  private registerVoice(voice: ActiveVoice): void {
    this.activeVoices.push(voice);
    if (this.activeVoices.length > AUDIO_CONFIG.maxPolyphony) {
      const oldest = this.activeVoices.shift();
      if (oldest) {
        try {
          oldest.stop();
        } catch {
          // Bỏ qua
        }
      }
    }
  }

  /**
   * Gỡ voice đã kết thúc
   */
  private removeVoice(voice: ActiveVoice): void {
    const idx = this.activeVoices.indexOf(voice);
    if (idx !== -1) {
      this.activeVoices.splice(idx, 1);
    }
  }

  /**
   * Sinh Impulse Response nhân tạo cho Convolver Reverb
   */
  private generateReverbImpulse(ctx: AudioContext, duration: number): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const impulse = ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    const decay = 3.5;
    for (let i = 0; i < length; i++) {
      const t = i / length;
      const factor = Math.exp(-t * decay);
      left[i] = (Math.random() * 2 - 1) * factor;
      right[i] = (Math.random() * 2 - 1) * factor;
    }

    return impulse;
  }

  /**
   * Sinh buffer nhiễu trắng (White Noise)
   */
  private createNoiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /**
   * 3.1 TIẾNG TICK CHỐT ĐỒNG BỘ THEO GÓC QUAY
   * @param speedRatio Tỉ lệ tốc độ từ 0 (sắp dừng) đến 1 (tối đa)
   * @param isRebound Đánh dấu tiếng tick nảy ngược yếu lúc dừng sát chốt
   */
  public playTick(speedRatio = 0.5, isRebound = false): void {
    if (this.isMutedState) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const cfg = AUDIO_CONFIG.tick;

      // Humanize: biến thiên nhẹ tần số ±3% và gain ±8%
      const pitchVar = 1 + (Math.random() * 2 - 1) * cfg.humanizePitch;
      const gainVar = 1 + (Math.random() * 2 - 1) * cfg.humanizeGain;

      // Tính toán thông số bám theo tốc độ
      const isSlow = speedRatio < 0.35;
      const bodyDuration = isSlow ? cfg.bodyDurationLow : cfg.bodyDurationHigh;
      const targetGain = isRebound
        ? cfg.reboundGain
        : (isSlow ? cfg.gainLowSpeed : cfg.gainHighSpeed) * gainVar;

      const tickMaster = ctx.createGain();
      tickMaster.gain.setValueAtTime(Math.min(cfg.maxGain, targetGain), now);
      tickMaster.connect(this.masterGain);

      // --- LỚP 1: Click nhựa (Noise qua Bandpass 2500Hz Q=1.2) ---
      const noiseBuffer = this.createNoiseBuffer(ctx, cfg.clickDuration);
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const clickFilter = ctx.createBiquadFilter();
      clickFilter.type = "bandpass";
      clickFilter.frequency.setValueAtTime(cfg.clickFreq * pitchVar, now);
      clickFilter.Q.setValueAtTime(cfg.clickQ, now);

      const clickGain = ctx.createGain();
      clickGain.gain.setValueAtTime(0.55, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + cfg.clickDuration);

      noiseSource.connect(clickFilter);
      clickFilter.connect(clickGain);
      clickGain.connect(tickMaster);

      noiseSource.start(now);
      noiseSource.stop(now + cfg.clickDuration + 0.005);

      // --- LỚP 2: Thân tiếng tick (Sine / Triangle 1400 - 1900Hz) ---
      const bodyOsc = ctx.createOscillator();
      const bodyGain = ctx.createGain();
      bodyOsc.type = "triangle";

      // Khi tốc độ cao: đẩy tần số lên +15%, khi chậm thì trầm hơn
      const speedPitchBonus = speedRatio > 0.6 ? 1.15 : 0.95;
      const baseFreq = cfg.bodyFreqBase * speedPitchBonus * pitchVar;

      bodyOsc.frequency.setValueAtTime(baseFreq, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.45, now + bodyDuration);

      bodyGain.gain.setValueAtTime(0.65, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + bodyDuration);

      bodyOsc.connect(bodyGain);
      bodyGain.connect(tickMaster);

      bodyOsc.start(now);
      bodyOsc.stop(now + bodyDuration + 0.01);

      // --- LỚP 3: Thân gỗ trầm (Sine 700Hz) chỉ khi tốc độ chậm lúc sắp dừng ---
      let woodOsc: OscillatorNode | null = null;
      if (isSlow && !isRebound) {
        woodOsc = ctx.createOscillator();
        const woodGain = ctx.createGain();
        woodOsc.type = "sine";
        woodOsc.frequency.setValueAtTime(cfg.woodBodyFreq * pitchVar, now);
        woodOsc.frequency.exponentialRampToValueAtTime(cfg.woodBodyFreq * 0.5, now + bodyDuration);

        woodGain.gain.setValueAtTime(0.4, now);
        woodGain.gain.exponentialRampToValueAtTime(0.001, now + bodyDuration);

        woodOsc.connect(woodGain);
        woodGain.connect(tickMaster);

        woodOsc.start(now);
        woodOsc.stop(now + bodyDuration + 0.01);
      }

      // Cleanup
      const voice: ActiveVoice = {
        stop: () => {
          try {
            noiseSource.disconnect();
            bodyOsc.disconnect();
            if (woodOsc) woodOsc.disconnect();
            tickMaster.disconnect();
          } catch {
            // Bỏ qua
          }
        },
        startTime: now,
      };
      this.registerVoice(voice);

      bodyOsc.onended = () => {
        voice.stop();
        this.removeVoice(voice);
      };
    } catch {
      // Bỏ qua lỗi audio
    }
  }

  /**
   * Phát tiếng nảy ngược nhẹ sau 90ms
   */
  public playReboundTick(): void {
    if (typeof window === "undefined") return;
    setTimeout(() => {
      this.playTick(0.1, true);
    }, AUDIO_CONFIG.tick.reboundDelayMs);
  }

  /**
   * 3.2 BẮT ĐẦU QUAY: Whoosh gió + Thump trầm + Ting ting trừ xu
   */
  public playSpinStart(): void {
    if (this.isMutedState) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const cfg = AUDIO_CONFIG.spinStart;

      // 1. Tiếng "vút" (Whoosh): Noise quét bandpass 400Hz -> 2400Hz
      const noiseBuffer = this.createNoiseBuffer(ctx, cfg.whooshDuration);
      const whooshSource = ctx.createBufferSource();
      whooshSource.buffer = noiseBuffer;

      const whooshFilter = ctx.createBiquadFilter();
      whooshFilter.type = "bandpass";
      whooshFilter.Q.setValueAtTime(1.5, now);
      whooshFilter.frequency.setValueAtTime(cfg.whooshFilterStart, now);
      whooshFilter.frequency.exponentialRampToValueAtTime(
        cfg.whooshFilterEnd,
        now + cfg.whooshDuration * 0.7
      );

      const whooshGain = ctx.createGain();
      whooshGain.gain.setValueAtTime(0.01, now);
      whooshGain.gain.linearRampToValueAtTime(cfg.whooshGain, now + cfg.whooshDuration * 0.4);
      whooshGain.gain.exponentialRampToValueAtTime(0.001, now + cfg.whooshDuration);

      whooshSource.connect(whooshFilter);
      whooshFilter.connect(whooshGain);
      whooshGain.connect(this.masterGain);

      whooshSource.start(now);
      whooshSource.stop(now + cfg.whooshDuration + 0.05);

      // 2. Tiếng "thịch" trầm (120Hz -> 60Hz decay 120ms)
      const thumpOsc = ctx.createOscillator();
      const thumpGain = ctx.createGain();
      thumpOsc.type = "sine";
      thumpOsc.frequency.setValueAtTime(cfg.thumpFreqStart, now);
      thumpOsc.frequency.exponentialRampToValueAtTime(cfg.thumpFreqEnd, now + cfg.thumpDuration);

      thumpGain.gain.setValueAtTime(cfg.thumpGain, now);
      thumpGain.gain.exponentialRampToValueAtTime(0.001, now + cfg.thumpDuration);

      thumpOsc.connect(thumpGain);
      thumpGain.connect(this.masterGain);

      thumpOsc.start(now);
      thumpOsc.stop(now + cfg.thumpDuration + 0.05);

      // 3. Tiếng trừ xu (2 nốt ting đi xuống: 1568Hz -> 1175Hz)
      cfg.coinDeductNotes.forEach((freq, idx) => {
        const noteTime = now + 0.05 + idx * cfg.coinDeductDuration;
        const coinOsc = ctx.createOscillator();
        const coinGain = ctx.createGain();
        coinOsc.type = "sine";
        coinOsc.frequency.setValueAtTime(freq, noteTime);

        coinGain.gain.setValueAtTime(0.2, noteTime);
        coinGain.gain.exponentialRampToValueAtTime(0.001, noteTime + cfg.coinDeductDuration);

        coinOsc.connect(coinGain);
        coinGain.connect(this.masterGain!);

        coinOsc.start(noteTime);
        coinOsc.stop(noteTime + cfg.coinDeductDuration + 0.02);
      });

      // Bắt đầu lớp nền vo vo khi quay
      this.startSpinLoop();
    } catch {
      // Bỏ qua
    }
  }

  /**
   * 3.3 BẮT ĐẦU LỚP NỀN VO VO TRONG LÚC QUAY
   */
  private startSpinLoop(): void {
    if (this.isMutedState) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    this.stopSpinLoop();

    try {
      const now = ctx.currentTime;
      const noiseBuffer = this.createNoiseBuffer(ctx, 2.0);
      this.spinLoopSource = ctx.createBufferSource();
      this.spinLoopSource.buffer = noiseBuffer;
      this.spinLoopSource.loop = true;

      this.spinLoopFilter = ctx.createBiquadFilter();
      this.spinLoopFilter.type = "lowpass";
      this.spinLoopFilter.frequency.setValueAtTime(AUDIO_CONFIG.spinLoop.minFilterFreq, now);

      this.spinLoopGain = ctx.createGain();
      this.spinLoopGain.gain.setValueAtTime(0.001, now);
      this.spinLoopGain.gain.linearRampToValueAtTime(0.04, now + 0.2);

      this.spinLoopSource.connect(this.spinLoopFilter);
      this.spinLoopFilter.connect(this.spinLoopGain);
      this.spinLoopGain.connect(this.masterGain);

      this.spinLoopSource.start(now);
    } catch {
      // Bỏ qua
    }
  }

  /**
   * Cập nhật lớp nền vo vo bám theo tốc độ góc thực tế
   */
  public updateSpinLoopVelocity(velocityRatio: number): void {
    if (!this.spinLoopFilter || !this.spinLoopGain || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const cfg = AUDIO_CONFIG.spinLoop;
      const targetFreq =
        cfg.minFilterFreq + (cfg.maxFilterFreq - cfg.minFilterFreq) * velocityRatio;
      const targetGain = cfg.maxGain * Math.min(1, velocityRatio * 1.2);

      this.spinLoopFilter.frequency.setTargetAtTime(targetFreq, now, 0.05);
      this.spinLoopGain.gain.setTargetAtTime(targetGain, now, 0.05);
    } catch {
      // Bỏ qua
    }
  }

  /**
   * Dừng lớp nền vo vo
   */
  private stopSpinLoop(): void {
    if (!this.spinLoopSource || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      if (this.spinLoopGain) {
        this.spinLoopGain.gain.linearRampToValueAtTime(0.001, now + 0.1);
      }
      this.spinLoopSource.stop(now + 0.12);
      setTimeout(() => {
        try {
          this.spinLoopSource?.disconnect();
          this.spinLoopFilter?.disconnect();
          this.spinLoopGain?.disconnect();
        } catch {
          // Bỏ qua
        }
        this.spinLoopSource = null;
        this.spinLoopFilter = null;
        this.spinLoopGain = null;
      }, 150);
    } catch {
      this.spinLoopSource = null;
    }
  }

  /**
   * 3.4 KHI VÒNG DỪNG HẲN: 1 tiếng "tock" trầm chắc
   */
  public playSpinEnd(): void {
    this.stopSpinLoop();

    if (this.isMutedState) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const cfg = AUDIO_CONFIG.spinEnd;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(cfg.freqStart, now);
      osc.frequency.exponentialRampToValueAtTime(cfg.freqEnd, now + cfg.duration);

      gain.gain.setValueAtTime(cfg.gain, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + cfg.duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + cfg.duration + 0.02);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {
          // Bỏ qua
        }
      };
    } catch {
      // Bỏ qua
    }
  }

  /**
   * 4. ÂM THANH NHẬN THƯỞNG: MỘT âm thanh duy nhất cho mọi phần thưởng (không nhận tham số)
   * Arpeggio chuông 4 nốt + Hợp âm nền C-E-G + Sparkle kim tuyến + Convolver Reverb
   */
  public playReward(): void {
    if (this.isMutedState) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    // Dừng âm thưởng cũ nếu đang chạy
    this.stopReward();

    try {
      const now = ctx.currentTime;
      const cfg = AUDIO_CONFIG.reward;

      // Master bus riêng cho Reward để có thể fade out khi modal đóng
      const rewardBus = ctx.createGain();
      rewardBus.gain.setValueAtTime(cfg.maxGain, now);
      rewardBus.connect(this.masterGain);
      this.currentRewardGain = rewardBus;

      // Khối Reverb Convolver
      let reverbInputNode: GainNode | null = null;
      if (this.reverbBuffer) {
        const convolver = ctx.createConvolver();
        convolver.buffer = this.reverbBuffer;

        const wetGain = ctx.createGain();
        wetGain.gain.setValueAtTime(cfg.reverbWet, now);

        reverbInputNode = ctx.createGain();
        reverbInputNode.connect(convolver);
        convolver.connect(wetGain);
        wetGain.connect(rewardBus);
      }

      // 1. Arpeggio đi lên 4 nốt chuông kim loại (C6, E6, G6, C7)
      cfg.arpeggioNotes.forEach((baseFreq, noteIdx) => {
        const noteTime = now + noteIdx * cfg.arpeggioStep;

        // Mỗi nốt là tổng hợp 3 sine ở tỉ lệ f, 2.76f, 5.4f tạo âm sắc chuông kim loại
        cfg.bellOvertones.forEach(({ ratio, gain: overtoneGainWeight }) => {
          const bellOsc = ctx.createOscillator();
          const bellGain = ctx.createGain();
          bellOsc.type = "sine";
          bellOsc.frequency.setValueAtTime(baseFreq * ratio, noteTime);

          const peakGain = 0.3 * overtoneGainWeight;
          bellGain.gain.setValueAtTime(0.001, noteTime);
          bellGain.gain.linearRampToValueAtTime(peakGain, noteTime + 0.002); // 2ms attack
          bellGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + cfg.bellDecay);

          bellOsc.connect(bellGain);
          bellGain.connect(rewardBus);
          if (reverbInputNode) {
            bellGain.connect(reverbInputNode);
          }

          bellOsc.start(noteTime);
          bellOsc.stop(noteTime + cfg.bellDecay + 0.05);
        });
      });

      // 2. Hợp âm nền C-E-G vào cùng lúc với nốt cuối cùng
      const chordStartTime = now + (cfg.arpeggioNotes.length - 1) * cfg.arpeggioStep;
      cfg.chordNotes.forEach((chordFreq) => {
        const chordOsc = ctx.createOscillator();
        const chordGain = ctx.createGain();
        chordOsc.type = "triangle";
        chordOsc.frequency.setValueAtTime(chordFreq, chordStartTime);

        chordGain.gain.setValueAtTime(0.001, chordStartTime);
        chordGain.gain.linearRampToValueAtTime(cfg.chordGain / 3, chordStartTime + 0.04);
        chordGain.gain.exponentialRampToValueAtTime(0.001, chordStartTime + cfg.chordDuration);

        chordOsc.connect(chordGain);
        chordGain.connect(rewardBus);
        if (reverbInputNode) {
          chordGain.connect(reverbInputNode);
        }

        chordOsc.start(chordStartTime);
        chordOsc.stop(chordStartTime + cfg.chordDuration + 0.05);
      });

      // 3. Sparkle: 4-5 tiếng "ting" rải ngẫu nhiên trong 400ms sau nốt cuối
      for (let i = 0; i < cfg.sparkleCount; i++) {
        const sparkleTime = chordStartTime + 0.05 + Math.random() * 0.38;
        const sparkleFreq =
          cfg.sparkleMinFreq + Math.random() * (cfg.sparkleMaxFreq - cfg.sparkleMinFreq);

        const spOsc = ctx.createOscillator();
        const spGain = ctx.createGain();
        spOsc.type = "sine";
        spOsc.frequency.setValueAtTime(sparkleFreq, sparkleTime);

        spGain.gain.setValueAtTime(0.001, sparkleTime);
        spGain.gain.linearRampToValueAtTime(0.12, sparkleTime + 0.005);
        spGain.gain.exponentialRampToValueAtTime(0.001, sparkleTime + cfg.sparkleDuration);

        spOsc.connect(spGain);
        spGain.connect(rewardBus);

        spOsc.start(sparkleTime);
        spOsc.stop(sparkleTime + cfg.sparkleDuration + 0.02);
      }
    } catch {
      // Bỏ qua
    }
  }

  /**
   * Dừng âm thanh nhận thưởng khi đóng modal (fade out 150ms)
   */
  public stopReward(): void {
    if (!this.currentRewardGain || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      this.currentRewardGain.gain.linearRampToValueAtTime(0.001, now + 0.15);
      setTimeout(() => {
        try {
          this.currentRewardGain?.disconnect();
        } catch {
          // Bỏ qua
        }
        this.currentRewardGain = null;
      }, 160);
    } catch {
      this.currentRewardGain = null;
    }
  }

  /**
   * 5. ÂM THANH UI: Click nút phụ
   */
  public playClick(): void {
    if (this.isMutedState) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const cfg = AUDIO_CONFIG.ui;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(cfg.clickFreq, now);
      osc.frequency.exponentialRampToValueAtTime(cfg.clickFreq * 0.4, now + cfg.clickDuration);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + cfg.clickDuration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + cfg.clickDuration + 0.02);
    } catch {
      // Bỏ qua
    }
  }

  /**
   * 5. ÂM THANH BÁO LỖI (Không đủ xu)
   */
  public playError(): void {
    if (this.isMutedState) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const cfg = AUDIO_CONFIG.ui;

      cfg.errorNotes.forEach((freq, idx) => {
        const noteTime = now + idx * cfg.errorDuration;
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = "square";
        osc.frequency.setValueAtTime(freq, noteTime);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(cfg.errorFilter, noteTime);

        gain.gain.setValueAtTime(0.2, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + cfg.errorDuration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(noteTime);
        osc.stop(noteTime + cfg.errorDuration + 0.02);
      });
    } catch {
      // Bỏ qua
    }
  }

  /**
   * Dừng toàn bộ âm thanh (khi ẩn tab hoặc unmount)
   */
  public stopAllSounds(): void {
    this.stopSpinLoop();
    this.stopReward();
    this.activeVoices.forEach((v) => {
      try {
        v.stop();
      } catch {
        // Bỏ qua
      }
    });
    this.activeVoices = [];
  }
}

/**
 * Xuất thể hiện Singleton dùng trực tiếp
 */
export const wheelAudio = WheelAudioEngine.getInstance();
