import persistReducer from "redux-persist/es/persistReducer";
import { authReducer } from "./login-store/Login.store";
import { configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import persistStore from "redux-persist/es/persistStore";
import profileReducer from "./profile-store/Profile-deatils";
import skillsReducer from "./post-store/PostStore";
import chatReducer from "./chat-store/chat.store";
const persistConfig = {
  key: "root",
  storage,
};

const persistAuthReducer = persistReducer(persistConfig, authReducer);

const store = configureStore({
  reducer: {
    authReducer: persistAuthReducer,
    profileReducer: profileReducer,
    skillsReducer: skillsReducer,
    chatReducer: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
  devTools: true,
});

const persistor = persistStore(store);
export { store, persistor };
