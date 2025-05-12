import React, { useEffect, useState, useCallback } from "react";
import { numberColorClasses, isNumber } from "./PVP/PvpPlay";
import MinesweeperModeSelector from "./Components/MinesweeperModeSelector";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { Socket } from "dgram";

const socket: Socket = io("http://localhost:3000");
function SinglePlay() {
    const [configMode, setConfigMode] = useState<any>(null);
    const [playerState, setPlayerState] = useState({
        revealedCells: new Set(),
        flags: new Set()
    });
    const [gameState, setGameState] = useState<any>(null);
    const [dialogMessage, setDialogMessage] = useState("");
    const [openDialog, setOpenDialog] = useState({ end: false });
    const [gameStarted, setGameStarted] = useState(false);
    const [endedGame, setEndedGame] = useState(false);
    

    const normalizePlayerState = useCallback((state) => {
        return {
            revealedCells: new Set(state?.revealedCells || []),
            flags: new Set(state?.flags || [])
        };
    }, []);

    const openCell = useCallback((index) => {
        socket.emit('openCell', { index });
    }, [socket]);

    const toggleFlag = useCallback((index, e) => {
        e.preventDefault();
        socket.emit('toggleFlag', { index });
    }, [socket]);

    useEffect(() => {
        const handlers = {
            connect: () => toast.success("Đã kết nối đến server!"),
            disconnect: () => toast.error("Mất kết nối với server!"),
            error: ({ message }) => toast.error(message),
            
            setGames: ({ gameState, playerState }) => {
                setGameState(gameState);
                setPlayerState(normalizePlayerState(playerState));
                setGameStarted(true);
                setEndedGame(false);
            },

            updateState: ({ gameState, playerState, action }) => {
                setGameState(gameState);
                setPlayerState(normalizePlayerState(playerState));
            },

            gameOver: ({ message }) => {
                setDialogMessage(message);
                setOpenDialog({ end: true });
                setGameStarted(false);
                setEndedGame(true);
            }
        };

        Object.entries(handlers).forEach(([event, handler]) => {
            socket.on(event, handler);
        });

        return () => {
            Object.entries(handlers).forEach(([event, handler]) => {
                socket.off(event, handler);
            });
            socket.disconnect();
        };
    }, [normalizePlayerState]);

    useEffect(() => {
        
        if (configMode) {
        console.log('check');

            socket.emit('initializeGame', configMode);
        }
    }, [configMode, socket]);

    const renderBoard = useCallback(() => {
        if (!gameState || !playerState) return null;

        const { rows: ratioX, cols: ratioY, cells } = gameState;
        const currentRevealed = playerState.revealedCells;
        const currentFlags = playerState.flags;

        return (
            <div
                className="grid gap-0.5 bg-gray-300 p-1 shadow"
                style={{
                    gridTemplateColumns: `repeat(${ratioY}, 24px)`,
                    gridTemplateRows: `repeat(${ratioX}, 24px)`,
                }}
            >
                {cells.map((cell, index) => {
                    const isRevealed = currentRevealed.has(index);
                    const isFlagged = currentFlags.has(index);
                    const canInteract = !isRevealed && !endedGame;

                    let content = "";
                    if (isFlagged) content = "🚩";
                    else if (isRevealed)
                        content = cell.isMine ? "💣" : cell.count > 0 ? cell.count : "";

                    const cellClasses = [
                        `${isNumber(cell?.count) ? numberColorClasses[cell.count] : ""}`,
                        "flex items-center justify-center w-[24px] h-[24px]",
                        "text-sm font-bold",
                        isRevealed ? "bg-gray-200" : "bg-gray-100",
                        canInteract ? "cursor-pointer hover:bg-gray-50" : "cursor-default",
                    ].join(" ");

                    return (
                        <div
                            key={index}
                            className={cellClasses}
                            onClick={canInteract ? () => openCell(index) : undefined}
                            onContextMenu={canInteract ? (e) => toggleFlag(index, e) : undefined}
                        >
                            {content}
                        </div>
                    );
                })}
            </div>
        );
    }, [gameState, playerState, endedGame, openCell, toggleFlag]);

    return (
        <div className="p-4">
            <MinesweeperModeSelector onModeChange={setConfigMode} />
            {gameState && renderBoard()}
            
            {openDialog.end && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-4 rounded">
                        <p>{dialogMessage}</p>
                        <button 
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                            onClick={() => setOpenDialog({ end: false })}
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SinglePlay;