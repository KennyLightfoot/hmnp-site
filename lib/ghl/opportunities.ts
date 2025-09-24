import { ghlApiRequest } from './error-handler'
import { getCleanEnv } from '@/lib/env-clean'
import { getErrorMessage } from '@/lib/utils/error-utils'

const LOCATION_ID = getCleanEnv('GHL_LOCATION_ID')
const PIPELINE_ID = process.env.GHL_DEFAULT_PIPELINE_ID || ''
const PIPELINE_STAGE_ID = process.env.GHL_DEFAULT_PIPELINE_STAGE_ID || ''

export async function createOpportunity(contactId: string, opportunityData: any, locationId?: string) {
  const locationIdToUse = locationId || LOCATION_ID
  if (!locationIdToUse) throw new Error('No location ID provided or available in environment.')
  const payload: any = { locationId: locationIdToUse, contactId, ...opportunityData }
  if (PIPELINE_ID) payload.pipelineId = PIPELINE_ID
  if (PIPELINE_STAGE_ID) payload.pipelineStageId = PIPELINE_STAGE_ID
  try {
    return await ghlApiRequest('/opportunities', { method: 'POST', body: JSON.stringify(payload) })
  } catch (error) {
    throw new Error(`Failed to create opportunity: ${getErrorMessage(error)}`)
  }
}

export async function updateOpportunityCustomFields(opportunityId: string, customFields: any) {
  try {
    return await ghlApiRequest(`/opportunities/${opportunityId}/custom-fields`, { method: 'PUT', body: JSON.stringify({ customFields }) })
  } catch (error) {
    throw new Error(`Failed to update opportunity custom fields: ${getErrorMessage(error)}`)
  }
}


