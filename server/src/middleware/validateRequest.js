export const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            console.log("Validation passed");
            next();
        } catch (error) {
            if (error?.errors?.length) {
                return res.status(400).json({ error: error.errors[0].message });
            }
            return res.status(400).json({ error: error.message });
        }
    };
};