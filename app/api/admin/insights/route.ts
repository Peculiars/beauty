import { client } from "@/sanity/lib/client";
import {
  ORDERS_LAST_7_DAYS_QUERY,
  ORDER_STATUS_DISTRIBUTION_QUERY,
  TOP_SELLING_PRODUCTS_QUERY,
  PRODUCTS_INVENTORY_QUERY,
  UNFULFILLED_ORDERS_QUERY,
  REVENUE_BY_PERIOD_QUERY,
} from "@/lib/sanity/queries/stats";

interface OrderItem {
  quantity: number;
  priceAtPurchase: number;
  productName: string;
  productId: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
  itemCount: number;
  items: OrderItem[];
}

interface StatusDistribution {
  paid: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

interface ProductSale {
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

interface UnfulfilledOrder {
  _id: string;
  orderNumber: string;
  total: number;
  createdAt: string;
  email: string;
  itemCount: number;
}

interface RevenuePeriod {
  currentPeriod: number;
  previousPeriod: number;
  currentOrderCount: number;
  previousOrderCount: number;
}

export async function GET() {
  try {
    // Calculate date ranges
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Fetch all analytics data in parallel
    const [
      recentOrders,
      statusDistribution,
      productSales,
      productsInventory,
      unfulfilledOrders,
      revenuePeriod,
    ] = await Promise.all([
      client.fetch<Order[]>(ORDERS_LAST_7_DAYS_QUERY, {
        startDate: sevenDaysAgo.toISOString(),
      }),
      client.fetch<StatusDistribution>(ORDER_STATUS_DISTRIBUTION_QUERY),
      client.fetch<ProductSale[]>(TOP_SELLING_PRODUCTS_QUERY),
      client.fetch<Product[]>(PRODUCTS_INVENTORY_QUERY),
      client.fetch<UnfulfilledOrder[]>(UNFULFILLED_ORDERS_QUERY),
      client.fetch<RevenuePeriod>(REVENUE_BY_PERIOD_QUERY, {
        currentStart: sevenDaysAgo.toISOString(),
        previousStart: fourteenDaysAgo.toISOString(),
      }),
    ]);

    // Aggregate top selling products
    const productSalesMap = new Map<
      string,
      { name: string; totalQuantity: number; revenue: number }
    >();

    for (const sale of productSales) {
      if (!sale.productId) continue;
      const existing = productSalesMap.get(sale.productId);
      if (existing) {
        existing.totalQuantity += sale.quantity;
        existing.revenue += sale.quantity * (sale.productPrice || 0);
      } else {
        productSalesMap.set(sale.productId, {
          name: sale.productName || "Unknown",
          totalQuantity: sale.quantity,
          revenue: sale.quantity * (sale.productPrice || 0),
        });
      }
    }

    const topProducts = Array.from(productSalesMap.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5);

    // Find products needing restock (low stock but high sales)
    const productSalesById = new Map(
      Array.from(productSalesMap.entries()).map(([id, data]) => [
        id,
        data.totalQuantity,
      ])
    );

    const needsRestock = productsInventory
      .filter((p) => {
        const salesQty = productSalesById.get(p._id) || 0;
        return p.stock <= 5 && salesQty > 0;
      })
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5);

    // Slow moving inventory (in stock but no sales)
    const slowMoving = productsInventory
      .filter((p) => {
        const salesQty = productSalesById.get(p._id) || 0;
        return p.stock > 10 && salesQty === 0;
      })
      .slice(0, 5);

    // Helper to calculate days since order
    const getDaysSinceOrder = (createdAt: string) => {
      const orderDate = new Date(createdAt);
      const diffTime = now.getTime() - orderDate.getTime();
      return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    };

    // Calculate metrics
    const currentRevenue = revenuePeriod.currentPeriod || 0;
    const previousRevenue = revenuePeriod.previousPeriod || 0;
    const revenueChange =
      previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : currentRevenue > 0
          ? 100
          : 0;

    const avgOrderValue =
      recentOrders.length > 0
        ? recentOrders.reduce((sum, o) => sum + (o.total || 0), 0) /
          recentOrders.length
        : 0;

    // Format metrics into insights
    const insights = {
      salesTrends: {
        summary: `Revenue this week: ₦${currentRevenue.toFixed(2)} (${revenueChange > 0 ? "+" : ""}${revenueChange.toFixed(1)}% vs last week). You've processed ${revenuePeriod.currentOrderCount || 0} orders with an average value of ₦${avgOrderValue.toFixed(2)}.`,
        highlights: [
          `${revenuePeriod.currentOrderCount || 0} orders this week`,
          `Average order value: ₦${avgOrderValue.toFixed(2)}`,
          topProducts[0]
            ? `Top seller: ${topProducts[0].name} (${topProducts[0].totalQuantity} sold)`
            : "No sales data yet",
        ],
        trend: revenueChange > 5 ? "up" : revenueChange < -5 ? "down" : "stable",
      },
      inventory: {
        summary: `${needsRestock.length} products need restocking. ${slowMoving.length} products have slow movement. Total inventory: ${productsInventory.length} products.`,
        alerts: [
          ...(needsRestock.length > 0 ? [needsRestock.slice(0, 2).map((p) => `${p.name} (${p.stock} left)`).join(", ")] : ["Inventory levels healthy"]),
          ...(unfulfilledOrders.length > 0 ? [`${unfulfilledOrders.length} orders awaiting shipment`] : []),
        ],
        recommendations: [
          needsRestock.length > 0 ? "Prioritize restocking high-demand items" : "Inventory is well-stocked",
          slowMoving.length > 0 ? "Consider promotions for slow-moving items" : "All products are selling well",
        ],
      },
      actionItems: {
        urgent: unfulfilledOrders.length > 0 
          ? [`Ship ${unfulfilledOrders.length} pending orders`, ...unfulfilledOrders.slice(0, 2).map(o => `Order #${o.orderNumber} (${o.itemCount} items)`)]
          : ["All orders fulfilled!"],
        recommended: [
          needsRestock.length > 0 ? `Restock ${needsRestock.length} low-inventory items` : "Check inventory levels",
          "Review top-performing products",
          "Analyze category performance",
        ],
        opportunities: [
          topProducts[0] ? `${topProducts[0].name} is your best performer - consider featuring it` : "Feature best-selling products",
          "Cross-sell related products",
          "Create bundles from top sellers",
        ],
      },
    };

    return Response.json({
      success: true,
      insights,
      rawMetrics: {
        currentRevenue,
        previousRevenue,
        revenueChange: revenueChange.toFixed(1),
        orderCount: revenuePeriod.currentOrderCount || 0,
        avgOrderValue: avgOrderValue.toFixed(2),
        unfulfilledCount: unfulfilledOrders.length,
        lowStockCount: productsInventory.filter((p) => p.stock <= 5).length,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to generate insights:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to generate insights",
      },
      { status: 500 }
    );
  }
}
