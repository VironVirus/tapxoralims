import { z } from "zod";
import { priorityOptions } from "@/features/orders/constants";

export const orderFormSchema = z.object({
  patient_id: z.string().uuid("Select a patient"),
  selected_test_ids: z
    .array(z.string().uuid("Select a valid test"))
    .min(1, "Choose at least one test"),
  priority: z.enum(priorityOptions),
  notes: z.string().trim().max(400, "Notes are too long")
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;

export const initialOrderFormState: OrderFormValues = {
  patient_id: "",
  selected_test_ids: [],
  priority: "routine",
  notes: ""
};
