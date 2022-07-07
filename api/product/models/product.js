'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

const slugify = require('slugify');

async function getCategorySlug(categories) {
    if (categories && categories.length) {
        const result = await strapi.query('categories').find({id_in: categories});
        return result.map(category => slugify(category.name, {lower: true})).join(',');
    }
    return '';
}

async function getTrainerSlug(id) {
    if (id) {
        const result = await strapi.query('trainer').find({id: id});
        if (result) {
            return slugify(result[0].name, {lower: true});
        }
    }
    return '';
}

module.exports = {
    lifecycles: {
        beforeCreate: async (data) => {
            data.categories_slug = await getCategorySlug(data.categories);
            data.trainer_slug = await getTrainerSlug(data.trainer);

            if (data) {
                if (data.title) {
                    data.slug = slugify(data.title, {lower: true});
                }
                if (data.price_info) {
                    let basePrice = +data.price_info.base_price;
                    let discount = +data.price_info.discount;

                    data.final_price = +basePrice - ((discount / 100) * basePrice);
                }
            }
        },
        beforeUpdate: async (params, data) => {
            data.categories_slug = await getCategorySlug(data.categories);
            data.trainer_slug = await getTrainerSlug(data.trainer);

            if (data) {
                if (data.title) {
                    data.slug = slugify(data.title, {lower: true});
                }
                if (data.price_info) {
                    let basePrice = +data.price_info.base_price;
                    let discount = +data.price_info.discount;

                    data.final_price = +basePrice - ((discount / 100) * basePrice);
                }
            }
        }
    }
};
