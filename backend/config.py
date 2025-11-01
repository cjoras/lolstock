TENANT_ID = "2849b437-def2-4fa6-8fec-0d748da315b5"
AUDIENCE = "api://e4f3a97c-8255-47ca-87e4-0683aa23238c"
JWKS_URL = f"https://login.microsoftonline.com/{TENANT_ID}/discovery/keys"
ISSUER = f"https://sts.windows.net/{TENANT_ID}/"
ALLOWED_ORIGINS = ["http://localhost:5173"]