import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";

export default function Success() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const txn = queryParams.get("txn");

  const [status, setStatus] = useState("Verifying payment...");
  const [amount, setAmount] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!txn) return setStatus("Invalid transaction.");

      try {
        // Fetch cart total from backend
        const resCart = await axios.get("http://localhost:8000/api/v1/cart/get", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        if (!resCart.data.success) {
          setStatus("Failed to fetch cart total.");
          return;
        }

        const totalAmount = (resCart.data.total * 1.1).toFixed(0); // total + 10% tax
        setAmount(totalAmount);

        // Verify transaction with eSewa RC API
        const res = await axios.get("https://rc.esewa.com.np/api/epay/transaction/status/", {
          params: {
            product_code: "EPAYTEST",
            total_amount: totalAmount,
            transaction_uuid: txn,
          },
        });

        if (res.data.status === "COMPLETE") {
          setStatus("✅ Payment successful!");

          // Clear cart after successful payment
          await axios.delete("http://localhost:8000/api/v1/cart/clear", {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          });
        } else {
          setStatus("❌ Payment not completed.");
        }
      } catch (err) {
        console.error(err);
        setStatus("Error verifying payment.");
      }
    };

    verifyPayment();
  }, [txn]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
      <h2 className="text-2xl font-semibold mb-4">{status}</h2>
      {amount && <p className="text-lg">Amount Paid: NPR {amount}</p>}
      <div className="flex gap-4 mt-6">
        <Button onClick={() => navigate("/")} className="px-6">
          Go Home
        </Button>
        <Button onClick={() => navigate("/products")} variant="secondary" className="px-6">
          Shop More
        </Button>
      </div>
    </div>
  );
}
