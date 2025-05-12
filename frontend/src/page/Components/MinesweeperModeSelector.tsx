import React, { useState } from 'react';

interface GameMode {
  name: string;
  rows: number;
  cols: number;
  mines?: number;
}

const gameModes: GameMode[] = [
  { name: 'Beginner', rows: 9, cols: 9 },
  { name: 'Intermediate', rows: 16, cols: 16 },
  { name: 'Expert', rows: 16, cols: 30 },
];

interface MinesweeperModeSelectorProps {
  onModeChange: (mode: GameMode) => void;
}

const MinesweeperModeSelector: React.FC<MinesweeperModeSelectorProps> = ({ onModeChange }) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>(gameModes[0]);
  const [showCustom, setShowCustom] = useState(false);
  const [customMode, setCustomMode] = useState<GameMode>({
    name: 'Custom',
    rows: 10,
    cols: 10,
    mines: 20
  });

  const handleModeSelect = (mode: GameMode) => {
    setSelectedMode(mode);
    onModeChange(mode);
    setShowCustom(false);
  };

  const handleCustomSubmit = () => {
    const validatedMode = {
      ...customMode,
      mines: Math.min(customMode?.mines || 20, Math.floor(customMode.rows * customMode.cols * 0.35))
    };
    handleModeSelect(validatedMode);
  };

  return (
    <div className=" bg-gray-100 flex flex-col p-4 mb-2">
      <h1 className="text-2xl font-bold mb-6">Select Game Mode</h1>

      <div className="flex flex-col items-center gap-3 w-full max-w-md">
        {/* Standard mode buttons */}
        <div className="flex flex-col gap-2 w-full">
          {gameModes.map((mode) => (
            <button
              key={mode.name}
              onClick={() => handleModeSelect(mode)}
              className={`px-4 py-3 rounded-lg font-medium transition-all ${selectedMode.name === mode.name && !showCustom
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-800 hover:bg-gray-100 border border-gray-200'
                }`}
            >
              {mode.name} ({mode.rows}x{mode.cols})
            </button>
          ))}
        </div>

        {/* Custom mode button */}
        <button
          onClick={() => setShowCustom(!showCustom)}
          className={`px-4 py-3 rounded-lg font-medium transition-all w-full ${showCustom
            ? 'bg-blue-500 text-white'
            : selectedMode.name === 'Custom'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-800 hover:bg-gray-100 border border-gray-200'
            }`}
        >
          Custom Mode {showCustom ? '▲' : '▼'}
        </button>

        {/* Custom mode form - animated dropdown */}
        {showCustom && (
          <div className="w-full p-4 bg-white rounded-lg border border-gray-200 shadow-sm mt-1 animate-fadeIn">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hàng</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={customMode.rows}
                  onChange={(e) => setCustomMode({ ...customMode, rows: parseInt(e.target.value) || 5 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cột</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={customMode.cols}
                  onChange={(e) => setCustomMode({ ...customMode, cols: parseInt(e.target.value) || 5 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bom</label>
              <input
                type="number"
                min="1"
                max={Math.floor(customMode.rows * customMode.cols * 0.35)}
                value={customMode.mines}
                onChange={(e) => setCustomMode({ ...customMode, mines: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <button
              onClick={handleCustomSubmit}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              LƯU
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MinesweeperModeSelector;