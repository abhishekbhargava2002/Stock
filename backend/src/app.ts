import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { errorHandler, notFound } from "./middleware/error.middleware";

// import authRoutes from "./modules/auth/auth.routes";
// import organizationRoutes from "./modules/organizations/organization.routes";
// import facilityRoutes from "./modules/facilities/facility.routes";
// import userRoutes from "./modules/users/user.routes";
// import roleRoutes from "./modules/roles/role.routes";
// import masterRoutes from "./modules/masters/master.routes";
// import stockRoutes from "./modules/stock/stock.routes";
// import salesRoutes from "./modules/sales/sales.routes";
// import reportRoutes from "./modules/reports/report.routes";
// import incentiveRoutes from "./modules/incentives/incentive.routes";
// import notificationRoutes from "./modules/notifications/notification.routes";
// import auditRoutes from "./modules/audit/audit.routes";

import authRoutes from '../src/routes/auth/auth.Router';
import organizationRoutes from '../src/routes/organization/organization.Router';
import facilityRoutes from '../src/routes/facility/facility.Router';
import userRoutes from '../src/routes/user/user.Routes';
import groupRoutes from "../src/routes/group/group.Router";
import categoryRoutes from "../src/routes/category/category.Router";
import godownRoutes from '../src/routes/godown/godown.Router';
import vendorRoutes from '../src/routes/vendor/vendor.Routes';
import employeeRoutes from '../src/routes/employee/employee.Router';
import unitRoutes from '../src/routes/unit/unit.Router';
import itemRoutes from '../src/routes/item/item.Router';
import masterRoutes from '../src/routes/masters/masters.Routes';
import stockInRoutes from "../src/routes/stock/stockIn/stockln.Router";
import stockTransfer from "../src/routes/stock/stockTransfer/stockTransfer.Router";
import stockOut from '../src/routes/stock/stockOut/stockOut.Router';
import stockManual from '../src/routes/stock/stockManual/stockmanual.Router';
import stockRouter from "../src/routes/stock/stock.Router";
import stockRegisterRouter from '../src/routes/stock/StockRegister/stockRegister.Router';
import dailySaleRouter from '../src/routes/dailySale/dailySale.Router';
import incentiveRouter from '../src/routes/incentive/incentive.Router';
import schemeRouter from '../src/routes/scheme/scheme.Router';
import incentiveReportRouter from '../src/routes/incentiveReport/inentiveReport.Router';

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientAppUrl, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "Stockora API is running", data: { service: "stockora-backend" } });
});

// app.use("/api/auth", authRoutes);
// app.use("/api/organizations", organizationRoutes);
// app.use("/api/facilities", facilityRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/roles", roleRoutes);
// app.use("/api", masterRoutes);
// app.use("/api", stockRoutes);
// app.use("/api", salesRoutes);
// app.use("/api", reportRoutes);
// app.use("/api", incentiveRoutes);
// app.use("/api", notificationRoutes);
// app.use("/api", auditRoutes);

//START
app.use("/api/auth", authRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/facilities", facilityRoutes);
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/godowns", godownRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/masters", masterRoutes);
app.use("/api/stock-in", stockInRoutes);
app.use("/api/stock-transfer", stockTransfer);
app.use("/api/stock-out", stockOut);
app.use("/api/manual-adjustments", stockManual);
app.use("/api/stock", stockRouter);
app.use("/api/stock-register", stockRegisterRouter);
app.use("/api/daily-sales", dailySaleRouter);
app.use("/api/incentive-rules", incentiveRouter);
app.use("/api/incentive-schemes", schemeRouter);
app.use("/api/incentive-reports", incentiveReportRouter);

app.use(notFound);
app.use(errorHandler);
