const db = require("../config/Database"); // Assuming you have a database configuration file
const jwt = require("jsonwebtoken");

// Fetch all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const [transactions] = await db.promise().query(`
      SELECT 
        transactions.id,
        transactions.invoice_number,
        users.username,
        packages.name AS package_name,
        transactions.price,
        transactions.status
      FROM transactions
      JOIN users ON transactions.user_id = users.id
      JOIN packages ON transactions.package_id = packages.id
    `);
    res.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res
      .status(500)
      .json({ msg: "Error fetching transactions", error: error.message });
  }
};

// Fetch a single transaction by ID
exports.getTransactionById = async (req, res) => {
  const { id } = req.params;
  try {
    const [transaction] = await db.promise().query(
      `
      SELECT
        transactions.id,
        transactions.invoice_number,
        users.username,
        packages.name AS package_name,
        transactions.price,
        transactions.status
      FROM transactions
      JOIN users ON transactions.user _id = users.id
      JOIN packages ON transactions.package_id = packages.id
      WHERE transactions.id = ?
    `,
      [id]
    );

    if (transaction.length === 0) {
      return res.status(404).json({ msg: "Transaction not found" });
    }

    res.json(transaction[0]);
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res
      .status(500)
      .json({ msg: "Error fetching transaction", error: error.message });
  }
};

// Create a new transaction
exports.createTransaction = async (req, res) => {
  const { user_id, package_id, price, status } = req.body;
  const invoice_number = `INV-${Date.now()}`;

  try {
    await db.promise().query(
      `
      INSERT INTO transactions (invoice_number, user_id, package_id, price, status)
      VALUES (?, ?, ?, ?, ?)`,
      [invoice_number, user_id, package_id, price, status]
    );

    res.status(201).json({ msg: "Transaction created successfully" });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res
      .status(500)
      .json({ msg: "Error creating transaction", error: error.message });
  }
};

// Update a transaction
exports.updateTransaction = async (req, res) => {
  const { id } = req.params;
  const { user_id, package_id, price, status } = req.body;

  try {
    await db.promise().query(
      `
      UPDATE transactions
      SET user_id = ?, package_id = ?, price = ?, status = ?
      WHERE id = ?`,
      [user_id, package_id, price, status, id]
    );

    res.json({ msg: "Transaction updated successfully" });
  } catch (error) {
    console.error("Error updating transaction:", error);
    res
      .status(500)
      .json({ msg: "Error updating transaction", error: error.message });
  }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    await db.promise().query(`DELETE FROM transactions WHERE id = ?`, [id]);
    res.json({ msg: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res
      .status(500)
      .json({ msg: "Error deleting transaction", error: error.message });
  }
};
