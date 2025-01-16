import jwt from 'jsonwebtoken';

// Middleware to verify token and differentiate roles
function verifyTokenAndRole(requiredRole) {
    return (req, res, next) => {
        try {
            const authHeader = req.headers['authorization'];

            // Check if the Authorization header is present
            if (!authHeader) {
                return res.status(403).json({ message: 'Access denied. No token provided.' });
            }

            // Ensure the token has the correct format (e.g., "Bearer <token>")
            const tokenParts = authHeader.split(' ');
            if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
                return res.status(400).json({ message: 'Invalid token format. Expected "Bearer <token>".' });
            }

            const token = tokenParts[1];

            // Verify the token
            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    if (err.name === 'TokenExpiredError') {
                        return res.status(401).json({ message: 'Token has expired. Please login again.' });
                    }
                    if (err.name === 'JsonWebTokenError') {
                        return res.status(401).json({ message: 'Invalid token.' });
                    }
                    return res.status(500).json({ message: 'Failed to authenticate token.' });
                }

                // Check the user's role
                if (decoded.role !== requiredRole) {
                    return res.status(403).json({ message: `Access denied for role: ${decoded.role}` });
                }

                // Attach user information to the request object
                req.user = {
                    id: decoded.id,
                    role: decoded.role,
                };

                next();
            });
        } catch (error) {
            console.error('Error in token verification middleware:', error.message);
            res.status(500).json({ message: 'Internal server error.' });
        }
    };
}

export const verifyStudentToken = verifyTokenAndRole('student');
export const verifyTeacherToken = verifyTokenAndRole('teacher');
