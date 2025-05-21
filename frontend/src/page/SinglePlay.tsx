import React, { useEffect, useState, useCallback } from "react";
import { numberColorClasses } from "./PVP/PvpPlay";
import MinesweeperModeSelector from "./Components/MinesweeperModeSelector";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import CustomDialog from "../components/CustomDialog";

const getNumberClass = (cell: any, isRevealed: boolean): string => {
    if (!isRevealed || !cell || typeof cell.count !== "number") return "";
    return numberColorClasses[cell.count] || "";
};

function SinglePlay() {
    const [configMode, setConfigMode] = useState<any>(null);
    const [playerState, setPlayerState] = useState({
        revealedCells: new Set<number>(),
        flags: new Set<number>(),
    });
    const [gameState, setGameState] = useState<any>(null);
    const [dialogMessage, setDialogMessage] = useState('');
    const [openDialog, setOpenDialog] = useState({ end: false });
    const [gameStarted, setGameStarted] = useState(false);
    const [endedGame, setEndedGame] = useState(false);
    const [socket, setSocket] = useState<any>(null);

    useEffect(() => {
        const newSocket = io("http://localhost:3000/single");
        setSocket(newSocket);
        return () => {
            newSocket.disconnect();
        };
    }, []);

    const normalizePlayerState = useCallback((state: any) => {
        return {
            revealedCells: new Set<number>(state?.revealedCells || []),
            flags: new Set<number>(state?.flags || []),
        };
    }, []);

    const openCell = useCallback(
        (index: number) => {
            if (socket) socket.emit("openCell", { index });
        },
        [socket]
    );

    const chording = useCallback(
        (index: number) => {
            if (socket) socket.emit("chording", { index });
        },
        [socket]
    );
    
    const toggleFlag = useCallback(
        (index: number, e: React.MouseEvent) => {
            e.preventDefault();
            if (socket) socket.emit("toggleFlag", { index });
        },
        [socket]
    );

    useEffect(() => {
        if (!socket) return;

        const handleConnect = () => toast.success("Đã kết nối đến server!");
        const handleDisconnect = () => toast.error("Mất kết nối với server!");
        const handleError = ({ message }: { message: string }) => toast.error(message);
        const handleSetGames = ({ gameState, playerState }: any) => {
            setGameState(gameState);
            setPlayerState(normalizePlayerState(playerState));
            setGameStarted(true);
            setEndedGame(false);
        };
        const handleUpdateState = ({ gameState, playerState }: any) => {
            setGameState(gameState);
            setPlayerState(normalizePlayerState(playerState));
        };
        const handleGameOver = ({ message }: { message: string }) => {
            setDialogMessage(message);
            setOpenDialog({ end: true });
            setGameStarted(false);
            setEndedGame(true);
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("error", handleError);
        socket.on("setGames", handleSetGames);
        socket.on("updateState", handleUpdateState);
        socket.on("gameOver", handleGameOver);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("error", handleError);
            socket.off("setGames", handleSetGames);
            socket.off("updateState", handleUpdateState);
            socket.off("gameOver", handleGameOver);
        };
    }, [socket, normalizePlayerState]);

    useEffect(() => {
        if (configMode && socket) {
            socket.emit("initializeGame", configMode);
        }
    }, [configMode, socket]);

    const renderBoard = useCallback(() => {
        if (!gameState || !playerState) return null;

        const { ratioX, ratioY, cells } = gameState;
        const currentRevealed = playerState.revealedCells;
        const currentFlags = playerState.flags;

        return (
            <div
                className="inline-grid gap-[1px] bg-gray-300 p-1 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500"
                style={{
                    gridTemplateColumns: `repeat(${ratioY}, 24px)`,
                    gridTemplateRows: `repeat(${ratioX}, 24px)`,
                }}
            >
                {cells.map((cell: any, index: number) => {
                    const isRevealed = currentRevealed.has(index);
                    const isFlagged = currentFlags.has(index);
                    const canInteract = !isRevealed && !endedGame;
                    const canChording = currentRevealed.has(index) && !endedGame;

                    let content = "";
                    if (isFlagged) content = "🚩";
                    else if (isRevealed)
                        content = cell.isMine ? "💣" : cell.count > 0 ? cell.count : "";

                    const cellClasses = [
                        getNumberClass(cell, isRevealed),
                        "flex items-center justify-center w-6 h-6 text-sm font-bold",
                        isRevealed
                            ? "bg-gray-200"
                            : "bg-gray-300 border-t-2 border-l-2 border-b-2 border-r-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500",
                        canInteract ? "cursor-pointer hover:bg-gray-400" : "cursor-default",
                    ].join(" ");

                    return (
                        <div
                            key={index}
                            className={cellClasses}
                            onClick={() => {
                                if (canInteract) {
                                    openCell(index);
                                } else if (canChording) {
                                    chording(index);
                                }
                            }}
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
        <div className="p-4 bg-gray-200 font-sans max-w-[600px]">
            <MinesweeperModeSelector onModeChange={setConfigMode} />
            {gameState && <div className="mt-4">{renderBoard()}</div>}
            <CustomDialog
                open={openDialog.end}
                title="Kết thúc trò chơi"
                onClose={() => setOpenDialog((pre) => ({ ...pre, end: false }))}
            >
                <p className="text-sm text-gray-800 font-sans">{dialogMessage}</p>
            </CustomDialog>
        </div>
    );
}

export default SinglePlay;