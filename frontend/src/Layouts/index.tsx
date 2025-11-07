// import React, { useState } from "react";
// import { Outlet, NavLink } from "react-router-dom";
// import CustomDialog from "../components/CustomDialog";

// import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
// import { selectServer } from "../store/features/serverOptions";
// import { toast } from "react-toastify";

// function MainLayout() {
//   const [showMenu, setShowMenu] = useState(false);
//   const [showDialog, setShowDialog] = useState(false);

//   const dispatch = useAppDispatch();
//   const { server, selectedServer } = useAppSelector((state) => state.serverOptions);
//   console.log(selectedServer);


//   return (
//     <div className="flex flex-col h-screen bg-gray-200 font-sans">
//       {/* Topbar */}
//       <div className="flex justify-end items-center px-4 py-2 bg-gray-200 border-b-2 border-t-white border-b-gray-500 relative">
//         <div className="relative">
//           <button
//             onClick={() => setShowMenu(!showMenu)}
//             className="flex items-center gap-2 text-sm font-medium text-gray-800 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 px-2 py-1 bg-gray-200 hover:bg-gray-300"
//           >
//             🧑 UserFake ▼
//           </button>

//           {showMenu && (
//             <div className="absolute right-0 mt-1 w-48 bg-gray-300 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 shadow z-10">
//               <button
//                 onClick={() => {
//                   setShowDialog(true);
//                   setShowMenu(false);
//                 }}
//                 className="block w-full text-left px-3 py-2 text-sm text-gray-800 hover:bg-gray-400"
//               >
//                 ⚙️ Cấu hình server
//               </button>
//               <button
//                 className="block w-full text-left px-3 py-2 text-sm text-gray-800 hover:bg-gray-400"
//               >
//                 🚪 Đăng xuất
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Main layout below topbar */}
//       <div className="flex flex-1">
//         {/* Sidebar */}
//         <div className="w-56 bg-gray-200 p-3 border-r-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 flex flex-col">
//           <h1 className="text-lg font-bold text-gray-800 mb-6">Minesweeper</h1>

//           <nav className="flex-1">
//             <ul className="space-y-1">
//               {[
//                 { to: "/", label: "🎮 Chơi đơn" },
//                 { to: "/pvp", label: "👥 Chơi PVP" },
//                 { to: "/leaderboard", label: "🏆 Bảng xếp hạng" },
//                 { to: "/settings", label: "⚙️ Cài đặt" },
//               ].map((item) => (
//                 <li key={item.to}>
//                   <NavLink
//                     to={item.to}
//                     className={({ isActive }) =>
//                       `block px-3 py-2 text-sm font-medium text-gray-800 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 rounded-sm ${isActive ? "bg-gray-200" : "bg-gray-300 hover:bg-gray-400"
//                       }`
//                     }
//                   >
//                     {item.label}
//                   </NavLink>
//                 </li>
//               ))}
//             </ul>
//           </nav>

//           <div className="mt-auto pt-3 border-t-2 border-t-white border-b-gray-500">
//             <div className="text-xs text-gray-500">Phiên bản 1.0.0</div>
//           </div>
//         </div>

//         {/* Main content */}
//         <div className="flex-1 overflow-auto p-4 bg-gray-200 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500">
//           <Outlet />
//         </div>
//       </div>

//       {/* Dialog hiển thị khi mở menu */}
//       <CustomDialog
//         open={showDialog}
//         onClose={() => setShowDialog(false)}
//         title="Cấu hình máy chủ"
//         size="md"
//         actions={[
//           {
//             label: "Đóng",
//             onClick: () => setShowDialog(false),
//             variant: "secondary",
//           },
//         ]}
//       >

//         <div className="flex flex-col gap-3">
//           <label htmlFor="server-select" className="text-sm font-medium text-gray-800">
//             Chọn máy chủ:
//           </label>

//           <select
//             id="server-select"
//             value={selectedServer}
//             onChange={(e) => {
//               dispatch(selectServer(e.target.value))
//               toast.success('Đổi server thành công')
//             }}
//             className="bg-white border border-gray-400 px-3 py-2 text-sm text-gray-800"
//           >
//             {server.map((server) => (
//               <option key={server.path} value={server.path}>
//                 {server.title} ({server.path})
//               </option>
//             ))}
//           </select>
//         </div>
//       </CustomDialog>
//     </div>
//   );
// }

