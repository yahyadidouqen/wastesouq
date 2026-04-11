import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublishPage from "./pages/PublishPage";
import BrowsePage from "./pages/BrowsePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublishPage />} />
        <Route path="/annonces" element={<BrowsePage />} />
      </Routes>
    </BrowserRouter>
  );
}