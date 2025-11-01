import React from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig";
import { postLogin } from "../services/api";

export const AuthButtons = () => {
  const { instance } = useMsal();

  const handleLogin = async () => {
    try {
      console.log("🔹 Åpner login popup...");
      const resp = await instance.loginPopup(loginRequest);
      console.log("✅ Logget inn:", resp.account);
      instance.setActiveAccount(resp.account);
      // opprett/oppdater bruker i DB
      await postLogin(instance, resp.account);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    try {
      await instance.logoutPopup();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <button onClick={handleLogin} style={{ marginRight: 8 }}>Login</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};
