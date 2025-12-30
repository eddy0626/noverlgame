// ========================================
// 캐릭터 스프라이트 컴포넌트
// ========================================

import { useMemo } from 'react';

interface CharacterSpriteProps {
  character: string;
  expression?: 'normal' | 'happy' | 'sad' | 'angry' | 'surprised';
  position?: 'left' | 'center' | 'right';
  isActive?: boolean;
}

// 캐릭터 정보 맵핑
const CHARACTER_DATA: Record<string, {
  name: string;
  hairColor: string;
  eyeColor: string;
  skinColor: string;
  outfitColor: string;
  accentColor: string;
}> = {
  '유나': {
    name: 'yuna',
    hairColor: '#2C1810',
    eyeColor: '#4A3728',
    skinColor: '#FFE4C4',
    outfitColor: '#2C3E50',
    accentColor: '#E74C3C',
  },
  '서연': {
    name: 'seoyeon',
    hairColor: '#1A1A2E',
    eyeColor: '#8B4513',
    skinColor: '#FFDAB9',
    outfitColor: '#8B0000',
    accentColor: '#FFD700',
  },
  '하린': {
    name: 'harin',
    hairColor: '#FF8C00',
    eyeColor: '#32CD32',
    skinColor: '#FFE4C4',
    outfitColor: '#FF69B4',
    accentColor: '#87CEEB',
  },
};

function CharacterSprite({
  character,
  expression = 'normal',
  position = 'center',
  isActive = true
}: CharacterSpriteProps) {
  const charData = CHARACTER_DATA[character];

  const positionStyle = useMemo(() => {
    switch (position) {
      case 'left': return { left: '15%', transform: 'translateX(-50%)' };
      case 'right': return { left: '85%', transform: 'translateX(-50%)' };
      default: return { left: '50%', transform: 'translateX(-50%)' };
    }
  }, [position]);

  if (!charData) {
    return null;
  }

  // 표정에 따른 눈 스타일
  const getEyeStyle = () => {
    switch (expression) {
      case 'happy': return { transform: 'scaleY(0.3)', borderRadius: '50%' };
      case 'sad': return { transform: 'rotate(-10deg)', opacity: 0.7 };
      case 'angry': return { transform: 'rotate(15deg) scaleY(0.7)' };
      case 'surprised': return { transform: 'scale(1.3)' };
      default: return {};
    }
  };

  return (
    <div
      className={`character-sprite ${isActive ? 'active' : 'inactive'}`}
      style={{
        position: 'absolute',
        bottom: '100px',
        ...positionStyle,
        transition: 'all 0.3s ease',
        opacity: isActive ? 1 : 0.6,
        filter: isActive ? 'none' : 'grayscale(50%)',
      }}
    >
      {/* SVG 캐릭터 */}
      <svg width="200" height="350" viewBox="0 0 200 350">
        {/* 머리카락 (뒤) */}
        <ellipse cx="100" cy="80" rx="70" ry="75" fill={charData.hairColor} />

        {/* 얼굴 */}
        <ellipse cx="100" cy="90" rx="45" ry="50" fill={charData.skinColor} />

        {/* 머리카락 (앞) */}
        <path
          d={`M 55 60 Q 70 30 100 25 Q 130 30 145 60 L 140 80 Q 100 70 60 80 Z`}
          fill={charData.hairColor}
        />

        {/* 눈 */}
        <g style={getEyeStyle()}>
          <ellipse cx="80" cy="90" rx="8" ry="10" fill={charData.eyeColor} />
          <ellipse cx="120" cy="90" rx="8" ry="10" fill={charData.eyeColor} />
          <circle cx="82" cy="88" r="3" fill="white" opacity="0.7" />
          <circle cx="122" cy="88" r="3" fill="white" opacity="0.7" />
        </g>

        {/* 입 */}
        <path
          d={expression === 'happy'
            ? "M 90 115 Q 100 125 110 115"
            : expression === 'sad'
            ? "M 90 120 Q 100 115 110 120"
            : "M 90 117 L 110 117"
          }
          stroke="#CC6666"
          strokeWidth="2"
          fill="none"
        />

        {/* 목 */}
        <rect x="90" y="135" width="20" height="25" fill={charData.skinColor} />

        {/* 몸통 (교복) */}
        <path
          d="M 50 160 L 70 155 L 100 160 L 130 155 L 150 160 L 145 280 L 55 280 Z"
          fill={charData.outfitColor}
        />

        {/* 칼라/리본 */}
        <polygon
          points="85,160 100,180 115,160"
          fill={charData.accentColor}
        />

        {/* 치마/바지 */}
        <path
          d="M 55 280 L 60 350 L 140 350 L 145 280 Z"
          fill={charData.outfitColor}
          opacity="0.8"
        />
      </svg>

      {/* 캐릭터 이름 표시 (디버그용, 필요시 제거) */}
      {/* <div style={{ textAlign: 'center', color: 'white', marginTop: '5px' }}>
        {character}
      </div> */}
    </div>
  );
}

export default CharacterSprite;
