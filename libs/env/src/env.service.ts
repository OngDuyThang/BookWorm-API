import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class Env {
    constructor(
        private readonly configService: ConfigService
    ) {}

    get NODE_ENV() {
        return this.configService.get<string>('NODE_ENV');
    }

    get SERVICE_HOST_NAME() {
        return this.configService.get<string>('SERVICE_HOST_NAME');
    }

    get SERVICE_PORT() {
        return this.configService.get<string>('SERVICE_PORT');
    }

    get DB_HOST() {
        return this.configService.get<string>('DB_HOST');
    }

    get DB_PORT() {
        return this.configService.get<string>('DB_PORT');
    }

    get DB_USERNAME() {
        return this.configService.get<string>('DB_USERNAME');
    }

    get DB_PASSWORD() {
        return this.configService.get<string>('DB_PASSWORD');
    }

    get DB_NAME() {
        return this.configService.get<string>('DB_NAME');
    }

    get AWS_S3_REGION() {
        return this.configService.get<string>('AWS_S3_REGION');
    }

    get AWS_S3_BUCKET() {
        return this.configService.get<string>('AWS_S3_BUCKET');
    }

    get AWS_ACCESS_KEY() {
        return this.configService.get<string>('AWS_ACCESS_KEY');
    }

    get AWS_SECRET_KEY() {
        return this.configService.get<string>('AWS_SECRET_KEY');
    }

    get RABBIT_MQ_URI() {
        return this.configService.get<string>('RABBIT_MQ_URI');
    }

    get QUEUE_NAME() {
        return this.configService.get<string>('QUEUE_NAME');
    }

    get REDIS_HOST() {
        return this.configService.get<string>('REDIS_HOST');
    }

    get REDIS_PORT() {
        return this.configService.get<string>('REDIS_PORT');
    }

    get REDIS_USERNAME() {
        return this.configService.get<string>('REDIS_USERNAME');
    }

    get REDIS_PASSWORD() {
        return this.configService.get<string>('REDIS_PASSWORD');
    }

    get ACCESS_TOKEN_SECRET() {
        return this.configService.get<string>('ACCESS_TOKEN_SECRET');
    }

    get REFRESH_TOKEN_SECRET() {
        return this.configService.get<string>('REFRESH_TOKEN_SECRET');
    }

    get VALIDATE_OTP_PATH_NAME() {
        return this.configService.get<string>('VALIDATE_OTP_PATH_NAME');
    }

    get RESET_PASSWORD_PATH_NAME() {
        return this.configService.get<string>('RESET_PASSWORD_PATH_NAME');
    }

    get MAILER_USERNAME() {
        return this.configService.get<string>('MAILER_USERNAME');
    }

    get MAILER_PASSWORD() {
        return this.configService.get<string>('MAILER_PASSWORD');
    }

    get GOOGLE_CLIENT_ID() {
        return this.configService.get<string>('GOOGLE_CLIENT_ID');
    }

    get GOOGLE_CLIENT_SECRET() {
        return this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    }

    get GOOGLE_CALLBACK_URL() {
        return this.configService.get<string>('GOOGLE_CALLBACK_URL');
    }

    get AUTH_SERVICE_HOST_NAME() {
        return this.configService.get<string>('AUTH_SERVICE_HOST_NAME');
    }

    get AUTH_SERVICE_PORT() {
        return this.configService.get<string>('AUTH_SERVICE_PORT');
    }

    get PRODUCT_SERVICE_HOST_NAME() {
        return this.configService.get<string>('PRODUCT_SERVICE_HOST_NAME');
    }

    get PRODUCT_SERVICE_PORT() {
        return this.configService.get<string>('PRODUCT_SERVICE_PORT');
    }

    get CART_SERVICE_HOST_NAME() {
        return this.configService.get<string>('CART_SERVICE_HOST_NAME');
    }

    get CART_SERVICE_PORT() {
        return this.configService.get<string>('CART_SERVICE_PORT');
    }

    get ORDER_SERVICE_HOST_NAME() {
        return this.configService.get<string>('ORDER_SERVICE_HOST_NAME');
    }

    get ORDER_SERVICE_PORT() {
        return this.configService.get<string>('ORDER_SERVICE_PORT');
    }

    get FRONTEND_HOST_NAME() {
        return this.configService.get<string>('FRONTEND_HOST_NAME');
    }

    get FRONTEND_PORT() {
        return this.configService.get<string>('FRONTEND_PORT');
    }

    get MVC_HOST_NAME() {
        return this.configService.get<string>('MVC_HOST_NAME');
    }

    get MVC_PORT() {
        return this.configService.get<string>('MVC_PORT');
    }

    get UPLOAD_SERVICE_HOST_NAME() {
        return this.configService.get<string>('UPLOAD_SERVICE_HOST_NAME');
    }

    get UPLOAD_SERVICE_PORT() {
        return this.configService.get<string>('UPLOAD_SERVICE_PORT');
    }

    get ASSET_SERVICE_HOST_NAME() {
        return this.configService.get<string>('ASSET_SERVICE_HOST_NAME');
    }

    get ASSET_SERVICE_PORT() {
        return this.configService.get<string>('ASSET_SERVICE_PORT');
    }

    get STRIPE_SECRET_KEY() {
        return this.configService.get<string>('STRIPE_SECRET_KEY');
    }

    get CLOUDINARY_CLOUD_NAME() {
        return this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    }

    get CLOUDINARY_API_KEY() {
        return this.configService.get<string>('CLOUDINARY_API_KEY');
    }

    get CLOUDINARY_API_SECRET() {
        return this.configService.get<string>('CLOUDINARY_API_SECRET');
    }

    get ADMIN_USERNAME() {
        return this.configService.get<string>('ADMIN_USERNAME');
    }

    get ADMIN_PASSWORD() {
        return this.configService.get<string>('ADMIN_PASSWORD');
    }
}