import { BusinessModel, type Business } from "../models/Business.js";

/**
 * The MVP is intentionally single-tenant.
 *
 * There is only one Business configuration, so we keep the lookup logic
 * centralized instead of introducing tenant IDs or organization abstractions.
 */
async function getBusiness(): Promise<Business | null> {
  return BusinessModel.findOne().exec();
}

/**
 * Returns the current business configuration.
 *
 * If the configuration has not been created yet, the controller can return
 * a 404 and the admin UI can guide the administrator through setup.
 */
export async function getBusinessSettings(): Promise<Business | null> {
  return getBusiness();
}

/**
 * Updates the single business configuration.
 *
 * `upsert` allows the first PUT request to create the configuration while
 * subsequent PUT requests update the existing document.
 *
 * `qrToken` is deliberately excluded from this update operation. QR token
 * lifecycle belongs to the QR-specific service so a normal settings update
 * cannot accidentally invalidate the customer's existing QR URL.
 */
export async function updateBusinessSettings(
  updates: Partial<
    Pick<
      Business,
      | "name"
      | "logoUrl"
      | "description"
      | "address"
      | "phone"
      | "googleReviewUrl"
    >
  >,
): Promise<Business> {
  const business = await BusinessModel.findOneAndUpdate(
    {},
    {
      $set: updates,
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  ).exec();

  return business;
}
