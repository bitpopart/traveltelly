import { BrowserRouter, Route, Routes } from "react-router-dom";
import IndexBasic from "./pages/IndexBasic";

export function AppMinimal() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IndexBasic />} />
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppMinimal;