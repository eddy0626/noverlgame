import { useEffect, useState } from 'react';
import { useGameStore } from './game/store';
import { validateScenario } from './game/engine';
import type { Scenario } from './game/types';
import TitleScreen from './components/TitleScreen';
import GameScreen from './components/GameScreen';
import scenarioData from './data/scenario.json';

function App() {
  const { scenario, isPlaying, loadScenario } = useGameStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 시나리오 로드 및 검증
    try {
      const data = scenarioData as Scenario;
      const errors = validateScenario(data);

      if (errors.length > 0) {
        setError(`시나리오 오류:\n${errors.join('\n')}`);
        return;
      }

      loadScenario(data);
    } catch (e) {
      setError(`시나리오 로드 실패: ${e}`);
    }
  }, [loadScenario]);

  // 에러 화면
  if (error) {
    return (
      <div className="app error-screen">
        <h1>오류 발생</h1>
        <pre>{error}</pre>
        <button onClick={() => window.location.reload()}>
          새로고침
        </button>
      </div>
    );
  }

  // 로딩 중
  if (!scenario) {
    return (
      <div className="app loading-screen">
        <div className="loading-spinner" />
        <p>로딩 중...</p>
      </div>
    );
  }

  // 메인 렌더링
  return (
    <div className="app">
      {isPlaying ? <GameScreen /> : <TitleScreen />}
    </div>
  );
}

export default App;
