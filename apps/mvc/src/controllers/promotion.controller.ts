import { UUIDPipe, getUrlEndpoint, getViewPath } from "@app/common";
import { Env } from "@app/env";
import { Controller, Get, Param, Res } from "@nestjs/common";
import { Response } from "express";

@Controller('promotions')
export class PromotionController {
    constructor(
        private readonly env: Env
    ) {}

    private viewPath(file: string) {
        return getViewPath('promotion', file)
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
        const findAllUrl = this.internalUrlEndpoint('promotions')
        const removeUrl = this.clientUrlEndpoint('promotions')
        let promotions: object

        try {
            const res = await fetch(findAllUrl, {
                method: 'GET'
            })
            const data = await res.json()
            promotions = data?.data
        } catch (e) {
            throw e
        }

        res.render(this.viewPath('list'), {
            promotions,
            removeUrl
        })
    }

    @Get('/create')
    async create(
        @Res() res: Response
    ) {
        const createUrl = this.clientUrlEndpoint('promotions')

        res.render(this.viewPath('create'), { createUrl })
    }

    @Get('/:id')
    async update(
        @Param('id', UUIDPipe) id: string,
        @Res() res: Response
    ) {
        const findOneUrl = this.internalUrlEndpoint(`promotions/${id}`)
        const updateUrl = this.clientUrlEndpoint(`promotions/${id}`)
        let promotion: object

        try {
            const res = await fetch(findOneUrl, {
                method: 'GET'
            })
            const data = await res.json()
            promotion = data?.data
        } catch (e) {
            throw e
        }

        res.render(this.viewPath('update'), { promotion, updateUrl })
    }
}