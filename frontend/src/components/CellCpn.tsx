import React, { memo } from "react";

export const numberColorClasses = new Map([
    [1, "text-blue-700"],
    [2, "text-green-700"],
    [3, "text-red-700"],
    [4, "text-purple-700"],
    [5, "text-maroon-700"],
    [6, "text-teal-700"],
    [7, "text-black"],
    [8, "text-gray-700"],
]);

const getNumberClass = (count: any, isRevealed: boolean): string => {
    if (!isRevealed || !count || typeof count !== "number") return "";
    return numberColorClasses.get(count) || "";
};

interface CellCpnProps {
    children?: React.ReactNode;
    isRevealed: boolean;
    canInteract: boolean;
    count?: number;
    onClick?: () => void;
    onContextMenu?: (e: React.MouseEvent) => void;
}

function CellCpn({ children, isRevealed, canInteract, count, ...props }: CellCpnProps) {
    const baseBorder =
        "border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500";
    const activeBorder =
        "active:border-t-gray-500 active:border-l-gray-500 active:border-b-white active:border-r-white active:scale-95";

    const cellClasses = [
        getNumberClass(count, isRevealed),
        "flex items-center justify-center w-6 h-6 text-sm font-bold",
        isRevealed
            ? "bg-gray-200"
            : `bg-gray-300 ${baseBorder} ${canInteract ? `${activeBorder} hover:brightness-105` : ""}`,
        canInteract ? "cursor-pointer" : "cursor-default",
        "select-none",
        "touch-manipulation", // Better mobile performance
    ].join(" ");

    return (
        <div className={cellClasses} {...props}>
            {children}
        </div>
    );
}

export default memo(CellCpn);
