// import React, { useState } from "react";

// interface GameMode {
//   name: string;
//   rows: number;
//   cols: number;
//   mines?: number;
// }

// const gameModes: GameMode[] = [
//   { name: "Beginner", rows: 9, cols: 9 },
//   { name: "Intermediate", rows: 16, cols: 16 },
//   { name: "Expert", rows: 16, cols: 30 },
// ];

// interface MinesweeperModeSelectorProps {
//   onModeChange: (mode: GameMode) => void;
// }

// const MinesweeperModeSelector: React.FC<MinesweeperModeSelectorProps> = ({ onModeChange }) => {
//   const [selectedMode, setSelectedMode] = useState<GameMode>(gameModes[0]);
//   const [showCustom, setShowCustom] = useState(false);
//   const [customMode, setCustomMode] = useState<GameMode>({
//     name: "Custom",
//     rows: 10,
//     cols: 10,
//     mines: 20,
//   });

//   const handleModeSelect = (mode: GameMode) => {
//     setSelectedMode(mode);
//     onModeChange(mode);
//     setShowCustom(false);
//   };

//   const handleCustomSubmit = () => {
//     const validatedMode = {
//       ...customMode,
//       mines: Math.min(customMode?.mines || 20, Math.floor(customMode.rows * customMode.cols * 0.35)),
//     };
//     handleModeSelect(validatedMode);
//   };

//   return (
//     <div className="w-full max-w-[300px] font-sans my-2">
//       <h1 className="text-lg font-bold text-gray-800 mb-3">Chọn chế độ</h1>
//       <div className="flex flex-col gap-1">
//         {gameModes.map((mode) => (
//           <button
//             key={mode.name}
//             onClick={() => handleModeSelect(mode)}
//             className={`py-2 px-3 text-left border-2 font-medium text-sm rounded-sm ${
//               selectedMode.name === mode.name && !showCustom
//                 ? "bg-gray-200 border-t-white border-l-white border-b-gray-500 border-r-gray-500"
//                 : "bg-gray-300 border-t-white border-l-white border-b-gray-500 border-r-gray-500 hover:bg-gray-400"
//             }`}
//           >
//             {mode.name} ({mode.rows}x{mode.cols})
//           </button>
//         ))}
//         <button
//           onClick={() => setShowCustom(!showCustom)}
//           className={`py-2 px-3 text-left border-2 font-medium text-sm rounded-sm ${
//             showCustom || selectedMode.name === "Custom"
//               ? "bg-gray-200 border-t-white border-l-white border-b-gray-500 border-r-gray-500"
//               : "bg-gray-300 border-t-white border-l-white border-b-gray-500 border-r-gray-500 hover:bg-gray-400"
//           }`}
//         >
//           Chế độ tùy chỉnh {showCustom ? "▲" : "▼"}
//         </button>
//         {showCustom && (
//           <div className="mt-2 p-3 bg-gray-200 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 rounded-sm">
//             <div className="grid grid-cols-2 gap-2 mb-2">
//               <div>
//                 <label className="block text-xs text-gray-800 mb-1">Hàng</label>
//                 <input
//                   type="number"
//                   min="1"
//                   max="20"
//                   value={customMode.rows}
//                   onChange={(e) =>
//                     setCustomMode({ ...customMode, rows: parseInt(e.target.value) || 5 })
//                   }
//                   className="w-full px-1 py-1 border border-gray-400 text-sm bg-white rounded-sm"
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs text-gray-800 mb-1">Cột</label>
//                 <input
//                   type="number"
//                   min="1"
//                   max="30"
//                   value={customMode.cols}
//                   onChange={(e) =>
//                     setCustomMode({ ...customMode, cols: parseInt(e.target.value) || 5 })
//                   }
//                   className="w-full px-1 py-1 border border-gray-400 text-sm bg-white rounded-sm"
//                 />
//               </div>
//             </div>
//             <div>
//               <label className="block text-xs text-gray-800 mb-1">Bom</label>
//               <input
//                 type="number"
//                 min="1"
//                 max={Math.floor(customMode.rows * customMode.cols * 0.35)}
//                 value={customMode.mines}
//                 onChange={(e) =>
//                   setCustomMode({ ...customMode, mines: parseInt(e.target.value) || 1 })
//                 }
//                 className="w-full px-1 py-1 border border-gray-400 text-sm bg-white rounded-sm"
//               />
//             </div>
//             <button
//               onClick={handleCustomSubmit}
//               className="mt-2 w-full py-1 bg-gray-300 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 text-sm hover:bg-gray-400 rounded-sm"
//             >
//               Lưu
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MinesweeperModeSelector;


