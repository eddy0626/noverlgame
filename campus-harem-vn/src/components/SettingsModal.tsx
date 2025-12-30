import { useGameStore } from '../game/store';
import { useAudioStore } from '../game/audioManager';

interface SettingsModalProps {
  onClose: () => void;
}

function SettingsModal({ onClose }: SettingsModalProps) {
  const { fontSize, setFontSize, textSpeed, setTextSpeed, deleteSave, returnToTitle } = useGameStore();
  const { bgmVolume, sfxVolume, isMuted, setBgmVolume, setSfxVolume, toggleMute, playSfx } = useAudioStore();

  const speedLabels = ['매우 느림', '느림', '보통', '빠름', '매우 빠름'];

  const handleReset = () => {
    if (confirm('정말로 저장 데이터를 삭제하시겠습니까?')) {
      deleteSave();
      returnToTitle();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>⚙️ 설정</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          {/* 글자 크기 설정 */}
          <div className="setting-section">
            <div className="setting-row">
              <label>글자 크기</label>
              <div className="font-controls">
                <button
                  className="font-btn"
                  onClick={() => setFontSize(fontSize - 2)}
                >
                  −
                </button>
                <span className="font-size-value">{fontSize}px</span>
                <button
                  className="font-btn"
                  onClick={() => setFontSize(fontSize + 2)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="setting-preview">
              <label>미리보기</label>
              <p style={{ fontSize: `${fontSize}px` }}>
                이것은 미리보기 텍스트입니다.
              </p>
            </div>
          </div>

          <hr className="setting-divider" />

          {/* 텍스트 속도 설정 */}
          <div className="setting-section">
            <div className="setting-row">
              <label>⏱️ 텍스트 속도</label>
              <div className="volume-control">
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={textSpeed}
                  onChange={(e) => setTextSpeed(parseInt(e.target.value))}
                  className="volume-slider"
                />
                <span className="volume-value">{speedLabels[textSpeed - 1]}</span>
              </div>
            </div>
            <p className="setting-hint">자동 모드에서 다음 대사로 넘어가는 속도</p>
          </div>

          <hr className="setting-divider" />

          {/* 오디오 설정 */}
          <div className="setting-section">
            <div className="setting-row">
              <label>🔇 음소거</label>
              <button
                className={`mute-btn ${isMuted ? 'muted' : ''}`}
                onClick={() => {
                  toggleMute();
                  playSfx('click');
                }}
              >
                {isMuted ? '🔇 OFF' : '🔊 ON'}
              </button>
            </div>

            <div className="setting-row">
              <label>🎵 BGM 볼륨</label>
              <div className="volume-control">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={bgmVolume}
                  onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
                  className="volume-slider"
                />
                <span className="volume-value">{Math.round(bgmVolume * 100)}%</span>
              </div>
            </div>

            <div className="setting-row">
              <label>🔔 효과음 볼륨</label>
              <div className="volume-control">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={sfxVolume}
                  onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                  className="volume-slider"
                />
                <span className="volume-value">{Math.round(sfxVolume * 100)}%</span>
              </div>
            </div>
          </div>

          <hr className="setting-divider" />

          {/* 데이터 삭제 */}
          <div className="setting-section danger-zone">
            <button className="btn-danger" onClick={handleReset}>
              🗑️ 저장 데이터 삭제
            </button>
            <p className="danger-hint">삭제 시 처음부터 다시 시작합니다</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
