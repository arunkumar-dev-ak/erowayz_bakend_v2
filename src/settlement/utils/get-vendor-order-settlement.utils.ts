export function getOrderSettlementsForVendor({
  month,
  year,
  offset,
  limit,
}: {
  offset: number;
  limit: number;
  month: number;
  year: number;
}) {
  // JavaScript months are 0-based, so subtract 1
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of the month

  const startDateStr = startDate.toISOString().split('T')[0]; // YYYY-MM-DD format
  const endDateStr = endDate.toISOString().split('T')[0]; // YYYY-MM-DD format

  const sql = `
    WITH days AS (
      SELECT generate_series(
        DATE '${startDateStr}', 
        DATE '${endDateStr}',
        INTERVAL '1 day'
      )::date AS day
    )
    SELECT 
      d.day,
      v.id AS "vendorId",
      u.name AS "vendorName",
      COALESCE(SUM(op."paidedAmount"), 0) AS "totalPaid",
      COALESCE(os.status, 'UNPAID') AS "settlementStatus"
    FROM days d
    JOIN "Vendor" v ON TRUE
    JOIN "User" u ON u.id = v."userId"
    LEFT JOIN "Order" o ON TRUE
    LEFT JOIN "OrderItem" oi ON oi."orderId" = o.id
    LEFT JOIN "OrderItemVendorServiceOption" oivs ON oi.id = oivs."cartItemId"
    LEFT JOIN "VendorServiceOption" vso 
           ON vso.id = oivs."vendorServiceOptionId"
          AND vso."vendorId" = v.id
    LEFT JOIN "OrderPayment" op 
           ON o.id = op."orderId"
          AND DATE(op."createdAt" + INTERVAL '5 hours 30 minutes') = d.day
          AND op.status = 'COMPLETED'
          AND op.type = 'JUSPAY'
          AND vso."vendorId" = v.id
    LEFT JOIN "OrderSettlement" os 
           ON os."vendorId" = v.id
          AND os.date::date = d.day
    GROUP BY d.day, v.id, u.name, os.status
    ORDER BY d.day
    LIMIT ${limit} OFFSET ${offset};
  `;

  return { sql, params: [] };
}
