import { BadRequestException } from '@nestjs/common';
import { DynamicField, DynamicSelectOption } from '@prisma/client';

export const getEnumValues = (enumObj: object): string => {
  return Object.values(enumObj).join(', ');
};

type InputValue = string | number | boolean | string[] | null | undefined;

export const checkDynamicFields = ({
  inputFields,
  dynamicFields,
}: {
  inputFields: Record<string, unknown>;
  dynamicFields: Array<DynamicField & { selectOptions: DynamicSelectOption[] }>;
}) => {
  const errors: { property: string; message: string }[] = [];

  for (const field of dynamicFields) {
    // console.log(inputFields);
    // console.log(field);
    // console.log(`field.label is ${inputFields[field.label]}`);
    const inputValue = inputFields[field.label] as InputValue;
    // console.log(inputValue);

    // 1. Required field check
    if (
      field.isRequired &&
      (inputValue === undefined ||
        inputValue === null ||
        (typeof inputValue === 'string' && inputValue.trim() === ''))
    ) {
      errors.push({
        property: field.label,
        message:
          field.errorMessage || `${field.label} is required in dynamic fields.`,
      });
      continue;
    }

    // 2. Skip validation if not required and not provided
    if (
      !field.isRequired &&
      (inputValue === undefined ||
        inputValue === null ||
        (typeof inputValue === 'string' && inputValue.trim() === ''))
    ) {
      continue;
    }

    // 3. Pattern validation
    if (field.pattern && typeof inputValue === 'string') {
      const regex = new RegExp(field.pattern);
      if (!regex.test(inputValue)) {
        errors.push({
          property: field.label,
          message: field.errorMessage || `${field.label} format is invalid.`,
        });
        continue;
      }
    }

    // 4. Type-based validation
    switch (field.type) {
      case 'SINGLE_SELECT': {
        if (
          typeof inputValue !== 'string' ||
          !field.selectOptions.some((opt) => opt.value === inputValue)
        ) {
          const validOptions = field.selectOptions
            .map((opt) => opt.value)
            .join(', ');
          errors.push({
            property: field.label,
            message:
              field.errorMessage ||
              `${field.label} has invalid options. Valid options are: ${validOptions}`,
          });
        }
        break;
      }

      case 'MULTI_SELECT': {
        if (!Array.isArray(inputValue)) {
          errors.push({
            property: field.label,
            message: field.errorMessage || `${field.label} must be an array.`,
          });
          break;
        }
        const invalidOptions = inputValue.filter(
          (val) => !field.selectOptions.some((opt) => opt.value === val),
        );
        if (invalidOptions.length > 0) {
          const validOptions = field.selectOptions
            .map((opt) => opt.value)
            .join(', ');
          errors.push({
            property: field.label,
            message:
              field.errorMessage ||
              `${field.label} has invalid options: ${invalidOptions.join(', ')}. Valid options are: ${validOptions}`,
          });
        }
        break;
      }

      case 'NUMBER': {
        if (isNaN(Number(inputValue))) {
          errors.push({
            property: field.label,
            message: field.errorMessage || `${field.label} must be a number.`,
          });
        }
        break;
      }

      case 'EMAIL': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (typeof inputValue !== 'string' || !emailRegex.test(inputValue)) {
          errors.push({
            property: field.label,
            message:
              field.errorMessage || `${field.label} must be a valid email.`,
          });
        }
        break;
      }

      case 'PHONE': {
        const phoneRegex = /^[0-9]{10,15}$/;
        if (typeof inputValue !== 'string' || !phoneRegex.test(inputValue)) {
          errors.push({
            property: field.label,
            message:
              field.errorMessage ||
              `${field.label} must be a valid phone number.`,
          });
        }
        break;
      }

      default:
        // No specific validation for TEXT, TEXTAREA etc.
        break;
    }
  }

  if (errors.length > 0) {
    throw new BadRequestException({
      message: 'Validation Failed',
      errors,
    });
  }
};

export function convertUTCToISTFormatted(utcTimeStr) {
  const utcDate = new Date(utcTimeStr + 'Z'); // Ensure it's treated as UTC
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(utcDate.getTime() + istOffsetMs);

  const day = String(istDate.getDate()).padStart(2, '0');
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const year = istDate.getFullYear();

  let hours = istDate.getHours();
  const minutes = String(istDate.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12 || 12; // Convert to 12-hour format

  return `${day}-${month}-${year} ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
}

export function getDayRange(shiftDate: Date) {
  const start = new Date(
    Date.UTC(
      shiftDate.getUTCFullYear(),
      shiftDate.getUTCMonth(),
      shiftDate.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );

  const end = new Date(
    Date.UTC(
      shiftDate.getUTCFullYear(),
      shiftDate.getUTCMonth(),
      shiftDate.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );

  return { start, end };
}
