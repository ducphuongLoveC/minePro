import React, { useEffect, useState, useCallback } from "react";

import { ToastContainer, toast } from "react-toastify";
import { FaCopy, FaSignOutAlt, FaUser, FaCrown, FaSkull } from "react-icons/fa";
import CustomDialog from "../../components/CustomDialog";
import { BeatLoader } from "react-spinners";
import { v4 as uuidv4 } from "uuid";
import MinesweeperModeSelector from "../Components/MinesweeperModeSelector";

export const numberColorClasses = {
  1: "text-blue-700",
  2: "text-green-700",
  3: "text-red-700",
  4: "text-purple-700",
  5: "text-maroon-700",
  6: "text-teal-700",
  7: "text-black",
  8: "text-gray-700",
};

export function isNumber(value: any): boolean {
  return typeof value === "number" && !isNaN(value);
}

interface PlayerState {
  revealedCells: Set<number>;
  flags: Set<number>;
}

interface Player {
  id: string;
  name: string;
  status: "playing" | "won" | "lost";
  isReady: boolean;
  isHost: boolean;
}

interface DialogProp {
  end: boolean;
  replay: boolean;
}

interface PvpPlayProp {
  socket: any
  onInRoom: () => void
  onLeaveRoom: () => void
}

const PvpPlay: React.FC<PvpPlayProp> = ({ socket, onInRoom, onLeaveRoom }) => {
  const [roomId, setRoomId] = useState<string>('');
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>("");
  const [gameStates, setGameStates] = useState<any | null>(null);
  const [playerStates, setPlayerStates] = useState<{ [key: string]: PlayerState }>({});
  const [players, setPlayers] = useState<Player[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const [openDialog, setOpenDialog] = useState<DialogProp>({ end: false, replay: false });
  const [dialogMessage, setDialogMessage] = useState<string>("");
  const [configMode, setConfigMode] = useState<any>({});
  const [gameStarted, setGameStarted] = useState(false);
  const [endedGame, setEndedGame] = useState(false);

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

  useEffect(() => {

    console.log("Registering socket events");
    const handlers = {
      // connect: () => {
      //   setIsConnected(true);
      //   toast.success("Đã kết nối đến server!");
      // },
      // disconnect: () => {
      //   setIsConnected(false);
      //   toast.error("Mất kết nối với server!");
      // },
      roomCreated: ({ roomId }: { roomId: string }) => {
        // toast.success(`Phòng ${roomId} đã được tạo!`);
      },
      error: ({ message }: { message: string }) => {
        toast.error(message);
      },
      joinedRoom: ({ roomId, playerId }: { roomId: string; playerId: string }) => {
        setRoomId(roomId);
        setPlayerId(playerId);
        // toast.success(`Đã tham gia phòng ${roomId}!`);
      },
      setGames: ({ gameStates, playerStates, playersStatus }: any) => {
        const players: Player[] = playersStatus.map((pl: any) => {
          const [id, player]: any = Object.entries(pl)[0];
          return {
            id,
            name: player.playerName,
            status: "playing",
            isReady: player.isReady,
            isHost: player.isHost
          };
        });
        setGameStates(gameStates);
        setPlayers(players);
        setPlayerStates(normalizePlayerStates(playerStates));
      },
      canStartGame: ({ canStart, message }: { canStart: boolean; message: string }) => {
        console.log("canStartGame triggered:", message); // Log để kiểm tra sự kiện
        setGameStarted(canStart);
        toast.success(message, { toastId: "canStartGame" }); // Sử dụng toastId để tránh lặp
      },
      sendReplayGame: ({ message }: { message: string }) => {
        setDialogMessage(message);
        setOpenDialog((pre) => ({ ...pre, replay: true }));
      },
      replayConfirmed: ({ gameStates, playerStates, playersStatus }: any) => {
        setGameStates(gameStates);
        setPlayerStates(normalizePlayerStates(playerStates));
        setPlayers(
          playersStatus.map((pl: any) => {
            const [id, player]: any = Object.entries(pl)[0];
            return {
              id,
              name: player.playerName,
              status: "playing",
              isReady: player.isReady,
              isHost: player.isHost
            };
          })
        );
        setGameStarted(true);
        setEndedGame(false);
        setOpenDialog({ end: false, replay: false });
        toast.success("Trò chơi đã được bắt đầu lại!");
      },
      replayDeclined: ({ message }: { message: string }) => {
        toast.info(message || "Một người chơi đã từ chối chơi lại.");
        setOpenDialog((pre) => ({ ...pre, replay: false }));
      },
      playerNotReady: ({ message }: { message: string }) => {
        toast.info(message);
      },
      updateState: ({ gameStates, playerStates, action }: any) => {
        setGameStates(gameStates);
        setPlayerStates(normalizePlayerStates(playerStates));
        if (action.result?.isMine) {
          const message =
            action.playerId === playerId
              ? "Bạn đã chạm vào mìn! Thua cuộc!"
              : "Đối thủ chạm mìn! Bạn thắng!";
          setDialogMessage(message);
          setOpenDialog((pre) => ({ ...pre, end: true }));
          setPlayers((prev) =>
            prev.map((p) =>
              p.id === action.playerId ? { ...p, status: "lost" } : { ...p, status: "won" }
            )
          );
        } else if (action.result?.isWin) {
          const message =
            action.playerId === playerId ? "Bạn đã thắng!" : "Đối thủ đã thắng!";
          setDialogMessage(message);
          setOpenDialog((pre) => ({ ...pre, end: true }));
          setPlayers((prev) =>
            prev.map((p) =>
              p.id === action.playerId ? { ...p, status: "won" } : { ...p, status: "lost" }
            )
          );
        }
      },
      gameOver: ({ winner, message }: any) => {
        setDialogMessage(message || (winner === playerId ? "Bạn đã thắng!" : "Bạn đã thua!"));
        setOpenDialog((pre) => ({ ...pre, end: true }));
        setGameStarted(false);
        setEndedGame(true);
      },
      roomFull: ({ message }: { message: string }) => {
        toast.error(message);
      },
      playerLeft: ({ playersStatus, gameStates, playerStates }: any) => {
        toast.info("Đối thủ đã rời phòng!");
        const updatedPlayers: Player[] = playersStatus.map((pl: any) => {
          const [id, player]: any = Object.entries(pl)[0];
          return {
            id,
            name: player.playerName,
            status: "playing",
            isReady: player.isReady,
            isHost: player.isHost
          };
        });
        setPlayers(updatedPlayers);
        setGameStates(gameStates);
        setPlayerStates(normalizePlayerStates(playerStates));
        setGameStarted(false);
        setEndedGame(false);
      },
      returnToLobby: ({ message }: { message: string }) => {
        toast.info(message);
        setGameStates(null);
        setPlayerStates({});
        setPlayers([]);
        setRoomId("");
        setPlayerId(null);
        setGameStarted(false);
        setEndedGame(false);
        setOpenDialog({ end: false, replay: false });
      }
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
    };
  }, [playerId, normalizePlayerStates]);




  const joinRoom = useCallback(
    (roomIdToJoin: string) => {
      if (roomIdToJoin.trim()) {
        socket.emit("joinRoom", roomIdToJoin, playerName);
        onInRoom();
      } else {
        toast.error("Kiểm tra lại tên phòng!");
      }
    },
    [playerName, socket, onInRoom]
  );

  const createRoom = useCallback(() => {
    const newRoomId = uuidv4();
    setRoomId(newRoomId);
    socket.emit("joinRoom", newRoomId, playerName, configMode);
    onInRoom();
  }, [playerName, configMode]);

  const startGame = useCallback(() => {
    socket.emit("startGame", roomId);
  }, [roomId]);

  const replayGame = useCallback(() => {
    toast.success('Gửi lời mời thành công!')
    socket.emit("replayGame", roomId);
  }, [roomId]);

  const toggleReadyGame = useCallback(() => {
    socket.emit("toggleReadyGame", roomId);
  }, [roomId]);

  const leaveRoom = useCallback(() => {
    socket.emit("leaveRoom", roomId);
    onLeaveRoom();
  }, [roomId]);

  const copyRoomId = useCallback(() => {
    navigator.clipboard.writeText(roomId);
    toast.success("Đã sao chép ID phòng!");
  }, [roomId]);

  const openCell = useCallback(
    (index: number) => {
      if (gameStates && !checkGameOver()) {
        socket.emit("openCell", { roomId, index });
      }
    },
    [gameStates, roomId]
  );

  const chording = useCallback(
    (index: number) => {
      if (gameStates && !checkGameOver()) {
        socket.emit("chording", { roomId, index });
      }
    },
    [gameStates, roomId]
  );

  const toggleFlag = useCallback(
    (index: number, e: React.MouseEvent) => {
      e.preventDefault();
      if (gameStates && !checkGameOver()) {
        socket.emit("toggleFlag", { roomId, index });
      }
    },
    [gameStates, roomId]
  );

  const renderBoard = useCallback(
    (isOpponent: boolean, game: any) => {
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
          className="grid gap-[1px] bg-gray-300 p-1 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 rounded-sm"
          style={{
            gridTemplateColumns: `repeat(${ratioY}, 24px)`,
            gridTemplateRows: `repeat(${ratioX}, 24px)`,
          }}
        >
          {cells.map((cell: any, index: number) => {
            const isRevealed = isOpponent ? opponentRevealed.has(index) : currentRevealed.has(index);
            const isFlagged = isOpponent ? opponentFlags.has(index) : currentFlags.has(index);
            const canInteract = !isOpponent && !checkGameOver() && !isRevealed;
            const interactive = canInteract && gameStarted;

            const canChording = currentRevealed.has(index) && !isOpponent;

            let content = "";
            if (isFlagged) content = "🚩";
            else if (isRevealed)
              content = cell.isMine ? "💣" : cell.count > 0 ? cell.count : "";
            else if (cell.isMarkHint) content = "x";

            const cellClasses = [
              isNumber(cell?.count) ? numberColorClasses[cell.count] : "",
              "flex items-center justify-center w-6 h-6 text-sm font-bold",
              isRevealed
                ? "bg-gray-200"
                : "bg-gray-300 border-t-2 border-l-2 border-b-2 border-r-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500",
              interactive ? "cursor-pointer hover:bg-gray-400" : "cursor-default",
            ].join(" ");

            return (
              <div
                key={index}
                className={cellClasses}
                onClick={() => {
                  if (interactive) {
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
    },
    [gameStates, playerStates, playerId, gameStarted, openCell, toggleFlag]
  );

  const renderPreGameForm = () => {
    if (roomId && gameStates) return null;

    return (
      <div className="mb-4 p-3 bg-gray-200 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 rounded-sm">
        <MinesweeperModeSelector onModeChange={(data) => setConfigMode(data)} />
        <input
          type="text"
          placeholder="Tên của bạn"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="px-2 py-1 border border-gray-400 bg-white text-sm w-full mb-2 rounded-sm"
        />
        <div className="flex gap-2">
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Nhập Room ID"
            className="px-2 py-1 border border-gray-400 bg-white text-sm flex-grow rounded-sm"
          />
          <button
            onClick={() => joinRoom(roomId)}
            className="px-3 py-1 bg-gray-300 text-gray-800 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 hover:bg-gray-400 text-sm rounded-sm"
          >
            Vào phòng
          </button>
          <button
            onClick={createRoom}
            className="px-3 py-1 bg-gray-300 text-gray-800 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 hover:bg-gray-400 text-sm rounded-sm"
          >
            Tạo phòng
          </button>
        </div>
      </div>
    );
  };

  const renderGameLobby = () => {
    if (!roomId || !gameStates) return null;

    return (
      <div className="mb-4 p-3 bg-gray-200 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 rounded-sm w-full">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-sm text-gray-800">
            Phòng: <span className="ml-1 bg-gray-300 text-[#337ab7] px-2 py-1 text-xs rounded-sm">{roomId}</span>
          </h3>
          <div className="flex gap-2 items-center">
            {renderLobbyControls()}
            <button
              onClick={copyRoomId}
              className="p-1 bg-gray-300 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 hover:bg-gray-400 text-[#337ab7] rounded-sm"
              title="Sao chép ID phòng"
            >
              <FaCopy size={12} />
            </button>
            <button
              onClick={leaveRoom}
              className="p-1 bg-gray-300 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 hover:bg-gray-400 text-[#ff0000] rounded-sm"
              title="Rời khỏi phòng"
            >
              <FaSignOutAlt size={12} />
            </button>
          </div>
        </div>
        <div className="space-y-1">{players.map(renderPlayerInfo)}</div>
      </div>
    );
  };

  const renderLobbyControls = () => {
    if (gameStarted) return null;

    const currentPlayer = players.find((p) => p.id === playerId);
    if (currentPlayer?.isHost) {
      if (endedGame) {
        return (
          <button
            onClick={replayGame}
            className="px-2 py-1 bg-gray-300 text-gray-800 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 hover:bg-gray-400 text-sm rounded-sm"
          >
            Chơi lại
          </button>
        );
      }
      return Object.keys(gameStates).length === 2 ? (
        <button
          onClick={startGame}
          className="px-2 py-1 bg-gray-300 text-gray-800 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 hover:bg-gray-400 text-sm rounded-sm"
        >
          Bắt đầu game
        </button>
      ) : (
        <BeatLoader size={8} color="#6B7280" />
      );
    }

    return (
      <button
        onClick={toggleReadyGame}
        className="px-2 py-1 bg-gray-300 text-gray-800 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 hover:bg-gray-400 text-sm rounded-sm"
      >
        {currentPlayer?.isReady ? "Hủy sẵn sàng" : "Sẵn sàng"}
      </button>
    );
  };

  const renderPlayerInfo = (player: Player) => {
    const isCurrentPlayer = playerId === player.id;

    return (
      <div
        key={player.id}
        className={`flex items-center p-2 bg-gray-300 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 rounded-sm ${isCurrentPlayer ? "bg-gray-200" : ""}`}
      >
        <div
          className={`flex items-center justify-center w-6 h-6 mr-2 bg-gray-400 text-white text-xs rounded-sm`}
        >
          <FaUser />
        </div>
        <div className="flex-1">
          <div className="flex items-center">
            <span className="font-medium text-sm text-gray-800">
              {player.name} {isCurrentPlayer && "(Bạn)"} {player.isHost && "(Host)"}
            </span>
            {player.status === "won" && <FaCrown className="ml-1 text-yellow-500" size={12} />}
            {player.status === "lost" && <FaSkull className="ml-1 text-gray-500" size={12} />}
            <div
              className={`ml-1 inline-block px-1 py-0.5 text-xs rounded-sm ${player.isReady ? "bg-green-200 text-green-800" : "bg-gray-400 text-gray-200"}`}
            >
              {player.isReady ? "Sẵn sàng" : "Chưa sẵn sàng"}
            </div>
          </div>
          <div className="text-xs text-gray-500">{getPlayerStatusText(player.status)}</div>
        </div>
      </div>
    );
  };

  const getPlayerStatusText = (status: string) => {
    switch (status) {
      case "playing":
        return "Đang chơi";
      case "won":
        return "Chiến thắng!";
      case "lost":
        return "Thua cuộc";
      default:
        return "";
    }
  };

  const renderGameBoards = () => {
    if (!gameStates || Object.keys(gameStates).length === 0) return null;

    return (
      <div className="flex gap-4">
        {Object.entries(gameStates).map(([pId, game]) => (
          <div key={pId} className="flex flex-col">
            <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center">
              {players.find((p) => p.id === pId)?.name}
              <span className={`ml-1 text-xs px-2 py-1 bg-gray-400 text-white rounded-sm`}>
                {pId === playerId ? "Bạn" : "Đối thủ"}
              </span>
            </h3>
            {renderBoard(pId !== playerId, game)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 bg-gray-200 font-sans">
      <header className="w-full max-w-[800px]">
        {renderPreGameForm()}
        {renderGameLobby()}
      </header>
      <main className="mt-4">
        {renderGameBoards()}
      </main>
      <CustomDialog
        open={openDialog.end}
        title="Kết thúc"
        onClose={() => setOpenDialog((pre) => ({ ...pre, end: false }))}
      >
        <p className="text-sm text-gray-800">{dialogMessage}</p>
      </CustomDialog>
      <CustomDialog
        open={openDialog.replay}
        title="Mời chơi lại"
        onClose={() => setOpenDialog((pre) => ({ ...pre, replay: false }))}
        actions={[
          {
            label: "Chấp nhận",
            onClick: () => {
              socket.emit("confirmReplay", { roomId, playerId });
              setOpenDialog((pre) => ({ ...pre, replay: false }));
            },
          },
          {
            label: "Từ chối",
            onClick: () => {
              socket.emit("declineReplay", { roomId, playerId });
              setOpenDialog((pre) => ({ ...pre, replay: false }));
            },
          },
        ]}
      >
        <p className="text-sm text-gray-800">{dialogMessage}</p>
      </CustomDialog>
    </div>
  );
};

export default PvpPlay;