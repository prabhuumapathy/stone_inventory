import {
  createStep,
  StepResponse,
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { STONE_VENDOR_MODULE } from "../modules/stone_vendor"
import StoneVendorModuleService from "../modules/stone_vendor/service"

export type CreateStoneVendorStepInput = {
  name: string
}

// Step definition
export const createStoneVendorStep = createStep(
  "create-stone-vendor-step",
  async (input: CreateStoneVendorStepInput, { container }) => {
    const stoneVendorModuleService: StoneVendorModuleService = container.resolve(
      STONE_VENDOR_MODULE
    )

    const stoneVendor = await stoneVendorModuleService.createStoneVendors(input)

    return new StepResponse(stoneVendor, stoneVendor.stone_vendor_id)
  }
)

// ✅ Workflow that uses the step
export const createStoneVendorWorkflow = createWorkflow(
  "create-stone-vendor-workflow",
  (input: CreateStoneVendorStepInput) => {
    const vendor = createStoneVendorStep(input)
    return new WorkflowResponse(vendor)
  }
)
