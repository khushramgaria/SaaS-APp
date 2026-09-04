import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import memberReducer from "./slices/memberSlice";
import projectReducer from "./slices/projectSlice";
import taskReducer from "./slices/taskSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    members: memberReducer,
    projects: projectReducer,
    tasks: taskReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
