import {useState} from "react";
import {apiService} from "../mw/services/api-service.ts";

type User = {
  id?: string;
  name?: string;
  personas?: string[];
}
export const useUserApi = () => {

  const [userObj, setUserObj] = useState<User>({ id: localStorage.getItem("uid")});

  const create = async (name: string) => {
    if (!name) return;
    const result = await apiService.createUser({ name }) as any;
    localStorage.setItem("uid", result.id);
    setUserObj(result);
    return result;
  };

  const login = async (name?: string) => {
    if (!name && !userObj.id) return;
    const result = await apiService.login({ name, id: userObj.id }) as any;
    if (result.id) {
      localStorage.setItem("uid", result.id);
      setUserObj(result);
    }
    return result;
  };

  const logout = () => {
    if (!userObj.id) return;
    localStorage.removeItem("uid");
    setUserObj({});
  }

  return {
    create,
    login,
    logout
  }
}