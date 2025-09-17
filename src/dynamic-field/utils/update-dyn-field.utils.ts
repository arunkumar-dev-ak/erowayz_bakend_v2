import { BadRequestException } from '@nestjs/common';
import { UpdateDynamicFieldDto } from '../dto/update-dynamic-field.dto copy';
import { DynamicFieldService } from '../dynamic-field.service';

export async function updateDynamicFieldVerification({
  dynamicFieldService,
  body,
  dynFieldId,
}: {
  dynamicFieldService: DynamicFieldService;
  body: UpdateDynamicFieldDto;
  dynFieldId: string;
}) {
  const { label, selectOptions, type } = body;

  const dynamicField =
    await dynamicFieldService.getDynamicFieldById(dynFieldId);
  if (!dynamicField) {
    throw new BadRequestException('Dynamic Field not found.');
  }

  const originalType = dynamicField.type;
  const updatedType = type || originalType;

  // Validate uniqueness of label + context
  if (label) {
    const existingField =
      await dynamicFieldService.getDynamicFieldByContextAndLabel({
        label: label,
        context: dynamicField.context,
      });

    if (existingField && existingField.id !== dynamicField.id) {
      throw new BadRequestException(
        `A dynamic field with label "${label || dynamicField.label}" already exists in the "${dynamicField.context}" context.`,
      );
    }
  }

  // Determine if select options should be deleted
  const typeTypesWithOptions = ['SINGLE_SELECT', 'MULTI_SELECT'];
  const wasSelectType = typeTypesWithOptions.includes(originalType);
  const isSelectType = typeTypesWithOptions.includes(updatedType);
  const shouldDeleteSelectOptions =
    (wasSelectType && !isSelectType) ||
    (selectOptions && selectOptions.length > 0);

  // Additional type-based validations
  if (
    !wasSelectType &&
    isSelectType &&
    (!selectOptions || selectOptions.length === 0)
  ) {
    throw new BadRequestException(
      `Updating type to "${updatedType}" requires select options to be provided.`,
    );
  } else if (!isSelectType && selectOptions && selectOptions.length >= 0) {
    throw new BadRequestException(
      `Type ${updatedType} does not requires select options to be provided.`,
    );
  }

  return {
    dynamicField,
    shouldDeleteSelectOptions,
  };
}
