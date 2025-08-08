const Order = require("../../models/Orders");
const Product = require("../../models/productsModel");
// create order
const createOrder = async (req, res) => {
  try {
    const {
      product,
      products,
      deliveryDetails,
      address,
      deliveryCost,
      subtotal,
      total,
      paymentMethod,
      orderDate,
    } = req.body;

    const newOrder = new Order({
      product: product || undefined,
      products: products || undefined,
      deliveryDetails: deliveryDetails || undefined,
      address: address || undefined,
      deliveryCost,
      subtotal,
      total,
      paymentMethod,
      orderDate,
    });

    await newOrder.save();
    res.status(201).json({ message: "Order saved", order: newOrder });
  } catch (error) {
    
    console.error("Order save error:", error);
    res.status(500).json({ message: "Failed to save order", error });
    
  }
};
// get all order
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ orderDate: -1 }); // latest first
    res.status(200).json({ message: "Orders fetched", orders });
  } catch (error) {
    console.error("Order fetch error:", error);
    res.status(500).json({ message: "Failed to fetch orders", error });
  }
};

const dashboardCard =   async (req, res) => {
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const startOfToday = new Date(now);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const eightMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 7, 1);

    const pendingOrdersCount = await Order.countDocuments({ pending: true });

    const deliveredOrders = await Order.find({
      pending: false,
      orderDate: { $gte: eightMonthsAgo },
    });

    const todayOrders = await Order.find({
      orderDate: { $gte: startOfToday, $lte: endOfToday },
    });

    const deliveredTodayOrders = await Order.find({
      pending: false,
      deliveredAt: { $gte: startOfToday, $lte: endOfToday },
    });

    let totalDeliveredToday = 0;
    for (const order of deliveredTodayOrders) {
      totalDeliveredToday += order.total;
    }

    const outOfStockProducts = await Product.find({ inStock: false }).select("name price  discountPrice");
    const outOfStockCount = outOfStockProducts.length;

    const stats = {
      totalSellToday: 0,
      totalSellMonth: 0,
      orderCountToday: 0,
      orderCountMonth: 0,
      totalProductsToday: 0,
      totalProductsMonth: 0,
      deliveredOrdersToday: 0,
      pendingOrdersToday: 0,
      deliveredOrdersMonth: 0,
      pendingOrders: pendingOrdersCount,
      outOfStockCount,
      outOfStockProducts,
      monthlySales: [],
      dailySales: [],
      totalDeliveredToday,
  
    };

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyMap = {};
    const dailyMap = {};

    for (const order of todayOrders) {
      stats.orderCountToday += 1;
      stats.totalSellToday += order.total;
      stats.totalProductsToday += order.products?.reduce((sum, p) => sum + p.quantity, 0) || 0;
      if (order.pending) stats.pendingOrdersToday += 1;
      else stats.deliveredOrdersToday += 1;
    }

    for (const order of deliveredOrders) {
      const orderDate = new Date(order.orderDate);
      const year = orderDate.getFullYear();
      const month = orderDate.getMonth();
      const day = orderDate.getDate();

      const isThisMonth = orderDate >= startOfMonth;

      const monthKey = `${year}-${month}`;
      const dayKey = `${year}-${month}-${day}`;

      if (!dailyMap[dayKey]) dailyMap[dayKey] = 0;
      dailyMap[dayKey] += order.total;

      if (!monthlyMap[monthKey]) monthlyMap[monthKey] = 0;
      monthlyMap[monthKey] += order.total;

      if (isThisMonth) {
        stats.deliveredOrdersMonth += 1;
        stats.totalSellMonth += order.total;
        stats.orderCountMonth += 1;
        stats.totalProductsMonth += order.products?.reduce((sum, p) => sum + p.quantity, 0) || 0;
      }
    }

    const existingMonths = new Set(Object.keys(monthlyMap));
    const sortedMonths = Array.from(existingMonths).sort();

    for (const key of sortedMonths) {
      const [year, month] = key.split("-").map(Number);
      stats.monthlySales.push({
        month: `${monthNames[month]} ${year}`,
        sales: monthlyMap[key] || 0,
      });
    }

    for (let i = 0; i < 31; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() - 30 + i);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      stats.dailySales.push({
        day: date.getDate(),
        date: `${monthNames[date.getMonth()]} ${date.getDate()}`,
        sales: dailyMap[key] || 0,
      });
    }

    res.json({ message: "Stats generated", stats });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ message: "Failed to calculate stats", error: err.message });
  }
}

 const topProduct = async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $match: { pending: false, products: { $exists: true } } },
      { $unwind: "$products" },
      {
        $group: {
          _id: {
            _id: "$products._id",
            name: "$products.name",
            image: "$products.image", // ✅ include image field
          },
          totalQuantity: { $sum: "$products.quantity" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({ message: "Top products fetched", topProducts });
  } catch (error) {
    console.error("Top products error:", error);
    res.status(500).json({ message: "Failed to fetch top products", error });
  }
}
const updatePending = async (req, res) => {
  try {
    const { pending } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { pending },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order updated", order });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Failed to update order", error });
  }
}

const deleteOrder =   async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order deleted", deleted });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Failed to delete order", error });
  }
}

module.exports = {createOrder,getAllOrders,dashboardCard, topProduct,updatePending,deleteOrder};