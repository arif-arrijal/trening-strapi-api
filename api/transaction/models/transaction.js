'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
    lifecycles: {
        beforeCreate: async (data) => {
            data.product_id = data.product;
        },
        beforeUpdate: async (params, data) => {
            if (data.already_paid === true) {
                data.payment_date = Date();
            }
        }
    }
};
