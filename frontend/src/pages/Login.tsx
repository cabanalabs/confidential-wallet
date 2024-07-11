import { useState } from "react";

import {useNavigate} from "react-router-dom";
import {useUserApi} from "../hooks/useUserApi.ts";
import {Button, TextInput} from "@mantine/core";

export const Login = () => {

  const navigate = useNavigate();

  // const { create, getUser, clearError, updateStyle } = userStore.actions;
  const { login, create } = useUserApi()
  const [loading, setLoading] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [register, _] = useState<boolean>(false);
  const [confirm, setConfirm] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (register) {
      await create(username); //, context
    } else if (confirm) {
      await login(username);
    } else {
      login(username).then((result) => {
        if (result) {
          setConfirm(true);
          navigate('/pilot')
        }
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
    }

    if (register || confirm) {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="w-[500px] max-w-mobile rounded-2xl border border-mineshaft px-4 py-8">
        <p className="mb-12 text-center text-xl font-black leading-s text-wildsand">
          userhunt
        </p>
        <form className="mb-4" onSubmit={handleSubmit}>
          {confirm ? (
            <h2 className="text-lg text-wildsand font-black text-center mb-2 -mt-6">Welcome back {username}!</h2>
          ) : (
          <TextInput
            disabled={loading}
            name="username"
            className="mb-2 w-full rounded-md"
            autoComplete="off"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError("");
            }}
          />
          )}
          {error && (
            <p className="mt-2 text-center text-xs font-bold text-danger">
              {error}
            </p>
          )}
          <Button
            className="mt-4"
            fullWidth
            disabled={loading}
            loading={loading}
          >
            {register ? "Create Account" : confirm ? "Yup that's me!" : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
};
