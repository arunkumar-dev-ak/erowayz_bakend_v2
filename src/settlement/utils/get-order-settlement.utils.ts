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

  const hourWithMin = date.toString().split(' ');
  const [year, month, day] = hourWithMin[0].split('-').map(Number);

  const startUtc = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const endUtc = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

  // --- CONDITIONS ---
  const conditions: string[] = [
    `op.status = 'COMPLETED'`,
    `op.type = 'JUSPAY'`,
  ];

  if (startUtc) {
    conditions.push(
      `op."createdAt" >= TIMESTAMP '${startUtc.toISOString()}' + INTERVAL '5 hours 30 minutes'`,
    );
  }
  if (endUtc) {
    conditions.push(
      `op."createdAt" <= TIMESTAMP '${endUtc.toISOString()} + INTERVAL '5 hours 30 minutes'`,
    );
  }

  if (shopName) {
    conditions.push(`si.name ILIKE '%${shopName}%'`);
  }

  const sql = `
    SELECT 
      vso."vendorId",
      u.name AS "vendorName",
      si.name,
      SUM(op."paidedAmount") AS "totalPaid",
      COALESCE(os.status, 'UNPAID') AS "settlementStatus"
    FROM "OrderPayment" AS op
    INNER JOIN "Order" AS o ON o.id = op."orderId"
    INNER JOIN "OrderItem" AS oi ON oi."orderId" = o.id
    INNER JOIN "OrderItemVendorServiceOption" AS oivs ON oi.id = oivs."cartItemId"
    INNER JOIN "VendorServiceOption" AS vso ON vso.id = oivs."vendorServiceOptionId"
    INNER JOIN "Vendor" AS v ON v.id = vso."vendorId"
    INNER JOIN "ShopInfo" AS si on si."vendorId" = v.id
    INNER JOIN "User" AS u ON u.id = v."userId"
    LEFT JOIN "OrderSettlement" AS os 
      ON os."vendorId" = vso."vendorId"
      AND os.date::date = (DATE $1 + INTERVAL '5 hours 30 minutes')
    WHERE ${conditions.join(' AND ')}
    GROUP BY vso."vendorId", u.name, os.status, si.name
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
    INNER JOIN "User" AS u ON u.id = v."userId"
    LEFT JOIN "OrderSettlement" AS os 
      ON os."vendorId" = vso."vendorId"
      AND os.date::date = (DATE $1 + INTERVAL '5 hours 30 minutes')
    WHERE ${conditions.join(' AND ')}
    GROUP BY vso."vendorId", u.name, os.status, si.name
  ) AS subquery;
`;

  // Use parameterized query so $1 works
  return { sql, countSql };
}
