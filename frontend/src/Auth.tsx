import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from "react";
import {Login} from "./pages";

export const Auth = () => {
  let uid = localStorage.getItem("uid");
  const navigate = useNavigate();
  // const[ queryParams, _] = useSearchParams();
  if(!uid) {//} && queryParams.has('demo')) {
    uid = 'demo';
  }

  useEffect(() => {
    const isRoot = window.location.pathname === "/";
    if (uid && isRoot) navigate("/home");
    else if (!uid && !isRoot) navigate("/");
  }, [uid, navigate]);

  // if (uid === undefined) return null;
  if (!uid) return <Login />;
  return <Outlet />;
}
