// Simple seed script for SmartPOS
const bcrypt = require('bcryptjs');

(async () => {
  const { Product, User, Sale, SaleItem, sequelize } = await import('./src/models/index.js').then(mod => mod);

  async function seed() {
  try {
    await sequelize.sync({ force: false });
    // Seed admin user
    const passwordHash = await bcrypt.hash('admin123', 10);
    await User.findOrCreate({
      where: { email: 'admin@smartpos.com' },
      defaults: {
        full_name: 'Admin User',
        password: passwordHash,
        role: 'admin',
        status: 'active'
      }
    });

    // Seed products
    const products = await Product.bulkCreate([
      {
        name: 'Coca Cola 330ml',
        category: 'Beverages',
        price: 1.5,
        stock_quantity: 100,
        min_stock_level: 10,
        status: 'active'
      },
      {
        name: 'Pepsi 330ml',
        category: 'Beverages',
        price: 1.4,
        stock_quantity: 80,
        min_stock_level: 8,
        status: 'active'
      },
      {
        name: 'Lays Classic',
        category: 'Snacks',
        price: 2.0,
        stock_quantity: 50,
        min_stock_level: 5,
        status: 'active'
      },
    ], { ignoreDuplicates: true });

    // Seed sales and sale items
    const sale = await Sale.create({
      customer_id: null,
      total_amount: 4.9,
      payment_method: 'cash',
      receipt_number: 'R0001',
      status: 'completed'
    });
    await SaleItem.bulkCreate([
      {
        sale_id: sale.id,
        product_id: products[0].id,
        quantity: 2,
        price: 1.5
      },
      {
        sale_id: sale.id,
        product_id: products[2].id,
        quantity: 1,
        price: 2.0
      }
    ]);

    console.log('Seed data inserted successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
  }
  await seed();
})();
