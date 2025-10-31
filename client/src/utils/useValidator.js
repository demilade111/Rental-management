import { useState } from "react";

export function useValidator(initialForm = {}, rules = {}) {
    const [errors, setErrors] = useState({});

    // Validate a single field
    const validateField = (field, value) => {
        let error = null;

        if (rules[field]) {
            for (const rule of rules[field]) {
                const msg = rule(value);
                if (msg) {
                    error = msg;
                    break;
                }
            }
        }

        setErrors(prev => ({ ...prev, [field]: error }));
        return error;
    };

    // Validate all fields on a step or submit
    const validateAll = (formData) => {
        const newErrors = {};
        let hasError = false;

        Object.keys(rules).forEach(field => {
            const value = formData[field];
            const ruleSet = rules[field];

            for (const rule of ruleSet) {
                const msg = rule(value);
                if (msg) {
                    newErrors[field] = msg;
                    hasError = true;
                    break;
                }
            }
        });

        console.log(formData)

        setErrors(newErrors);
        return !hasError;
    };

    // Helper to clear an error when user types
    const clearError = (field) => {
        setErrors(prev => ({ ...prev, [field]: null }));
    };

    return {
        errors,
        validateField,
        validateAll,
        clearError
    };
}
