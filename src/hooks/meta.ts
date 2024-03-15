"use client";
import { SignInParams } from "../CredentiProvider";

export const useMetaSignIn = () => {
  return (params: SignInParams) => {
    if (typeof window !== "undefined") {
      const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${
        params.clientId
      }&display=popup&response_type=token&redirect_uri=${
        params.redirectUrl
      }&state=${params.state}&scope=${params.scope ?? "email,public_profile"}`;

      window.location.replace(url);
    }
  };
};
