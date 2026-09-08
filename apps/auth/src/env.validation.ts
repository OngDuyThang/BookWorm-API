import { AbstractEnvValidation } from "@app/env"
import { IsNotEmpty, IsNumberString, IsOptional, IsString } from "class-validator"

export class EnvValidation extends AbstractEnvValidation {
    @IsString()
    @IsNotEmpty()
    SERVICE_HOST_NAME: string

    @IsNumberString()
    @IsNotEmpty()
    SERVICE_PORT: string

    @IsString()
    @IsNotEmpty()
    AUTH_QUEUE: string

    @IsString()
    @IsNotEmpty()
    REDIS_HOST: string

    @IsNumberString()
    @IsNotEmpty()
    REDIS_PORT: string

    @IsString()
    @IsNotEmpty()
    REDIS_USERNAME: string

    @IsString()
    @IsNotEmpty()
    REDIS_PASSWORD: string

    @IsString()
    @IsNotEmpty()
    ACCESS_TOKEN_SECRET: string

    @IsString()
    @IsNotEmpty()
    REFRESH_TOKEN_SECRET: string

    @IsString()
    @IsNotEmpty()
    VALIDATE_OTP_PATH_NAME: string

    @IsString()
    @IsNotEmpty()
    RESET_PASSWORD_PATH_NAME: string

    @IsString()
    @IsNotEmpty()
    MAILER_USERNAME: string

    @IsString()
    @IsNotEmpty()
    MAILER_PASSWORD: string

    @IsString()
    @IsNotEmpty()
    GOOGLE_CLIENT_ID: string

    @IsString()
    @IsNotEmpty()
    GOOGLE_CLIENT_SECRET: string

    @IsString()
    @IsNotEmpty()
    GOOGLE_CALLBACK_URL: string

    @IsString()
    @IsNotEmpty()
    GOOGLE_ISSUER: string

    @IsString()
    @IsNotEmpty()
    FRONTEND_HOST_NAME: string

    @IsString()
    @IsNotEmpty()
    FRONTEND_PORT: string

    @IsString()
    @IsNotEmpty()
    MVC_HOST_NAME: string

    @IsString()
    @IsNotEmpty()
    MVC_PORT: string

    @IsString()
    @IsOptional()
    ADMIN_USERNAME?: string

    @IsString()
    @IsOptional()
    ADMIN_PASSWORD?: string
}