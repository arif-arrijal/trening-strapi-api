'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
    /**
     * @param id user_id
     * @param review is adding new review
     * @param course is adding new course
     * @param favorite is adding new favorite
     * * */
    updateSummary: async (param) => {
        let summary = await strapi.query('user-summary').findOne({ user_id: param.id });
        let data;
        if (!summary) {
            let user = await strapi.query('user', 'users-permissions').findOne({ id: param.id }, ['role']);
            data = {
                user_id: user.id,
                users: user,
                total_reviews: param.review ? 1 : 0,
                total_courses: param.course ? 1 : 0,
                total_favorites: param.favorite ? 1 : 0,
            };

            await strapi.query('user-summary').create(data);
        } else {
            data = {
                total_reviews: param.review ? summary.total_reviews + 1 : summary.total_reviews,
                total_courses: param.course ? summary.total_courses + 1 : summary.total_courses,
                total_favorites: param.favorite ? summary.total_favorites + 1 : summary.total_favorites,
            }
            
            let updatedData = await strapi.query('user-summary').update({ id: summary.id }, data);
            console.log(updatedData);
        }
        return {};
    }
};
