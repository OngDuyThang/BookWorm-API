import { IsNotEmpty, IsNumberString, IsOptional, IsString } from "class-validator"

export class EnvValidation {
    @IsString()
    @IsNotEmpty()
    SERVICE_HOST_NAME: string

    @IsNumberString()
    @IsNotEmpty()
    SERVICE_PORT: string

    @IsString()
    @IsNotEmpty()
    CLOUDINARY_CLOUD_NAME: string

    @IsString()
    @IsNotEmpty()
    CLOUDINARY_API_KEY: string

    @IsString()
    @IsNotEmpty()
    CLOUDINARY_API_SECRET: string

    @IsString()
    @IsOptional()
    AWS_S3_REGION?: string

    @IsString()
    @IsOptional()
    AWS_S3_BUCKET?: string

    @IsString()
    @IsOptional()
    AWS_ACCESS_KEY?: string

    @IsString()
    @IsOptional()
    AWS_SECRET_KEY?: string
}