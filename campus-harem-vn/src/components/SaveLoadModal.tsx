// ========================================
// 저장/로드 모달 컴포넌트
// ========================================

import { useState } from 'react';
import { useGameStore } from '../game/store';
import { useAudioStore } from '../game/audioManager';

interface SaveLoadModalProps {
  mode: 'save' | 'load';
  onClose: () => void;
}

function SaveLoadModal({ mode, onClose }: SaveLoadModalProps) {
  const { saveToSlot, loadFromSlot, getSlotInfo, deleteSlot, isPlaying } = useGameStore();
  const { playSfx } = useAudioStore();
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const slots = Array.from({ length: 6 }, (_, i) => ({
    index: i,
    info: getSlotInfo(i),
  }));

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSlotClick = (slot: number) => {
    playSfx('click');
    setSelectedSlot(slot);
  };

  const handleAction = () => {
    if (selectedSlot === null) return;

    if (mode === 'save') {
      saveToSlot(selectedSlot);
      playSfx('save');
      onClose();
    } else {
      const success = loadFromSlot(selectedSlot);
      if (success) {
        playSfx('load');
        onClose();
      }
    }
  };

  const handleDelete = () => {
    if (selectedSlot === null) return;
    if (confirm('정말 이 슬롯을 삭제하시겠습니까?')) {
      deleteSlot(selectedSlot);
      playSfx('click');
      setSelectedSlot(null);
    }
  };

  // 로드 모드에서 게임 플레이 중이 아니면 빈 슬롯만 불가
  const canSelectSlot = (slot: { index: number; info: ReturnType<typeof getSlotInfo> }) => {
    if (mode === 'save') return isPlaying;
    return slot.info !== null;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content save-load-modal" onClick={(e) => e.stopPropagation()}>
        <h2>{mode === 'save' ? '💾 저장하기' : '📂 불러오기'}</h2>

        <div className="save-slots">
          {slots.map((slot) => (
            <div
              key={slot.index}
              className={`save-slot ${selectedSlot === slot.index ? 'selected' : ''} ${
                !canSelectSlot(slot) ? 'disabled' : ''
              }`}
              onClick={() => canSelectSlot(slot) && handleSlotClick(slot.index)}
            >
              <div className="slot-header">
                <span className="slot-number">슬롯 {slot.index + 1}</span>
                {slot.info && (
                  <span className="slot-chapter">{slot.info.chapter}</span>
                )}
              </div>
              {slot.info ? (
                <div className="slot-info">
                  <span className="slot-date">{formatDate(slot.info.timestamp)}</span>
                </div>
              ) : (
                <div className="slot-empty">비어있음</div>
              )}
            </div>
          ))}
        </div>

        <div className="modal-buttons">
          {selectedSlot !== null && slots[selectedSlot].info && (
            <button className="btn-danger" onClick={handleDelete}>
              🗑️ 삭제
            </button>
          )}
          <button
            className="btn-primary"
            onClick={handleAction}
            disabled={selectedSlot === null || (mode === 'load' && !slots[selectedSlot]?.info)}
          >
            {mode === 'save' ? '저장' : '불러오기'}
          </button>
          <button className="btn-secondary" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

export default SaveLoadModal;
