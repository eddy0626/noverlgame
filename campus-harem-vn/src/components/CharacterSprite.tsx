// ========================================
// 캐릭터 스프라이트 컴포넌트 (이미지 기반)
// ========================================

import { useMemo, useState } from 'react';

interface CharacterSpriteProps {
  character: string;
  expression?: 'normal' | 'happy' | 'sad' | 'angry' | 'surprised';
  position?: 'left' | 'center' | 'right';
  isActive?: boolean;
}

// 캐릭터 이름 -> 파일명 맵핑
const CHARACTER_FILE_MAP: Record<string, string> = {
  '유나': 'yuna',
  '서연': 'seoyeon',
  '하린': 'harin',
};

function CharacterSprite({
  character,
  expression = 'normal',
  position = 'center',
  isActive = true
}: CharacterSpriteProps) {
  const [imageError, setImageError] = useState(false);
  const characterFile = CHARACTER_FILE_MAP[character];

  const positionStyle = useMemo(() => {
    switch (position) {
      case 'left': return { left: '15%', transform: 'translateX(-50%)' };
      case 'right': return { left: '85%', transform: 'translateX(-50%)' };
      default: return { left: '50%', transform: 'translateX(-50%)' };
    }
  }, [position]);

  if (!characterFile) {
    return null;
  }

  // 이미지 경로 생성 (표정별 이미지 지원)
  const imagePath = `/characters/${characterFile}_${expression}.png`;
  const fallbackPath = `/characters/${characterFile}_normal.png`;

  return (
    <div
      className={`character-sprite ${isActive ? 'active' : 'inactive'}`}
      style={{
        position: 'absolute',
        bottom: '20px',
        ...positionStyle,
        transition: 'all 0.3s ease',
        opacity: isActive ? 1 : 0.6,
        filter: isActive ? 'none' : 'grayscale(50%)',
        zIndex: isActive ? 10 : 5,
      }}
    >
      <img
        src={imageError ? fallbackPath : imagePath}
        alt={character}
        onError={() => setImageError(true)}
        style={{
          width: 'auto',
          height: '450px',
          imageRendering: 'pixelated', // 픽셀아트 선명하게
          transform: isActive ? 'scale(1)' : 'scale(0.95)',
          transition: 'transform 0.3s ease',
        }}
      />
    </div>
  );
}

export default CharacterSprite;
