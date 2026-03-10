import { createBrowserRouter } from "react-router-dom";
import { Dashboard } from "./features/dashboard";
import { ChatPage } from "./features/chat";
import { DiseasePage } from "./features/disease-detection";
import { NewsPage } from "./features/news";
import VoiceAgentPage from "./features/voice-agent/VoiceAgentPage";

export const router = createBrowserRouter([
  { path: "/", element: <Dashboard /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/chat", element: <ChatPage /> },
  { path: "/disease", element: <DiseasePage /> },
  { path: "/news", element: <NewsPage /> },
  { path: "/voice-agent", element: <VoiceAgentPage /> },
]);
