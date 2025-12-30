// ========================================
// 게임 상태 관리 (Zustand)
// ========================================

import { create } from 'zustand';
import type {
  GameState,
  Scenario,
  GameNode,
  LogEntry,
  SaveData,
  Choice,
} from './types';
import {
  getInitialVariables,
  getInitialFlags,
  applyEffects,
  applyFlagEffects,
  getNode,
  getAvailableChoices,
  resolveBranch,
} from './engine';
import { useGalleryStore, getEndingCGId } from './galleryManager';

const SAVE_KEY_PREFIX = 'campus_harem_vn_save';
const AUTO_SAVE_KEY = 'campus_harem_vn_autosave';
const SAVE_VERSION = '1.0.0';
const MAX_SAVE_SLOTS = 6;

interface GameStore {
  // 상태
  scenario: Scenario | null;
  gameState: GameState | null;
  currentNode: GameNode | null;
  isPlaying: boolean;
  isEnded: boolean;
  endingInfo: { id: string; title: string; text: string } | null;

  // 설정
  fontSize: number;
  showLog: boolean;
  autoMode: boolean;
  skipMode: boolean;
  textSpeed: number; // 1-5, default 3

  // 액션
  loadScenario: (scenario: Scenario) => void;
  startNewGame: () => void;
  continueGame: () => boolean;
  goToNode: (nodeId: string) => void;
  selectChoice: (choice: Choice) => void;
  advanceScene: () => void;

  // 저장/로드 (멀티 슬롯)
  autoSave: () => void;
  saveToSlot: (slot: number) => void;
  loadFromSlot: (slot: number) => boolean;
  loadSave: () => boolean;
  hasSave: () => boolean;
  hasSlotSave: (slot: number) => boolean;
  getSlotInfo: (slot: number) => { timestamp: number; chapter: string; nodeId: string } | null;
  getAllSaveSlots: () => (SaveData | null)[];
  deleteSave: () => void;
  deleteSlot: (slot: number) => void;

  // 설정
  setFontSize: (size: number) => void;
  toggleLog: () => void;
  toggleAutoMode: () => void;
  toggleSkipMode: () => void;
  setTextSpeed: (speed: number) => void;

  // 게임 종료
  returnToTitle: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // 초기 상태
  scenario: null,
  gameState: null,
  currentNode: null,
  isPlaying: false,
  isEnded: false,
  endingInfo: null,
  fontSize: 16,
  showLog: false,
  autoMode: false,
  skipMode: false,
  textSpeed: 3,

  // 시나리오 로드
  loadScenario: (scenario) => {
    set({ scenario });
  },

  // 새 게임 시작
  startNewGame: () => {
    const { scenario } = get();
    if (!scenario) return;

    const initialState: GameState = {
      currentNodeId: scenario.start,
      variables: getInitialVariables(),
      flags: getInitialFlags(),
      log: [],
      chapter: 0,
    };

    const firstNode = getNode(scenario, scenario.start);

    set({
      gameState: initialState,
      currentNode: firstNode,
      isPlaying: true,
      isEnded: false,
      endingInfo: null,
    });

    // 자동 저장
    get().autoSave();
  },

  // 이어하기
  continueGame: () => {
    const loaded = get().loadSave();
    if (loaded) {
      set({ isPlaying: true });
    }
    return loaded;
  },

