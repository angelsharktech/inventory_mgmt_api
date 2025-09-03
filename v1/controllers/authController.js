const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

exports.register = async (req, res) => {
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
      isClient,
      // Banking details
      bankDetails,
      gstDetails,
      // Client-specific fields
      clientProfile
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
      isClient: isClient || false,
      bankDetails: bankDetails || {},
      gstDetails: gstDetails || {},
      clientProfile: isClient ? {
        ...clientProfile,
        clientSince: clientProfile?.clientSince || new Date()
      } : undefined
    });

    await user.save();
    
    // Create token for immediate login after registration
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role_id: user.role_id,
        isClient: user.isClient
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      // Handle duplicate key errors (unique fields)
      const field = Object.keys(error.keyPattern)[0];
      res.status(400).json({ 
        error: `${field} already exists`,
        field
      });
    } else {
      res.status(400).json({ 
        error: error.message,
        details: error.errors 
      });
    }
  }
};

exports.login = async (req, res) => {
  try {
    console.log("res.body",req.body);
    
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('user',user);
    // Return more user information upon login
    res.status(200).json({ 
      token,
      user: {
        id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role_id: user.role_id,
        profile_picture: user.profile_picture,
        isClient: user.isClient,
        status: user.status
      }
    });
  } catch (error) {
    console.log(error);
    
    res.status(400).json({ 
      error: error.message,
      details: error.errors 
    });
  }
};

// Additional controller for updating bank details
exports.updateBankDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { bankDetails } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { $set: { bankDetails } },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      message: 'Bank details updated successfully',
      bankDetails: user.bankDetails
    });
  } catch (error) {
    res.status(400).json({ 
      error: error.message,
      details: error.errors 
    });
  }
};