import { FaceSmileIcon, FaceFrownIcon, FlagIcon } from '@heroicons/react/24/solid';
import React, { useEffect, useState, useCallback, useRef } from "react";
import MinesweeperModeSelector from "./Components/MinesweeperModeSelector";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import CustomDialog from "../components/CustomDialog";
import { useAppSelector } from "../hooks/useRedux";
import CellCpn from "../components/CellCpn";
import { Box } from '../components/UI/Box';
import CounterClock, { CounterClockHandle } from '../components/UI/Clock';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';

const statusGame = {
    'playing': <FaceSmileIcon className="w-6 h-[100%] text-green-500 p-0 m-0" />,
    'lost': <FaceFrownIcon className="w-6 h-full text-red-500 p-0 m-0" />,
    'winner': <FaceSmileIcon className="w-6 h-[100%] text-orange-400 p-0 m-0" />
}

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

    const [statusPlayer, setStatusPlayer] = useState<string>('');
    const { selectedServer } = useAppSelector((state) => state.serverOptions);

    const [isClockStarted, setIsClockStarted] = useState(false);

    const actionClockRef = useRef<CounterClockHandle | null>(null);


    useEffect(() => {
        const newSocket = io(`${selectedServer}/single`, {
            transports: ["websocket"],
            upgrade: false,
            forceNew: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 20000,
        });

        newSocket.connect();
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [selectedServer]);

    const applyChanges = useCallback((changes) => {
        setPlayerState(prev => {
            const newRevealed = new Set(prev.revealedCells);
            const newFlags = new Set(prev.flags);

            // Apply revealed cell changes
            changes.revealedCells?.forEach(cell => newRevealed.add(cell));

            // Apply flag changes (toggle)
            changes.flags?.forEach(flag => {
                if (newFlags.has(flag)) {
                    newFlags.delete(flag);
                } else {
                    newFlags.add(flag);
                }
            });

            return {
                revealedCells: newRevealed,
                flags: newFlags
            };
        });
    }, []);

    const openCell = useCallback((index: number) => {
        if (!isClockStarted) {
            actionClockRef.current?.start();
            setIsClockStarted(true);
        }
        if (socket) socket.emit("openCell", { index });
    }, [socket, isClockStarted]);

    const chording = useCallback((index: number) => {
        if (socket) socket.emit("chording", { index });
    }, [socket]);

    const toggleFlag = useCallback((index: number, e: React.MouseEvent) => {
        e.preventDefault();
        if (socket) socket.emit("toggleFlag", { index });
    }, [socket]);

    const handleError = useCallback(({ message }: { message: string }) => {
        toast.error(message);
    }, []);

    const handleGameInitialized = useCallback(({ gameState, revealedCells, flags, status }: any) => {
        console.log(gameState);

        setGameState(gameState);
        setStatusPlayer(status)
        setPlayerState({
            revealedCells: new Set(revealedCells),
            flags: new Set(flags)
        });
        setGameStarted(true);
        setEndedGame(false);

        actionClockRef.current?.reset();
        setIsClockStarted(false);
    }, []);

    const handleStateUpdate = useCallback(({ changes, ...actionData }: any) => {
        applyChanges(changes);
        // You can use actionData for any additional logic if needed
    }, [applyChanges]);

    const handleGameOver = useCallback(({ message, revealedCells, flags, status }: any) => {
        console.log(message);

        console.log(status);
        setStatusPlayer(status);

        setPlayerState({
            revealedCells: new Set(revealedCells),
            flags: new Set(flags)
        });
        // setDialogMessage(message);
        // setOpenDialog({ end: true });
        toast.success(message);
        setGameStarted(false);
        setEndedGame(true);
        actionClockRef.current?.destroy();
    }, []);

    useEffect(() => {
        if (!socket) return;
        socket.on("error", handleError);
        socket.on("gameInitialized", handleGameInitialized);
        socket.on("stateUpdate", handleStateUpdate);
        socket.on("gameOver", handleGameOver);

        return () => {
            socket.off("error", handleError);
            socket.off("gameInitialized", handleGameInitialized);
            socket.off("stateUpdate", handleStateUpdate);
            socket.off("gameOver", handleGameOver);
        };
    }, [socket, handleError, handleGameInitialized, handleStateUpdate, handleGameOver]);

    useEffect(() => {
        if (configMode && socket) {
            socket.emit("initializeGame", configMode);
        }
    }, [configMode, socket]);

    // Keyboard shortcuts
    useKeyboardShortcut(
        { key: 'r', ctrl: true },
        () => {
            if (socket && configMode) {
                socket.emit("initializeGame", configMode);
                toast.info('🎮 Game đã được reset!');
            }
        },
        !!(socket && configMode)
    );

    // Show help dialog with keyboard shortcuts
    useKeyboardShortcut(
        { key: '?', shift: true },
        () => {
            toast.info(
                <div>
                    <strong>Phím tắt:</strong><br/>
                    • Ctrl+R: Chơi lại<br/>
                    • Click: Mở ô<br/>
                    • Right-click: Đặt cờ
                </div>,
                { autoClose: 5000 }
            );
        },
        true
    );

    const Cell = React.memo(({
        cell,
        index,
        isRevealed,
        isFlagged,
        canInteract,
        canChording,
        openCell,
        toggleFlag
    }: {
        cell: any,
        index: number,
        isRevealed: boolean,
        isFlagged: boolean,
        canInteract: boolean,
        canChording: boolean,
        openCell: (index: number) => void,
        toggleFlag: (index: number, e: React.MouseEvent) => void
    }) => {
        let content: any = "";
        if (isFlagged) content = <FlagIcon color='red' />;
        else if (isRevealed)
            content = cell.isMine ? "💣" : cell.count > 0 ? cell.count : "";

        return (
            <CellCpn
                canInteract={canInteract}
                isRevealed={isRevealed}
                key={index}
                count={cell.count}
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
            </CellCpn>
        );
    });

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
                    const canChording = isRevealed && !endedGame;

                    return (
                        <Cell
                            key={index}
                            cell={cell}
                            index={index}
                            isRevealed={isRevealed}
                            isFlagged={isFlagged}
                            canInteract={canInteract}
                            canChording={canChording}
                            openCell={openCell}
                            toggleFlag={toggleFlag}
                        />
                    );
                })}
            </div>
        );
    }, [gameState, playerState, endedGame, openCell, toggleFlag]);

    return (
        <div className="p-2 sm:p-4 bg-gray-200 font-sans">
            <div className="animate-fadeIn">
                <MinesweeperModeSelector onModeChange={setConfigMode} />
                <Box className='inline-block mt-2 w-full sm:w-auto'>
                    <div className="flex items-center justify-between gap-2">
                        <Box className="text-xs sm:text-sm">
                            🚩 {playerState.flags.size}/{gameState?.totalMines}
                        </Box>
                        <Box 
                            variant='varButton' 
                            className='cursor-pointer hover:scale-105 transition-transform' 
                            onClick={() => {
                                socket.emit("initializeGame", configMode);
                            }}
                            title="Chơi lại"
                        >
                            {statusGame[statusPlayer]}
                        </Box>
                        <Box className="text-xs sm:text-sm">
                            ⏱️ <CounterClock ref={actionClockRef} />
                        </Box>
                    </div>
                    {gameState && (
                        <div className="mt-4 overflow-x-auto">
                            <div className="inline-block min-w-min">
                                {renderBoard()}
                            </div>
                        </div>
                    )}
                </Box>
            </div>
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