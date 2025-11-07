export type serverOptionsProp = {
    title: string,
    path: string,
}
export const serverOptionsConfig: serverOptionsProp[] = [
    {
        title: 'Máy chủ local (server của dev)',
        path: 'http://localhost:3000',
    },
    {
        title: 'Máy chủ cloudflared',
        path: 'https://turn-mobility-tried-puerto.trycloudflare.com',
    },
    {
        title: 'Máy chủ localtunnel',
        path: 'https://fast-kids-wonder.loca.lt',
    },
    {
        title: 'Máy chủ ngrok',
        path: 'https://toad-arriving-accurately.ngrok-free.app',
    },
    {
        title: 'Máy chủ render',
        path: 'https://minesweeper-be.onrender.com',
    },
]