  // 노드 이동
  goToNode: (nodeId) => {
    const { scenario, gameState } = get();
    if (!scenario || !gameState) return;

    const node = getNode(scenario, nodeId);
    if (!node) return;

    let newState = { ...gameState, currentNodeId: nodeId };

    // 씬 노드면 로그에 추가
    if (node.type === 'scene') {
      const logEntry: LogEntry = {
        speaker: node.speaker,
        text: node.text,
        nodeId: node.id,
      };
      newState.log = [...newState.log, logEntry];

      // 효과 적용
      if (node.effects) {
        newState.variables = applyEffects(node.effects, newState.variables);
      }
      if (node.flagEffects) {
        newState.flags = applyFlagEffects(node.flagEffects, newState.flags);
      }
    }

    // 엔딩 노드 처리
    if (node.type === 'end') {
      // 엔딩 CG 해금
      const cgId = getEndingCGId(node.endingId);
      if (cgId) {
        useGalleryStore.getState().unlockCG(cgId);
      }
      // 엔딩 자체도 해금
      useGalleryStore.getState().unlockEnding(node.endingId);

      set({
        gameState: newState,
        currentNode: node,
        isEnded: true,
        endingInfo: {
          id: node.endingId,
          title: node.endingTitle,
          text: node.endingText,
        },
      });
      // 엔딩 도달시 세이브 삭제 (새 게임 유도)
      get().deleteSave();
      return;
    }

    // 점프/분기 노드는 자동 진행
    if (node.type === 'jump') {
      set({ gameState: newState, currentNode: node });
      get().goToNode(node.next);
      return;
    }

    if (node.type === 'branch') {
      const nextId = resolveBranch(node, newState.variables, newState.flags);
      set({ gameState: newState, currentNode: node });
      get().goToNode(nextId);
      return;
    }

    set({
      gameState: newState,
      currentNode: node,
    });

    // 자동 저장
    get().autoSave();
  },

  // 선택지 선택
  selectChoice: (choice) => {
    const { gameState } = get();
    if (!gameState) return;

    let newState = { ...gameState };

    // 효과 적용
    if (choice.effects) {
      newState.variables = applyEffects(choice.effects, newState.variables);
    }
    if (choice.flagEffects) {
      newState.flags = applyFlagEffects(choice.flagEffects, newState.flags);
    }

    set({ gameState: newState });
    get().goToNode(choice.next);
  },

  // 씬 진행 (다음 노드로)
  advanceScene: () => {
    const { currentNode } = get();
    if (!currentNode || currentNode.type !== 'scene') return;
    get().goToNode(currentNode.next);
  },

