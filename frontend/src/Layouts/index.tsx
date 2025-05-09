    import React from "react";
    import { Outlet } from "react-router-dom";
    import { Link } from "react-router-dom";

    function MainLayout() {
        return (
            <div className="flex h-screen bg-gray-100">
                {/* Sidebar */}
                <div className="w-64 bg-blue-800 text-white p-4 flex flex-col">
                    <h1 className="text-2xl font-bold mb-8 text-center">Minesweeper</h1>

                    <nav className="flex-1">
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/"
                                    className="block px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
                                >
                                    🎮 Chơi đơn
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/pvp"
                                    className="block px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
                                >
                                    👥 Chơi PVP
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/leaderboard"
                                    className="block px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
                                >
                                    🏆 Bảng xếp hạng
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/settings"
                                    className="block px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
                                >
                                    ⚙️ Cài đặt
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    <div className="mt-auto pt-4 border-t border-blue-700">
                        <div className="text-sm text-blue-200">Phiên bản 1.0.0</div>
                    </div>
                </div>

                {/* Main content */}
                <div className="flex-1 overflow-auto p-6">
                    <Outlet />
                </div>
            </div>
        );
    }

    export default MainLayout;