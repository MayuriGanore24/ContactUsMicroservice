// user.controller.js
const userService = require('../services/user.service');
const { validateUserRegistration } = require('../validation/user.validation');
const logger = require('../config/logger');
const { ApiError } = require('../middleware/error.middleware');

const registerUser = async (req, res, next) => {
    try {
        // Validate input data
        const { error } = validateUserRegistration(req.body);
        if (error) {
            // Format validation errors
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            throw new ApiError(400, 'Validation Error', { errors });
        }

        // Log registration attempt (without sensitive data)
        logger.info(`Registration attempt for email: ${req.body.email.substring(0, 3)}...`);

        // Register the user
        const user = await userService.registerUser(req.body);

        // Log successful registration
        logger.info(`User registered successfully: ${user._id}`);

        // Return successful response
        res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            user: {
                id: user._id,
                status: user.status
            }
        });
    } catch (error) {
        // If it's a known error, pass it to the error handler
        if (error instanceof ApiError) {
            return next(error);
        }

        // Handle specific error cases
        if (error.message === 'User already registered') {
            return next(new ApiError(409, 'Email is already registered'));
        }

        // For unexpected errors
        next(new ApiError(500, 'Failed to register user', error));
    }
};

const getUserProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Get user profile
        const user = await userService.getUserProfile(userId);

        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error) {
        if (error instanceof ApiError) {
            return next(error);
        }

        next(new ApiError(500, 'Failed to retrieve user profile'));
    }
};

const updateUserProfile = async (req, res, next) => {
    // Implementation for profile updates
    // This would be similar to other controller methods
    res.status(501).json({
        status: 'error',
        message: 'Not implemented yet'
    });
};

const changePassword = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        // Validate input
        if (!currentPassword || !newPassword) {
            throw new ApiError(400, 'Current password and new password are required');
        }

        // Change password
        await userService.changePassword(userId, currentPassword, newPassword);

        res.status(200).json({
            status: 'success',
            message: 'Password changed successfully'
        });
    } catch (error) {
        if (error instanceof ApiError) {
            return next(error);
        }

        next(new ApiError(500, 'Failed to change password'));
    }
};

module.exports = {
    registerUser,
    getUserProfile,
    updateUserProfile,
    changePassword
};