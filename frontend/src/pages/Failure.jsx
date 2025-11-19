import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function Failure() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get transaction ID from query string
  const queryParams = new URLSearchParams(location.search);
  const txn = queryParams.get("txn");

  useEffect(() => {
    if (txn) {
      console.warn("Payment failed for transaction:", txn);
    }
  }, [txn]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
      <XCircle className="text-red-500 w-20 h-20 mb-6" />
      <h1 className="text-3xl font-semibold text-red-600 mb-2">
        Payment Failed
      </h1>
      <p className="text-gray-600 mb-6 max-w-md">
        Unfortunately, your payment via eSewa could not be processed.
        {txn && (
          <span>
            <br />
            Transaction ID: <b>{txn}</b>
          </span>
        )}
      </p>

      <div className="flex gap-4">
        <Button
          variant="secondary"
          onClick={() => navigate(-1)}
          className="px-6"
        >
          Try Again
        </Button>
        <Button onClick={() => navigate("/")} className="px-6">
          Go Home
        </Button>
      </div>
    </div>
  );
}
