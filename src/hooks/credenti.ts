"use client";
import { useContext } from "react";
import { AuthenticationContext, SignInParams } from "../CredentiProvider";
import axios from "axios";

interface CredentiSignInResponse {
    accessToken: string;
    refreshToken: string;
    userId: number;
    clientId: number;
    email: string;
  }

export const useCredentiSignIn = () => {
    const {
      setSecurity,
      setIsLoading,
      setSecurityError,
    } = useContext(AuthenticationContext);
  
    return (params: SignInParams) => {
      setIsLoading(true);
      const clientId = params.clientId ? +params.clientId : null;
      if (!params.email || !params.password || !clientId) {
        throw new Error("Invalid credenti authorization request");
      }
  
      const body = {
        email: params.email,
        password: params.password,
        clientId: clientId,
      };
  
      axios
        .post<CredentiSignInResponse>(
          process.env.REACT_APP_CREDENTI_API + "/api/v1/authorization/token",
          body
        )
        .then((res) => {
          setSecurity(res.data);
          setSecurityError({
            message: "",
          });
        })
        .catch((err) => {
          setSecurity(undefined);
          setSecurityError({
            message: err.response.data.message,
          });
        })
        .finally(() => setIsLoading(false));
    };
  };