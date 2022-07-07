'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
const { sanitizeEntity } = require('strapi-utils');

module.exports = {
    /**
     * Retrieve records.
     *
     * @return {Array}
     */

    async find(ctx) {
        let entities;
        if (ctx.query._q) {
            entities = await strapi.services.product.search(ctx.query);
        } else {
            entities = await strapi.services.product.find(ctx.query);
        }

        entities = entities.map(entity => sanitizeEntity(entity, { model: strapi.models.product }));

        let user = ctx.state.user;
        if (entities.length === 1) {
            let user_id = user && user.id || undefined;
            let product_id = entities[0].id;
            let already_buy = false;
            let already_paid = false;
            let already_comment = false;

            // Handle hide url when user not login / not buy
            if (user) {
                let transaction = await strapi.services.transaction.find({ product_id, user_id });
                already_buy = transaction.length > 0;
                already_paid = transaction.length && transaction[0].already_paid;
            }

            // Handle hide url when user not login / not buy
            let reviews = await strapi.services.review.find({ product_id_eq: product_id });

            reviews.forEach(review => {
                delete review.product;
                delete review.product_id;

                if (review.user_id === user_id) {
                    already_comment = true;
                }
            });

            entities[0].already_buy = already_buy;
            entities[0].already_comment = already_comment;
            entities[0].reviews = reviews;

            entities[0].materials.forEach(y => {
                if (!already_buy) delete y.url;
                y.is_paid = already_paid;
            });
        }

        return entities;
    }
};
