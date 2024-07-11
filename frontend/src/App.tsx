import { Routes, Route } from "react-router-dom";
import { NotFound } from "./pages";

import {Layout} from "./Layout.tsx";
import {Auth} from "./Auth.tsx";
import {Home} from "./pages/Home.tsx";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route element={<Auth />}>
          <Route path="home" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}
