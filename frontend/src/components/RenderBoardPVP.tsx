// import React from "react";

// interface RenderBoardPVPProp {
//     isOpponent: Boolean;
//     game: any
// }
// function RenderBoardPVP({ isOpponent, game }: RenderBoardPVPProp) {
//     if (!gameStates || !playerStates || !playerId) return null;

//     const { ratioX, ratioY, cells } = game;
//     const currentPlayerState = playerStates[playerId];
//     const opponentId = Object.keys(playerStates).find((id) => id !== playerId);
//     const opponentState = opponentId ? playerStates[opponentId] : null;

//     const currentRevealed = currentPlayerState?.revealedCells || new Set();
//     const currentFlags = currentPlayerState?.flags || new Set();
//     const opponentRevealed = opponentState?.revealedCells || new Set();
//     const opponentFlags = opponentState?.flags || new Set();

//     return (
//         <div
//             className="grid gap-px bg-gray-300 p-2 rounded-lg shadow"
//             style={{
//                 gridTemplateColumns: `repeat(${ratioX}, minmax(0, 1fr))`,
//                 gridTemplateRows: `repeat(${ratioY}, minmax(0, 1fr))`,
//             }}
//         >
//             {cells.map((cell, index) => {
//                 const isRevealed = isOpponent ? opponentRevealed.has(index) : currentRevealed.has(index);
//                 const isFlagged = isOpponent ? opponentFlags.has(index) : currentFlags.has(index);
//                 const canInteract = !isOpponent && !checkGameOver() && !isRevealed;

//                 let content = '';
//                 if (isFlagged) {
//                     content = '🚩';
//                 } else if (isRevealed) {
//                     content = cell.isMine ? '💣' : cell.count > 0 ? cell.count.toString() : '';
//                 }

//                 return (
//                     <div
//                         key={index}
//                         className={`
//                                 flex items-center justify-center
//                                 w-8 h-8 text-sm font-bold
//                                 ${isRevealed ? 'bg-gray-200' : 'bg-gray-100'}
//                                 ${canInteract ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'}
//                                 `}
//                         onClick={canInteract ? () => openCell(index) : undefined}
//                         onContextMenu={canInteract ? (e) => toggleFlag(index, e) : undefined}
//                     >
//                         {content}
//                     </div>
//                 );
//             })}
//         </div>
//     );
// }
// export default RenderBoardPVP;



// return (
    //     <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
    //         <header className="w-full max-w-3xl">
    //             {/* <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">Minesweeper</h1> */}

    //             {!gameStates && (


    //                 <div className="mb-6 p-4 bg-white rounded-lg shadow">
    //                     <input
    //                         type="text"
    //                         placeholder="Tên của bạn"
    //                         value={playerName}
    //                         onChange={(e) => setPlayerName(e.target.value)}
    //                         className="px-3 py-2 border rounded mb-2 w-full"
    //                     />
    //                     <div className="flex gap-2">
    //                         <input
    //                             type="text"
    //                             value={roomId}
    //                             onChange={(e) => setRoomId(e.target.value)}
    //                             placeholder="Nhập Room ID"
    //                             className="px-3 py-2 border rounded flex-grow"
    //                         />
    //                         <button
    //                             onClick={joinRoom}
    //                             className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    //                         >
    //                             Vào phòng
    //                         </button>
    //                         <button
    //                             onClick={createRoom}
    //                             className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
    //                         >
    //                             Tạo phòng
    //                         </button>
    //                     </div>
    //                 </div>


    //             )}

    //             {roomId && gameStates && (
    //                 <div className="mb-4 p-4 bg-white rounded-lg shadow-md border border-blue-200">
    //                     <div className="flex justify-between items-center mb-3">
    //                         <h3 className="font-semibold text-lg text-blue-700 flex items-center">
    //                             Phòng:
    //                             <span className="ml-2 bg-blue-100 px-3 py-1 rounded-md font-mono">{roomId}</span>
    //                         </h3>
    //                         <div className="flex gap-2 items-center">

    //                             {!gameStarted && (
    //                                 isHost ? (
    //                                     Object.entries(gameStates).length === 2 ? (
    //                                         <button
    //                                             onClick={startGame}
    //                                             className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors"
    //                                         >
    //                                             Bắt đầu game
    //                                         </button>
    //                                     ) : (
    //                                         <BeatLoader size={10} />
    //                                     )
    //                                 ) : (
    //                                     <div>
    //                                         {players.find((p) => p.id === playerId)?.isReady ? <button
    //                                             onClick={readyGame}
    //                                             className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors"
    //                                         >
    //                                             Hủy sẵn sàng
    //                                         </button> : <button
    //                                             onClick={readyGame}
    //                                             className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors"
    //                                         >
    //                                             Sẵn sàng
    //                                         </button>}

    //                                     </div>
    //                                 )
    //                             )}


    //                             <button
    //                                 onClick={copyRoomId}
    //                                 className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors"
    //                                 title="Sao chép ID phòng"
    //                             >
    //                                 <FaCopy />
    //                             </button>
    //                             <button
    //                                 onClick={leaveRoom}
    //                                 className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors"
    //                                 title="Rời khỏi phòng"
    //                             >
    //                                 <FaSignOutAlt />
    //                             </button>
    //                         </div>
    //                     </div>
    //                     <div className="space-y-2">
    //                         {players.map((player) => (
    //                             <div
    //                                 key={player.id}
    //                                 className={`flex items-center p-3 rounded-lg ${playerId === player.id ? 'bg-blue-50' : 'bg-gray-50'
    //                                     }`}
    //                             >
    //                                 <div
    //                                     className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${playerId === player.id ? 'bg-blue-500 text-white' : 'bg-gray-300'
    //                                         }`}
    //                                 >
    //                                     <FaUser />
    //                                 </div>
    //                                 <div className="flex-1">
    //                                     <div className="flex items-center">
    //                                         <span className="font-medium">
    //                                             {player.name} {playerId === player.id && '(Bạn)'}
    //                                         </span>
    //                                         {player.status === 'won' && <FaCrown className="ml-2 text-yellow-500" />}
    //                                         {player.status === 'lost' && <FaSkull className="ml-2 text-gray-500" />}
    //                                         <div
    //                                             className={`ml-1 inline-block px-2 py-1 text-xs font-medium rounded-full ${player.isReady ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'
    //                                                 }`}
    //                                         >
    //                                             {player.isReady ? 'Đã sẵn sàng' : 'Chưa sẵn sàng'}
    //                                         </div>

    //                                     </div>
    //                                     <div className="text-xs text-gray-500">
    //                                         {player.status === 'Đang chơi'
    //                                             ? 'Đang chơi'
    //                                             : player.status === 'won'
    //                                                 ? 'Chiến thắng!'
    //                                                 : 'Thua cuộc'}
    //                                     </div>
    //                                 </div>
    //                             </div>
    //                         ))}
    //                     </div>
    //                 </div>
    //             )}
    //         </header>

    //         <main className="mt-6 flex flex-col items-center gap-8">
    //             {gameStates && (
    //                 <div className="flex gap-8">
    //                     {Object.entries(gameStates).map(([pId, game]) => (
    //                         <div key={pId} className="flex flex-col items-center">
    //                             <h3 className="text-lg font-semibold mb-2 flex items-center">
    //                                 {players.find((p) => p.id === pId)?.name || `Người chơi ${pId.slice(0, 4)}`}
    //                                 {pId === playerId ? (
    //                                     <span className="ml-2 text-sm bg-blue-500 text-white px-2 py-1 rounded">Bạn</span>
    //                                 ) : (
    //                                     <span className="ml-2 text-sm bg-gray-500 text-white px-2 py-1 rounded">Đối thủ</span>
    //                                 )}
    //                             </h3>
    //                             {renderBoard(pId !== playerId, game)}
    //                         </div>
    //                     ))}
    //                 </div>
    //             )}
    //         </main>

    //         <CustomDialog open={openDialog} title="Kết thúc" onClose={() => setOpenDialog(false)}>
    //             {dialogMessage}
    //         </CustomDialog>
    //         <ToastContainer position="top-right" autoClose={2000} />
    //     </div>
    // );
