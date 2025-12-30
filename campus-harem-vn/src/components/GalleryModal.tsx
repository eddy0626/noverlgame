// ========================================
// 갤러리 모달 컴포넌트
// ========================================

import { useState } from 'react';
import { useGalleryStore, CG_COLLECTION, CGItem } from '../game/galleryManager';

interface GalleryModalProps {
  onClose: () => void;
}

function GalleryModal({ onClose }: GalleryModalProps) {
  const { isUnlocked, getProgress, getUnlockedCount, getTotalCount } = useGalleryStore();
  const [selectedCG, setSelectedCG] = useState<CGItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'event' | 'ending'>('all');

  const filteredCGs = CG_COLLECTION.filter((cg) => {
    if (filter === 'all') return true;
    return cg.category === filter;
  });

  // 캐릭터별 색상
  const getCharacterColor = (character?: string) => {
    switch (character) {
      case '유나': return 'var(--color-yuna)';
      case '서연': return 'var(--color-seoyeon)';
      case '하린': return 'var(--color-harin)';
      default: return 'var(--accent-gold)';
    }
  };

  // CG 뷰어 렌더링
  if (selectedCG) {
    const unlocked = isUnlocked(selectedCG.id);
    return (
      <div className="modal-overlay" onClick={() => setSelectedCG(null)}>
        <div className="cg-viewer" onClick={(e) => e.stopPropagation()}>
          <button className="cg-close-btn" onClick={() => setSelectedCG(null)}>
            ×
          </button>
          <div className="cg-image-container">
            {unlocked ? (
              <div
                className="cg-image"
                style={{
                  background: `linear-gradient(135deg, ${getCharacterColor(selectedCG.character)}33 0%, var(--bg-tertiary) 100%)`,
                }}
              >
                <span className="cg-placeholder-icon">
                  {selectedCG.category === 'ending' ? '👑' : '💫'}
                </span>
                <p className="cg-placeholder-text">{selectedCG.title}</p>
              </div>
            ) : (
              <div className="cg-image locked">
                <span className="cg-lock-icon">🔒</span>
                <p className="cg-lock-text">미해금</p>
              </div>
            )}
          </div>
          {unlocked && (
            <div className="cg-details">
              <h3>{selectedCG.title}</h3>
              <p>{selectedCG.description}</p>
              {selectedCG.character && (
                <span
                  className="cg-character-tag"
                  style={{ color: getCharacterColor(selectedCG.character) }}
                >
                  ♥ {selectedCG.character}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal gallery-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🖼️ 갤러리</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* 진행도 */}
        <div className="gallery-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${getProgress()}%` }}
            />
          </div>
          <span className="progress-text">
            {getUnlockedCount()} / {getTotalCount()} ({getProgress()}%)
          </span>
        </div>

        {/* 필터 탭 */}
        <div className="gallery-tabs">
          <button
            className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            전체
          </button>
          <button
            className={`tab-btn ${filter === 'event' ? 'active' : ''}`}
            onClick={() => setFilter('event')}
          >
            이벤트
          </button>
          <button
            className={`tab-btn ${filter === 'ending' ? 'active' : ''}`}
            onClick={() => setFilter('ending')}
          >
            엔딩
          </button>
        </div>

        {/* CG 그리드 */}
        <div className="modal-content">
          <div className="cg-grid">
            {filteredCGs.map((cg) => {
              const unlocked = isUnlocked(cg.id);
              return (
                <div
                  key={cg.id}
                  className={`cg-card ${unlocked ? 'unlocked' : 'locked'}`}
                  onClick={() => setSelectedCG(cg)}
                >
                  <div
                    className="cg-thumbnail"
                    style={{
                      background: unlocked
                        ? `linear-gradient(135deg, ${getCharacterColor(cg.character)}44 0%, var(--bg-tertiary) 100%)`
                        : 'var(--bg-tertiary)',
                    }}
                  >
                    {unlocked ? (
                      <span className="cg-icon">
                        {cg.category === 'ending' ? '👑' : '💫'}
                      </span>
                    ) : (
                      <span className="cg-lock">🔒</span>
                    )}
                  </div>
                  <p className="cg-title">
                    {unlocked ? cg.title : '???'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GalleryModal;
