import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import memberReducer from "./slices/memberSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    members: memberReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
