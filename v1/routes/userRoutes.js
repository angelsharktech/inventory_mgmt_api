const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');


// Get logged-in user's profile
router.get('/me', userController.getMyProfile);

// Change password
router.patch('/change-password', userController.changePassword);


// Get all users (protected route)
router.get('/', authenticateToken, userController.getAllUsers);

// Get a single user by ID (protected route)
router.get('/:id', authenticateToken, userController.getUserById);

// Update a user by ID (protected route)
router.put('/:id', authenticateToken, userController.updateUser);
// Update a user by ID (protected route)

router.patch('/:id', authenticateToken, userController.patchUser);

// Delete a user by ID (protected route)
router.delete('/:id', authenticateToken, userController.deleteUser);


// Get user profile (protected route)
router.get('/profile', authenticateToken, userController.getUserProfile);

// Add this new route
router.get('/organization/:organization_id/position/:position_id', userController.getUsersByPositionInOrganization);
router.get('/organization/:organization_id', userController.getAllUsersByOrganization );
module.exports = router;