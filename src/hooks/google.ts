"use client";
import { useContext } from "react";
import { AuthenticationContext, SignInParams } from "../CredentiProvider";

export const useGoogleSignIn = () => {
  const { setSecurity, setSecurityError } = useContext(AuthenticationContext);

  return (params: SignInParams) => {
    if (typeof window !== "undefined") {
      if (!params.clientId || !params.redirectUrl) {
        setSecurity(undefined);
        setSecurityError({
          message: "Invalid Google Authentication Request",
        });
      }

      const url: string[] = [
        `https://accounts.google.com/o/oauth2/v2/auth?client_id=${
          params.clientId
        }&redirect_uri=${params.redirectUrl}&response_type=${
          params.responseType ?? "token"
        }&scope=${params.scope ?? "email openid profile"}`,
      ];

      addRequestParam(url, "state", params.state);
      addRequestParam(
        url,
        "include_granted_scopes",
        params?.includeGrantedScopes?.toString()
      );
      addRequestParam(
        url,
        "enable_granular_consent",
        params?.enableGranularConsent?.toString()
      );
      addRequestParam(url, "login_hint", params.loginHint);
      addRequestParam(url, "prompt", params.prompt);

      window.location.replace(url.join(""));
    }
  };
};

const addRequestParam = (url: string[], key: string, v?: string) => {
  if (v) {
    url.push(`&${key}=${v}`);
  }
};
