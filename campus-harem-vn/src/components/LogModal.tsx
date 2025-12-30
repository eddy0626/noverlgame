import { useGameStore } from '../game/store';

interface LogModalProps {
  onClose: () => void;
}

// 화자에 따른 클래스 반환
function getSpeakerClass(speaker: string | undefined): string {
  if (!speaker || speaker === '나' || speaker === '―') return 'narrator';
  const s = speaker.toLowerCase();
  if (s.includes('유나')) return 'yuna';
  if (s.includes('서연')) return 'seoyeon';
  if (s.includes('하린')) return 'harin';
  return '';
}

function LogModal({ onClose }: LogModalProps) {
  const { gameState, fontSize } = useGameStore();

  const logs = gameState?.log ?? [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal log-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📜 대사 로그</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-content" style={{ fontSize: `${fontSize - 2}px` }}>
          {logs.length === 0 ? (
            <p className="empty-log">아직 기록이 없습니다.</p>
          ) : (
            <div className="log-list">
              {[...logs].reverse().map((entry, index) => (
                <div key={index} className={`log-entry ${getSpeakerClass(entry.speaker)}`}>
                  <div className="log-speaker">
                    {entry.speaker || '―'}
                  </div>
                  <div className="log-text">{entry.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LogModal;
