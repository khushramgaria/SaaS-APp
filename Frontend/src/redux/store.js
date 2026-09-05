import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import memberReducer from "./slices/memberSlice";
import projectReducer from "./slices/projectSlice";
import taskReducer from "./slices/taskSlice";
import documentReducer from "./slices/documentSlice";
import activityReducer from "./slices/activitySlice";
import chatReducer from "./slices/chatSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    members: memberReducer,
    projects: projectReducer,
    tasks: taskReducer,
    documents: documentReducer,
    activity: activityReducer,
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
