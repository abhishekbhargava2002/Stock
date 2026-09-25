import { z } from "zod";

export const createOrganizationSchema = z.object({
  organization: z.object({
    name: z.string().min(2, "Organization name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(10, "Phone must be 10 digits"),
    gstNumber: z.string().optional(),
    address: z.string().min(5, "Address is required"),
    facilityLimit: z.number().min(1),
    userLimit: z.number().min(5),
  }),

  facility: z.object({
    name: z.string().min(2, "Facility name required"),
    code: z
      .string()
      .min(2, "Facility code required")
      .transform((val) => val.toUpperCase()),
    city: z.string().optional(),
    state: z.string().optional(),
    address: z.string().optional(),
  }),

  superAdmin: z.object({
    name: z.string().min(2, "Name required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(10, "Phone must be 10 digits"),
    password: z.string().min(6, "Password must be at least 6 chars"),
    confirmPassword: z.string(),
  }),
})
  .refine((data) => data.superAdmin.password === data.superAdmin.confirmPassword, {
    message: "Passwords do not match",
    path: ["superAdmin", "confirmPassword"],
  });


export const updateOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, "Organization name is required")
    .optional(),

  email: z
    .string()
    .email("Invalid email")
    .optional(),

  phone: z
    .string()
    .min(10, "Phone must be 10 digits")
    .optional(),

  gstNumber: z.string().optional(),

  address: z
    .string()
    .min(5, "Address is required")
    .optional(),

  facilityLimit: z
    .number()
    .min(1, "Facility limit must be at least 1")
    .optional(),

  userLimit: z
    .number()
    .min(5, "User limit must be at least 5")
    .optional(),
});