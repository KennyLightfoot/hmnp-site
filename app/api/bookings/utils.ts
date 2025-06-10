/**
 * Helper function to build a GHL custom field object.
 * Logs an error and returns null if the environment variable for the ID is not set.
 * @param envVarName The name of the environment variable storing the custom field ID.
 * @param value The value for the custom field.
 * @param fieldDescription A human-readable description of the field for logging.
 * @returns A GHL custom field object or null if the ID is missing.
 */
export function buildCustomField(
  envVarName: string,
  value: string | string[] | undefined,
  fieldDescription: string
): { id: string; value: string | string[] } | null {
  const fieldId = process.env[envVarName];
  if (!fieldId) {
    console.error(`GHL Custom Field ID Error: Environment variable ${envVarName} for '${fieldDescription}' is not set. This field will be skipped.`);
    return null;
  }
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    // GHL might not appreciate empty strings for all field types, 
    // and undefined/null should definitely be skipped or handled as per API spec (often by not sending the field).
    // For now, we'll skip sending if value is effectively empty to avoid potential API errors.
    // console.log(`GHL Custom Field Info: Value for '${fieldDescription}' (ID: ${fieldId}) is undefined, null, or empty. Skipping field.`);
    // Depending on GHL's API, you might need to send an empty string or a specific null-like value.
    // For safety, we return null to filter it out from the payload if the value is not meaningful.
    return null;
  }
  return { id: fieldId, value };
}
