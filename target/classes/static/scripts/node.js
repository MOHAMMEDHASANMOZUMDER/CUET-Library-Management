const express = require('express');
const fetch = require('node-fetch');
const app = express();
const cors = require('cors'); 
app.use(cors());              
app.use(express.json());


app.use(express.json());

app.post('/api/initiate-sslcommerz', async (req, res) => {
    const { amount, payment_method, fine_id, customer_name, customer_email, customer_phone, tran_id } = req.body;

    // SSL Commerz store credentials
    const store_id = 'your_store_id';
    const store_passwd = 'your_store_password';

    // Prepare payload for SSL Commerz API
    const postData = {
        store_id,
        store_passwd,
        total_amount: amount,
        currency: 'BDT',
        tran_id,
        success_url: 'https://yourdomain.com/payment-success',
        fail_url: 'https://yourdomain.com/payment-fail',
        cancel_url: 'https://yourdomain.com/payment-cancel',
        emi_option: 0,
        cus_name: customer_name,
        cus_email: customer_email,
        cus_add1: 'Your address',
        cus_phone: customer_phone,
        // Add other required fields here
    };

    try {
        const response = await fetch('https://sandbox.sslcommerz.com/gwprocess/v4/api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData)
        });
        const data = await response.json();
        if(data.status === 'SUCCESS') {
            res.json(data);  // Forward GatewayPageURL etc.
        } else {
            res.status(400).json({ status: 'FAILED', message: 'SSL Commerz API failed' });
        }
    } catch (error) {
        console.error('SSL Commerz error:', error);
        res.status(500).json({ status: 'FAILED', message: 'Internal server error' });
    }
});
app.use(cors({
  origin: 'http://localhost:5000'  
}));
