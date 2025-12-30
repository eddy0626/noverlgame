import { useState } from 'react';
import { useGameStore } from '../game/store';
import { useAudioStore } from '../game/audioManager';
import GalleryModal from './GalleryModal';

function TitleScreen() {
  const { startNewGame, continueGame, hasSave, scenario } = useGameStore();
  const { playSfx, playBgm } = useAudioStore();
  const [showGallery, setShowGallery] = useState(false);

  // 타이틀 BGM 재생
  useState(() => {
    playBgm('title');
  });

  const handleContinue = () => {
    if (!continueGame()) {
      alert('저장된 게임을 불러올 수 없습니다.');
    }
  };

  return (
    <div className="title-screen">
      {/* 배경 별 효과 */}
      <div className="title-stars">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* 캐릭터 실루엣 */}
      <div className="title-characters">
        <div className="character-silhouette yuna">유나</div>
        <div className="character-silhouette seoyeon">서연</div>
        <div className="character-silhouette harin">하린</div>
      </div>

      {/* 로고 */}
      <div className="title-logo">
        <h1>{scenario?.meta.title || 'Campus Harem VN'}</h1>
        <p className="subtitle">~ 캠퍼스에서 시작되는 이야기 ~</p>
      </div>

      {/* 메뉴 버튼 */}
      <div className="title-menu">
        <button
          className="btn-primary"
          onClick={() => {
            playSfx('click');
            startNewGame();
          }}
        >
          <span>✦</span> 처음부터 <span>✦</span>
        </button>
        <button
          className="btn-secondary"
          onClick={() => {
            playSfx('click');
            handleContinue();
          }}
          disabled={!hasSave()}
        >
          이어하기
        </button>
        <button
          className="btn-secondary"
          onClick={() => {
            playSfx('click');
            setShowGallery(true);
          }}
        >
          🖼️ 갤러리
        </button>
      </div>

      {/* 갤러리 모달 */}
      {showGallery && <GalleryModal onClose={() => setShowGallery(false)} />}

      {/* 버전 정보 */}
      <p className="title-version">
        v{scenario?.meta.version || '1.0.0'}
      </p>
    </div>
  );
}

export default TitleScreen;
