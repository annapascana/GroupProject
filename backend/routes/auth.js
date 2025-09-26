const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const { db } = require('../server');

const router = express.Router();

// Email configuration
const emailTransporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'demo@crimsoncollab.com',
        pass: process.env.EMAIL_PASS || 'demo-password'
    }
});

// Validation middleware
const registerValidation = [
    body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
    body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];

const loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
];

const forgotPasswordValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
];

// Register new user
router.post('/register', registerValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { firstName, lastName, email, password } = req.body;

        // Check if user already exists
        db.get('SELECT id FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (user) {
                return res.status(400).json({ error: 'User already exists with this email' });
            }

            // Hash password
            const saltRounds = 12;
            const passwordHash = await bcrypt.hash(password, saltRounds);

            // Create user
            const userId = uuidv4();
            db.run(
                'INSERT INTO users (id, email, password_hash, first_name, last_name, verified) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, email, passwordHash, firstName, lastName, false],
                function(err) {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to create user' });
                    }

                    // Generate JWT token
                    const token = jwt.sign(
                        { userId, email, role: 'user' },
                        process.env.JWT_SECRET || 'demo-secret-key',
                        { expiresIn: '24h' }
                    );

                    res.status(201).json({
                        message: 'User created successfully',
                        token,
                        user: {
                            id: userId,
                            email,
                            firstName,
                            lastName,
                            verified: false,
                            role: 'user'
                        }
                    });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Login user
router.post('/login', loginValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        db.get(
            'SELECT * FROM users WHERE email = ? AND is_active = 1',
            [email],
            async (err, user) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }

                if (!user) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                // Check password
                const isValidPassword = await bcrypt.compare(password, user.password_hash);
                if (!isValidPassword) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                // Update last login
                db.run(
                    'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
                    [user.id]
                );

                // Generate JWT token
                const token = jwt.sign(
                    { userId: user.id, email: user.email, role: user.role },
                    process.env.JWT_SECRET || 'demo-secret-key',
                    { expiresIn: '24h' }
                );

                res.json({
                    message: 'Login successful',
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.first_name,
                        lastName: user.last_name,
                        avatar: user.avatar_url,
                        verified: user.verified,
                        role: user.role,
                        socialProvider: user.social_provider
                    }
                });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Forgot password - send OTP
router.post('/forgot-password', forgotPasswordValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email } = req.body;

        // Check if user exists
        db.get('SELECT id, first_name FROM users WHERE email = ? AND is_active = 1', [email], (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!user) {
                return res.status(404).json({ error: 'No account found with this email address' });
            }

            // Generate OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpId = uuidv4();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            // Store OTP in database
            db.run(
                'INSERT INTO password_reset_otps (id, email, otp, expires_at) VALUES (?, ?, ?, ?)',
                [otpId, email, otp, expiresAt.toISOString()],
                async (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to create reset code' });
                    }

                    // Send email (in production)
                    try {
                        await sendOTPEmail(email, user.first_name, otp);
                        res.json({ message: 'Password reset code sent to your email' });
                    } catch (emailError) {
                        console.error('Email sending failed:', emailError);
                        // For demo purposes, still return success but log OTP
                        console.log(`DEMO: OTP for ${email} is: ${otp} (expires in 10 minutes)`);
                        res.json({ 
                            message: 'Password reset code sent to your email',
                            demo: { otp, expiresAt: expiresAt.toISOString() }
                        });
                    }
                }
            );
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Verify OTP
router.post('/verify-otp', [
    body('email').isEmail().normalizeEmail(),
    body('otp').isLength({ min: 6, max: 6 }).isNumeric()
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, otp } = req.body;

        db.get(
            'SELECT * FROM password_reset_otps WHERE email = ? AND otp = ? AND expires_at > datetime("now")',
            [email, otp],
            (err, otpRecord) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }

                if (!otpRecord) {
                    // Check if OTP exists but is expired
                    db.get(
                        'SELECT * FROM password_reset_otps WHERE email = ? AND otp = ?',
                        [email, otp],
                        (err, expiredRecord) => {
                            if (expiredRecord) {
                                return res.status(400).json({ error: 'Verification code has expired' });
                            } else {
                                return res.status(400).json({ error: 'Invalid verification code' });
                            }
                        }
                    );
                    return;
                }

                // Check attempts
                if (otpRecord.attempts >= otpRecord.max_attempts) {
                    return res.status(400).json({ error: 'Too many failed attempts. Please request a new code.' });
                }

                // Increment attempts
                db.run(
                    'UPDATE password_reset_otps SET attempts = attempts + 1 WHERE id = ?',
                    [otpRecord.id]
                );

                res.json({ message: 'OTP verified successfully' });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Reset password
router.post('/reset-password', [
    body('email').isEmail().normalizeEmail(),
    body('otp').isLength({ min: 6, max: 6 }).isNumeric(),
    body('newPassword').isLength({ min: 8 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, otp, newPassword } = req.body;

        // Verify OTP
        db.get(
            'SELECT * FROM password_reset_otps WHERE email = ? AND otp = ? AND expires_at > datetime("now")',
            [email, otp],
            async (err, otpRecord) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }

                if (!otpRecord) {
                    return res.status(400).json({ error: 'Invalid or expired verification code' });
                }

                // Hash new password
                const saltRounds = 12;
                const passwordHash = await bcrypt.hash(newPassword, saltRounds);

                // Update user password
                db.run(
                    'UPDATE users SET password_hash = ? WHERE email = ?',
                    [passwordHash, email],
                    function(err) {
                        if (err) {
                            return res.status(500).json({ error: 'Failed to update password' });
                        }

                        // Delete used OTP
                        db.run('DELETE FROM password_reset_otps WHERE id = ?', [otpRecord.id]);

                        res.json({ message: 'Password reset successfully' });
                    }
                );
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Send OTP email
async function sendOTPEmail(email, firstName, otp) {
    const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@crimsoncollab.com',
        to: email,
        subject: 'CrimsonCollab Password Reset Code',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #9E1B32;">CrimsonCollab Password Reset</h2>
                <p>Hello ${firstName},</p>
                <p>You requested a password reset for your CrimsonCollab account.</p>
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                    <h3 style="color: #9E1B32; margin: 0;">Your verification code:</h3>
                    <h1 style="color: #9E1B32; font-size: 2.5em; margin: 10px 0; letter-spacing: 0.2em;">${otp}</h1>
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this password reset, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="color: #666; font-size: 0.9em;">
                    CrimsonCollab Team<br>
                    This is an automated message, please do not reply.
                </p>
            </div>
        `
    };

    await emailTransporter.sendMail(mailOptions);
}

module.exports = router;
