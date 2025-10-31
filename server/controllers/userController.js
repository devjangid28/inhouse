const { allQuery, getQuery, runQuery } = require('../database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userController = {
  getAllUsers: async (req, res) => {
    try {
      const users = await allQuery('SELECT * FROM users ORDER BY created_at DESC');
      res.json({ success: true, data: users });
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getUserById: async (req, res) => {
    try {
      const user = await getQuery('SELECT * FROM users WHERE id = ?', [req.params.id]);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      res.json({ success: true, data: user });
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  createUser: async (req, res) => {
    try {
      const { username, email, password, full_name, phone } = req.body;
      const result = await runQuery(
        'INSERT INTO users (username, email, password, full_name, phone) VALUES (?, ?, ?, ?, ?)',
        [username, email, password, full_name, phone]
      );
      const user = await getQuery('SELECT * FROM users WHERE id = ?', [result.id]);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { username, email, full_name, phone } = req.body;
      await runQuery(
        'UPDATE users SET username = ?, email = ?, full_name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [username, email, full_name, phone, req.params.id]
      );
      const user = await getQuery('SELECT * FROM users WHERE id = ?', [req.params.id]);
      res.json({ success: true, data: user });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  deleteUser: async (req, res) => {
    try {
      await runQuery('DELETE FROM users WHERE id = ?', [req.params.id]);
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  register: async (req, res) => {
    try {
      const { email, password, full_name } = req.body;

      if (!email || !password || !full_name) {
        return res.status(400).json({
          success: false,
          error: 'Email, password, and full name are required'
        });
      }

      const existingUser = await getQuery('SELECT id FROM users WHERE email = ?', [email]);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User with this email already exists'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const username = email.split('@')[0];

      const result = await runQuery(
        'INSERT INTO users (username, email, password, full_name) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, full_name]
      );

      const user = await getQuery(
        'SELECT id, username, email, full_name, created_at FROM users WHERE id = ?',
        [result.id]
      );

      res.status(201).json({
        success: true,
        data: user,
        message: 'User registered successfully'
      });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      const user = await getQuery('SELECT * FROM users WHERE email = ?', [email]);

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }

      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: userWithoutPassword,
        message: 'Login successful'
      });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required'
        });
      }

      const user = await getQuery('SELECT id, email, full_name FROM users WHERE email = ?', [email]);

      if (!user) {
        return res.status(200).json({
          success: true,
          message: 'If the email exists, a password reset link has been sent'
        });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000);

      await runQuery(
        'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
        [resetToken, resetTokenExpiry.toISOString(), user.id]
      );

      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

      console.log('Password reset requested for:', user.email);
      console.log('Reset link:', resetLink);
      console.log('Token expires at:', resetTokenExpiry);

      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
        resetLink
      });
    } catch (error) {
      console.error('Error in forgot password:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Token and new password are required'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters long'
        });
      }

      const user = await getQuery(
        'SELECT id, email FROM users WHERE reset_token = ? AND reset_token_expiry > ?',
        [token, new Date().toISOString()]
      );

      if (!user) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired reset token'
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await runQuery(
        'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [hashedPassword, user.id]
      );

      res.json({
        success: true,
        message: 'Password has been reset successfully'
      });
    } catch (error) {
      console.error('Error in reset password:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = userController;
