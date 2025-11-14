// export function getOrderSettlementsForVendor({
//   month,
//   year,
//   vendorId, // Add this parameter
// }: {
//   month: number;
//   year: number;
//   vendorId: string; // Add this type
// }) {
//   // JavaScript months are 0-based, so subtract 1
//   const startDate = new Date(Date.UTC(year, month - 1, 1));
//   const endDate = new Date(Date.UTC(year, month, 0)); // Last day of the month

//   const startDateStr = startDate.toISOString().split('T')[0]; // YYYY-MM-DD format
//   const endDateStr = endDate.toISOString().split('T')[0]; // YYYY-MM-DD format

//   const sql = `
//     WITH days AS (
//       SELECT generate_series(
//         DATE '${startDateStr}',
//         DATE '${endDateStr}',
//         INTERVAL '1 day'
//       )::date AS day
//     )
//     SELECT
//       d.day,
//       v.id AS "vendorId",
//       u.name AS "vendorName",
//       COALESCE(SUM(op."paidedAmount"),0) AS totalAmount,
//       COALESCE(SUM(os."amount"),0) AS totalPaid,
//       COALESCE(os.status, 'UNPAID') AS "settlementStatus"
//     FROM days d
//     JOIN "Vendor" v ON v.id = '${vendorId}'
//     JOIN "User" u ON u.id = v."userId"
//     LEFT JOIN "Order" o ON TRUE
//     LEFT JOIN "OrderItem" oi ON oi."orderId" = o.id
//     LEFT JOIN "OrderItemVendorServiceOption" oivs ON oi.id = oivs."cartItemId"
//     LEFT JOIN "VendorServiceOption" vso
//            ON vso.id = oivs."vendorServiceOptionId"
//           AND vso."vendorId" = v.id
//     LEFT JOIN "OrderPayment" op
//            ON o.id = op."orderId"
//           AND DATE(op."createdAt" + INTERVAL '5 hours 30 minutes') = d.day
//           AND op.status = 'COMPLETED'
//           AND op.type = 'JUSPAY'
//           AND vso."vendorId" = v.id
//     LEFT JOIN "OrderSettlement" os
//            ON os."vendorId" = v.id
//           AND os.date::date = d.day
//     GROUP BY d.day, v.id, u.name, os.status
//     ORDER BY d.day
//   `;

//   return { sql, params: [] };
// }

export function getOrderSettlementsForVendor({
  date,
  vendorId,
  offset = '0',
  limit = '10',
}: {
  date: Date;
  vendorId: string;
  offset?: string;
  limit?: string;
}) {
  // Safe date parsing
  const parsedDate = new Date(date);

  const year = parsedDate.getUTCFullYear();
  const month = parsedDate.getUTCMonth(); // 0-based
  const day = parsedDate.getUTCDate();

  const startUtc = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  const endUtc = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

  const settlementDateISO = parsedDate.toISOString().split('T')[0]; // Get YYYY-MM-DD format

  const sql = `
  SELECT 
    vso."vendorId",
    u.name AS vendorName,
    si.name,
    bd."accountHolderName",
    bd."accountNumber",
    bd."ifscCode",
    bd."linkedPhoneNumber",
    bd."bankPlatformType",
    bn.name AS bankName,
    bpt.name AS bankPaymentType,
    SUM(op."paidedAmount") AS totalAmount,
    COALESCE(SUM(os."amount"), 0) AS totalPaid,
    COALESCE(os.status, 'UNPAID') AS settlementStatus,
    COALESCE(
      (
        SELECT json_agg(
          json_build_object('id', osf.id, 'proofImage', osf."proofImage")
        )
        FROM "OrderSettlementFile" osf
        WHERE osf."orderSettlementId" = os.id
      ),
      '[]'
    ) AS settlementFiles
  FROM "OrderPayment" AS op
  INNER JOIN "Order" AS o ON o.id = op."orderId"
  INNER JOIN "OrderItem" AS oi ON oi."orderId" = o.id
  INNER JOIN "OrderItemVendorServiceOption" AS oivs ON oi.id = oivs."cartItemId"
  INNER JOIN "VendorServiceOption" AS vso ON vso.id = oivs."vendorServiceOptionId"
  INNER JOIN "Vendor" AS v ON v.id = vso."vendorId"
  INNER JOIN "ShopInfo" AS si ON si."vendorId" = v.id
  INNER JOIN "BankDetail" AS bd ON bd."vendorId" = v.id
  LEFT JOIN "BankPaymentType" AS bpt ON bpt.id = bd."bankPaymentTypeId"
  LEFT JOIN "BankName" AS bn ON bn.id = bd."bankNameId"
  INNER JOIN "User" AS u ON u.id = v."userId"
  LEFT JOIN "OrderSettlement" AS os 
    ON os."vendorId" = vso."vendorId"
   AND os.date = (TIMESTAMP '${settlementDateISO} 00:00:00.000')
  WHERE op.status = 'COMPLETED'
    AND op.type = 'JUSPAY'
    AND op."createdAt" >= TIMESTAMP '${startUtc.toISOString()}' - INTERVAL '5 hours 30 minutes'
    AND op."createdAt" <= TIMESTAMP '${endUtc.toISOString()}' - INTERVAL '5 hours 30 minutes'
    AND vso."vendorId" = '${vendorId}'
  GROUP BY 
    vso."vendorId", 
    u.name, 
    os.status, 
    os.id,
    si.name,
    bd."accountHolderName",
    bd."accountNumber",
    bd."ifscCode",
    bd."linkedPhoneNumber",
    bd."bankPlatformType",
    bn.name,
    bpt.name
  LIMIT ${limit} OFFSET ${offset};
  `;

  return { sql, params: [] };
}
