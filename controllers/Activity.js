// controllers/ActivityController.js
const db = require("../config/Database.js");

exports.getActivities = async (req, res) => {
  try {
    // SQL query to fetch user activities based on transactions
    const query = `
      SELECT 
        u.id AS user_id, 
        u.first_name, 
        u.last_name, 
        t.invoice_number, 
        t.status AS transaction_status
      FROM users u
      JOIN transactions t ON t.user_id = u.id
      WHERE t.status = 'Proses' 
      ORDER BY t.created_at DESC;
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching activities:", err.message);
        return res.status(500).json({ error: "Failed to fetch activities." });
      }

      // Respond with the activities
      const activities = results.map(row => ({
        id: row.user_id,
        username: `${row.first_name} ${row.last_name}`,
        invoice_number: row.invoice_number,
        transaction_status: row.transaction_status,
      }));

      return res.status(200).json({ activities });
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: "An error occurred while fetching activities." });
  }
};
