import React from "react";
import { UserGroupIcon, ArrowRightCircleIcon } from "@heroicons/react/24/solid";
import { Box } from "../../components/UI/Box";
import LoadingSpinner from "../../components/LoadingSpinner";

interface Room {
    id: string;
    name: string;
    currentPlayers: number;
    maxPlayers: number;
}

interface RoomListProps {
    rooms: Room[];
    onJoinRoom: (roomId: string) => void;
    isLoading?: boolean;
}

const RoomList: React.FC<RoomListProps> = ({ rooms, onJoinRoom, isLoading = false }) => {
    const truncateRoomId = (id: string, maxLength: number = 8) => {
        return id.length > maxLength ? `${id.slice(0, maxLength)}...` : id;
    };

    return (
        <div className="w-full sm:max-w-[350px] font-sans p-2 sm:p-4 animate-fadeIn">
            <Box className="h-auto sm:h-[90vh] overflow-hidden">
                <h1 className="text-base sm:text-lg font-bold text-gray-800 mb-3">
                    📋 Danh sách phòng
                </h1>
                
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <LoadingSpinner text="Đang tải danh sách phòng..." />
                    </div>
                ) : rooms.length === 0 ? (
                    <div className="text-center py-8 text-gray-600">
                        <p className="text-sm">Chưa có phòng nào</p>
                        <p className="text-xs mt-2">Hãy tạo phòng mới!</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                        {rooms.map((room, index) => (
                            <Box 
                                as="section" 
                                key={room.id} 
                                className="flex items-center justify-between hover:bg-gray-100 transition-colors"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex flex-col flex-1 min-w-0">
                                    <span className="font-medium text-xs sm:text-sm text-gray-700 truncate">
                                        {room.name}
                                    </span>
                                    <span className="text-xs text-gray-500 truncate">
                                        ID: {truncateRoomId(room.id)}
                                    </span>
                                    <span className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                                        <UserGroupIcon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                                        {room.currentPlayers}/{room.maxPlayers}
                                    </span>
                                </div>
                                <Box
                                    as="button"
                                    onClick={() => onJoinRoom(room.id)}
                                    aria-label={`Join room ${room.name}`}
                                    className="flex items-center gap-1 text-xs sm:text-sm shrink-0 hover:scale-105 transition-transform"
                                    disabled={room.currentPlayers >= room.maxPlayers}
                                >
                                    <ArrowRightCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                                    <span className="hidden sm:inline">Tham gia</span>
                                </Box>
                            </Box>
                        ))}
                    </div>
                )}
            </Box>
        </div>
    );
};

export default React.memo(RoomList);
