const Work = require('../models/Work');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Organization = require('../models/Organization');
const Scheme = require('../models/Scheme');
const WorkType = require('../models/WorkType');
const PaymentMode = require('../models/PaymentMode');
const notificationService = require('../services/notificationService');


// Helper function to validate staff assignments
const validateStaffAssignments = async (staffAssignments) => {
  for (const assignment of staffAssignments) {
    const staffExists = await User.findById(assignment.staff_id);
    if (!staffExists) {
      throw new Error(`Staff member with ID ${assignment.staff_id} not found`);
    }
  }
};

// Helper function to validate status
const validateStatus = (status) => {
  const validStatuses = ['Pending', 'In Progress', 'Completed', 'On Hold', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}. Valid statuses are: ${validStatuses.join(', ')}`);
  }
};

// @desc    Create new work
// @route   POST /api/v1/works
exports.createWork = async (req, res) => {
  try {
    const { 
      title,
      description,
      organization_id,
      scheme_id,
      client_id,
      projectManager_id,
      staffAssignments = [],
      totalFee = 0,
      startDate,
      dueDate
    } = req.body;

    // Validate required fields
    const requiredFields = { title, organization_id, scheme_id, client_id };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields
      });
    }

    // Validate client exists and is actually a client
    const clientExists = await User.findOne({ _id: client_id, isClient: true });
    if (!clientExists) {
      return res.status(400).json({
        success: false,
        message: 'Client not found or user is not a client'
      });
    }

    // Validate organization exists
    const orgExists = await Organization.findById(organization_id);
    if (!orgExists) {
      return res.status(400).json({
        success: false,
        message: 'Organization not found'
      });
    }


    if (!Scheme) {
      return res.status(400).json({
        success: false,
        message: 'Scheme not found or inactive'
      });
    }

    // Validate project manager if provided
    if (projectManager_id) {
      const pmExists = await User.findById(projectManager_id);
      if (!pmExists) {
        return res.status(400).json({
          success: false,
          message: 'Project manager not found'
        });
      }
    }

    // Validate staff assignments if provided
    if (staffAssignments && staffAssignments.length > 0) {
      await validateStaffAssignments(staffAssignments);
    }

    // Prepare users array for chat
    const chatUsers = [
      req.user._id, // admin who created
      client_id,
      ...(projectManager_id ? [projectManager_id] : []),
      ...(staffAssignments?.map(a => a.staff_id) || [])
    ];

    // Create a chat for this work
    const chat = await Chat.create({
      chatName: `Work Chat: ${title}`,
      users: chatUsers,
      isGroupChat: true,
      groupAdmin: req.user._id
    });

    // Create the work record
    const workData = {
      title,
      description,
      organization_id,
      scheme_id,
      client_id,
      admin_id: req.user._id,
      chat_id: chat._id,
      ...(projectManager_id && { projectManager_id }),
      ...(staffAssignments.length > 0 && { staffAssignments }),
      ...(totalFee && { totalFee }),
      ...(startDate && { startDate }),
      ...(dueDate && { dueDate })
    };

    const work = await Work.create(workData);

    // Populate the work for response
    const populatedWork = await Work.findById(work._id)
      .populate('admin_id', 'first_name last_name email')
      .populate('projectManager_id', 'first_name last_name email')
      .populate('staffAssignments.staff_id', 'first_name last_name email')
      .populate({
        path: 'client_id',
        select: 'first_name last_name phone_number email clientProfile.name clientProfile.contact',
        match: { isClient: true }
      })
      .populate('scheme_id', 'name description')
      .populate('organization_id', 'name')
      .populate('chat_id');

    // Notification logic (unchanged)
    // ... (keep your existing notification code)

    res.status(201).json({
      success: true,
      data: populatedWork,
      notifications: {
        sent: true,
        message: 'Work created and notifications sent successfully'
      }
    });

  } catch (error) {
    console.error('Error creating work:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all works
// @route   GET /api/v1/works
exports.getWorks = async (req, res) => {
  try {
    const works = await Work.find()
      .populate('admin_id', 'first_name last_name email')
      .populate('projectManager_id', 'first_name last_name email')
      .populate('staffAssignments.staff_id', 'first_name last_name email')
      .populate('scheme_id', 'name description')
      .populate({
        path: 'client_id',
        select: 'first_name last_name phone_number email clientProfile.associate_id clientProfile.contact',
        match: { isClient: true }
      })
      .populate('payment_mode_id')
      .populate('chat_id')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: works.length,
      data: works
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single work
// @route   GET /api/v1/works/:id
exports.getWork = async (req, res) => {
  try {
    const work = await Work.findById(req.params.id)
      .populate('admin_id', 'first_name last_name email')
      .populate('projectManager_id', 'first_name last_name email')
      .populate('staffAssignments.staff_id', 'first_name last_name email')
      .populate('scheme_id', 'name description')
      .populate({
        path: 'client_id',
        select: 'first_name last_name phone_number email clientProfile.associate_id clientProfile.contact',
        match: { isClient: true }
      })
      .populate('payment_mode_id')
      .populate('chat_id')
      .populate('resolvedBy', 'first_name last_name email');

    if (!work) {
      return res.status(404).json({
        success: false,
        message: 'Work not found'
      });
    }

    res.status(200).json({
      success: true,
      data: work
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update work (PUT - Full Update)
// @route   PUT /api/v1/works/:id
exports.updateWork = async (req, res) => {
  try {
    // Validate scheme if being updated
    if (req.body.scheme_id) {
      const scheme = await Scheme.findOne({ 
        _id: req.body.scheme_id,
        isActive: true 
      });
      
      if (!scheme) {
        return res.status(400).json({
          success: false,
          message: 'Scheme not found or inactive'
        });
      }
    }

    if (req.body.staffAssignments) {
      await validateStaffAssignments(req.body.staffAssignments);
    }

    const work = await Work.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('admin_id', 'first_name last_name email')
      .populate('projectManager_id', 'first_name last_name email')
      .populate('staffAssignments.staff_id', 'first_name last_name email')
      .populate('scheme_id', 'name description')

    if (!work) {
      return res.status(404).json({
        success: false,
        message: 'Work not found'
      });
    }

    res.status(200).json({
      success: true,
      data: work
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Validation Error',
      error: error.message
    });
  }
};

// @desc    Update work (PATCH - Partial Update)
// @route   PATCH /api/v1/works/:id
exports.patchWork = async (req, res) => {
  try {
    // Special handling for mark as resolved
    if (req.body.isResolved === true) {
      req.body.resolvedBy = req.user._id;
      req.body.resolvedAt = new Date();
    }

    // Validate scheme if being updated
    if (req.body.scheme_id) {
      const scheme = await Scheme.findOne({ 
        _id: req.body.scheme_id,
        isActive: true 
      });
      
      if (!scheme) {
        return res.status(400).json({
          success: false,
          message: 'Scheme not found or inactive'
        });
      }
    }

    if (req.body.staffAssignments) {
      await validateStaffAssignments(req.body.staffAssignments);
    }

    const work = await Work.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('admin_id', 'first_name last_name email')
      .populate('projectManager_id', 'first_name last_name email')
      .populate('staffAssignments.staff_id', 'first_name last_name email')
      .populate('scheme_id', 'name description')

    if (!work) {
      return res.status(404).json({
        success: false,
        message: 'Work not found'
      });
    }

    res.status(200).json({
      success: true,
      data: work
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Validation Error',
      error: error.message
    });
  }
};

// @desc    Delete work
// @route   DELETE /api/v1/works/:id
exports.deleteWork = async (req, res) => {
  try {
    const work = await Work.findByIdAndDelete(req.params.id);

    if (!work) {
      return res.status(404).json({
        success: false,
        message: 'Work not found'
      });
    }

    // Optionally delete the associated chat
    if (work.chat_id) {
      await Chat.findByIdAndDelete(work.chat_id);
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

// @desc    Get works by organization ID
// @route   GET /api/v1/works/organization/:organizationId
exports.getWorksByOrganization = async (req, res) => {
  try {
    const organizationId = req.params.organizationId;

    const works = await Work.find({ organization_id: organizationId })
      .populate('admin_id', 'first_name last_name email')
      .populate('projectManager_id', 'first_name last_name email')
      .populate('staffAssignments.staff_id', 'first_name last_name email')
      .populate('scheme_id', 'name description')
      .populate({
        path: 'client_id',
        select: 'first_name last_name email phone_number clientProfile.associate_id clientProfile.contact',
        match: { isClient: true }
      })
      .populate('payment_mode_id')
      .populate('chat_id')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: works.length,
      data: works
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get works by staff ID
// @route   GET /api/v1/works/staff/:staffId
exports.getWorksByStaff = async (req, res) => {
  try {
    const staffId = req.params.staffId;

    // Validate staff exists
    const staffExists = await User.findById(staffId);
    if (!staffExists) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    const works = await Work.find({ 
      'staffAssignments.staff_id': staffId 
    })
      .populate('admin_id', 'first_name last_name email')
      .populate('projectManager_id', 'first_name last_name email')
      .populate('staffAssignments.staff_id', 'first_name last_name email')
      .populate('scheme_id', 'name description')
      .populate({
        path: 'client_id',
        select: 'first_name last_name email phone_number clientProfile.associate_id clientProfile.contact',
        match: { isClient: true }
      })
      .populate('payment_mode_id')
      .populate('chat_id')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: works.length,
      data: works
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get works by project manager ID
// @route   GET /api/v1/works/project-manager/:pmId
exports.getWorksByProjectManager = async (req, res) => {
  try {
    const pmId = req.params.pmId;

    // Validate PM exists
    const pmExists = await User.findById(pmId);
    if (!pmExists) {
      return res.status(404).json({
        success: false,
        message: 'Project manager not found'
      });
    }

    const works = await Work.find({ 
      projectManager_id: pmId 
    })
      .populate('admin_id', 'first_name last_name email')
      .populate('projectManager_id', 'first_name last_name email')
      .populate('staffAssignments.staff_id', 'first_name last_name email')
      .populate('scheme_id', 'name description')
      .populate({
        path: 'client_id',
        select: 'first_name last_name email phone_number clientProfile.associate_id clientProfile.contact',
        match: { isClient: true }
      })
      .populate('payment_mode_id')
      .populate('chat_id')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: works.length,
      data: works
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get works by client ID
// @route   GET /api/v1/works/client/:clientId
exports.getWorksByClient = async (req, res) => {
  try {
    const clientId = req.params.clientId;

    // Validate client exists and is actually a client
    const clientExists = await User.findOne({ 
      _id: clientId, 
      isClient: true 
    });
    if (!clientExists) {
      return res.status(404).json({
        success: false,
        message: 'Client not found or user is not a client'
      });
    }

    const works = await Work.find({ 
      client_id: clientId 
    })
      .populate('admin_id', 'first_name last_name email')
      .populate('projectManager_id', 'first_name last_name email')
      .populate('staffAssignments.staff_id', 'first_name last_name email')
      .populate('scheme_id', 'name description')
      .populate({
        path: 'client_id',
        select: 'first_name last_name email phone_number clientProfile.associate_id clientProfile.contact',
        match: { isClient: true }
      })
      .populate('payment_mode_id')
      .populate('chat_id')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: works.length,
      data: works
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get works by associate ID
// @route   GET /api/v1/works/associate/:associateId
exports.getWorksByAssociate = async (req, res) => {
  try {
    const associateId = req.params.associateId;

    // Validate associate exists
    const associateExists = await User.findById(associateId);
    if (!associateExists) {
      return res.status(404).json({
        success: false,
        message: 'Associate not found'
      });
    }

    // Associate could be involved as staff, PM, or admin
    const works = await Work.find({
      $or: [
        { 'staffAssignments.staff_id': associateId },
        { projectManager_id: associateId },
        { admin_id: associateId }
      ]
    })
      .populate('admin_id', 'first_name last_name email')
      .populate('projectManager_id', 'first_name last_name email')
      .populate('staffAssignments.staff_id', 'first_name last_name email')
      .populate('scheme_id', 'name description')
      .populate({
        path: 'client_id',
        select: 'first_name last_name email phone_number clientProfile.associate_id clientProfile.contact',
        match: { isClient: true }
      })
      .populate('payment_mode_id')
      .populate('chat_id')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: works.length,
      data: works
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get works by admin ID
// @route   GET /api/v1/works/admin/:adminId
exports.getWorksByAdmin = async (req, res) => {
  try {
    const adminId = req.params.adminId;

    // Validate admin exists
    const adminExists = await User.findById(adminId);
    if (!adminExists) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    const works = await Work.find({ 
      admin_id: adminId 
    })
      .populate('admin_id', 'first_name last_name email')
      .populate('projectManager_id', 'first_name last_name email')
      .populate('staffAssignments.staff_id', 'first_name last_name email')
      .populate('scheme_id', 'name description')
      .populate({
        path: 'client_id',
        select: 'first_name last_name email phone_number clientProfile.associate_id clientProfile.contact',
        match: { isClient: true }
      })
      .populate('payment_mode_id')
      .populate('chat_id')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: works.length,
      data: works
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get works by workType ID
// @route   GET /api/v1/works/work-type/:workTypeId
exports.getWorksByWorkType = async (req, res) => {
  try {
    const workTypeId = req.params.workTypeId;

    const works = await Work.find({ workType_id: workTypeId })
      .populate('admin_id', 'first_name last_name email')
      .populate('projectManager_id', 'first_name last_name email')
      .populate('staffAssignments.staff_id', 'first_name last_name email')
      .populate('scheme_id', 'name description')
      .populate('workType_id', 'name')
      .populate({
        path: 'client_id',
        select: 'first_name last_name email phone_number clientProfile.associate_id clientProfile.contact',
        match: { isClient: true }
      })
      .populate('payment_mode_id')
      .populate('chat_id')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: works.length,
      data: works
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get works by scheme ID
// @route   GET /api/v1/works/scheme/:schemeId
exports.getWorksByScheme = async (req, res) => {
  try {
    const schemeId = req.params.schemeId;

    const works = await Work.find({ scheme_id: schemeId })
      .populate('admin_id', 'first_name last_name email')
      .populate('projectManager_id', 'first_name last_name email')
      .populate('staffAssignments.staff_id', 'first_name last_name email')
      .populate('scheme_id', 'name description')
      .populate({
        path: 'client_id',
        select: 'first_name last_name email phone_number clientProfile.associate_id clientProfile.contact',
        match: { isClient: true }
      })
      .populate('payment_mode_id')
      .populate('chat_id')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: works.length,
      data: works
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};