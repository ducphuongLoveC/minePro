import React, { useEffect, useState, useCallback, use } from 'react';
import { io, Socket } from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaCopy, FaSignOutAlt, FaUser, FaCrown, FaSkull } from 'react-icons/fa';
import CustomDialog from '../../components/CustomDialog';

import { BeatLoader } from 'react-spinners';

const socket: Socket = io('http://localhost:3000');

import { v4 as uuidv4 } from 'uuid';
import MinesweeperModeSelector from './MinesweeperModeSelector';

const numberColorClasses = {
    1: 'text-blue-600',
    2: 'text-green-600',
    3: 'text-red-600',
    4: 'text-blue-900',
    5: 'text-red-900',
    6: 'text-cyan-600',
    7: 'text-black',
    8: 'text-gray-600',
  };
  

function isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
}


interface PlayerState {
    revealedCells: Set<number>;
    flags: Set<number>;
}

interface Player {
    id: string;
    name: string;
    status: 'playing' | 'won' | 'lost';
    isReady: boolean
}

const PvpPlay: React.FC = () => {
    const [roomId, setRoomId] = useState<string>('');
    const [playerId, setPlayerId] = useState<string | null>(null);
    const [playerName, setPlayerName] = useState<string>('');
    const [gameStates, setGameStates] = useState<any | null>(null);
    const [playerStates, setPlayerStates] = useState<{ [key: string]: PlayerState }>({});
    const [players, setPlayers] = useState<Player[]>([]);
    const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [dialogMessage, setDialogMessage] = useState<string>('');

    const [configMode, setConfigMode] = useState<any>({});

    const [isHost, setIsHost] = useState(false);

    const [gameStarted, setGameStarted] = useState(false);

    const normalizePlayerStates = useCallback(
        (states: { [key: string]: { revealedCells: number[]; flags: number[] } }) => {
            const normalized: { [key: string]: PlayerState } = {};
            for (const [id, state] of Object.entries(states)) {
                normalized[id] = {
                    revealedCells: new Set(state.revealedCells),
                    flags: new Set(state.flags),
                };
            }
            return normalized;
        },
        []
    );


    const checkGameOver = () => {
        if (!gameStates) return false;
        return Object.values(gameStates).some((game: any) => game.gameOver);
    };

    console.log(configMode);


    useEffect(() => {
        const handlers = {
            connect: () => {
                setIsConnected(true);
                toast.success('Đã kết nối đến server!');
            },
            disconnect: () => {
                setIsConnected(false);
                toast.error('Mất kết nối với server!');
            },
            roomCreated: ({ roomId }: { roomId: string }) => {
                toast.success(`Phòng ${roomId} đã được tạo!`);
            },
            waitingForPlayer: ({ message }: { message: string }) => {
                toast.info(message);
            },
            error: ({ message }: { message: string }) => {
                toast.error(message);
            },
            joinedRoom: ({ roomId, playerId }: { roomId: string; playerId: string }) => {

                setRoomId(roomId);
                setPlayerId(playerId);

                toast.success(`Đã tham gia phòng ${roomId}!`);
            },
            setGames: ({ gameStates, playerStates, playersStatus }: any) => {



                const players: Player[] = playersStatus.map((pl) => {
                    const [id, player]: any = Object.entries(pl)[0]
                    return {
                        id, name: player.playerName, status: 'playing', isReady: player.isReady
                    }
                })

                console.log(gameStates);


                setGameStates(gameStates);
                setPlayers(players);

                setPlayerStates(normalizePlayerStates(playerStates));
            },
            canStartGame: ({ canStart, message }: { canStart: boolean, message: string }) => {
                setGameStarted(canStart);
                toast.success(message)
            },

            playerNotReady: ({ message }) => {
                toast.info(message)
            },

            updateState: ({ gameStates, playerStates, action }: any) => {

                console.log(playerStates);

                setGameStates(gameStates);
                setPlayerStates(normalizePlayerStates(playerStates));
                // console.log('here', normalizePlayerStates(playerStates));

                if (action.result?.isMine) {
                    const message =
                        action.playerId === playerId ? 'Bạn đã chạm vào mìn! Thua cuộc!' : 'Đối thủ chạm mìn! Bạn thắng!';
                    setDialogMessage(message);
                    setOpenDialog(true);
                    setPlayers((prev) =>
                        prev.map((p) =>
                            p.id === action.playerId ? { ...p, status: 'lost' } : { ...p, status: 'won' }
                        )
                    );
                } else if (action.result?.isWin) {
                    const message = action.playerId === playerId ? 'Bạn đã thắng!' : 'Đối thủ đã thắng!';
                    setDialogMessage(message);
                    setOpenDialog(true);
                    setPlayers((prev) =>
                        prev.map((p) =>
                            p.id === action.playerId ? { ...p, status: 'won' } : { ...p, status: 'lost' }
                        )
                    );
                }
            },
            gameOver: ({ winner, message }: any) => {
                setDialogMessage(message || (winner === playerId ? 'Bạn đã thắng!' : 'Bạn đã thua!'));
                setOpenDialog(true);
                setGameStarted(false);
                // setGameStates(null);
                // setPlayerStates({});
                // setRoomId('');
                // setPlayers([]);
            },
            roomFull: ({ message }: { message: string }) => {
                toast.error(message);
            },
            playerLeft: () => {
                toast.info('Đối thủ đã rời khỏi phòng!');
                setGameStates(null);
                setPlayerStates({});
                setRoomId('');
                setPlayers([]);
                setGameStarted(false);

            },
        };

        Object.entries(handlers).forEach(([event, handler]) => {
            socket.on(event, handler);
        });

        return () => {
            Object.entries(handlers).forEach(([event, handler]) => {
                socket.off(event, handler);
            });
        };
    }, [playerId, playerName, normalizePlayerStates]);

    const joinRoom = useCallback(() => {
        if (roomId.trim()) {
            setIsHost(false)
            socket.emit('joinRoom', roomId, playerName);
        } else {
            toast.error('Kiểm tra lại tên phòng!');
        }
    }, [roomId, playerName]);

    const createRoom = useCallback(() => {
        const newRoomId = uuidv4();
        setRoomId(newRoomId);
        setIsHost(true);
        console.log('configMode', configMode);

        socket.emit('joinRoom', newRoomId, playerName, configMode);

    }, [playerName, configMode]);

    const startGame = useCallback(() => {
        socket.emit('startGame', roomId);

    }, [roomId, playerName]);

    const toggleReadyGame = useCallback(() => {
        socket.emit('toggleReadyGame', roomId);

    }, [roomId, playerName]);


    const leaveRoom = useCallback(() => {
        socket.emit('leaveRoom');
        setRoomId('');
        setGameStates(null);
        setPlayerStates({});
        setPlayers([]);
        setGameStarted(false);
        toast.info('Bạn đã rời khỏi phòng!');

    }, []);

    const copyRoomId = useCallback(() => {
        navigator.clipboard.writeText(roomId);
        toast.success('Đã sao chép ID phòng!');
    }, [roomId]);

    const openCell = useCallback(
        (index: number) => {
            console.log('check');

            if (gameStates && !checkGameOver()) {
                socket.emit('openCell', { roomId, index });
            }
        },
        [gameStates, roomId]
    );

    const toggleFlag = useCallback(
        (index: number, e: React.MouseEvent) => {
            e.preventDefault();
            if (gameStates && !checkGameOver()) {
                socket.emit('toggleFlag', { roomId, index });
            }
        },
        [gameStates, roomId]
    );


    const renderBoard = useCallback(
        (isOpponent, game) => {
            if (!gameStates || !playerStates || !playerId) return null;

            const { ratioX, ratioY, cells } = game;
            const currentPlayerState = playerStates[playerId];
            const opponentId = Object.keys(playerStates).find((id) => id !== playerId);
            const opponentState = opponentId ? playerStates[opponentId] : null;
            const currentRevealed = currentPlayerState?.revealedCells || new Set();

            const currentFlags = currentPlayerState?.flags || new Set();
            const opponentRevealed = opponentState?.revealedCells || new Set();
            const opponentFlags = opponentState?.flags || new Set();

            return (
                <div
                    className="grid gap-0.5 bg-gray-300 p-1 shadow"
                    style={{
                        gridTemplateColumns: `repeat(${ratioY}, 24px)`,
                        gridTemplateRows: `repeat(${ratioX}, 24px)`,
                    }}
                >
                    {cells.map((cell, index) => {
                        const isRevealed = isOpponent ? opponentRevealed.has(index) : currentRevealed.has(index);
                        const isFlagged = isOpponent ? opponentFlags.has(index) : currentFlags.has(index);
                        const canInteract = !isOpponent && !checkGameOver() && !isRevealed;
                        const interactive = canInteract && gameStarted;

                        let content = '';
                        if (isFlagged) content = '🚩';
                        else if (isRevealed) content = cell.isMine ? '💣' : cell.count > 0 ? cell.count : '';


                        const cellClasses = [
                            `${isNumber(cell?.count) ? numberColorClasses[cell.count] : ''}`,
                            'flex items-center justify-center w[24px] h[24px]',
                            'text-sm font-bold',
                            isRevealed ? 'bg-gray-200' : 'bg-gray-100',
                            interactive ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'
                        ].join(' ');
                        return (
                            <div
                                key={index}
                                className={cellClasses}
                                onClick={interactive ? () => openCell(index) : undefined}
                                // onClick={() => openCell(index)}

                                onContextMenu={canInteract ? (e) => toggleFlag(index, e) : undefined}
                            >
                                {content}
                                {cell.isMarkHint && 'x'}
                            </div>
                        );
                    })}
                </div>
            );
        },
        [gameStates, playerStates, playerId, gameStarted, openCell, toggleFlag]
    );

    // ==============================================
    // Các hàm render phụ trợ
    // ==============================================

    const renderPreGameForm = () => {
        if (gameStates) return null;

        return (
            <div className="mb-6 p-4 bg-white rounded-lg shadow">
                <MinesweeperModeSelector onModeChange={(data) => setConfigMode(data)} />
                <input
                    type="text"
                    placeholder="Tên của bạn"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="px-3 py-2 border rounded mb-2 w-full"
                />
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        placeholder="Nhập Room ID"
                        className="px-3 py-2 border rounded flex-grow"
                    />
                    <button
                        onClick={joinRoom}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Vào phòng
                    </button>
                    <button
                        onClick={createRoom}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Tạo phòng
                    </button>
                </div>
            </div>
        );
    };

    const renderGameLobby = () => {
        return (
            <div className="mb-4 p-4 bg-white rounded-lg shadow-md border border-blue-200">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-lg text-blue-700 flex items-center">
                        Phòng:
                        <span className="ml-2 bg-blue-100 px-3 py-1 rounded-md font-mono">
                            {roomId}
                        </span>
                    </h3>

                    <div className="flex gap-2 items-center">
                        {renderLobbyControls()}

                        <button
                            onClick={copyRoomId}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors"
                            title="Sao chép ID phòng"
                        >
                            <FaCopy />
                        </button>
                        <button
                            onClick={leaveRoom}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors"
                            title="Rời khỏi phòng"
                        >
                            <FaSignOutAlt />
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    {players.map(renderPlayerInfo)}
                </div>
            </div>
        );
    };

    const renderLobbyControls = () => {
        if (gameStarted) return null;

        // Host controls
        if (isHost) {
            return Object.entries(gameStates).length === 2
                ? (
                    <button
                        onClick={startGame}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors"
                    >
                        Bắt đầu game
                    </button>
                )
                : <BeatLoader size={10} />;
        }

        // Player controls
        const currentPlayer = players.find((p) => p.id === playerId);
        return (
            <button
                onClick={toggleReadyGame}
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors"
            >
                {currentPlayer?.isReady ? 'Hủy sẵn sàng' : 'Sẵn sàng'}
            </button>
        );
    };

    const renderPlayerInfo = (player) => {
        const isCurrentPlayer = playerId === player.id;

        return (
            <div
                key={player.id}
                className={`flex items-center p-3 rounded-lg ${isCurrentPlayer ? 'bg-blue-50' : 'bg-gray-50'}`}
            >
                <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${isCurrentPlayer ? 'bg-blue-500 text-white' : 'bg-gray-300'
                        }`}
                >
                    <FaUser />
                </div>

                <div className="flex-1">
                    <div className="flex items-center">
                        <span className="font-medium">
                            {player.name} {isCurrentPlayer && '(Bạn)'}
                        </span>

                        {player.status === 'won' && <FaCrown className="ml-2 text-yellow-500" />}
                        {player.status === 'lost' && <FaSkull className="ml-2 text-gray-500" />}

                        <div
                            className={`ml-1 inline-block px-2 py-1 text-xs font-medium rounded-full ${player.isReady ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'
                                }`}
                        >
                            {player.isReady ? 'Đã sẵn sàng' : 'Chưa sẵn sàng'}
                        </div>
                    </div>

                    <div className="text-xs text-gray-500">
                        {getPlayerStatusText(player.status)}
                    </div>
                </div>
            </div>
        );
    };

    const getPlayerStatusText = (status) => {
        switch (status) {
            case 'playing': return 'Đang chơi';
            case 'won': return 'Chiến thắng!';
            case 'lost': return 'Thua cuộc';
            default: return '';
        }
    };

    const renderGameBoards = () => {
        return (
            <div className="flex gap-5">
                {Object.entries(gameStates).map(([pId, game]) => (
                    <div key={pId} className="flex flex-col items-center">
                        <h3 className="text-lg font-semibold mb-2 flex items-center">
                            {players.find((p) => p.id === pId)?.name}
                            <span className={`ml-2 text-sm text-white px-2 py-1 rounded ${pId === playerId ? 'bg-blue-500' : 'bg-gray-500'}`}>
                                {pId === playerId ? 'Bạn' : 'Đối thủ'}
                            </span>
                        </h3>
                        {renderBoard(pId !== playerId, game)}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-gray-100 flex flex-col">
            <header className="w-full max-w-3xl">
                {/* Phần nhập tên và phòng (khi chưa vào game) */}
                {renderPreGameForm()}
                {/* Phòng chờ game (khi đã có room) */}
                {roomId && gameStates && renderGameLobby()}
            </header>

            <main className="mt-6 flex flex-col items-center gap-8">
                {/* Bảng game cho các người chơi */}
                {gameStates && renderGameBoards()}
            </main>

            {/* Dialog và Toast */}
            <CustomDialog
                open={openDialog}
                title="Kết thúc"
                onClose={() => setOpenDialog(false)}
            >
                {dialogMessage}
            </CustomDialog>

            <ToastContainer position="top-right" autoClose={2000} />
        </div>
    );

};

export default PvpPlay;