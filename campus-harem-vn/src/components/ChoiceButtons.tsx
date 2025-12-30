import { useGameStore, useAvailableChoices } from '../game/store';
import { useAudioStore } from '../game/audioManager';
import type { ChoiceNode } from '../game/types';

function ChoiceButtons() {
  const { currentNode, selectChoice, fontSize } = useGameStore();
  const { playSfx } = useAudioStore();
  const availableChoices = useAvailableChoices();

  if (!currentNode || currentNode.type !== 'choice') {
    return null;
  }

  const node = currentNode as ChoiceNode;

  return (
    <div className="choices" style={{ fontSize: `${fontSize}px` }}>
      {node.prompt && (
        <p className="choice-prompt">
          <span className="prompt-deco">♦</span>
          {node.prompt}
          <span className="prompt-deco">♦</span>
        </p>
      )}
      <div className="choice-list">
        {availableChoices.map((choice, index) => (
          <button
            key={index}
            className="choice-btn"
            onClick={() => {
              playSfx('choice');
              selectChoice(choice);
            }}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <span className="choice-icon">▸</span>
            <span className="choice-text">{choice.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ChoiceButtons;
