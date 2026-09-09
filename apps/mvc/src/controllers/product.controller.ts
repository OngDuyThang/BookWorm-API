import { UUIDPipe, getUrlEndpoint, getViewPath } from "@app/common";
import { Env } from "@app/env";
import { Controller, Get, Param, Res } from "@nestjs/common";
import { Response } from "express";

@Controller('products')
export class ProductController {
    constructor(
        private readonly env: Env
    ) {}

    private viewPath(file: string) {
        return getViewPath('product', file)
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
        const findAllUrl = this.internalUrlEndpoint('products')
        const removeUrl = this.clientUrlEndpoint('products')
        let products: object

        try {
            const res = await fetch(findAllUrl, {
                method: 'GET'
            })
            const data = await res.json()
            products = data?.data
        } catch (e) {
            throw e
        }

        res.render(this.viewPath('list'), {
            products,
            removeUrl
        })
    }

    @Get('/create')
    async create(
        @Res() res: Response
    ) {
        const findAllAuthorUrl = this.internalUrlEndpoint('authors')
        const findAllCatUrl = this.internalUrlEndpoint('categories')
        const findAllPromotionUrl = this.internalUrlEndpoint('promotions')
        const createUrl = this.clientUrlEndpoint('products')
        const uploadUrl = getUrlEndpoint(
            this.env.UPLOAD_SERVICE_HOST_NAME,
            this.env.UPLOAD_SERVICE_PORT,
            '/api/upload/product-image'
        )
        let authors: object, categories: object, promotions: object

        try {
            const res = await fetch(findAllAuthorUrl, {
                method: 'GET'
            })
            const data = await res.json()
            authors = data?.data
        } catch (e) {
            console.log(e)
        }

        try {
            const res = await fetch(findAllCatUrl, {
                method: 'GET'
            })
            const data = await res.json()
            categories = data?.data
        } catch (e) {
            console.log(e)
        }

        try {
            const res = await fetch(findAllPromotionUrl, {
                method: 'GET'
            })
            const data = await res.json()
            promotions = data?.data
        } catch (e) {
            console.log(e)
        }

        res.render(this.viewPath('create'), { authors, categories, promotions, createUrl, uploadUrl })
    }

    @Get('/:id')
    async update(
        @Param('id', UUIDPipe) id: string,
        @Res() res: Response
    ) {
        const findOneUrl = this.internalUrlEndpoint(`products/${id}`)
        const findAllAuthorUrl = this.internalUrlEndpoint('authors')
        const findAllCatUrl = this.internalUrlEndpoint('categories')
        const findAllPromotionUrl = this.internalUrlEndpoint('promotions')
        const updateUrl = this.clientUrlEndpoint(`products/${id}`)
        const uploadUrl = getUrlEndpoint(
            this.env.UPLOAD_SERVICE_HOST_NAME,
            this.env.UPLOAD_SERVICE_PORT,
            '/api/upload/product-image'
        )
        let product: object, authors: object, categories: object, promotions: object

        try {
            const res = await fetch(findOneUrl, {
                method: 'GET'
            })
            const data = await res.json()
            product = data?.data
        } catch (e) {
            throw e
        }

        try {
            const res = await fetch(findAllAuthorUrl, {
                method: 'GET'
            })
            const data = await res.json()
            authors = data?.data
        } catch (e) {
            console.log(e)
        }

        try {
            const res = await fetch(findAllCatUrl, {
                method: 'GET'
            })
            const data = await res.json()
            categories = data?.data
        } catch (e) {
            console.log(e)
        }

        try {
            const res = await fetch(findAllPromotionUrl, {
                method: 'GET'
            })
            const data = await res.json()
            promotions = data?.data
        } catch (e) {
            console.log(e)
        }

        res.render(this.viewPath('update'), { product, authors, categories, promotions, updateUrl, uploadUrl })
    }
}