// export default MainLayout;




import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Outlet, NavLink } from "react-router-dom";
import CustomDialog from "../components/CustomDialog";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { selectServer } from "../store/features/serverOptions";
import { toast } from "react-toastify";
import io, { Socket } from "socket.io-client";
import { Cog6ToothIcon, PlayIcon, ServerStackIcon, TrophyIcon, UserCircleIcon, UsersIcon } from "@heroicons/react/24/solid";
import { Box } from "../components/UI/Box";

// Define types for server and state
interface Server {
  path: string;
  title: string;
}

interface RootState {
  serverOptions: {
    server: Server[];
    selectedServer: string | null;
  };
}

interface SocketPingData {
  latency: number | null;
  isConnected: boolean;
  connectionStatus: "connecting" | "connected" | "disconnected" | "failed";
}

// Custom hook for Socket.IO connection with optimized ping
function useSocketPing(serverUrl: string | null): SocketPingData {
  const [latency, setLatency] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected" | "failed">("connecting");

  const socket = useMemo<Socket | null>(() => {
    if (!serverUrl) return null;
    return io(serverUrl, {
      transports: ["websocket"], // Chỉ sử dụng WebSocket
      upgrade: false,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });
  }, [serverUrl]);

  useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      setIsConnected(true);
      setConnectionStatus("connected");
      setLatency(0);
    };

    const onDisconnect = (reason: string) => {
      setIsConnected(false);
      setConnectionStatus(reason === "io client disconnect" ? "disconnected" : "failed");
      setLatency(null);
    };

    const onPong = (data: { pingTime: number }) => {
      const calculatedLatency = Date.now() - data.pingTime;
      setLatency((prev) => (prev === null ? calculatedLatency : prev * 0.7 + calculatedLatency * 0.3));
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("pong", onPong);

    const pingInterval = setInterval(() => {
      if (socket.connected) {
        socket.volatile.emit("ping", { pingTime: Date.now() });
      }
    }, 2000);

    return () => {
      clearInterval(pingInterval);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("pong", onPong);
      socket.disconnect();
    };
  }, [socket]);

  return { latency: latency !== null ? Math.round(latency) : null, isConnected, connectionStatus };
}

// PingIndicator component
interface PingIndicatorProps {
  latency: number | null;
  isConnected: boolean;
  connectionStatus: "connecting" | "connected" | "disconnected" | "failed";
}

