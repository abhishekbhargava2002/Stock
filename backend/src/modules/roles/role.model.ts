// import { Schema, model, Types } from "mongoose";

// const permissionSchema = new Schema(
//   {
//     view: { type: Boolean, default: false },
//     add: { type: Boolean, default: false },
//     edit: { type: Boolean, default: false },
//     delete: { type: Boolean, default: false },
//     export: { type: Boolean, default: false },
//     approve: { type: Boolean, default: false },
//   },
//   { _id: false }
// );

// const roleSchema = new Schema(
//   {
//     organizationId: { type: Types.ObjectId, ref: "Organization", index: true },
//     name: { type: String, required: true, trim: true },
//     description: { type: String, trim: true },
//     permissions: {
//       masters: permissionSchema,
//       stockIn: permissionSchema,
//       stockTransfer: permissionSchema,
//       stockOut: permissionSchema,
//       dailySale: permissionSchema,
//       reports: permissionSchema,
//       incentives: permissionSchema,
//       manage: permissionSchema,
//     },
//     status: { type: String, enum: ["active", "inactive"], default: "active" },
//   },
//   { timestamps: true }
// );

// roleSchema.index({ organizationId: 1, name: 1 }, { unique: true });

// export const Role = model("Role", roleSchema);
