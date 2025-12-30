import { useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '../game/store';
import { useAudioStore } from '../game/audioManager';
import type { SceneNode } from '../game/types';

function TextBox() {
  const { currentNode, advanceScene, fontSize, autoMode, skipMode, textSpeed } = useGameStore();
  const { playSfx } = useAudioStore();
  const autoTimerRef = useRef<number | null>(null);

  const handleAdvance = useCallback(() => {
    playSfx('message');
    advanceScene();
  }, [playSfx, advanceScene]);

  // 키보드 컨트롤 (Space, Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleAdvance();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAdvance]);

  // 자동/스킵 모드 처리
  useEffect(() => {
    // 이전 타이머 정리
    if (autoTimerRef.current) {
      clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }

    if (!currentNode || currentNode.type !== 'scene') return;

    if (skipMode) {
      // 스킵 모드: 매우 빠르게 진행 (100ms)
      autoTimerRef.current = window.setTimeout(() => {
        advanceScene();
      }, 100);
    } else if (autoMode) {
      // 자동 모드: 텍스트 길이와 속도에 따라 대기
      const textLength = (currentNode as SceneNode).text?.length || 0;
      const baseDelay = 3000 - (textSpeed - 1) * 500; // 속도 1: 3s, 속도 5: 1s
      const delay = Math.max(1000, baseDelay + textLength * 30);

      autoTimerRef.current = window.setTimeout(() => {
        advanceScene();
      }, delay);
    }

    return () => {
      if (autoTimerRef.current) {
        clearTimeout(autoTimerRef.current);
      }
    };
  }, [currentNode, autoMode, skipMode, textSpeed, advanceScene]);

  if (!currentNode || currentNode.type !== 'scene') {
    return null;
  }

  const node = currentNode as SceneNode;
  const isNarrator = !node.speaker || node.speaker === '나' || node.speaker === '';

  // 캐릭터별 스타일 클래스
  const getSpeakerClass = () => {
    if (isNarrator) return 'narrator';
    const speaker = node.speaker?.toLowerCase() || '';
    if (speaker.includes('유나')) return 'yuna';
    if (speaker.includes('서연')) return 'seoyeon';
    if (speaker.includes('하린')) return 'harin';
    return '';
  };

  return (
    <div
      className="textbox"
      onClick={handleAdvance}
      style={{ fontSize: `${fontSize}px` }}
    >
      {/* 코너 장식 */}
      <div className="textbox-corner top-left" />
      <div className="textbox-corner top-right" />
      <div className="textbox-corner bottom-left" />
      <div className="textbox-corner bottom-right" />

      {/* 화자 이름 */}
      {node.speaker && (
        <div className={`speaker ${getSpeakerClass()}`}>
          {node.speaker === '나' ? '―' : node.speaker}
        </div>
      )}

      {/* 대사 텍스트 */}
      <div className="text">{node.text}</div>

      {/* 탭 힌트 */}
      <div className="tap-hint">
        <span className="tap-icon">▼</span>
        클릭 또는 Space/Enter
      </div>
    </div>
  );
}

export default TextBox;
