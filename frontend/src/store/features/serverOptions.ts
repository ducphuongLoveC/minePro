import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { serverOptionsConfig, type serverOptionsProp } from '../../config/serverOptions';

interface ServerState {
    server: serverOptionsProp[];
    selectedServer: string;
}

const initialState: ServerState = {
    server: serverOptionsConfig,
    selectedServer: serverOptionsConfig[0].path || '',
};

const serverOptionsSlice = createSlice({
    name: 'serverOptions',
    initialState,
    reducers: {
        addServer: (state, action: PayloadAction<serverOptionsProp>) => {
            state.server.push(action.payload);
        },
        selectServer: (state, action: PayloadAction<string>) => {
            state.selectedServer = action.payload;
        },
    },
});

export const { addServer, selectServer } = serverOptionsSlice.actions;
export default serverOptionsSlice.reducer;
