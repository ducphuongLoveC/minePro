import React, { Suspense, lazy } from "react";
import { useRoutes } from "react-router-dom";
import MainLayout from "../Layouts";

// Lazy load các page components để tối ưu performance
const SinglePlay = lazy(() => import("../page/SinglePlay"));
const PVP = lazy(() => import("../page/PVP"));

// Loading component
const PageLoader = () => (
    <div className="flex items-center justify-center h-full">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-3"></div>
            <p className="text-sm text-gray-600">Đang tải...</p>
        </div>
    </div>
);

export const routes = [
    {
        path: "/",
        element: <MainLayout />,
        children: [
            { 
                path: "", 
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <SinglePlay />
                    </Suspense>
                )
            },
            { 
                path: "pvp", 
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <PVP />
                    </Suspense>
                )
            }
        ]
    }
];

const AppRoutes = () => {
    const element = useRoutes(routes);
    return element;
};

export default AppRoutes;