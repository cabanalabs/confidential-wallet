import {Outlet, useLocation} from "react-router-dom";
import { Header } from "./components/Header.tsx";

export const Layout = () => {
  const location = useLocation();
  const showNav = location.pathname !== "/";
  return (
    <>
      {showNav && <Header />}
      <main className="max-w-tablet mx-auto h-full w-full bg-woodsmoke">
        <Outlet />
      </main>
    </>
  );
};
