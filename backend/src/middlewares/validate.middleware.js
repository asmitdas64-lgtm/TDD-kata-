export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      if (parsed.body !== undefined) {
        req.body = parsed.body;
      }
      // Attach sanitized/coerced values to req.validated
      req.validated = parsed;
      // Copy coerced query numbers back into req.query where permissible
      if (parsed.query !== undefined) {
        req.validatedQuery = parsed.query;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validate;
