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

    private urlEndpoint(path: string) {
        return getUrlEndpoint(
            this.env.PRODUCT_SERVICE_HOST_NAME,
            this.env.PRODUCT_SERVICE_PORT,
            `/api/${path}`
        );
    }

    @Get()
    async list(
        @Res() res: Response
    ) {
        const findAllUrl = this.urlEndpoint('authors');
        const removeUrl = findAllUrl;
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
        const createUrl = this.urlEndpoint('authors');
        res.render(this.viewPath('create'), { createUrl });
    }

    @Get('/:id')
    async update(
        @Param('id', UUIDPipe) id: string,
        @Res() res: Response
    ) {
        const findOneUrl = this.urlEndpoint(`authors/${id}`);
        const updateUrl = findOneUrl;
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
