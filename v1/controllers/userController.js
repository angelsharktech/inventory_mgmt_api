const User = require('../models/User');
const Organization = require('../models/Organization');
const Role = require('../models/Role');
const Position = require('../models/Position');
const mongoose = require('mongoose'); // Import mongoose
const jwt = require('jsonwebtoken');

exports.getUserProfile = async (req, res) => {
  try {
    // Check if user ID exists in request
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }

    const user = await User.findById(req.user.id)
      .select('-password') // Exclude password field
      .populate('organization_id')
      .populate('role_id')
      .populate('position_id');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};
// Create a new user
exports.createUser = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      phone_number,
      email,
      country,
      address,
      city,
      company_name,
      organization_id,
      password,
      role_id,
      position_id,
      profile_picture,
      bio,
      status,
      hidefee,
    } = req.body;

    const user = new User({
      first_name,
      last_name,
      phone_number,
      email,
      country,
      address,
      city,
      company_name,
      organization_id,
      password,
      role_id,
      position_id,
      profile_picture,
      bio,
      status,
      hidefee,
    });

    await user.save();
    res.status(201).send('User registered successfully');
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// Get all users (protected route)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate('organization_id')
      .populate('role_id')
      .populate('position_id');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Get a single user by ID (protected route)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('organization_id')
      .populate('role_id')
      .populate('position_id');
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Update a user by ID (protected route)
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Delete a user by ID (protected route)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.status(200).send('User deleted successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
};



// User login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send('Invalid credentials');
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).send('Invalid credentials');
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    res.status(400).send(error.message);
  }
};



// Get authenticated user's profile
exports.getMyProfile = async (req, res) => {
  try {
    // Get token from headers
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify token and get user ID
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        error: error.message
      });
    }

    // Find user by ID from token
    const user = await User.findById(userId)
      .select('-password') // Exclude password
      .populate('organization_id')
      .populate('role_id')
      .populate('position_id');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // 1. Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // 2. Get user
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 3. Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // 4. Update password
    user.password = newPassword;
    await user.save();

    // 5. Respond with success
    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};
// Add this new method to your existing user controller

// Get users by position within a specific organization
exports.getUsersByPositionInOrganization = async (req, res) => {
  try {
    const { organization_id, position_id } = req.params;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(organization_id)) {
      return res.status(400).json({ message: 'Invalid organization ID' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(position_id)) {
      return res.status(400).json({ message: 'Invalid position ID' });
    }

    // Find users matching both organization and position
    const users = await User.find({
      organization_id: organization_id,
      position_id: position_id
    })
    .populate('organization_id')
    .populate('role_id')
    .populate('position_id');

    if (!users || users.length === 0) {
      return res.status(404).json({ 
        message: 'No users found for this position in the specified organization' 
      });
    }

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get all users within a specific organization
exports.getAllUsersByOrganization = async (req, res) => {
  try {
    const { organization_id } = req.params;

    // Validate organization ID
    if (!mongoose.Types.ObjectId.isValid(organization_id)) {
      return res.status(400).json({ message: 'Invalid organization ID' });
    }

    // Find users matching the organization
    const users = await User.find({
      organization_id: organization_id
    })
    .populate('organization_id')
    .populate('role_id')
    .populate('position_id');

    if (!users || users.length === 0) {
      return res.status(404).json({ 
        message: 'No users found in the specified organization' 
      });
    }

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.patchUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;

    // Validate workTypeSchemes if they exist in the update
    if (updateData.clientProfile?.workTypeSchemes) {
      for (const ws of updateData.clientProfile.workTypeSchemes) {
        if (ws.workType_id) {
          const workType = await WorkType.findById(ws.workType_id);
          if (!workType) {
            return res.status(400).json({
              success: false,
              message: `WorkType with ID ${ws.workType_id} not found`
            });
          }
        }
        if (ws.scheme_id) {
          const scheme = await Scheme.findById(ws.scheme_id);
          if (!scheme) {
            return res.status(400).json({
              success: false,
              message: `Scheme with ID ${ws.scheme_id} not found`
            });
          }
        }
      }
    }

    // Validate references exist
    if (updateData.organization_id) {
      const orgExists = await Organization.findById(updateData.organization_id);
      if (!orgExists) {
        return res.status(400).json({
          success: false,
          message: 'Organization not found'
        });
      }
    }

    if (updateData.role_id) {
      const roleExists = await Role.findById(updateData.role_id);
      if (!roleExists) {
        return res.status(400).json({
          success: false,
          message: 'Role not found'
        });
      }
    }

    if (updateData.position_id) {
      const positionExists = await Position.findById(updateData.position_id);
      if (!positionExists) {
        return res.status(400).json({
          success: false,
          message: 'Position not found'
        });
      }
    }

    if (updateData.clientProfile?.language_id) {
      const languageExists = await Language.findById(updateData.clientProfile.language_id);
      if (!languageExists) {
        return res.status(400).json({
          success: false,
          message: 'Language not found'
        });
      }
    }

    if (updateData.clientProfile?.associate_id) {
      const associateExists = await User.findById(updateData.clientProfile.associate_id);
      if (!associateExists) {
        return res.status(400).json({
          success: false,
          message: 'Associate not found'
        });
      }
    }

    // Handle password update separately
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    // Update timestamps
    updateData.updated_at = new Date();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      {
        new: true,
        runValidators: true
      }
    )
    .populate('organization_id')
    .populate('role_id')
    .populate('position_id')
    .populate('clientProfile.language_id')
    .populate('clientProfile.associate_id')
    .populate('clientProfile.workTypeSchemes.workType_id')
    .populate('clientProfile.workTypeSchemes.scheme_id');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If updating client profile, ensure isClient is true
    if (updateData.clientProfile && !updatedUser.isClient) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update client profile for non-client user'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedUser
    });

  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
        field: field
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};