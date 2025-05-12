import React from "react";
import { useRoutes } from "react-router-dom";
import MainLayout from "../Layouts";
import PVP from "../page/PVP";
import SinglePlay from "../page/SinglePlay";
export const routes = [
    {
        path: "/",
        element: <MainLayout />,
        children: [
            { path: "", element: <SinglePlay/> },
            { path: "pvp", element: <PVP/> }
        ]
    }
]
const AppRoutes = () => {
    const element = useRoutes(routes);

    return element;
};
export default AppRoutes;