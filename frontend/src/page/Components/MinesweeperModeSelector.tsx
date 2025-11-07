import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Cog6ToothIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/solid";
import { Box } from "../../components/UI/Box";

interface GameMode {
  name: string;
  rows: number;
  cols: number;
  mines?: number;
  isMark?: boolean;
}

const gameModes: GameMode[] = [
  { name: "Dễ", rows: 9, cols: 9 },
  { name: "Trung", rows: 16, cols: 16 },
  { name: "Khó", rows: 16, cols: 30 },
];

interface MinesweeperModeSelectorProps {
  onModeChange: (mode: GameMode) => void;
}

const MinesweeperModeSelector: React.FC<MinesweeperModeSelectorProps> = ({ onModeChange }) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>(gameModes[0]);
  const [showCustom, setShowCustom] = useState(false);
  const [customMode, setCustomMode] = useState<GameMode>({
    name: "Custom",
    rows: 10,
    cols: 10,
    mines: 20,
    isMark: false,
  });

  const handleModeSelect = useCallback((mode: GameMode) => {
    setSelectedMode(mode);
    onModeChange(mode);
    setShowCustom(false);
  }, [onModeChange]);

  const handleCustomSubmit = useCallback(() => {
    const validatedMode = { ...customMode };
    handleModeSelect(validatedMode);
  }, [customMode, handleModeSelect]);

  const handleCustomChange = useCallback((field: keyof GameMode, value: any) => {
    setCustomMode(prev => ({ ...prev, [field]: value }));
  }, []);

  useEffect(() => {
    onModeChange(selectedMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const modeButtons = useMemo(() => 
    gameModes.map((mode) => (
      <button
        key={mode.name}
        onClick={() => handleModeSelect(mode)}
        className={`flex items-center justify-center gap-2 transition-colors ${
          selectedMode.name === mode.name && !showCustom
            ? "bg-gray-200 border-t-white border-l-white border-b-gray-500 border-r-gray-500"
            : "bg-gray-300 border-t-white border-l-white border-b-gray-500 border-r-gray-500 hover:bg-gray-400"
        } border-2 font-medium text-xs sm:text-sm rounded-sm px-1 py-1`}
      >
        {selectedMode.name === mode.name && !showCustom && (
          <CheckCircleIcon className="w-4 h-4 text-green-600" />
        )}
        {mode.name}
      </button>
    ))
  , [selectedMode.name, showCustom, handleModeSelect]);

  return (
    <div className="font-sans animate-fadeIn">
      <h1 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
        <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
        Chọn chế độ
      </h1>
      <div className="flex my-1 gap-1 flex-wrap">
        {modeButtons}
        <button
          onClick={() => setShowCustom(!showCustom)}
          className={`flex items-center justify-center gap-2 transition-colors ${
            showCustom || selectedMode.name === "Custom"
              ? "bg-gray-200 border-t-white border-l-white border-b-gray-500 border-r-gray-500"
              : "bg-gray-300 border-t-white border-l-white border-b-gray-500 border-r-gray-500 hover:bg-gray-400"
          } border-2 font-medium text-xs sm:text-sm rounded-sm px-1 py-1`}
        >
          <Cog6ToothIcon className="w-4 h-4 text-blue-600" />
          Chỉnh
          {showCustom ? (
            <ArrowUpIcon className="w-4 h-4 text-gray-600" />
          ) : (
            <ArrowDownIcon className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>
      {showCustom && (
        <Box className="inline-block animate-fadeIn">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            <div>
              <label className="block text-xs text-gray-800 mb-1">Hàng</label>
              <Box 
                as="input"
                type="number"
                min="1"
                max="20"
                value={customMode.rows}
                onChange={(e) => handleCustomChange('rows', parseInt(e.target.value) || 5)}
                placeholder="1-20"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-800 mb-1">Cột</label>
              <Box 
                as="input"
                type="number"
                min="1"
                max="30"
                value={customMode.cols}
                onChange={(e) => handleCustomChange('cols', parseInt(e.target.value) || 5)}
                placeholder="1-30"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-800 mb-1">Bom</label>
              <Box 
                as="input"
                type="number"
                min="1"
                value={customMode.mines}
                onChange={(e) => handleCustomChange('mines', parseInt(e.target.value) || 1)}
                className="w-full"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-xs text-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={customMode.isMark}
                  onChange={(e) => handleCustomChange('isMark', e.target.checked)}
                  className="w-4 h-4"
                />
                Đánh dấu
              </label>
            </div>
          </div>
          <Box 
            as="button" 
            onClick={handleCustomSubmit} 
            className="flex items-center justify-center gap-2 w-full hover:scale-105 transition-transform"
          >
            <CheckCircleIcon className="w-4 h-4 text-green-600" />
            Lưu cấu hình
          </Box>
        </Box>
      )}
    </div>
  );
};

export default React.memo(MinesweeperModeSelector);
