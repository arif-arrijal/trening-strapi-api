'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
const {sanitizeEntity, parseMultipartData} = require('strapi-utils');

module.exports = {
    /**
     * Retrieve records.
     *
     * @return {Array}
     */
    getUser(ctx) {
        return ctx.state.user;
    },
    async find(ctx) {
        let entities;
        let user = this.getUser(ctx); 

        if (ctx.query._q) {
            entities = await strapi.services.transaction.search(ctx.query);
        } else {
            entities = await strapi.services.transaction.find(ctx.query);
        }

        entities = entities.map(entity => sanitizeEntity(entity, {model: strapi.models.transaction}));

        entities.forEach(entity => {
            let showLink = false;
            if (user && user.id) {
                showLink = entity.already_paid;
            }

            entity.product.materials.forEach(material => {
                if (showLink) {
                    material.is_paid = true;
                } else {
                    material.is_paid = false;
                    delete material.url;
                }
            })
        })
        return entities;
    },
    async create(ctx) {
        let entity;
        let user = this.getUser(ctx);

        if (user && user._id) {
            const existData = await strapi.services.transaction.find({
                user_id_eq: ctx.state.user._id,
                product_id_eq: ctx.request.body.product
            });
            if (existData && existData.length > 0) {
                ctx.throw(400, `Pelatihan ini sudah pernah dibeli sebelumnya pada ${existData[0].createdAt}.`);
            }
        }

        if (ctx.is('multipart')) {
            const {data, files} = parseMultipartData(ctx);
            entity = await strapi.services.transaction.create(data, {files});
        } else {
            let body = ctx.request.body;
            body.user_id = user.id;
            body.users = user;

            let product = await strapi.services.product.findOne({id: body.product});
            body.price = product.final_price;
            entity = await strapi.services.transaction.create(body);
        }

        // Update summary
        if (user && user._id) {
            await strapi.services['user-summary'].updateSummary({id: user.id, course: true});
        }

        return sanitizeEntity(entity, {model: strapi.models.transaction});
    }
};
