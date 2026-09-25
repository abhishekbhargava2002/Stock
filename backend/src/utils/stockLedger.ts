import { ClientSession, Types } from "mongoose";
import { StockBalance, StockLedger } from "../modules/stock/stock.models";

type ApplyStockInput = {
  organizationId: Types.ObjectId | string;
  facilityId: Types.ObjectId | string;
  godownId: Types.ObjectId | string;
  itemId: Types.ObjectId | string;
  transactionType: string;
  quantityIn?: number;
  quantityOut?: number;
  unitId?: Types.ObjectId | string;
  rate?: number;
  referenceType: string;
  referenceId: Types.ObjectId | string;
  remarks?: string;
  createdBy?: Types.ObjectId | string;
  session?: ClientSession;
};

export async function applyStockMovement(input: ApplyStockInput) {
  const quantityIn = input.quantityIn || 0;
  const quantityOut = input.quantityOut || 0;
  const rate = input.rate || 0;

  const balance = await StockBalance.findOneAndUpdate(
    {
      organizationId: input.organizationId,
      facilityId: input.facilityId,
      godownId: input.godownId,
      itemId: input.itemId,
    },
    { $setOnInsert: { availableQuantity: 0, averageRate: rate, stockValue: 0 } },
    { new: true, upsert: true, session: input.session }
  );

  const nextQuantity = balance.availableQuantity + quantityIn - quantityOut;
  if (nextQuantity < 0) throw new Error("Stock cannot go negative");

  balance.availableQuantity = nextQuantity;
  balance.averageRate = rate || balance.averageRate;
  balance.stockValue = nextQuantity * (balance.averageRate || 0);
  await balance.save({ session: input.session });

  return StockLedger.create(
    [
      {
        organizationId: input.organizationId,
        facilityId: input.facilityId,
        godownId: input.godownId,
        itemId: input.itemId,
        transactionType: input.transactionType,
        quantityIn,
        quantityOut,
        balanceQuantity: nextQuantity,
        unitId: input.unitId,
        rate,
        amount: (quantityIn || quantityOut) * rate,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        remarks: input.remarks,
        createdBy: input.createdBy,
      },
    ],
    { session: input.session }
  );
}
