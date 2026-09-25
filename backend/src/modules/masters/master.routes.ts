import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendList, sendSuccess } from "../../utils/apiResponse";
import { Category, Employee, Godown, Group, Item, Unit, Vendor } from "./master.models";

const router = Router();

const models = {
  groups: Group,
  categories: Category,
  items: Item,
  units: Unit,
  godowns: Godown,
  vendors: Vendor,
  employees: Employee,
} as const;

function registerCrud(path: keyof typeof models) {
  const Model = models[path];
  router.post(`/${path}`, asyncHandler(async (req, res) => sendSuccess(res, `${path} created`, await Model.create(req.body), 201)));
  router.get(`/${path}`, asyncHandler(async (req, res) => sendList(res, `${path} fetched`, await Model.find(req.query).sort({ createdAt: -1 }))));
  router.get(`/${path}/:id`, asyncHandler(async (req, res) => sendSuccess(res, `${path} fetched`, await Model.findById(req.params.id))));
  router.put(`/${path}/:id`, asyncHandler(async (req, res) => sendSuccess(res, `${path} updated`, await Model.findByIdAndUpdate(req.params.id, req.body, { new: true }))));
  router.patch(`/${path}/:id/status`, asyncHandler(async (req, res) => sendSuccess(res, `${path} status updated`, await Model.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }))));
}

Object.keys(models).forEach((key) => registerCrud(key as keyof typeof models));

export default router;
