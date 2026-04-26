const User = require('../models/User');
const Candidate = require('../models/Candidate');
const Recruiter = require('../models/Recruiter');
const jwt = require('jsonwebtoken');

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    let profileData = {};
    if (user.role === 'Candidate') {
      profileData = await Candidate.findOne({ user: user._id });
    } else if (user.role === 'Recruiter') {
      profileData = await Recruiter.findOne({ user: user._id });
    }

    res.json({
      user,
      profile: profileData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, role, companyName } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, role });

    // Create respective profile
    if (role === 'Candidate') {
      await Candidate.create({ user: user._id });
    } else if (role === 'Recruiter') {
      if (!companyName) {
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ message: 'Company name is required for recruiters' });
      }
      await Recruiter.create({ user: user._id, companyName });
    }

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: 'There is no user with that email' });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Since we don't have an email service configured, we'll return the token in the response for testing purposes.
    // In a real application, you would send this via email.
    res.status(200).json({
      success: true,
      message: 'Token generated (usually sent via email)',
      resetToken
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const crypto = require('crypto');

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid token or token has expired' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      message: 'Password reset successful'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, forgotPassword, resetPassword, getProfile };
