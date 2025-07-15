const Role = require('../models/Role');

// Create Role
exports.createRole = async (req, res) => {
  try {
    const { name } = req.body;
    const role = new Role({ name });
    await role.save();
    res.status(201).json(role);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// Get All Roles
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Get Role by ID
exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).send('Role not found');
    }
    res.status(200).json(role);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Update Role
exports.updateRole = async (req, res) => {
  try {
    const { name } = req.body;
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true }
    );
    
    if (!role) {
      return res.status(404).send('Role not found');
    }
    
    res.status(200).json(role);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// Delete Role
exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    
    if (!role) {
      return res.status(404).send('Role not found');
    }
    
    res.status(200).json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).send(error.message);
  }
};