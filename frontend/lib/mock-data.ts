import type { Category, Facility, Godown, Group, IncentiveRule, Item, NotificationItem, Organization, Sale, StockLedger, StockTransaction, Unit, User, Vendor } from "@/types";
export const organizations: Organization[] = [
 { id:"ORG-001", name:"Shree Electronics", email:"admin@shreeelectronics.in", phone:"9876543210", address:"Nagpur, Maharashtra", gst:"27ABCDE1234F1Z5", facilityLimit:4, userLimit:25, status:"Active" },
 { id:"ORG-002", name:"Mahavir Distributors", email:"ops@mahavirdist.in", phone:"9822222222", address:"Pune, Maharashtra", facilityLimit:3, userLimit:18, status:"Active" }
];
export const facilities: Facility[] = [
 { id:"FAC-001", organizationId:"ORG-001", name:"Main Facility", code:"NGP-MAIN", city:"Nagpur", state:"Maharashtra", isPrimary:true, status:"Active" },
 { id:"FAC-002", organizationId:"ORG-001", name:"Gondia Store", code:"GON-STORE", city:"Gondia", state:"Maharashtra", status:"Active" }
];
export const users: User[] = [
 { id:"U-001", name:"Ramesh Patil", email:"ramesh@stockora.in", phone:"9876500001", role:"Client Super Admin", facility:"Main Facility", status:"Active" },
 { id:"U-002", name:"Tushar Deshmukh", email:"tushar@stockora.in", phone:"9876500002", role:"Stock Manager", facility:"Nagpur Warehouse", status:"Active" },
 { id:"U-003", name:"Pooja Sharma", email:"pooja@stockora.in", phone:"9876500003", role:"Sales Operator", facility:"Gondia Store", status:"Active" }
];
export const groups: Group[] = [
 { id:"G-001", name:"Electronics", description:"TV, appliances and electronic goods", status:"Active" },
 { id:"G-002", name:"Apparel", description:"Wearable products and textile inventory", status:"Active" },
 { id:"G-003", name:"Hardware", description:"Tools, spares and store items", status:"Active" }
];
export const categories: Category[] = [
 { id:"C-001", name:"Television", group:"Electronics", description:"LED and smart TVs", status:"Active" },
 { id:"C-002", name:"Clothing", group:"Apparel", description:"T-shirts and uniforms", status:"Active" },
 { id:"C-003", name:"Appliances", group:"Electronics", description:"Home appliances", status:"Active" }
];
export const units: Unit[] = [
 { id:"UN-001", name:"Pieces", code:"PCS", description:"Single quantity", status:"Active" },
 { id:"UN-002", name:"Box", code:"BOX", description:"Box packing", status:"Active" },
 { id:"UN-003", name:"Kilogram", code:"KG", description:"Weight unit", status:"Active" }
];
export const godowns: Godown[] = [
 { id:"GD-001", name:"Main Godown", address:"MIDC Nagpur", isDefault:true, status:"Active" },
 { id:"GD-002", name:"Nagpur Warehouse", address:"Wardha Road, Nagpur", status:"Active" },
 { id:"GD-003", name:"Gondia Store", address:"Railway Station Road, Gondia", status:"Active" }
];
export const vendors: Vendor[] = [
 { id:"V-001", name:"Mahavir Distributors", phone:"9822211111", email:"billing@mahavir.in", gst:"27AAACM2222M1Z5", address:"Nagpur", status:"Active" },
 { id:"V-002", name:"Vidarbha Traders", phone:"9822223333", email:"sales@vidarbha.in", gst:"27AAACV3333V1Z2", address:"Gondia", status:"Active" },
 { id:"V-003", name:"Galaxy Appliances", phone:"9876541122", email:"orders@galaxy.in", address:"Pune", status:"Active" }
];
export const items: Item[] = [
 { id:"I-001", name:"TCL TV", sku:"TV-TCL-43", group:"Electronics", category:"Television", qty:150, unit:"PCS", mrp:32000, sellingPrice:29500, lowStock:20, status:"Active" },
 { id:"I-002", name:"Samsung TV", sku:"TV-SAM-55", group:"Electronics", category:"Television", qty:100, unit:"PCS", mrp:45000, sellingPrice:40000, lowStock:15, status:"Active" },
 { id:"I-003", name:"Onida TV", sku:"TV-ONI-32", group:"Electronics", category:"Television", qty:9, unit:"PCS", mrp:32000, sellingPrice:30000, lowStock:10, status:"Active" },
 { id:"I-004", name:"Black Polo T-Shirt", sku:"TS-BLK-M", group:"Apparel", category:"Clothing", qty:50, unit:"PCS", mrp:700, sellingPrice:500, lowStock:25, status:"Active" },
 { id:"I-005", name:"Mixer Grinder", sku:"MX-GRD-750", group:"Electronics", category:"Appliances", qty:42, unit:"PCS", mrp:4500, sellingPrice:3900, lowStock:10, status:"Active" }
];
export const stockIn: StockTransaction[] = [
 { id:"STOCKIN-00003", date:"28/04/2026 11:45 AM", vendor:"Mahavir Distributors", godown:"Main Godown", items:4, quantity:120, value:240000, vehicle:"MH31 AB 1234", createdBy:"Tushar", status:"Completed" },
 { id:"STOCKIN-00002", date:"28/04/2026 11:36 AM", vendor:"Galaxy Appliances", godown:"Nagpur Warehouse", items:2, quantity:70, value:190000, vehicle:"MH12 CD 9988", createdBy:"Pooja", status:"Completed" }
];
export const transfers: StockTransaction[] = [
 { id:"TRF-00011", date:"29/04/2026", source:"Main Godown", destination:"Gondia Store", items:3, quantity:40, value:80000, vehicle:"MH35 KL 6767", createdBy:"Tushar", status:"Completed" }
];
export const stockOut: StockTransaction[] = [
 { id:"OUT-00008", date:"29/04/2026", vendor:"Vidarbha Traders", godown:"Gondia Store", items:2, quantity:15, value:45000, vehicle:"MH31 XY 4321", createdBy:"Pooja", status:"Completed" }
];
export const sales: Sale[] = [
 { id:"SALE-00021", saleDate:"28/04/2026", facility:"Gondia Store", items:3, quantity:18, amount:25000, mode:"Manual", uploadedBy:"Tushar", status:"Completed" },
 { id:"SALE-00020", saleDate:"27/04/2026", facility:"Main Facility", items:5, quantity:29, amount:84000, mode:"Excel", uploadedBy:"Pooja", status:"Completed" }
];
export const ledger: StockLedger[] = [
 { id:"L-001", date:"01/04/2026", type:"OPENING_STOCK", ref:"OPEN-I-001", item:"TCL TV", godown:"Main Godown", quantityIn:100, quantityOut:0, balance:100, createdBy:"System" },
 { id:"L-002", date:"28/04/2026", type:"STOCK_IN", ref:"STOCKIN-00003", item:"TCL TV", godown:"Main Godown", quantityIn:50, quantityOut:0, balance:150, createdBy:"Tushar" },
 { id:"L-003", date:"29/04/2026", type:"STOCK_TRANSFER_OUT", ref:"TRF-00011", item:"TCL TV", godown:"Main Godown", quantityIn:0, quantityOut:20, balance:130, createdBy:"Tushar" },
 { id:"L-004", date:"29/04/2026", type:"STOCK_TRANSFER_IN", ref:"TRF-00011", item:"TCL TV", godown:"Gondia Store", quantityIn:20, quantityOut:0, balance:20, createdBy:"Tushar" },
 { id:"L-005", date:"29/04/2026", type:"STOCK_OUT", ref:"OUT-00008", item:"Onida TV", godown:"Gondia Store", quantityIn:0, quantityOut:5, balance:9, createdBy:"Pooja" }
];
export const incentiveRules: IncentiveRule[] = [
 { id:"IR-001", name:"TV Quantity Bonus", applicableOn:"Item: TV", vendor:"All Vendors", incentiveType:"Amount", ruleType:"Singular", effectiveFrom:"01/04/2026", status:"Active" },
 { id:"IR-002", name:"Monthly Sales Slab", applicableOn:"Category: Electronics", vendor:"Mahavir Distributors", incentiveType:"Percentage", ruleType:"Slabwise", effectiveFrom:"01/04/2026", status:"Active" }
];
export const notifications: NotificationItem[] = [
 { id:"N-001", title:"Low stock: Onida TV", message:"Available quantity is below threshold in Gondia Store.", type:"Low Stock", date:"Today", read:false },
 { id:"N-002", title:"Manual adjustment created", message:"Stock adjustment requires audit review.", type:"Adjustment", date:"Yesterday", read:true }
];
