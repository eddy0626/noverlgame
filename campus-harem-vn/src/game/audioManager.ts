// ========================================
// 오디오 매니저 (BGM & 효과음)
// ========================================

import { create } from 'zustand';

interface AudioState {
  bgmVolume: number;
  sfxVolume: number;
  isMuted: boolean;
  currentBgm: string | null;

  // 액션
  setBgmVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  toggleMute: () => void;
  playBgm: (track: string) => void;
  stopBgm: () => void;
  playSfx: (sound: string) => void;
}

// BGM 트랙 정의
export const BGM_TRACKS: Record<string, string> = {
  title: '/audio/bgm/title.mp3',
  campus: '/audio/bgm/campus.mp3',
  romantic: '/audio/bgm/romantic.mp3',
  tension: '/audio/bgm/tension.mp3',
  ending: '/audio/bgm/ending.mp3',
};

// 효과음 정의
export const SFX_SOUNDS: Record<string, string> = {
  click: '/audio/sfx/click.mp3',
  choice: '/audio/sfx/choice.mp3',
  save: '/audio/sfx/save.mp3',
  load: '/audio/sfx/load.mp3',
  message: '/audio/sfx/message.mp3',
};

// 오디오 요소 캐시
let bgmAudio: HTMLAudioElement | null = null;
const sfxCache: Record<string, HTMLAudioElement> = {};

// 페이드 설정
const FADE_DURATION = 500; // ms
let fadeInterval: number | null = null;

// 페이드 아웃 헬퍼
function fadeOut(audio: HTMLAudioElement, duration: number): Promise<void> {
  return new Promise((resolve) => {
    if (fadeInterval) {
      clearInterval(fadeInterval);
    }

    const startVolume = audio.volume;
    const steps = 20;
    const stepTime = duration / steps;
    const volumeStep = startVolume / steps;
    let currentStep = 0;

    fadeInterval = window.setInterval(() => {
      currentStep++;
      audio.volume = Math.max(0, startVolume - volumeStep * currentStep);

      if (currentStep >= steps) {
        if (fadeInterval) clearInterval(fadeInterval);
        fadeInterval = null;
        audio.pause();
        resolve();
      }
    }, stepTime);
  });
}

// 페이드 인 헬퍼
function fadeIn(audio: HTMLAudioElement, targetVolume: number, duration: number): void {
  if (fadeInterval) {
    clearInterval(fadeInterval);
  }

  audio.volume = 0;
  const steps = 20;
  const stepTime = duration / steps;
  const volumeStep = targetVolume / steps;
  let currentStep = 0;

  fadeInterval = window.setInterval(() => {
    currentStep++;
    audio.volume = Math.min(targetVolume, volumeStep * currentStep);

    if (currentStep >= steps) {
      if (fadeInterval) clearInterval(fadeInterval);
      fadeInterval = null;
    }
  }, stepTime);
}

export const useAudioStore = create<AudioState>((set, get) => ({
  bgmVolume: 0.5,
  sfxVolume: 0.7,
  isMuted: false,
  currentBgm: null,

  setBgmVolume: (volume) => {
    set({ bgmVolume: volume });
    if (bgmAudio) {
      bgmAudio.volume = get().isMuted ? 0 : volume;
    }
  },

  setSfxVolume: (volume) => {
    set({ sfxVolume: volume });
  },

  toggleMute: () => {
    const newMuted = !get().isMuted;
    set({ isMuted: newMuted });
    if (bgmAudio) {
      bgmAudio.volume = newMuted ? 0 : get().bgmVolume;
    }
  },

  playBgm: async (track) => {
    const { currentBgm, bgmVolume, isMuted } = get();
    const trackUrl = BGM_TRACKS[track] || track;

    // 같은 트랙이면 무시
    if (currentBgm === track && bgmAudio && !bgmAudio.paused) {
      return;
    }

    // 기존 BGM 페이드 아웃
    if (bgmAudio && !bgmAudio.paused) {
      await fadeOut(bgmAudio, FADE_DURATION);
      bgmAudio.currentTime = 0;
    }

    // 새 BGM 재생 (페이드 인)
    bgmAudio = new Audio(trackUrl);
    bgmAudio.loop = true;

    const targetVolume = isMuted ? 0 : bgmVolume;
    bgmAudio.volume = 0;

    bgmAudio.play().then(() => {
      if (!isMuted && bgmAudio) {
        fadeIn(bgmAudio, targetVolume, FADE_DURATION);
      }
    }).catch(() => {
      // 자동 재생 차단 시 무시
      console.log('[Audio] BGM autoplay blocked');
    });

    set({ currentBgm: track });
  },

  stopBgm: async () => {
    if (bgmAudio && !bgmAudio.paused) {
      await fadeOut(bgmAudio, FADE_DURATION);
      bgmAudio.currentTime = 0;
    }
    set({ currentBgm: null });
  },

  playSfx: (sound) => {
    const { sfxVolume, isMuted } = get();
    if (isMuted) return;

    const soundUrl = SFX_SOUNDS[sound] || sound;

    // 캐시된 오디오 사용 또는 새로 생성
    if (!sfxCache[sound]) {
      sfxCache[sound] = new Audio(soundUrl);
    }

    const audio = sfxCache[sound];
    audio.volume = sfxVolume;
    audio.currentTime = 0;
    audio.play().catch(() => {
      // 재생 실패 시 무시
    });
  },
}));

// 씬 타입에 따른 BGM 매핑
export function getBgmForScene(nodeId: string): string {
  if (nodeId.startsWith('P')) return 'campus';
  if (nodeId.startsWith('C1')) return 'campus';
  if (nodeId.startsWith('C2')) return 'romantic';
  if (nodeId.startsWith('C3')) return 'tension';
  if (nodeId.startsWith('END')) return 'ending';
  return 'campus';
}
