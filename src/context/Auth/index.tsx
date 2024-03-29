import React, { useState, useEffect } from "react";
import AuthenticationService from "services/external/api/auth";
import { deleteAllStorageItems } from "services/internal/storage";
import {
   AlreadyExistsError,
   NotFoundError,
   UnauthorizedError
} from "services/models/errors";
import { Alert } from "react-native";
import internalSecurity from "services/internal/security/btoa";
import * as LocalAuthentication from "expo-local-authentication";
import { refresh } from "services/external/api/apiFetch";
import { ChallengeRequest } from "services/models/requests/challengeRequest";
import { RegisterRequest } from "services/models/requests/registerRequest";
import { LoginRequest } from "services/models/requests/loginRequest";
import { clearCache } from "services/external/graphql/client";

interface ForgotPasswordRequest {
   email?: string;
   phoneNumber?: string;
}
interface LoginResponse {
   valid: boolean;
   verificationEmailSent?: boolean;
   emailError?: string;
   passwordError?: string;
}
interface RegisterResponse {
   valid: boolean;
   emailError?: string;
   passwordError?: string;
}

export enum AuthState {
   Verifying,
   SignedOut,
   SignedIn
}

interface Props {
   children: React.ReactNode;
}

interface Context {
   state: AuthState;
   tryLocalAuthentication: () => Promise<boolean>;
   login: (loginRequest: LoginRequest) => Promise<LoginResponse>;
   register: (registerRequest: RegisterRequest) => Promise<RegisterResponse>;
   forgotPassword: (
      forgotPasswordRequest: ForgotPasswordRequest
   ) => Promise<boolean>;
   confirmEmailVerification: (code: number) => Promise<boolean>;
   confirmPasswordReset: (code: number) => Promise<boolean>;
   updatePassword: (password: string) => Promise<boolean>;
   logout: () => void;
}

const AuthContext = React.createContext<Context>(undefined!);

const AuthProvider: React.FC<Props> = (props: Props) => {
   const [verified, setVerified] = useState<boolean>(false);
   const [state, setState] = useState<AuthState>(AuthState.Verifying);

   const verify = async () => {
      try {
         await refresh();
         setVerified(true);
      } catch (error) {
         console.error("Error verifying refresh token");
         console.error(error);
      } finally {
         setState(AuthState.SignedOut);
      }
   };

   const tryLocalAuthentication = async (): Promise<boolean> => {
      try {
         if (verified) {
            const response = await LocalAuthentication.authenticateAsync();
            if (response) {
               setState(AuthState.SignedIn);
               return true;
            }
         }
      } catch (error) {}
      return false;
   };

   const login = async (loginRequest: LoginRequest): Promise<LoginResponse> => {
      try {
         const authenticationService = AuthenticationService.getInstance();
         const response = await authenticationService.login({
            email: loginRequest.email,
            phoneNumber: loginRequest.phoneNumber,
            password: internalSecurity.btoa(loginRequest.password)
         });
         let verificationEmailSent = false;
         if (response.isEmailVerified) {
            setState(AuthState.SignedIn);
            verificationEmailSent = true;
         }
         return { valid: true, verificationEmailSent };
      } catch (error) {
         if (error instanceof UnauthorizedError)
            return { valid: false, passwordError: "Incorrect password" };
         if (error instanceof NotFoundError)
            return {
               valid: false,
               emailError: "No user found with this email"
            };

         Alert.alert(
            "Unable to log in",
            "We're having trouble logging you in. Please try again later."
         );
         return { valid: false };
      }
   };

   const register = async (
      registerRequest: RegisterRequest
   ): Promise<RegisterResponse> => {
      try {
         const authenticationService = AuthenticationService.getInstance();
         await authenticationService.register({
            firstName: registerRequest.firstName,
            lastName: registerRequest.lastName,
            email: registerRequest.email,
            phoneNumber: registerRequest.phoneNumber,
            password: internalSecurity.btoa(registerRequest.password)
         });
         return { valid: true };
      } catch (error) {
         if (error instanceof AlreadyExistsError)
            return {
               valid: false,
               emailError: "A user already exists with this email address"
            };
         Alert.alert(
            "Unable to create account",
            "We're having trouble creating your account. Please try again later."
         );
         return { valid: false };
      }
   };

   const forgotPassword = async (
      forgotPasswordRequest: ForgotPasswordRequest
   ): Promise<boolean> => {
      try {
         const authenticationService = AuthenticationService.getInstance();
         const challengeRequest: ChallengeRequest = {
            email: forgotPasswordRequest.email,
            phoneNumber: forgotPasswordRequest.phoneNumber,
            type: "passwordReset"
         };
         await authenticationService.challenge(challengeRequest);
         return true;
      } catch (error) {
         Alert.alert(
            "Unable to confirm your email",
            "We're having trouble verifying your email. Please try again later."
         );
         return false;
      }
   };

   const confirmEmailVerification = async (code: number): Promise<boolean> => {
      try {
         const authenticationService = AuthenticationService.getInstance();
         await authenticationService.confirmChallenge(code);
         setState(AuthState.SignedIn);
         return true;
      } catch (error) {
         if (error instanceof UnauthorizedError) return false;

         Alert.alert(
            "Unable to confirm your email",
            "We're having trouble confirming your email. Please try again later."
         );
         return false;
      }
   };
   const confirmPasswordReset = async (code: number): Promise<boolean> => {
      try {
         const authenticationService = AuthenticationService.getInstance();
         await authenticationService.confirmChallenge(code);
         return true;
      } catch (error) {
         if (error instanceof UnauthorizedError) return false;
         Alert.alert(
            "Unable to confirm your email",
            "We're having trouble confirming your email. Please try again later."
         );
         return false;
      }
   };

   const updatePassword = async (password: string): Promise<boolean> => {
      try {
         const authenticationService = AuthenticationService.getInstance();
         await authenticationService.updatePassword(
            internalSecurity.btoa(password)
         );
         setState(AuthState.SignedIn);
         return true;
      } catch (error) {
         if (error instanceof UnauthorizedError) return false;
         Alert.alert(
            "Unable to update password",
            "We're having trouble updating your password. Please try again later."
         );
         return false;
      }
   };

   const logout = async () => {
      await clearCache();
      deleteAllStorageItems();
      setVerified(false);
      setState(AuthState.SignedOut);
   };

   useEffect(() => {
      verify();
   }, []);

   const value: Context = {
      state,
      tryLocalAuthentication,
      login,
      register,
      forgotPassword,
      confirmEmailVerification,
      confirmPasswordReset,
      updatePassword,
      logout
   };

   return (
      <AuthContext.Provider value={value}>
         {props.children}
      </AuthContext.Provider>
   );
};

export const useAuth = (): Context => React.useContext<Context>(AuthContext);

export default AuthProvider;
