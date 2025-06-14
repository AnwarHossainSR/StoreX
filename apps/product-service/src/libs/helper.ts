import { ValidationError } from "@packages/error-handler";

function getSellerId(req: any): string {
  if (!req?.seller?.id) {
    throw new ValidationError("Seller ID Not Found");
  }
  return req.seller.id;
}

export { getSellerId };
