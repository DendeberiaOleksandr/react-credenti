"use client";
import axios from "axios";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type Props = {
  children: ReactNode;
};

const SECURITY_KEY = "credentiSecurity";

export interface AuthenticationProviderOptions {
  name: "credenti" | "google" | string;
}

export interface SignInParams {
  email?: string;
  username?: string;
  password?: string;
  clientId?: string;
  redirectUrl: string;
  responseType?: string;
  scope?: string;
  state?: string;
  includeGrantedScopes?: boolean;
  enableGranularConsent?: boolean;
  loginHint?: string;
  prompt?: string;
}

export interface AppSecurity {
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  jwt?: string;
  accessToken?: string;
  accessTokenExpiration?: string;
  accessTokenExpiriesIn?: string;
  emailVerified?: string;
  accessType?: string;
  refreshToken?: string;
  azp?: string;
  aud?: string;
  sub?: string;
  scope?: string;
  givenName?: string;
  familyName?: string;
  accessVerified?: string;
  locale?: string;
  id?: string;
  birthday?: string;
  gender?: string;
  ageRange?: string;
  education?: string;
  hometown?: string;
  picture?: string;
  languages?: string;
  link?: string;
  location?: string;
  middleName?: string;
  name?: string;
  nameFormat?: string;
  relatioshipStatus?: string;
  shortName?: string;
}

export interface SecurityError {
  message: string;
}

export type AuthenticationContextType = {
  security?: AppSecurity;
  setSecurity: (security: AppSecurity | undefined) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  securityError?: SecurityError;
  setSecurityError: (securityError: SecurityError) => void;
};

export const AuthenticationContext = createContext<AuthenticationContextType>({
  isLoading: false,
  setSecurity: () => {},
  setIsLoading: () => {},
  setSecurityError: () => {},
});

export interface GoogleTokenInfoResponse {
  azp?: string;
  aud?: string;
  sub?: string;
  scope?: string;
  exp?: string;
  expires_in?: string;
  email?: string;
  email_verified?: string;
  access_type?: string;
}

export interface GoogleUserInfoResponse {
  sub?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email?: string;
  access_verified?: string;
  locale?: string;
}

export interface MetaPicture {
  height: number;
  is_silhouette: boolean;
  url: string;
  width: number;
}

export interface MetaMeResponse {
  id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  birthday?: string;
  gender?: string;
  age_range?: string;
  education?: string;
  hometown?: string;
  picture?: {
    data: MetaPicture;
  };
  languages?: string;
  link?: string;
  location?: string;
  middle_name?: string;
  name?: string;
  name_format?: string;
  relatioship_status?: string;
  short_name?: string;
}

function CredentiProvider({ children }: Props) {
  const [pathname, setPathname] = useState<string>();
  const [security, setSecurity] = useState<AppSecurity | undefined>();
  const [securityError, setSecurityError] = useState<
    SecurityError | undefined
  >();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const setAppSecurity = (appSecurity: AppSecurity | undefined) => {
    setSecurity(appSecurity);
    if (typeof window !== "undefined") {
      localStorage.setItem(SECURITY_KEY, JSON.stringify(appSecurity));
    }
  };

  const handleGoogleOAuthCallback = (params: Record<string, string>) => {
    const accessToken = params["access_token"];

    if (accessToken) {
      axios
        .get<GoogleTokenInfoResponse>(
          `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`
        )
        .then((res) => {
          axios
            .get<GoogleUserInfoResponse>(
              `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
            )
            .then((userInfoRes) =>
              setSecurity({
                ...(security ?? {
                  email: "",
                }),
                email: res.data.email ?? "",
                username: res.data.email,
                jwt: accessToken,
                accessToken: accessToken,
                accessTokenExpiration: res.data.exp,
                accessTokenExpiriesIn: res.data.expires_in,
                emailVerified: res.data.email_verified,
                accessType: res.data.access_type,
                azp: res.data.azp,
                aud: res.data.aud,
                sub: res.data.sub,
                scope: res.data.scope,
                name: userInfoRes.data.name,
                givenName: userInfoRes.data.given_name,
                familyName: userInfoRes.data.family_name,
                picture: userInfoRes.data.picture,
                accessVerified: userInfoRes.data.access_verified,
                locale: userInfoRes.data.locale,
              })
            );
        });
    }
  };

  const loadSecurityFromStorage = () => {
    setSecurity(JSON.parse(localStorage.getItem(SECURITY_KEY) ?? ""));
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPathname(window.location.href);
      loadSecurityFromStorage();
    }
  }, []);

  const isGoogleOAuthCallback = (path: string) => {
    return path && path.includes("googleapis");
  };

  const handleMetaOAuthCallback = (params: Record<string, string>) => {
    const accessToken = params["access_token"];
    if (accessToken) {
      axios
        .get<MetaMeResponse>(
          `https://graph.facebook.com/me?access_token=${accessToken}&fields=id,email,first_name,last_name,birthday,gender,age_range,education,hometown,picture,languages,link,location,middle_name,name,name_format,relationship_status,short_name`
        )
        .then((res) => {
          setAppSecurity({
            ...(security ?? {
              email: "",
            }),
            email: res.data.email ?? "",
            username: res.data.email,
            jwt: accessToken,
            accessToken: accessToken,
            id: res.data.id,
            firstName: res.data.first_name,
            lastName: res.data.last_name,
            birthday: res.data.birthday,
            gender: res.data.gender,
            ageRange: res.data.age_range,
            education: res.data.education,
            hometown: res.data.hometown,
            picture: res.data.picture?.data.url,
            languages: res.data.languages,
            link: res.data.link,
            location: res.data.location,
            middleName: res.data.middle_name,
            name: res.data.name,
            nameFormat: res.data.name_format,
            relatioshipStatus: res.data.relatioship_status,
            shortName: res.data.short_name,
          });
        });
    }
  };

  const mapPathname = (pathname: string) => {
    const params: Record<string, string> = {};

    const splitPath = pathname.split("#");

    if (splitPath && splitPath.length === 2) {
      splitPath[1].split("&").forEach((entry) => {
        const map = entry.split("=");
        params[map[0]] = map[1];
      });
    }

    return params;
  };

  useEffect(() => {
    if (pathname) {
      const params = mapPathname(pathname);
      if (params && params.length) {
        if (isGoogleOAuthCallback(pathname)) {
          handleGoogleOAuthCallback(params);
        } else {
          handleMetaOAuthCallback(params);
        }
      }
    }
  }, [pathname]);

  return (
    <AuthenticationContext.Provider
      value={{
        security: security,
        setSecurity: setAppSecurity,
        isLoading: isLoading,
        setIsLoading: setIsLoading,
        securityError: securityError,
        setSecurityError: setSecurityError,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
}

export interface UseAuthenticationProps {
  redirectUri: string | undefined;
}

export const useAuthentication = () => {
  const context = useContext(AuthenticationContext);

  return context;
};

export default CredentiProvider;
