// ========================================
// 갤러리 매니저 (CG 컬렉션)
// ========================================

import { create } from 'zustand';

const GALLERY_KEY = 'campus_harem_vn_gallery';

// CG 정의 (이벤트 CG 및 엔딩 CG)
export interface CGItem {
  id: string;
  title: string;
  description: string;
  category: 'event' | 'ending';
  character?: string;
  thumbnail?: string;
}

export const CG_COLLECTION: CGItem[] = [
  // 이벤트 CG
  {
    id: 'cg_prologue_meet',
    title: '첫 만남',
    description: '캠퍼스에서의 첫날, 세 명의 여학생과 우연히 마주치다.',
    category: 'event',
  },
  {
    id: 'cg_yuna_cafe',
    title: '유나와의 카페 데이트',
    description: '소꿉친구 유나와 함께한 따뜻한 오후.',
    category: 'event',
    character: '유나',
  },
  {
    id: 'cg_seoyeon_library',
    title: '도서관의 서연',
    description: '조용한 도서관에서 서연 선배와의 특별한 시간.',
    category: 'event',
    character: '서연',
  },
  {
    id: 'cg_harin_rooftop',
    title: '옥상의 하린',
    description: '석양이 물드는 옥상에서 하린과 함께.',
    category: 'event',
    character: '하린',
  },
  // 엔딩 CG
  {
    id: 'cg_ending_e1',
    title: '유나 엔딩',
    description: '소꿉친구와의 영원한 약속',
    category: 'ending',
    character: '유나',
  },
  {
    id: 'cg_ending_e2',
    title: '서연 엔딩',
    description: '선배와의 졸업 후 재회',
    category: 'ending',
    character: '서연',
  },
  {
    id: 'cg_ending_e3',
    title: '하린 엔딩',
    description: '후배와 함께하는 새로운 시작',
    category: 'ending',
    character: '하린',
  },
  {
    id: 'cg_ending_e4',
    title: '하렘 엔딩',
    description: '모두와 함께하는 특별한 결말',
    category: 'ending',
  },
  {
    id: 'cg_ending_e5',
    title: '혼자 엔딩',
    description: '자기 발전을 선택한 결말',
    category: 'ending',
  },
  {
    id: 'cg_ending_e6',
    title: '트루 엔딩',
    description: '진정한 사랑을 찾은 완벽한 결말',
    category: 'ending',
  },
];

// 엔딩 정보 타입
export interface EndingInfo {
  id: string;
  title: string;
  description: string;
  character?: string;
  special?: 'harem' | 'true' | 'solo';
}

// 엔딩 목록
export const ENDINGS: EndingInfo[] = [
  { id: 'E1', title: '유나 엔딩', description: '소꿉친구와의 영원한 약속', character: '유나' },
  { id: 'E2', title: '서연 엔딩', description: '선배와의 졸업 후 재회', character: '서연' },
  { id: 'E3', title: '하린 엔딩', description: '후배와 함께하는 새로운 시작', character: '하린' },
  { id: 'E4', title: '하렘 엔딩', description: '모두와 함께하는 특별한 결말', special: 'harem' },
  { id: 'E5', title: '혼자 엔딩', description: '자기 발전을 선택한 결말', special: 'solo' },
  { id: 'E6', title: '트루 엔딩', description: '진정한 사랑을 찾은 완벽한 결말', special: 'true' },
];

interface GalleryState {
  unlockedCGs: string[];
  unlockedEndings: string[];

  // 액션
  unlockCG: (cgId: string) => void;
  unlockEnding: (endingId: string) => void;
  isUnlocked: (cgId: string) => boolean;
  isEndingUnlocked: (endingId: string) => boolean;
  getUnlockedCount: () => number;
  getTotalCount: () => number;
  getProgress: () => number;
  getEndingProgress: () => { unlocked: number; total: number };
  resetGallery: () => void;
}

const ENDINGS_KEY = 'campus_harem_vn_endings';

export const useGalleryStore = create<GalleryState>((set, get) => {
  // 저장된 갤러리 데이터 로드
  let savedCGs: string[] = [];
  let savedEndings: string[] = [];
  try {
    const savedCG = localStorage.getItem(GALLERY_KEY);
    if (savedCG) {
      savedCGs = JSON.parse(savedCG);
    }
    const savedEnd = localStorage.getItem(ENDINGS_KEY);
    if (savedEnd) {
      savedEndings = JSON.parse(savedEnd);
    }
  } catch (e) {
    console.error('[Gallery] 로드 실패:', e);
  }

  return {
    unlockedCGs: savedCGs,
    unlockedEndings: savedEndings,

    unlockCG: (cgId) => {
      const { unlockedCGs } = get();
      if (!unlockedCGs.includes(cgId)) {
        const newUnlocked = [...unlockedCGs, cgId];
        set({ unlockedCGs: newUnlocked });

        // 저장
        try {
          localStorage.setItem(GALLERY_KEY, JSON.stringify(newUnlocked));
        } catch (e) {
          console.error('[Gallery] 저장 실패:', e);
        }
      }
    },

    unlockEnding: (endingId) => {
      const { unlockedEndings } = get();
      if (!unlockedEndings.includes(endingId)) {
        const newUnlocked = [...unlockedEndings, endingId];
        set({ unlockedEndings: newUnlocked });

        // 저장
        try {
          localStorage.setItem(ENDINGS_KEY, JSON.stringify(newUnlocked));
        } catch (e) {
          console.error('[Gallery] 엔딩 저장 실패:', e);
        }
      }
    },

    isUnlocked: (cgId) => {
      return get().unlockedCGs.includes(cgId);
    },

    isEndingUnlocked: (endingId) => {
      return get().unlockedEndings.includes(endingId);
    },

    getUnlockedCount: () => {
      return get().unlockedCGs.length;
    },

    getTotalCount: () => {
      return CG_COLLECTION.length;
    },

    getProgress: () => {
      const { unlockedCGs } = get();
      return Math.round((unlockedCGs.length / CG_COLLECTION.length) * 100);
    },

    getEndingProgress: () => {
      const { unlockedEndings } = get();
      return {
        unlocked: unlockedEndings.length,
        total: ENDINGS.length,
      };
    },

    resetGallery: () => {
      set({ unlockedCGs: [], unlockedEndings: [] });
      try {
        localStorage.removeItem(GALLERY_KEY);
        localStorage.removeItem(ENDINGS_KEY);
      } catch (e) {
        console.error('[Gallery] 리셋 실패:', e);
      }
    },
  };
});

// 엔딩 ID와 CG ID 매핑
export function getEndingCGId(endingId: string): string | null {
  const mapping: Record<string, string> = {
    'E1': 'cg_ending_e1',
    'E2': 'cg_ending_e2',
    'E3': 'cg_ending_e3',
    'E4': 'cg_ending_e4',
    'E5': 'cg_ending_e5',
    'E6': 'cg_ending_e6',
  };
  return mapping[endingId] || null;
}
