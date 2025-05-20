import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import PvpPlay from "./PvpPlay";
import RoomList from "../Components/RoomList";


const socket = io("http://localhost:3000");

function PVP() {
    const [rooms, setRooms] = useState([
    ]);

    const [isInRoom, setIsInroom] = useState(false);

    useEffect(() => {
        socket.on("roomList", (updatedRooms) => {
            console.log(rooms);
            setRooms(
                updatedRooms.map((room) => ({
                    id: room.id,
                    name: room.name || `Phòng ${room.id}`,
                    currentPlayers: room.currentPlayers,
                    maxPlayers: room.maxPlayers,
                }))
            );
        });

        return () => {
            socket.off("roomList");
        };
    }, []);

    useEffect(() => {

        if (socket) {
            socket.emit('emitRoomList')
        }
    }, [])

    return (
        <div className="flex">
            {
                !isInRoom && <RoomList
                    rooms={rooms}
                    onJoinRoom={(id) => {
                        console.log(id);
                        socket.emit("joinRoom", id);
                        setIsInroom(true)
                    }}
                />
            }

            <PvpPlay socket={socket} onInRoom={() => setIsInroom(true)} onLeaveRoom={() => setIsInroom(false)} />
        </div>
    );
}

export default PVP;