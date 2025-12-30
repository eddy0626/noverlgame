// ========================================
// VN 엔진 타입 정의
// ========================================

// 게임 변수 (호감도 등)
export interface GameVariables {
  affectionA: number;  // 소꿉친구 유나 호감도
  affectionB: number;  // 선배 서연 호감도
  affectionC: number;  // 후배 하린 호감도
  honesty: number;     // 솔직함 수치
  resolve: number;     // 각오/책임감 수치
}

// 플래그 (이벤트 발생 여부)
export type GameFlags = Record<string, boolean>;

// 게임 상태
export interface GameState {
  currentNodeId: string;
  variables: GameVariables;
  flags: GameFlags;
  log: LogEntry[];
  chapter: number;
}

// 대사 로그 항목
export interface LogEntry {
  speaker: string;
  text: string;
  nodeId: string;
}

// ========================================
// 노드 시스템
// ========================================

// 효과 (변수 조작)
export interface Effect {
  op: 'set' | 'inc' | 'dec';  // 설정, 증가, 감소
  key: keyof GameVariables;
  value: number;
}

// 플래그 효과
export interface FlagEffect {
  op: 'set' | 'unset';
  key: string;
}

// 조건
export interface Condition {
  type: 'variable' | 'flag';
  key: string;
  op?: '>=' | '<=' | '==' | '>' | '<' | '!=';  // variable용
  value?: number;                               // variable용
  expected?: boolean;                           // flag용 (기본 true)
}

// 선택지
export interface Choice {
  text: string;
  condition?: Condition;      // 표시 조건 (없으면 항상 표시)
  effects?: Effect[];         // 변수 효과
  flagEffects?: FlagEffect[]; // 플래그 효과
  next: string;               // 다음 노드 ID
}

// 노드 타입들
export type NodeType = 'scene' | 'choice' | 'jump' | 'branch' | 'end';

// 기본 노드 인터페이스
export interface BaseNode {
  id: string;
  type: NodeType;
}

// 씬 노드 (대사/나레이션)
export interface SceneNode extends BaseNode {
  type: 'scene';
  speaker: string;           // 화자 (빈 문자열이면 나레이션)
  text: string;              // 대사 내용
  effects?: Effect[];        // 변수 효과
  flagEffects?: FlagEffect[];
  next: string;              // 다음 노드
}

// 선택지 노드
export interface ChoiceNode extends BaseNode {
  type: 'choice';
  prompt?: string;           // 선택 전 안내 문구 (선택)
  choices: Choice[];
}

// 점프 노드 (무조건 이동)
export interface JumpNode extends BaseNode {
  type: 'jump';
  next: string;
}

// 분기 노드 (조건부 이동)
export interface BranchNode extends BaseNode {
  type: 'branch';
  branches: {
    condition: Condition;
    next: string;
  }[];
  default: string;           // 모든 조건 불만족시
}

// 엔딩 노드
export interface EndNode extends BaseNode {
  type: 'end';
  endingId: string;          // 엔딩 식별자 (E1, E2 등)
  endingTitle: string;       // 엔딩 제목
  endingText: string;        // 엔딩 설명
}

// 모든 노드 유니온 타입
export type GameNode = SceneNode | ChoiceNode | JumpNode | BranchNode | EndNode;

// ========================================
// 시나리오 데이터 구조
// ========================================

export interface Scenario {
  meta: {
    title: string;
    version: string;
    author: string;
  };
  start: string;             // 시작 노드 ID
  nodes: Record<string, GameNode>;
}

// ========================================
// 저장 데이터
// ========================================

export interface SaveData {
  state: GameState;
  timestamp: number;
  version: string;
}
