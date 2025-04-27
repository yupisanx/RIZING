import { useState, useCallback } from 'react';

const useFormValidation = (initialState = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback(() => {
    const newErrors = {};
    
    Object.keys(validationRules).forEach(key => {
      const rules = validationRules[key];
      const value = values[key];

      if (rules.required && !value) {
        newErrors[key] = rules.required;
      } else if (rules.pattern && value && !rules.pattern.test(value)) {
        newErrors[key] = rules.patternMessage;
      } else if (rules.minLength && value && value.length < rules.minLength) {
        newErrors[key] = rules.minLengthMessage;
      } else if (rules.maxLength && value && value.length > rules.maxLength) {
        newErrors[key] = rules.maxLengthMessage;
      } else if (rules.custom && value) {
        const customError = rules.custom(value);
        if (customError) {
          newErrors[key] = customError;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validationRules]);

  const handleChange = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true);
    const isValid = validate();
    
    if (isValid) {
      try {
        await onSubmit(values);
      } catch (error) {
        setErrors(prev => ({
          ...prev,
          submit: error.message
        }));
      }
    }
    
    setIsSubmitting(false);
  }, [values, validate]);

  const resetForm = useCallback(() => {
    setValues(initialState);
    setErrors({});
    setIsSubmitting(false);
  }, [initialState]);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    validate
  };
};

export default useFormValidation; 