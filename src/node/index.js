const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = 5922;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const pool = new Pool({
  user: "user_5922",
  host: "db",
  database: "crm_5922",
  password: "pass_5922",
  port: 5432,
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.get("/customers", async (req, res) => {
  try {
    const customerData = await pool.query(
      "SELECT * FROM customers ORDER BY customer_id"
    );
    res.json(customerData.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

app.get("/customer/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;
    const result = await pool.query(
      "SELECT * FROM customers WHERE customer_id = $1",
      [customerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

app.post("/add-customer", async (req, res) => {
  try {
    const { companyName, industry, contact, location } = req.body;

    const newCustomer = await pool.query(
      `INSERT INTO customers (company_name, industry, contact, location)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [companyName, industry, contact, location]
    );

    res.json({ success: true, customer: newCustomer.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

app.delete("/customer/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;

    const result = await pool.query(
      "DELETE FROM customers WHERE customer_id = $1 RETURNING *",
      [customerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    res.json({ success: true, customer: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

app.put("/customer/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;
    const { companyName, industry, contact, location } = req.body;

    const result = await pool.query(
      `UPDATE customers
       SET company_name = $1,
           industry = $2,
           contact = $3,
           location = $4
       WHERE customer_id = $5
       RETURNING *`,
      [companyName, industry, contact, location, customerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    res.json({ success: true, customer: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: String(err) });
  }
});