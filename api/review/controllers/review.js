'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
const {sanitizeEntity, parseMultipartData} = require('strapi-utils');

module.exports = {
    getUser(ctx) {
        return ctx.state.user;
    },
    async create(ctx) {
        let entity;
        let user = this.getUser(ctx);

        if (ctx.is('multipart')) {
            const {data, files} = parseMultipartData(ctx);
            entity = await strapi.services.review.create(data, {files});
        } else { 
            entity = await strapi.services.review.create(ctx.request.body);
        }

        // Update summary
        if (user && user._id) {
            await strapi.services['user-summary'].updateSummary({id: user.id, review: true});
        }

        return sanitizeEntity(entity, {model: strapi.models.review});
    }
};
