export const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            // Parse the entire request object (body, query, params)
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params
            });
            console.log("Validation passed");
            next();
        } catch (error) {
            if (error?.errors?.length) {
                return res.status(400).json({ error: JSON.stringify(error.errors, null, 2) });
            }
            return res.status(400).json({ error: error.message });
        }
    };
};