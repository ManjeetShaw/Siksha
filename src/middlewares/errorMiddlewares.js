// This is our global error handling middleware
// In Express, any middleware with FOUR parameters (err, req, res, next)
// is automatically treated as an error handler
// When any controller calls next(error) or throws inside an async handler,
// Express forwards it here instead of crashing the server

// ── Not Found Handler ─────────────────────────────────────────────────────────
// This middleware runs when NO route matched the incoming request
// For example if someone hits GET /api/blahblah — no route exists for that
// so Express falls through all routes and hits this handler
export const notFound = (req, res, next) => {

    // We create a new Error object with a descriptive message
    // req.originalUrl is the URL the client tried to access
    // e.g. "Not found - /api/blahblah"
    const error = new Error(`Not found - ${req.originalUrl}`);

    // 404 means the resource doesn't exist
    res.status(404);

    // We pass the error to next() — this tells Express to skip
    // to the next ERROR handling middleware, which is errorHandler below
    next(error);
};


// ── Global Error Handler ──────────────────────────────────────────────────────
// This runs whenever next(error) is called anywhere in the app
// OR when an unhandled error is thrown in a controller
// The four parameters are what make Express recognise this as an error handler
// If you remove "err" from the front, it becomes regular middleware — won't work
export const errorHandler = (err, req, res, next) => {

    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // Mongoose throws internal-looking errors for malformed input (e.g. a
    // non-ObjectId string in an :id param) that we were previously passing
    // straight through to the client verbatim (P0-5). Translate the known
    // shapes into safe, friendly messages instead.
    if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid ${err.path}: "${err.value}"`;
    } else if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors).map((e) => e.message).join(", ");
    } else if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue || {})[0] || "field";
        message = `${field} already in use`;
    }

    // Anything else stays generic in production — no raw driver/library
    // internals reach the client — but keeps its real message in dev so
    // it's still easy to debug locally.
    if (process.env.NODE_ENV === "production" && statusCode >= 500) {
        message = "Something went wrong. Please try again later.";
    }

    res.status(statusCode);
    res.json({
        message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack
    });
};