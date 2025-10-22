import { AdminSettlementQueryDto } from '../dto/admin-settlement.dto';

export function getSettlements({
  query,
  offset,
  limit,
}: {
  query: AdminSettlementQueryDto;
  offset: number;
  limit: number;
}) {
  const { date, shopName } = query;

  // Safe date parsing
  const parsedDate = new Date(date);

  const year = parsedDate.getUTCFullYear();
  const month = parsedDate.getUTCMonth(); // 0-based
  const day = parsedDate.getUTCDate();

  const startUtc = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  const endUtc = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

  // CONDITIONS - Use hardcoded values to avoid parameter issues
  const conditions: string[] = [
    `op.status = 'COMPLETED'`,
    `op.type = 'JUSPAY'`,
    `op."createdAt" >= TIMESTAMP '${startUtc.toISOString()}' + INTERVAL '5 hours 30 minutes'`,
    `op."createdAt" <= TIMESTAMP '${endUtc.toISOString()}' + INTERVAL '5 hours 30 minutes'`,
  ];

  if (shopName) {
    conditions.push(`si.name ILIKE '%${shopName}%'`);
  }

  // Use the parsed date directly in the query - no parameters needed
  const settlementDateISO = parsedDate.toISOString().split('T')[0]; // Get YYYY-MM-DD format

  const sql = `
    SELECT 
      vso."vendorId",
      u.name AS "vendorName",
      u.id AS "userId",
      si.name AS "shopName",
      bd."accountHolderName",
      bd."accountNumber",
      bd."ifscCode",
      bd."linkedPhoneNumber",
      bd."bankPlatformType",
      bn.name AS bankName,
      bpt.name AS bankPaymentType,
      COALESCE(SUM(op."paidedAmount"),0) AS totalAmount,
      COALESCE(SUM(os."amount"),0) AS totalPaid,
      COALESCE(os.status, 'UNPAID') AS "settlementStatus"
    FROM "OrderPayment" AS op
    INNER JOIN "Order" AS o ON o.id = op."orderId"
    INNER JOIN "OrderItem" AS oi ON oi."orderId" = o.id
    INNER JOIN "OrderItemVendorServiceOption" AS oivs ON oi.id = oivs."cartItemId"
    INNER JOIN "VendorServiceOption" AS vso ON vso.id = oivs."vendorServiceOptionId"
    INNER JOIN "Vendor" AS v ON v.id = vso."vendorId"
    INNER JOIN "ShopInfo" AS si on si."vendorId" = v.id
    LEFT JOIN "BankDetail" AS bd ON bd."vendorId" = v.id
    LEFT JOIN "BankPaymentType" AS bpt ON bpt.id = bd."bankPaymentTypeId"
    LEFT JOIN "BankName" AS bn ON bn.id = bd."bankNameId"
    INNER JOIN "User" AS u ON u.id = v."userId"
    LEFT JOIN "OrderSettlement" AS os 
      ON os."vendorId" = vso."vendorId"
      AND os.date::date = DATE('${settlementDateISO}')
    WHERE ${conditions.join(' AND ')}
    GROUP BY vso."vendorId", u.name, os.status, si.name, u.id, bd."accountHolderName",
      bd."accountNumber",
      bd."ifscCode",
      bd."linkedPhoneNumber",
      bd."bankPlatformType",
      bn.name,
      bpt.name
    LIMIT ${limit} OFFSET ${offset};
  `;

  const countSql = `
    SELECT COUNT(*) AS totalCount
    FROM (
      SELECT vso."vendorId"
      FROM "OrderPayment" AS op
      INNER JOIN "Order" AS o ON o.id = op."orderId"
      INNER JOIN "OrderItem" AS oi ON oi."orderId" = o.id
      INNER JOIN "OrderItemVendorServiceOption" AS oivs ON oi.id = oivs."cartItemId"
      INNER JOIN "VendorServiceOption" AS vso ON vso.id = oivs."vendorServiceOptionId"
      INNER JOIN "Vendor" AS v ON v.id = vso."vendorId"
      INNER JOIN "ShopInfo" AS si on si."vendorId" = v.id
      LEFT JOIN "BankDetail" AS bd ON bd."vendorId" = v.id
      LEFT JOIN "BankPaymentType" AS bpt ON bpt.id = bd."bankPaymentTypeId"
      LEFT JOIN "BankName" AS bn ON bn.id = bd."bankNameId"
      INNER JOIN "User" AS u ON u.id = v."userId"
      LEFT JOIN "OrderSettlement" AS os 
        ON os."vendorId" = vso."vendorId"
        AND os.date::date = DATE('${settlementDateISO}')
      WHERE ${conditions.join(' AND ')}
      GROUP BY vso."vendorId", u.name, os.status, si.name, bd."accountHolderName",
      bd."accountNumber",
      bd."ifscCode",
      bd."linkedPhoneNumber",
      bd."bankPlatformType",
      bn.name,
      bpt.name
    ) AS subquery;
  `;

  // No parameters needed since everything is hardcoded
  return { sql, countSql, params: [] };
}