import React, { useState } from "react";

interface GameMode {
  name: string;
  rows: number;
  cols: number;
  mines?: number;
}

const gameModes: GameMode[] = [
  { name: "Beginner", rows: 9, cols: 9 },
  { name: "Intermediate", rows: 16, cols: 16 },
  { name: "Expert", rows: 16, cols: 30 },
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
  });

  const handleModeSelect = (mode: GameMode) => {
    setSelectedMode(mode);
    onModeChange(mode);
    setShowCustom(false);
  };

  const handleCustomSubmit = () => {
    const validatedMode = {
      ...customMode,
      mines: Math.min(customMode?.mines || 20, Math.floor(customMode.rows * customMode.cols * 0.35)),
    };
    handleModeSelect(validatedMode);
  };

  return (
    <div className="w-full max-w-[500px] font-sans my-4 p-4">
      <h1 className="text-lg font-bold text-gray-800 mb-3">Chọn chế độ</h1>
      <div className="flex flex-row flex-wrap gap-2">
        {gameModes.map((mode) => (
          <button
            key={mode.name}
            onClick={() => handleModeSelect(mode)}
            className={`py-2 px-4 text-center border-2 font-medium text-sm rounded-sm min-w-[100px] ${
              selectedMode.name === mode.name && !showCustom
                ? "bg-gray-200 border-t-white border-l-white border-b-gray-500 border-r-gray-500"
                : "bg-gray-300 border-t-white border-l-white border-b-gray-500 border-r-gray-500 hover:bg-gray-400"
            }`}
            aria-label={`Select ${mode.name} mode (${mode.rows}x${mode.cols})`}
          >
            {mode.name}
          </button>
        ))}
        <button
          onClick={() => setShowCustom(!showCustom)}
          className={`py-2 px-4 text-center border-2 font-medium text-sm rounded-sm min-w-[100px] ${
            showCustom || selectedMode.name === "Custom"
              ? "bg-gray-200 border-t-white border-l-white border-b-gray-500 border-r-gray-500"
              : "bg-gray-300 border-t-white border-l-white border-b-gray-500 border-r-gray-500 hover:bg-gray-400"
          }`}
          aria-label="Toggle custom mode settings"
        >
          Tùy chỉnh {showCustom ? "▲" : "▼"}
        </button>
      </div>
      {showCustom && (
        <div className="mt-4 p-4 bg-gray-200 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 rounded-sm">
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-xs text-gray-800 mb-1">Hàng</label>
              <input
                type="number"
                min="1"
                max="20"
                value={customMode.rows}
                onChange={(e) =>
                  setCustomMode({ ...customMode, rows: parseInt(e.target.value) || 5 })
                }
                className="w-full px-2 py-1 border border-gray-400 text-sm bg-white rounded-sm focus:outline-none"
                aria-label="Number of rows"
                placeholder="1-20"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-800 mb-1">Cột</label>
              <input
                type="number"
                min="1"
                max="30"
                value={customMode.cols}
                onChange={(e) =>
                  setCustomMode({ ...customMode, cols: parseInt(e.target.value) || 5 })
                }
                className="w-full px-2 py-1 border border-gray-400 text-sm bg-white rounded-sm focus:outline-none"
                aria-label="Number of columns"
                placeholder="1-30"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-800 mb-1">Bom</label>
              <input
                type="number"
                min="1"
                max={Math.floor(customMode.rows * customMode.cols * 0.35)}
                value={customMode.mines}
                onChange={(e) =>
                  setCustomMode({ ...customMode, mines: parseInt(e.target.value) || 1 })
                }
                className="w-full px-2 py-1 border border-gray-400 text-sm bg-white rounded-sm focus:outline-none"
                aria-label="Number of mines"
                placeholder={`1-${Math.floor(customMode.rows * customMode.cols * 0.35)}`}
              />
            </div>
          </div>
          <button
            onClick={handleCustomSubmit}
            className="w-full py-2 bg-gray-300 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 text-sm font-medium hover:bg-gray-400 rounded-sm"
            aria-label="Save custom mode"
          >
            Lưu
          </button>
        </div>
      )}
    </div>
  );
};

export default MinesweeperModeSelector;