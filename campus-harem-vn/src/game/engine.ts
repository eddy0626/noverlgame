// ========================================
// VN 엔진 핵심 로직
// ========================================

import type {
  Condition,
  Effect,
  FlagEffect,
  GameVariables,
  GameFlags,
  GameNode,
  Scenario,
  Choice,
} from './types';

// 조건 체크
export function checkCondition(
  condition: Condition,
  variables: GameVariables,
  flags: GameFlags
): boolean {
  if (condition.type === 'flag') {
    const flagValue = flags[condition.key] ?? false;
    const expected = condition.expected ?? true;
    return flagValue === expected;
  }

  if (condition.type === 'variable') {
    const varValue = variables[condition.key as keyof GameVariables];
    const targetValue = condition.value ?? 0;
    const op = condition.op ?? '>=';

    switch (op) {
      case '>=': return varValue >= targetValue;
      case '<=': return varValue <= targetValue;
      case '==': return varValue === targetValue;
      case '>':  return varValue > targetValue;
      case '<':  return varValue < targetValue;
      case '!=': return varValue !== targetValue;
      default:   return false;
    }
  }

  return false;
}

// 효과 적용 (변수)
export function applyEffects(
  effects: Effect[],
  variables: GameVariables
): GameVariables {
  const newVars = { ...variables };

  for (const effect of effects) {
    const key = effect.key;
    switch (effect.op) {
      case 'set':
        newVars[key] = effect.value;
        break;
      case 'inc':
        newVars[key] = (newVars[key] ?? 0) + effect.value;
        break;
      case 'dec':
        newVars[key] = (newVars[key] ?? 0) - effect.value;
        break;
    }
    // 범위 제한 (0~100)
    newVars[key] = Math.max(0, Math.min(100, newVars[key]));
  }

  return newVars;
}

// 플래그 효과 적용
export function applyFlagEffects(
  flagEffects: FlagEffect[],
  flags: GameFlags
): GameFlags {
  const newFlags = { ...flags };

  for (const effect of flagEffects) {
    if (effect.op === 'set') {
      newFlags[effect.key] = true;
    } else if (effect.op === 'unset') {
      delete newFlags[effect.key];
    }
  }

  return newFlags;
}

// 표시 가능한 선택지 필터링
export function getAvailableChoices(
  choices: Choice[],
  variables: GameVariables,
  flags: GameFlags
): Choice[] {
  return choices.filter(choice => {
    if (!choice.condition) return true;
    return checkCondition(choice.condition, variables, flags);
  });
}

// 분기 노드에서 다음 노드 결정
export function resolveBranch(
  node: { branches: { condition: Condition; next: string }[]; default: string },
  variables: GameVariables,
  flags: GameFlags
): string {
  for (const branch of node.branches) {
    if (checkCondition(branch.condition, variables, flags)) {
      return branch.next;
    }
  }
  return node.default;
}

// 노드 가져오기 (에러 처리 포함)
export function getNode(scenario: Scenario, nodeId: string): GameNode | null {
  const node = scenario.nodes[nodeId];
  if (!node) {
    console.error(`[VN Engine] Node not found: ${nodeId}`);
    return null;
  }
  return node;
}

// 초기 변수
export function getInitialVariables(): GameVariables {
  return {
    affectionA: 0,
    affectionB: 0,
    affectionC: 0,
    honesty: 50,
    resolve: 50,
  };
}

// 초기 플래그
export function getInitialFlags(): GameFlags {
  return {};
}

// 시나리오 유효성 검사 (간단)
export function validateScenario(scenario: Scenario): string[] {
  const errors: string[] = [];

  if (!scenario.start) {
    errors.push('시작 노드가 정의되지 않았습니다.');
  }

  if (!scenario.nodes[scenario.start]) {
    errors.push(`시작 노드 "${scenario.start}"를 찾을 수 없습니다.`);
  }

  // 모든 next 참조 확인
  for (const [id, node] of Object.entries(scenario.nodes)) {
    if (node.type === 'scene' || node.type === 'jump') {
      if (!scenario.nodes[node.next]) {
        errors.push(`노드 "${id}"의 next "${node.next}"를 찾을 수 없습니다.`);
      }
    }
    if (node.type === 'choice') {
      for (const choice of node.choices) {
        if (!scenario.nodes[choice.next]) {
          errors.push(`노드 "${id}"의 선택지 next "${choice.next}"를 찾을 수 없습니다.`);
        }
      }
    }
    if (node.type === 'branch') {
      for (const branch of node.branches) {
        if (!scenario.nodes[branch.next]) {
          errors.push(`노드 "${id}"의 분기 next "${branch.next}"를 찾을 수 없습니다.`);
        }
      }
      if (!scenario.nodes[node.default]) {
        errors.push(`노드 "${id}"의 default "${node.default}"를 찾을 수 없습니다.`);
      }
    }
  }

  return errors;
}
