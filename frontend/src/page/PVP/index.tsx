import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import PvpPlay from "./PvpPlay";
import RoomList from "../Components/RoomList";


const socket = io("http://localhost:3000/pvp");

interface Room {
    id: string;
    name: string;
    currentPlayers: number;
    maxPlayers: number
}

const PVP: React.FC = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isInRoom, setIsInRoom] = useState(false);

    useEffect(() => {
        const handleRoomList = (updatedRooms: any[]) => {
            setRooms(
                updatedRooms.map((room) => ({
                    id: room.id,
                    name: room.name || `Phòng ${room.id}`,
                    currentPlayers: room.currentPlayers,
                    maxPlayers: room.maxPlayers,
                }))
            );
        };

        socket.on("roomList", handleRoomList);

        socket.emit("emitRoomList");

        return () => {
            socket.off("roomList", handleRoomList);
        };
    }, []);
    
    return (
        <div className="flex">
            {!isInRoom && (
                <RoomList
                    rooms={rooms}
                    onJoinRoom={(id) => {
                        socket.emit("joinRoom", id);
                        setIsInRoom(true);
                    }}
                />
            )}
            <PvpPlay
                socket={socket}
                onInRoom={() => setIsInRoom(true)}
                onLeaveRoom={() => setIsInRoom(false)}
            />
        </div>
    );
};

export default PVP;