const PingIndicator: React.FC<PingIndicatorProps> = ({ latency, isConnected, connectionStatus }) => {
  const getStatusColor = (): string => {
    if (!isConnected) return "bg-red-500";
    if (connectionStatus === "connecting") return "bg-gray-500";
    if (latency !== null && latency < 30) return "bg-green-500";
    if (latency !== null && latency < 100) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusText = (): string => {
    if (!isConnected) return "Mất kết nối";
    if (connectionStatus === "connecting") return "Đang kết nối...";
    return `${latency}ms`;
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`}></span>
      <span className="text-sm text-gray-800">{getStatusText()}</span>
    </div>
  );
};

const MainLayout: React.FC = () => {
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const { server, selectedServer } = useAppSelector((state: RootState) => state.serverOptions);

  const { latency, isConnected, connectionStatus } = useSocketPing(selectedServer);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [allServerPings, setAllServerPings] = useState<any>({});

  const pingAllServers = useCallback(async () => {
    const results: Record<string, number | null> = {};
    await Promise.all(
      server.map(async (srv: Server) => {
        const tempSocket = io(srv.path, {
          transports: ["websocket"],
          upgrade: false,
          forceNew: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 20000,
        });

        try {
          const latency = await new Promise<number | null>((resolve) => {
            const pingTime = Date.now();
            tempSocket.on("connect", () => {
              tempSocket.volatile.emit("ping", { pingTime });
            });

            tempSocket.on("pong", (data: { pingTime: number }) => {
              resolve(Date.now() - data.pingTime);
            });

            tempSocket.on("connect_error", () => resolve(null));
            setTimeout(() => resolve(null), 1500);
          });

          results[srv.path] = latency;
        } catch (error) {
          results[srv.path] = null;
        } finally {
          tempSocket.disconnect();
        }
      })
    );
    setAllServerPings(results);
  }, [server]);

  useEffect(() => {
    if (showDialog) {
      pingAllServers();
      const interval = setInterval(pingAllServers, 8000);
      return () => clearInterval(interval);
    }
  }, [showDialog, pingAllServers]);

  return (
    <div className="flex flex-col bg-gray-200 font-sans h-[100vh] overflow-hidden">
      {/* Topbar */}
      <Box className="flex justify-between items-center relative shrink-0">
        {/* Hamburger menu cho mobile */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden p-2 hover:bg-gray-300 rounded transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-4 mr-4">
          {selectedServer ? (
            <PingIndicator latency={latency} isConnected={isConnected} connectionStatus={connectionStatus} />
          ) : (
            <span className="text-xs sm:text-sm text-gray-800">Chưa chọn server</span>
          )}
        </div>

        <div className="relative">
          <Box
            as='button'
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 text-xs sm:text-sm font-medium"
          >
            <UserCircleIcon className="w-5 h-5 text-gray-800" /> 
            <span className="hidden sm:inline">User ▼</span>
          </Box>

          {showMenu && (
            <Box className="absolute right-0 mt-1 z-10 w-48 animate-fadeIn">
              <Box
                as={'button'}
                onClick={() => {
                  setShowDialog(true);
                  setShowMenu(false);
                }}
                className="w-full text-left"
              >
                <ServerStackIcon className="w-5 h-5 text-gray-800 inline-block mr-1" /> Cấu hình server
              </Box>
              <Box as={'button'} className="w-full text-left">
                Đăng xuất
              </Box>
            </Box>
          )}
        </div>
      </Box>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Overlay cho mobile khi sidebar mở */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside 
          className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            ${isMobile ? 'fixed z-30' : 'relative'}
            w-56 bg-gray-200 p-3 border-r-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 
            flex flex-col h-full transition-transform duration-300 ease-in-out
          `}
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg font-bold text-gray-800">Minesweeper</h1>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 hover:bg-gray-300 rounded"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto">
            <ul className="space-y-1">
              {[
                { to: "/", label: "Chơi đơn", icon: <PlayIcon className="w-5 h-5 text-green-600" /> },
                { to: "/pvp", label: "Chơi PVP", icon: <UsersIcon className="w-5 h-5 text-blue-600" /> },
                { to: "/leaderboard", label: "Bảng xếp hạng", icon: <TrophyIcon className="w-5 h-5 text-yellow-500" /> },
                { to: "/settings", label: "Cài đặt", icon: <Cog6ToothIcon className="w-5 h-5 text-gray-700" /> },
              ].map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={() => isMobile && setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-800 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 rounded-sm transition-colors ${
                        isActive ? "bg-gray-200" : "bg-gray-300 hover:bg-gray-400"
                      }`
                    }
                  >
                    {item.icon}
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto pt-3 border-t-2 border-t-white border-b-gray-500">
            <div className="text-xs text-gray-500">Phiên bản 1.0.0</div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-2 sm:p-4 bg-gray-200 border-2 border-t-white border-l-white">
          <Outlet />
        </main>
      </div>

      {/* Server configuration dialog with radio buttons */}
      <CustomDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        title="Cấu hình máy chủ"
        size="md"
        actions={[
          {
            label: "Đóng",
            onClick: () => setShowDialog(false),
            variant: "secondary",
          },
        ]}
      >
        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium text-gray-800">Chọn máy chủ:</span>
          <div className="space-y-2">
            {server.map((srv: Server) => (
              <label key={srv.path} className="flex items-center gap-2 text-sm text-gray-800">
                <input
                  type="radio"
                  name="server"
                  value={srv.path}
                  checked={selectedServer === srv.path}
                  onChange={(e) => {
                    dispatch(selectServer(e.target.value));
                    toast.success("Đổi server thành công");
                  }}
                  className="h-4 w-4 text-blue-600"
                />
                <span>
                  {srv.title} ({srv.path}){" "}
                  {allServerPings[srv.path] !== undefined
                    ? allServerPings[srv.path] !== null
                      ? `${Math.round(allServerPings[srv.path])}ms`
                      : "Không thể kết nối"
                    : "Đang đo..."}
                </span>
              </label>
            ))}
          </div>
        </div>
      </CustomDialog>
    </div>
  );
};

export default MainLayout;