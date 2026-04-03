const { z } = require('zod');

/**
 * Creates an Express middleware that validates req.body against a Zod schema.
 * On failure, responds with 400 and field-level error messages.
 */
function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const errors = result.error.errors.map(e => ({
                field: e.path.join('.'),
                message: e.message,
            }));
            return res.status(400).json({
                success: false,
                message: errors[0]?.message || 'Validation failed.',
                errors,
            });
        }
        req.body = result.data;
        next();
    };
}

// ── Auth schemas ─────────────────────────────────────────────────────────────
const registerSchema = z.object({
    username: z
        .string({ required_error: 'Username is required.' })
        .min(3, 'Username must be at least 3 characters.')
        .max(30, 'Username must not exceed 30 characters.')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username may only contain letters, numbers, and underscores.'),
    email: z
        .string({ required_error: 'Email is required.' })
        .email('Please enter a valid email address.'),
    password: z
        .string({ required_error: 'Password is required.' })
        .min(6, 'Password must be at least 6 characters.'),
});

const loginSchema = z.object({
    email: z
        .string({ required_error: 'Email is required.' })
        .email('Please enter a valid email address.'),
    password: z
        .string({ required_error: 'Password is required.' })
        .min(1, 'Password is required.'),
});

module.exports = { validate, registerSchema, loginSchema };