  // 자동 저장
  autoSave: () => {
    const { gameState } = get();
    if (!gameState) return;

    const saveData: SaveData = {
      state: gameState,
      timestamp: Date.now(),
      version: SAVE_VERSION,
    };

    try {
      localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(saveData));
    } catch (e) {
      console.error('[VN] 자동저장 실패:', e);
    }
  },

  // 슬롯에 저장
  saveToSlot: (slot: number) => {
    const { gameState } = get();
    if (!gameState || slot < 0 || slot >= MAX_SAVE_SLOTS) return;

    const saveData: SaveData = {
      state: gameState,
      timestamp: Date.now(),
      version: SAVE_VERSION,
    };

    try {
      localStorage.setItem(`${SAVE_KEY_PREFIX}_${slot}`, JSON.stringify(saveData));
    } catch (e) {
      console.error('[VN] 슬롯 저장 실패:', e);
    }
  },

  // 슬롯에서 로드
  loadFromSlot: (slot: number) => {
    const { scenario } = get();
    if (!scenario || slot < 0 || slot >= MAX_SAVE_SLOTS) return false;

    try {
      const saved = localStorage.getItem(`${SAVE_KEY_PREFIX}_${slot}`);
      if (!saved) return false;

      const saveData: SaveData = JSON.parse(saved);
      const node = getNode(scenario, saveData.state.currentNodeId);
      if (!node) return false;

      set({
        gameState: saveData.state,
        currentNode: node,
        isEnded: false,
        endingInfo: null,
        isPlaying: true,
      });

      return true;
    } catch (e) {
      console.error('[VN] 슬롯 로드 실패:', e);
      return false;
    }
  },

  // 저장 로드 (자동저장에서)
  loadSave: () => {
    const { scenario } = get();
    if (!scenario) return false;

    try {
      const saved = localStorage.getItem(AUTO_SAVE_KEY);
      if (!saved) return false;

      const saveData: SaveData = JSON.parse(saved);

      // 버전 체크 (간단히)
      if (saveData.version !== SAVE_VERSION) {
        console.warn('[VN] 세이브 버전 불일치');
      }

      const node = getNode(scenario, saveData.state.currentNodeId);
      if (!node) return false;

      set({
        gameState: saveData.state,
        currentNode: node,
        isEnded: false,
        endingInfo: null,
      });

      return true;
    } catch (e) {
      console.error('[VN] 로드 실패:', e);
      return false;
    }
  },

  // 자동저장 존재 확인
  hasSave: () => {
    try {
      return localStorage.getItem(AUTO_SAVE_KEY) !== null;
    } catch {
      return false;
    }
  },

  // 슬롯 세이브 존재 확인
  hasSlotSave: (slot: number) => {
    try {
      return localStorage.getItem(`${SAVE_KEY_PREFIX}_${slot}`) !== null;
    } catch {
      return false;
    }
  },

  // 슬롯 정보 가져오기
  getSlotInfo: (slot: number) => {
    try {
      const saved = localStorage.getItem(`${SAVE_KEY_PREFIX}_${slot}`);
      if (!saved) return null;

      const saveData: SaveData = JSON.parse(saved);
      const nodeId = saveData.state.currentNodeId;
      let chapter = '프롤로그';
      if (nodeId.startsWith('C1')) chapter = 'Chapter 1';
      else if (nodeId.startsWith('C2')) chapter = 'Chapter 2';
      else if (nodeId.startsWith('C3')) chapter = 'Chapter 3';

      return {
        timestamp: saveData.timestamp,
        chapter,
        nodeId,
      };
    } catch {
      return null;
    }
  },

  // 모든 세이브 슬롯 정보
  getAllSaveSlots: () => {
    const slots: (SaveData | null)[] = [];
    for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
      try {
        const saved = localStorage.getItem(`${SAVE_KEY_PREFIX}_${i}`);
        slots.push(saved ? JSON.parse(saved) : null);
      } catch {
        slots.push(null);
      }
    }
    return slots;
  },

  // 자동저장 삭제
  deleteSave: () => {
    try {
      localStorage.removeItem(AUTO_SAVE_KEY);
    } catch (e) {
      console.error('[VN] 세이브 삭제 실패:', e);
    }
  },

  // 슬롯 삭제
  deleteSlot: (slot: number) => {
    try {
      localStorage.removeItem(`${SAVE_KEY_PREFIX}_${slot}`);
    } catch (e) {
      console.error('[VN] 슬롯 삭제 실패:', e);
    }
  },

  // 글자 크기 설정
  setFontSize: (size) => {
    set({ fontSize: Math.max(12, Math.min(24, size)) });
  },

  // 로그 토글
  toggleLog: () => {
    set((state) => ({ showLog: !state.showLog }));
  },

  // 자동 모드 토글
  toggleAutoMode: () => {
    set((state) => ({
      autoMode: !state.autoMode,
      skipMode: false // 자동 모드 켜면 스킵 모드 끔
    }));
  },

  // 스킵 모드 토글
  toggleSkipMode: () => {
    set((state) => ({
      skipMode: !state.skipMode,
      autoMode: false // 스킵 모드 켜면 자동 모드 끔
    }));
  },

  // 텍스트 속도 설정
  setTextSpeed: (speed) => {
    set({ textSpeed: Math.max(1, Math.min(5, speed)) });
  },

  // 타이틀로 돌아가기
  returnToTitle: () => {
    set({
      isPlaying: false,
      isEnded: false,
      endingInfo: null,
      gameState: null,
      currentNode: null,
    });
  },
}));

// 선택지 필터링 헬퍼
export function useAvailableChoices(): Choice[] {
  const { currentNode, gameState } = useGameStore();

  if (!currentNode || currentNode.type !== 'choice' || !gameState) {
    return [];
  }

  return getAvailableChoices(
    currentNode.choices,
    gameState.variables,
    gameState.flags
  );
}
