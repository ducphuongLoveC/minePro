import React, { useEffect, useState, useRef } from "react";
import io, { Socket } from "socket.io-client";
import PvpPlay from "./PvpPlay";
import RoomList from "../Components/RoomList";
import { useAppSelector } from "../../hooks/useRedux";

interface Room {
    id: string;
    name: string;
    currentPlayers: number;
    maxPlayers: number;
}

interface ServerState {
    serverOptions: {
        selectedServer: string;
    };
}

const PVP: React.FC = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isInRoom, setIsInRoom] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const socketRef = useRef<Socket | null>(null);

    const { selectedServer } = useAppSelector((state: ServerState) => state.serverOptions);

    useEffect(() => {
        if (!selectedServer) {
            setError("No server selected");
            setIsLoading(false);
            return;
        }

        const socket = io(`${selectedServer}/pvp`, {
            transports: ["websocket"],
            upgrade: false,
            forceNew: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 20000,
        });
        socketRef.current = socket;

        socket.on("connect_error", (err) => {
            setError(`Connection failed: ${err.message}`);
            setIsLoading(false);
        });

        const handleRoomList = (updatedRooms: Room[]) => {
            setRooms(
                updatedRooms.map((room) => ({
                    id: room.id,
                    name: room.name || `Phòng ${room.id}`,
                    currentPlayers: room.currentPlayers,
                    maxPlayers: room.maxPlayers,
                }))
            );
            setIsLoading(false);
        };

        socket.on("roomList", handleRoomList);


        if (socket.connected) {
            socket.emit("emitRoomList");
        } else {
            socket.on("connect", () => {
                socket.emit("emitRoomList");
            });
        }

        return () => {
            socket.off("roomList", handleRoomList);
            socket.off("connect_error");
            socket.disconnect();
            socketRef.current = null;
        };
    }, [selectedServer]);

    const handleJoinRoom = (id: string) => {
        if (socketRef.current) {
            socketRef.current.emit("joinRoom", id);
            setIsInRoom(true);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row animate-fadeIn">
            {!isInRoom && (
                <RoomList
                    rooms={rooms}
                    onJoinRoom={handleJoinRoom}
                    isLoading={isLoading}
                />
            )}
            {error && (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded m-4">
                    <strong>Lỗi:</strong> {error}
                </div>
            )}
            {socketRef.current && (
                <PvpPlay
                    socket={socketRef.current}
                    onInRoom={() => setIsInRoom(true)}
                    onLeaveRoom={() => setIsInRoom(false)}
                />
            )}
        </div>
    );
};

export default PVP;