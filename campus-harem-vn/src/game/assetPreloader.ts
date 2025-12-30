// ========================================
// Asset Preloader - Performance Optimization
// ========================================

// 프리로드할 이미지 목록
const IMAGES_TO_PRELOAD = [
  '/backgrounds/classroom.png',
  '/backgrounds/library.png',
  '/backgrounds/cafe.png',
];

// 프리로드할 오디오 목록
const AUDIO_TO_PRELOAD = [
  '/audio/bgm/title.mp3',
  '/audio/bgm/day.mp3',
  '/audio/bgm/romantic.mp3',
  '/audio/bgm/tense.mp3',
  '/audio/bgm/ending.mp3',
  '/audio/sfx/click.mp3',
  '/audio/sfx/message.mp3',
  '/audio/sfx/choice.mp3',
];

interface PreloadState {
  loaded: number;
  total: number;
  isComplete: boolean;
  errors: string[];
}

let preloadState: PreloadState = {
  loaded: 0,
  total: 0,
  isComplete: false,
  errors: [],
};

// 이미지 프리로드
function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, _reject) => {
    const img = new Image();
    img.onload = () => {
      preloadState.loaded++;
      resolve();
    };
    img.onerror = () => {
      preloadState.errors.push(`Image failed: ${src}`);
      preloadState.loaded++;
      resolve(); // 에러 시에도 계속 진행
    };
    img.src = src;
  });
}

// 오디오 프리로드
function preloadAudio(src: string): Promise<void> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = 'auto';

    const onReady = () => {
      preloadState.loaded++;
      cleanup();
      resolve();
    };

    const onError = () => {
      preloadState.errors.push(`Audio failed: ${src}`);
      preloadState.loaded++;
      cleanup();
      resolve();
    };

    const cleanup = () => {
      audio.removeEventListener('canplaythrough', onReady);
      audio.removeEventListener('error', onError);
    };

    audio.addEventListener('canplaythrough', onReady, { once: true });
    audio.addEventListener('error', onError, { once: true });
    audio.src = src;
    audio.load();

    // 타임아웃 처리 (5초)
    setTimeout(() => {
      if (!preloadState.isComplete) {
        cleanup();
        preloadState.loaded++;
        resolve();
      }
    }, 5000);
  });
}

// 모든 에셋 프리로드
export async function preloadAllAssets(
  onProgress?: (loaded: number, total: number) => void
): Promise<PreloadState> {
  const allAssets = [...IMAGES_TO_PRELOAD, ...AUDIO_TO_PRELOAD];
  preloadState = {
    loaded: 0,
    total: allAssets.length,
    isComplete: false,
    errors: [],
  };

  // 진행 상황 콜백
  const progressInterval = onProgress
    ? setInterval(() => {
        onProgress(preloadState.loaded, preloadState.total);
      }, 100)
    : null;

  try {
    // 이미지와 오디오 병렬 로드
    await Promise.all([
      ...IMAGES_TO_PRELOAD.map(preloadImage),
      ...AUDIO_TO_PRELOAD.map(preloadAudio),
    ]);
  } finally {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    preloadState.isComplete = true;
  }

  if (preloadState.errors.length > 0) {
    console.warn('[Preloader] Some assets failed to load:', preloadState.errors);
  }

  console.log('[Preloader] Complete:', preloadState.loaded, '/', preloadState.total);
  return preloadState;
}

// 현재 프리로드 상태
export function getPreloadState(): PreloadState {
  return { ...preloadState };
}

// 특정 이미지 프리로드 (런타임 사용)
export function preloadImageNow(src: string): void {
  const img = new Image();
  img.src = src;
}

// 특정 오디오 프리로드 (런타임 사용)
export function preloadAudioNow(src: string): void {
  const audio = new Audio();
  audio.preload = 'auto';
  audio.src = src;
  audio.load();
}
