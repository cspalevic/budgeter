import { getItem, StorageKeys } from "services/internal/storage";
import {
   callApi,
   handleAuthResponse,
   handleConfirmationCodeResponse
} from "../apiFetch";
import { ChallengeRequest } from "../models/requests/challengeRequest"
import {
   AlreadyExistsError,
   GeneralError,
   InternalServerError,
   NotFoundError,
   UnauthorizedError
} from "../models/errors";
import { AuthResponse, ConfirmationCodeResponse } from "../models/responses";
import { RegisterRequest } from "../models/requests/registerRequest";

interface LoginResponse {
   isEmailVerified: boolean;
   confirmationCodeResponse?: ConfirmationCodeResponse;
   authResponse?: AuthResponse;
}

class AuthenticationService {
   private resource: string;

   static instance: AuthenticationService;

   constructor() {
      this.resource = "auth";
   }

   static getInstance(): AuthenticationService {
      if (!AuthenticationService.instance)
         AuthenticationService.instance = new AuthenticationService();
      return AuthenticationService.instance;
   }

   public async login(email: string, password: string): Promise<LoginResponse> {
      const options: RequestInit = {
         method: "POST",
         headers: {
            "Content-Type": "application/json"
         },
         body: JSON.stringify({ email, password })
      };
      const response = await callApi(`${this.resource}/login`, options);
      if (response.status === 400) {
         const body = await response.json();
         throw new GeneralError(body.message);
      }
      if (response.status === 401) {
         throw new UnauthorizedError();
      }
      if (response.status === 404) {
         throw new NotFoundError();
      }
      if (response.status >= 500) {
         const body = await response.json();
         throw new InternalServerError(body.message);
      }
      const body = await response.json();
      let authResponse;
      let confirmationCodeResponse;
      let isEmailVerified = true;
      if (response.status === 202) {
         isEmailVerified = false;
         confirmationCodeResponse = {
            key: body.key,
            expires: body.expires
         };
         await handleConfirmationCodeResponse(confirmationCodeResponse);
      } else {
         authResponse = {
            expires: body.expires,
            accessToken: body.accessToken,
            refreshToken: body.refreshToken
         };
         await handleAuthResponse(authResponse);
      }
      return {
         isEmailVerified,
         authResponse,
         confirmationCodeResponse
      };
   }

   public async register(
      registerRequest: RegisterRequest
   ): Promise<ConfirmationCodeResponse> {
      const options: RequestInit = {
         method: "POST",
         headers: {
            "Content-Type": "application/json"
         },
         body: JSON.stringify({ registerRequest })
      };
      const response = await callApi(`${this.resource}/register`, options);
      if (response.status === 400) {
         const body = await response.json();
         throw new GeneralError(body.message);
      }
      if (response.status === 409) {
         throw new AlreadyExistsError();
      }
      if (response.status >= 500) {
         const body = await response.json();
         throw new InternalServerError(body.message);
      }
      const body = await response.json();
      const confirmationCodeResponse: ConfirmationCodeResponse = {
         key: body.key,
         expires: body.expires
      };
      await handleConfirmationCodeResponse(confirmationCodeResponse);
      return confirmationCodeResponse;
   }

   public async challenge(
      challengeRequest: ChallengeRequest
   ): Promise<ConfirmationCodeResponse> {
      const options: RequestInit = {
         method: "POST",
         headers: {
            "Content-Type": "application/json"
         },
         body: JSON.stringify({ challengeRequest })
      };
      const response = await callApi(`${this.resource}/challenge`, options);
      if (response.status === 400) {
         const body = await response.json();
         throw new GeneralError(body.message);
      }
      if (response.status >= 500) {
         const body = await response.json();
         throw new InternalServerError(body.message);
      }
      const body = await response.json();
      const confirmationCodeResponse: ConfirmationCodeResponse = {
         key: body.key,
         expires: body.expires
      };
      await handleConfirmationCodeResponse(confirmationCodeResponse);
      return confirmationCodeResponse;
   }

   public async confirmChallenge(code: number): Promise<AuthResponse> {
      const key = await getItem(StorageKeys.ConfirmationKey);
      const options: RequestInit = {
         method: "POST",
         headers: {
            "Content-Type": "application/json"
         },
         body: JSON.stringify({ code })
      };
      const response = await callApi(
         `${this.resource}/challenge/${key}`,
         options
      );
      if (response.status === 400) {
         const body = await response.json();
         throw new GeneralError(body.message);
      }
      if (response.status === 401) {
         throw new UnauthorizedError();
      }
      if (response.status >= 500) {
         const body = await response.json();
         throw new InternalServerError(body.message);
      }
      const body = await response.json();
      const authResponse: AuthResponse = {
         expires: body.expires,
         accessToken: body.accessToken,
         refreshToken: body.refreshToken
      };
      await handleAuthResponse(authResponse);
      return authResponse;
   }
}

export default {
   getInstance: (): AuthenticationService => AuthenticationService.getInstance()
};
