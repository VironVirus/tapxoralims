import { z } from "zod";
import type { InventoryTransactionType } from "@/features/inventory/inventory-utils";

function isValidDateInput(value: string) {
  if (!value) {
    return true;
  }

  return Number.isFinite(Date.parse(value));
}

export const inventoryTransactionTypes = [
  "stock_in",
  "stock_out",
  "usage",
  "adjustment"
] as const satisfies readonly InventoryTransactionType[];

export const inventoryItemFormSchema = z.object({
  name: z.string().trim().min(2, "Item name is required"),
  category: z.string().trim().max(80, "Category is too long"),
  unit_cost: z.coerce.number().min(0, "Unit cost must be zero or higher"),
  quantity: z.coerce.number().min(0, "Opening quantity must be zero or higher"),
  unit: z.string().trim().min(1, "Unit is required").max(20, "Unit is too long"),
  lot_number: z.string().trim().max(80, "Lot number is too long"),
  expiry_date: z.string().trim().refine(isValidDateInput, "Enter a valid expiry date"),
  reorder_level: z.coerce.number().min(0, "Reorder level must be zero or higher"),
  vendor: z.string().trim().max(120, "Vendor name is too long"),
  storage_location: z.string().trim().max(120, "Storage location is too long"),
  description: z.string().trim().max(400, "Description is too long"),
  is_active: z.boolean()
});

export const inventoryTransactionFormSchema = z
  .object({
    item_id: z.string().uuid("Select an inventory item"),
    transaction_type: z.enum(inventoryTransactionTypes),
    quantity: z.coerce.number(),
    unit_cost: z.coerce.number().min(0, "Unit cost must be zero or higher"),
    reason: z.string().trim().max(160, "Reason is too long"),
    reference_number: z.string().trim().max(80, "Reference number is too long"),
    notes: z.string().trim().max(300, "Notes are too long")
  })
  .superRefine((value, ctx) => {
    if (value.transaction_type === "adjustment") {
      if (value.quantity === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["quantity"],
          message: "Adjustment quantity must be positive or negative, not zero"
        });
      }
      return;
    }

    if (value.quantity <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["quantity"],
        message: "Quantity must be greater than zero"
      });
    }
  });

export type InventoryItemFormValues = z.infer<typeof inventoryItemFormSchema>;
export type InventoryTransactionFormValues = z.infer<
  typeof inventoryTransactionFormSchema
>;

export const initialInventoryItemFormState: InventoryItemFormValues = {
  name: "",
  category: "",
  unit_cost: 0,
  quantity: 0,
  unit: "units",
  lot_number: "",
  expiry_date: "",
  reorder_level: 0,
  vendor: "",
  storage_location: "",
  description: "",
  is_active: true
};

export const initialInventoryTransactionFormState: InventoryTransactionFormValues =
  {
    item_id: "00000000-0000-0000-0000-000000000000",
    transaction_type: "stock_in",
    quantity: 1,
    unit_cost: 0,
    reason: "",
    reference_number: "",
    notes: ""
  };
