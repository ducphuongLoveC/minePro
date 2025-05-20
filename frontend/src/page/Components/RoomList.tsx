import React from "react";

interface Room {
    id: string;
    name: string;
    currentPlayers: number;
    maxPlayers: number;
}

interface RoomListProps {
    rooms: Room[];
    onJoinRoom: (roomId: string) => void;
}

const RoomList: React.FC<RoomListProps> = ({ rooms, onJoinRoom }) => {
    // Function to truncate room ID
    const truncateRoomId = (id: string, maxLength: number = 8) => {
        return id.length > maxLength ? `${id.slice(0, maxLength)}...` : id;
    };

    return (
        <div className="w-full max-w-[350px] font-sans p-4">
            <div className="bg-gray-200 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 p-4 rounded-sm h-[90vh]">
                <h1 className="text-lg font-bold text-gray-800 mb-3">Danh sách phòng</h1>
                <div className="flex flex-col gap-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {rooms.map((room) => (
                        <div
                            key={room.id}
                            className="flex items-center justify-between py-2 px-4 border-2 bg-gray-300 border-t-white border-l-white border-b-gray-500 border-r-gray-500 rounded-sm"
                        >
                            <div className="flex flex-col">
                                <span className="font-medium text-sm text-gray-700">
                                    {room.name} (ID: {truncateRoomId(room.id)})
                                </span>
                                <span className="text-xs text-gray-600">
                                    {room.currentPlayers}/{room.maxPlayers} người chơi
                                </span>
                            </div>
                            <button
                                onClick={() => onJoinRoom(room.id)}
                                className="py-1 px-3 bg-gray-200 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 text-sm font-medium text-gray-800 hover:bg-gray-400 rounded-sm"
                                aria-label={`Join room ${room.name}`}
                            >
                                Tham gia
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RoomList;