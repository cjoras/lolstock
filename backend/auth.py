from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
from jose.utils import base64url_decode
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
import requests

TENANT_ID = "2849b437-def2-4fa6-8fec-0d748da315b5"
AUDIENCE = "api://e4f3a97c-8255-47ca-87e4-0683aa23238c"
JWKS_URL = f"https://login.microsoftonline.com/{TENANT_ID}/discovery/keys"
ISSUER = f"https://sts.windows.net/{TENANT_ID}/"

bearer_scheme = HTTPBearer()


def get_rsa_public_key(jwk):
    """Bygger en RSA public key i PEM-format fra en JWK"""
    try:
        print("🧩 Genererer RSA public key ...")
        n = int.from_bytes(base64url_decode(jwk["n"].encode("utf-8")), "big")
        e = int.from_bytes(base64url_decode(jwk["e"].encode("utf-8")), "big")
        public_numbers = rsa.RSAPublicNumbers(e, n)
        public_key = public_numbers.public_key()
        pem_bytes = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        )
        print("✅ RSA key generert OK")
        return pem_bytes  # behold som bytes
    except Exception as e:
        print("❌ Feil ved generering av RSA key:", e)
        raise


def verify_jwt(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    token = credentials.credentials
    print("\n🟢 Token mottatt (første 60 tegn):", token[:60], "...\n")

    try:
        # Hent JWKS
        print("🌍 Henter JWKS fra:", JWKS_URL)
        jwks = requests.get(JWKS_URL).json()
        print("🔑 JWKS keys:", [k["kid"] for k in jwks["keys"]])

        # Header
        header = jwt.get_unverified_header(token)
        print("🧾 JWT header:", header)

        # Match riktig JWK
        key_data = next((k for k in jwks["keys"] if k["kid"] == header["kid"]), None)
        if not key_data:
            raise Exception(f"Ingen matchende JWK funnet for kid {header['kid']}")
        print("✅ Fant riktig JWK")

        # Bygg public key
        public_pem = get_rsa_public_key(key_data)
        print("📜 Public PEM length:", len(public_pem))

        # Les ut uten verifikasjon
        unverified = jwt.get_unverified_claims(token)
        print("📦 Unverified payload:", unverified)
        print("👉 aud:", unverified.get("aud"))
        print("👉 iss:", unverified.get("iss"))

        # Verifiser fullt ut
        payload = jwt.decode(
            token,
            public_pem,
            algorithms=["RS256"],
            audience=AUDIENCE,
            issuer=ISSUER,
        )

        print("✅ Token verifisert OK! Payload:")
        print(payload)
        return payload

    except Exception as e:
        print("❌ JWT verification failed:", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"JWT verification failed: {e}",
        )