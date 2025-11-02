export const msalConfig = {
  auth: {
    clientId: "899f5fa6-9f68-4568-bb65-e15e5fba0cd5", // FRONTEND app
    authority: "https://login.microsoftonline.com/2849b437-def2-4fa6-8fec-0d748da315b5",
    redirectUri: "http://localhost:5173",
    redirectUri: "https://lolstock-frontend.onrender.com",
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["api://e4f3a97c-8255-47ca-87e4-0683aa23238c/access_as_user"],
};
