import { useState, useMemo, useEffect } from 'react';
import { useGameStore } from '../game/store';
import { useAudioStore, getBgmForScene } from '../game/audioManager';
import TextBox from './TextBox';
import ChoiceButtons from './ChoiceButtons';
import LogModal from './LogModal';
import SettingsModal from './SettingsModal';
import SaveLoadModal from './SaveLoadModal';
import CharacterSprite from './CharacterSprite';

function GameScreen() {
  const {
    currentNode,
    isEnded,
    endingInfo,
    gameState,
    returnToTitle,
    toggleLog,
    showLog,
    autoMode,
    skipMode,
    toggleAutoMode,
    toggleSkipMode,
  } = useGameStore();

  const [showSettings, setShowSettings] = useState(false);
  const [showSaveLoad, setShowSaveLoad] = useState<'save' | 'load' | null>(null);
  const { playBgm, playSfx } = useAudioStore();

  // 씬에 따른 BGM 자동 재생
  useEffect(() => {
    if (currentNode && !isEnded) {
      const bgmTrack = getBgmForScene(currentNode.id);
      playBgm(bgmTrack);
    }
  }, [currentNode?.id, isEnded, playBgm]);

  // 사쿠라 파티클 생성
  const sakuraParticles = useMemo(() => {
    return [...Array(15)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 10}s`,
      duration: `${10 + Math.random() * 10}s`,
    }));
  }, []);

  // 엔딩 화면
  if (isEnded && endingInfo) {
    // 엔딩별 특별 효과 클래스
    const getEndingClass = () => {
      if (endingInfo.id === 'E4') return 'harem';
      if (endingInfo.id === 'E6') return 'true';
      return '';
    };

    return (
      <div className={`ending-screen ${getEndingClass()}`}>
        <div className="ending-glow" />
        <p className="ending-label">✦ ENDING ✦</p>
        <h2 className="ending-title">{endingInfo.title}</h2>
        <p className="ending-text">{endingInfo.text}</p>
        <button className="btn-primary" onClick={returnToTitle}>
          타이틀로 돌아가기
        </button>
      </div>
    );
  }

  if (!currentNode || !gameState) {
    return (
      <div className="game-screen">
        <div className="loading-text">로딩 중...</div>
      </div>
    );
  }

  // 챕터 정보 (현재 노드 ID 기반)
  const getChapterInfo = () => {
    const nodeId = currentNode.id;
    if (nodeId.startsWith('P')) return '프롤로그';
    if (nodeId.startsWith('C1')) return 'Chapter 1';
    if (nodeId.startsWith('C2')) return 'Chapter 2';
    if (nodeId.startsWith('C3')) return 'Chapter 3';
    return '';
  };

  // 현재 장면의 배경 타입 추정 (노드 ID 기반)
  const getBackgroundType = () => {
    const nodeId = currentNode.id.toLowerCase();
    if (nodeId.includes('cafe')) return 'cafe';
    if (nodeId.includes('library')) return 'library';
    if (nodeId.includes('night')) return 'night';
    if (nodeId.includes('roof')) return 'rooftop';
    return 'classroom'; // 기본 배경을 교실로 변경
  };

  // 배경 이미지 경로
  const getBackgroundImage = () => {
    const bgType = getBackgroundType();
    const bgMap: Record<string, string> = {
      classroom: '/backgrounds/classroom.png',
      library: '/backgrounds/library.png',
      cafe: '/backgrounds/cafe.png',
      campus: '/backgrounds/classroom.png',
      night: '/backgrounds/classroom.png',
      rooftop: '/backgrounds/classroom.png',
    };
    return bgMap[bgType] || '/backgrounds/classroom.png';
  };

  return (
    <div className="game-screen">
      {/* 배경 레이어 */}
      <div className={`game-background ${getBackgroundType()}`}>
        <img
          src={getBackgroundImage()}
          alt="background"
          className="bg-image"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            imageRendering: 'pixelated',
          }}
        />
        <div className="bg-overlay" />
      </div>

      {/* 사쿠라 파티클 */}
      <div className="sakura-particles">
        {sakuraParticles.map((p) => (
          <div
            key={p.id}
            className="sakura"
            style={{
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      {/* 캐릭터 레이어 */}
      <div className="character-layer">
        {currentNode.type === 'scene' && currentNode.speaker && (
          <>
            {/* 현재 화자 캐릭터 표시 */}
            {['유나', '서연', '하린'].includes(currentNode.speaker) && (
              <CharacterSprite
                character={currentNode.speaker}
                expression="normal"
                position="center"
                isActive={true}
              />
            )}
          </>
        )}
      </div>

      {/* 상단 바 */}
      <div className="top-bar">
        <span className="chapter-info">{getChapterInfo()}</span>
        <div className="auto-skip-controls">
          <button
            className={`auto-btn ${autoMode ? 'active' : ''}`}
            onClick={() => { playSfx('click'); toggleAutoMode(); }}
          >
            {autoMode ? '⏸ AUTO' : '▶ AUTO'}
          </button>
          <button
            className={`skip-btn ${skipMode ? 'active' : ''}`}
            onClick={() => { playSfx('click'); toggleSkipMode(); }}
          >
            {skipMode ? '⏸ SKIP' : '⏩ SKIP'}
          </button>
        </div>
        <div className="menu-buttons">
          <button onClick={() => { playSfx('click'); setShowSaveLoad('save'); }}>💾</button>
          <button onClick={() => { playSfx('click'); setShowSaveLoad('load'); }}>📂</button>
          <button onClick={toggleLog}>📜</button>
          <button onClick={() => setShowSettings(true)}>⚙️</button>
          <button onClick={returnToTitle}>🏠</button>
        </div>
      </div>

      {/* 게임 컨텐츠 */}
      <div className="game-content">
        {currentNode.type === 'choice' && <ChoiceButtons />}
        {currentNode.type === 'scene' && <TextBox />}
      </div>

      {/* 모달들 */}
      {showLog && <LogModal onClose={toggleLog} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showSaveLoad && (
        <SaveLoadModal
          mode={showSaveLoad}
          onClose={() => setShowSaveLoad(null)}
        />
      )}
    </div>
  );
}

export default GameScreen;
