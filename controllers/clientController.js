const User = require('../models/User');
const WorkType = require('../models/WorkType');
const Scheme = require('../models/Scheme');

// Update all populate calls to use the correct nested paths
exports.getClients = async (req, res) => {
  try {
    const clients = await User.find({ isClient: true })
      .populate('clientProfile.language_id')
      .populate('clientProfile.associate_id')
      .populate('organization_id')
      .populate('clientProfile.workTypeSchemes.workType_id')
      .populate('clientProfile.workTypeSchemes.scheme_id')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: clients.length,
      data: clients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Similarly update all other methods that use populate:
exports.getClientsByOrganization = async (req, res) => {
  try {
    const clients = await User.find({ isClient: true, organization_id: req.params.organizationId })
      .populate('clientProfile.language_id')
      .populate('clientProfile.associate_id')
      .populate('organization_id')
      .populate('clientProfile.workTypeSchemes.workType_id')
      .populate('clientProfile.workTypeSchemes.scheme_id')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: clients.length,
      data: clients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

exports.getClient = async (req, res) => {
  try {
    const client = await User.findById(req.params.id)
      .populate('clientProfile.language_id')
      .populate('clientProfile.associate_id')
      .populate('organization_id')
      .populate('clientProfile.workTypeSchemes.workType_id')
      .populate('clientProfile.workTypeSchemes.scheme_id');

    if (!client || !client.isClient) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create new client
// @route   POST /api/v1/clients
exports.createClient = async (req, res) => {
  try {
    // Validate workType and scheme if provided
    if (req.body.clientProfile && req.body.clientProfile.workTypeSchemes) {
      for (const ws of req.body.clientProfile.workTypeSchemes) {
        const workType = await WorkType.findById(ws.workType_id);
        const scheme = await Scheme.findById(ws.scheme_id);
        
        if (!workType || !scheme) {
          return res.status(400).json({
            success: false,
            message: 'Invalid WorkType or Scheme ID'
          });
        }
      }
    }

    // Set isClient to true
    req.body.isClient = true;

    // Create the client
    const client = await User.create(req.body);

    res.status(201).json({
      success: true,
      data: client
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone number already exists'
      });
    }
    res.status(400).json({
      success: false,
      message: 'Validation Error',
      error: error.message
    });
  }
};

// @desc    Update client (PUT - Full Update)
// @route   PUT /api/v1/clients/:id

// Update the populate paths in updateClient and patchClient as well
exports.updateClient = async (req, res) => {
  try {
    if (req.body.clientProfile && req.body.clientProfile.workTypeSchemes) {
      for (const ws of req.body.clientProfile.workTypeSchemes) {
        const workType = await WorkType.findById(ws.workType_id);
        const scheme = await Scheme.findById(ws.scheme_id);
        
        if (!workType || !scheme) {
          return res.status(400).json({
            success: false,
            message: 'Invalid WorkType or Scheme ID'
          });
        }
      }
    }

    const client = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    .populate('clientProfile.language_id')
    .populate('clientProfile.associate_id')
    .populate('organization_id')
    .populate('clientProfile.workTypeSchemes.workType_id')
    .populate('clientProfile.workTypeSchemes.scheme_id');

    if (!client || !client.isClient) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone number already exists'
      });
    }
    res.status(400).json({
      success: false,
      message: 'Validation Error',
      error: error.message
    });
  }
};

exports.patchClient = async (req, res) => {
  try {
    // Validate workTypeSchemes if they exist in the update
    if (req.body.clientProfile && req.body.clientProfile.workTypeSchemes) {
      for (const ws of req.body.clientProfile.workTypeSchemes) {
        const workType = await WorkType.findById(ws.workType_id);
        const scheme = await Scheme.findById(ws.scheme_id);
        
        if (!workType || !scheme) {
          return res.status(400).json({
            success: false,
            message: 'Invalid WorkType or Scheme ID'
          });
        }
      }
    }

    // Ensure we don't accidentally remove the isClient flag
    if (req.body.isClient === false) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove client status'
      });
    }

    // Force isClient to be true for client updates
    req.body.isClient = true;

    const client = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )
    .populate('clientProfile.language_id')
    .populate('clientProfile.associate_id')
    .populate('organization_id')
    .populate('clientProfile.workTypeSchemes.workType_id')
    .populate('clientProfile.workTypeSchemes.scheme_id');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Additional check to ensure this is actually a client
    if (!client.isClient) {
      return res.status(400).json({
        success: false,
        message: 'The requested user is not a client'
      });
    }

    res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone number already exists'
      });
    }
    res.status(400).json({
      success: false,
      message: 'Validation Error',
      error: error.message
    });
  }
};
// @desc    Delete client
// @route   DELETE /api/v1/clients/:id
exports.deleteClient = async (req, res) => {
  try {
    const client = await User.findByIdAndDelete(req.params.id);

    if (!client || !client.isClient) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};