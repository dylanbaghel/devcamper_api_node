const asyncHandler = require('./asyncHandler');

const advancedResults = (model, populate) => {
    return asyncHandler(async (req, res, next) => {
        let query;

        // Copy req.query
        const reqQuery = { ...req.query };

        // Fields To Exclude
        const removeFields = ['select', 'sort', 'limit', 'page'];

        // Loop over removeFields and delete them from reqQuery
        removeFields.forEach(param => delete reqQuery[param]);

        // Create Query String For Filtering
        let queryStr = JSON.stringify(reqQuery);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        query = model.find(JSON.parse(queryStr));

        // populate
        if (populate) {
            query = query.populate(populate);
        }

        // Select Fields
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        // sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const totalBootcamps = await model.countDocuments();
        const totalPages = Math.ceil(totalBootcamps / limit);

        query = query.skip(skip).limit(limit);


        // Executing Query
        const results = await query;

        // Pagination result
        const pagination = {
            currentPage: page,
            totalDocuments: totalBootcamps,
            totalPages
        }

        if (totalPages > 1 && page > 1) {
            pagination.prev = page - 1;
        }

        if (page < totalPages) {
            pagination.next = page + 1;
        }

        res.advancedResults = {
            success: true,
            count: results.length,
            pagination,
            data: results
        };

        next();
    });
}

module.exports = advancedResults;