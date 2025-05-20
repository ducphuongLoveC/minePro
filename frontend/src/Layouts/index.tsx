import React from "react";
import { Outlet } from "react-router-dom";
import { NavLink } from "react-router-dom";

function MainLayout() {
  return (
    <div className="flex h-screen bg-gray-200 font-sans">
      {/* Sidebar */}
      <div className="w-56 bg-gray-200 p-3 border-r-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 flex flex-col">
        <h1 className="text-lg font-bold text-gray-800 mb-6">Minesweeper</h1>

        <nav className="flex-1">
          <ul className="space-y-1">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `block px-3 py-2 text-sm font-medium text-gray-800 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 rounded-sm ${
                    isActive ? "bg-gray-200" : "bg-gray-300 hover:bg-gray-400"
                  }`
                }
              >
                🎮 Chơi đơn
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/pvp"
                className={({ isActive }) =>
                  `block px-3 py-2 text-sm font-medium text-gray-800 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 rounded-sm ${
                    isActive ? "bg-gray-200" : "bg-gray-300 hover:bg-gray-400"
                  }`
                }
              >
                👥 Chơi PVP
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/leaderboard"
                className={({ isActive }) =>
                  `block px-3 py-2 text-sm font-medium text-gray-800 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 rounded-sm ${
                    isActive ? "bg-gray-200" : "bg-gray-300 hover:bg-gray-400"
                  }`
                }
              >
                🏆 Bảng xếp hạng
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `block px-3 py-2 text-sm font-medium text-gray-800 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 rounded-sm ${
                    isActive ? "bg-gray-200" : "bg-gray-300 hover:bg-gray-400"
                  }`
                }
              >
                ⚙️ Cài đặt
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="mt-auto pt-3 border-t-2 border-t-white border-b-gray-500">
          <div className="text-xs text-gray-500">Phiên bản 1.0.0</div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-4 bg-gray-200 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500">
        <Outlet />
      </div>
    </div>
  );
}

export default MainLayout;