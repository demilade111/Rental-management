export const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            const shape =
                typeof schema?._def?.shape === "function" ? schema._def.shape() : null;

            const expectsRequestParts =
                shape &&
                Object.keys(shape).some((key) => ["body", "query", "params"].includes(key));

            if (expectsRequestParts) {
                schema.parse({
                    body: req.body,
                    query: req.query,
                    params: req.params,
                });
            } else {
                schema.parse(req.body);
            }

            next();
        } catch (error) {
            if (error?.errors?.length) {
                return res
                    .status(400)
                    .json({ error: JSON.stringify(error.errors, null, 2) });
            }
            return res.status(400).json({ error: error.message });
        }
    };
};