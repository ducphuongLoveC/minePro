// import React, { useEffect, useState } from "react";
// import io from "socket.io-client";
// import PvpPlay from "./PvpPlay";
// import RoomList from "../Components/RoomList";
// import { useAppSelector } from "../../hooks/useRedux";


// interface Room {
//     id: string;
//     name: string;
//     currentPlayers: number;
//     maxPlayers: number
// }

// const PVP: React.FC = () => {
//     const [rooms, setRooms] = useState<Room[]>([]);
//     const [isInRoom, setIsInRoom] = useState(false);

//     const { selectedServer } = useAppSelector((state) => state.serverOptions);

//     useEffect(() => {

//         const socket = io(`${selectedServer}/pvp`, {
//             transports: ["websocket"],
//         });

//         const handleRoomList = (updatedRooms: any[]) => {
//             setRooms(
//                 updatedRooms.map((room) => ({
//                     id: room.id,
//                     name: room.name || `Phòng ${room.id}`,
//                     currentPlayers: room.currentPlayers,
//                     maxPlayers: room.maxPlayers,
//                 }))
//             );
//         };

//         socket.on("roomList", handleRoomList);

//         socket.emit("emitRoomList");

//         return () => {
//             socket.off("roomList", handleRoomList);
//         };
//     }, [selectedServer]);

//     return (
//         <div className="flex">
//             {!isInRoom && (
//                 <RoomList
//                     rooms={rooms}
//                     onJoinRoom={(id) => {
//                         socket.emit("joinRoom", id);
//                         setIsInRoom(true);
//                     }}
//                 />
//             )}
//             <PvpPlay
//                 socket={socket}
//                 onInRoom={() => setIsInRoom(true)}
//                 onLeaveRoom={() => setIsInRoom(false)}
//             />
//         </div>
//     );
// };

// export default PVP;

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
            reconnectionAttempts: 3,
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

    if (isLoading) {
        return <div>Loading rooms...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="flex">
            {!isInRoom && (
                <RoomList
                    rooms={rooms}
                    onJoinRoom={handleJoinRoom}
                />
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