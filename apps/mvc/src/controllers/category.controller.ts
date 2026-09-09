import { Controller, Get, Param, Render, Res } from "@nestjs/common";
import { UUIDPipe, getUrlEndpoint, getViewPath } from "@app/common";
import { Response } from "express";
import { Env } from "@app/env";

@Controller('categories')
export class CategoryController {
    constructor(
        private readonly env: Env
    ) {}

    private viewPath(file: string) {
        return getViewPath('category', file)
    }

    private internalUrlEndpoint(path: string) {
        return getUrlEndpoint(
            this.env.PRODUCT_SERVICE_HOST_NAME,
            this.env.PRODUCT_SERVICE_PORT,
            `/api/${path}`
        )
    }

    private clientUrlEndpoint(path: string) {
        return getUrlEndpoint(
            this.env.CLIENT_PRODUCT_SERVICE_HOST_NAME,
            this.env.PRODUCT_SERVICE_PORT,
            `/api/${path}`
        )
    }

    @Get()
    async list(
        @Res() res: Response
    ) {
        const findAllUrl = this.internalUrlEndpoint('categories')
        const removeUrl = this.clientUrlEndpoint('categories')
        let categories: object

        try {
            const res = await fetch(findAllUrl, {
                method: 'GET'
            })
            const data = await res.json()
            categories = data?.data
        } catch (e) {
            throw e
        }

        res.render(this.viewPath('list'), {
            categories,
            removeUrl
        })
    }

    @Get('/create')
    async create(
        @Res() res: Response
    ) {
        const findAllUrl = this.internalUrlEndpoint('categories')
        const createUrl = this.clientUrlEndpoint('categories')
        let categories: object

        try {
            const res = await fetch(findAllUrl, {
                method: 'GET'
            })
            const data = await res.json()
            categories = data?.data
        } catch (e) {
            console.log(e)
        }

        res.render(this.viewPath('create'), { categories, createUrl })
    }

    @Get('/:id')
    async update(
        @Param('id', UUIDPipe) id: string,
        @Res() res: Response
    ) {
        const findOneUrl = this.internalUrlEndpoint(`categories/${id}`)
        const findAllUrl = this.internalUrlEndpoint('categories')
        const updateUrl = this.clientUrlEndpoint(`categories/${id}`)
        let category: object, categories: object

        try {
            const res = await fetch(findOneUrl, {
                method: 'GET'
            })
            const data = await res.json()
            category = data?.data
        } catch (e) {
            throw e
        }

        try {
            const res = await fetch(findAllUrl, {
                method: 'GET'
            })
            const data = await res.json()
            categories = data?.data
        } catch (e) {
            console.log(e)
        }

        res.render(this.viewPath('update'), { category, categories, updateUrl })
    }
}