import express from "express";
const router = express.Router();
import { authenticate, authorize, } from "../../middleware/auth.middleware";
import {
    create,
    getAll,
    update,
    getGenders,
    getRoles,
    getFacilities,
    getStatuses,
} from "../../controllers/employee/employee.Controller";


// CREATE EMPLOYEE
router.post(
    "/",
    authenticate,
    authorize("super_admin"),
    create
);


// GET ALL EMPLOYEES
router.get(
    "/",
    authenticate,
    authorize("super_admin"),
    getAll
);


// UPDATE EMPLOYEE
router.put(
    "/:id",
    authenticate,
    authorize("super_admin"),
    update
);


// GET GENDERS
router.get(
    "/genders",
    authenticate,
    authorize("super_admin"),
    getGenders
);


// GET ROLES
router.get(
    "/roles",
    authenticate,
    authorize("super_admin"),
    getRoles
);


// GET FACILITIES
router.get(
    "/facilities",
    authenticate,
    authorize("super_admin"),
    getFacilities
);


// GET STATUS
router.get(
    "/statuses",
    authenticate,
    authorize("super_admin"),
    getStatuses
);


export default router;