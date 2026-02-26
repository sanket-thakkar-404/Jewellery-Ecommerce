/**
 * Standard API response envelope
 * { success, message, data, pagination }
 */
class ApiResponse {
    constructor(statusCode, message, data = null, pagination = null) {
        this.statusCode = statusCode;
        this.success = statusCode < 400;
        this.message = message;
        if (data !== null) this.data = data;
        if (pagination !== null) this.pagination = pagination;
    }

    static success(res, message = 'Success', data = null, pagination = null, statusCode = 200) {
        return res.status(statusCode).json(new ApiResponse(statusCode, message, data, pagination));
    }

    static created(res, message = 'Created', data = null) {
        return res.status(201).json(new ApiResponse(201, message, data));
    }
    static unauthorized(res, message = "Unauthorized", data = null) {
        return res.status(401).json(new ApiResponse(401, message, data));
    }

    static noContent(res) {
        return res.status(204).send();
    }
}

module.exports = ApiResponse;
