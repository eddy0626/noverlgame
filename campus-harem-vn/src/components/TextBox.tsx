import { useGameStore } from '../game/store';
import { useAudioStore } from '../game/audioManager';
import type { SceneNode } from '../game/types';

function TextBox() {
  const { currentNode, advanceScene, fontSize } = useGameStore();
  const { playSfx } = useAudioStore();

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

  const handleClick = () => {
    playSfx('message');
    advanceScene();
  };

  return (
    <div
      className="textbox"
      onClick={handleClick}
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
        탭하여 계속
      </div>
    </div>
  );
}

export default TextBox;
