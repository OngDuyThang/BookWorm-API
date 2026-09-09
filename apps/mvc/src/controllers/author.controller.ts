import { Controller, Get, Param, Res } from "@nestjs/common";
import { UUIDPipe, getUrlEndpoint, getViewPath } from "@app/common";
import { Response } from "express";
import { Env } from "@app/env";

@Controller('authors')
export class AuthorController {
    constructor(
        private readonly env: Env
    ) {}

    private viewPath(file: string) {
        return getViewPath('author', file);
    }

    private internalUrlEndpoint(path: string) {
        return getUrlEndpoint(
            this.env.PRODUCT_SERVICE_HOST_NAME,
            this.env.PRODUCT_SERVICE_PORT,
            `/api/${path}`
        );
    }

    private clientUrlEndpoint(path: string) {
        return getUrlEndpoint(
            this.env.CLIENT_PRODUCT_SERVICE_HOST_NAME,
            this.env.PRODUCT_SERVICE_PORT,
            `/api/${path}`
        );
    }

    @Get()
    async list(
        @Res() res: Response
    ) {
        const findAllUrl = this.internalUrlEndpoint('authors');
        const removeUrl = this.clientUrlEndpoint('authors');
        let authors: any[] = [];

        try {
            const response = await fetch(findAllUrl, {
                method: 'GET'
            });
            const data = await response.json();
            authors = data?.data || [];
        } catch (e) {
            console.error('Failed to fetch authors list:', e);
        }

        res.render(this.viewPath('list'), {
            authors,
            removeUrl
        });
    }

    @Get('/create')
    async create(
        @Res() res: Response
    ) {
        const createUrl = this.clientUrlEndpoint('authors');
        res.render(this.viewPath('create'), { createUrl });
    }

    @Get('/:id')
    async update(
        @Param('id', UUIDPipe) id: string,
        @Res() res: Response
    ) {
        const findOneUrl = this.internalUrlEndpoint(`authors/${id}`);
        const updateUrl = this.clientUrlEndpoint(`authors/${id}`);
        let author: any = null;

        try {
            const response = await fetch(findOneUrl, {
                method: 'GET'
            });
            const data = await response.json();
            author = data?.data;
        } catch (e) {
            console.error(`Failed to fetch author ${id}:`, e);
        }

        res.render(this.viewPath('update'), { author, updateUrl });
    }
}
