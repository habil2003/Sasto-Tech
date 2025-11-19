import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Wallet, CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';

const Payment = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const { user } = useSelector((store) => store.user);
  const accessToken = localStorage.getItem('accessToken');

  const fetchOrderDetails = async () => {
    if (!orderId) {
      toast.error('Order ID is missing');
      navigate('/orders');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:8000/api/v1/order/order/${orderId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      if (res.data.success) {
        setOrder(res.data.order);
        
        // If already paid, redirect to orders
        if (res.data.order.paymentStatus === 'Paid') {
          toast.success('Payment already completed!');
          navigate('/orders');
        }
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to fetch order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const handlePayWithESewa = async () => {
    try {
      setPaymentProcessing(true);
      const res = await axios.post(
        `http://localhost:8000/api/v1/payment/esewa/initiate`,
        {
          shippingAddress: order.shippingAddress,
          orderId: order._id
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (res.data.success) {
        // Create form and submit to eSewa
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = res.data.paymentUrl;

        Object.keys(res.data.paymentData).forEach((key) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = res.data.paymentData[key];
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
      setPaymentProcessing(false);
    }
  };

  const handlePayLater = () => {
    toast.info('You can pay from Orders page anytime');
    navigate('/orders');
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-lg">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <p className="text-lg mb-4">Order not found</p>
            <Button onClick={() => navigate('/orders')} className="bg-pink-600">
              Go to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If payment method is COD, show confirmation instead
  if (order.paymentMethod === 'COD') {
    return (
      <div className="pt-20 pb-10 min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4">
          <Button
            onClick={() => navigate('/orders')}
            variant="outline"
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>

          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
              <p className="text-gray-600 mb-6">
                Order ID: #{order._id.slice(-8).toUpperCase()}
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Wallet className="h-5 w-5 text-blue-600" />
                  <p className="font-semibold text-blue-900">Cash on Delivery</p>
                </div>
                <p className="text-sm text-blue-700">
                  Pay NPR {order.totalAmount} when your order is delivered
                </p>
              </div>

              <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items:</span>
                    <span>{order.items.length} item(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>NPR {order.totalAmount - 100}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span>NPR 100</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span>NPR {order.totalAmount}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => navigate('/orders')}
                className="w-full bg-pink-600"
              >
                View My Orders
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Online payment page
  return (
    <div className="pt-20 pb-10 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <Button
          onClick={() => navigate('/orders')}
          variant="outline"
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Payment Options */}
          <div className="md:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-6 w-6" />
                  Complete Your Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Order Info Banner */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <p className="font-semibold text-yellow-900">Payment Pending</p>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Complete your payment to confirm your order
                    </p>
                  </div>

                  {/* eSewa Payment Option */}
                  <div className="border-2 border-pink-200 rounded-lg p-6 hover:border-pink-400 transition">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src="https://esewa.com.np/common/images/esewa-logo.png"
                          alt="eSewa"
                          className="h-10"
                        />
                        <div>
                          <h3 className="font-semibold text-lg">Pay with eSewa</h3>
                          <p className="text-sm text-gray-600">
                            Secure and fast payment
                          </p>
                        </div>
                      </div>
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>

                    <Button
                      onClick={handlePayWithESewa}
                      disabled={paymentProcessing}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      {paymentProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pay NPR {order.totalAmount} Now
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Pay Later Option */}
                  <div className="border rounded-lg p-6">
                    <h3 className="font-semibold mb-2">Pay Later</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      You can complete the payment anytime from your Orders page
                    </p>
                    <Button
                      onClick={handlePayLater}
                      variant="outline"
                      className="w-full"
                    >
                      Pay Later
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Security */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Secure payment powered by eSewa</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
                <p className="text-sm text-gray-600">
                  Order #{order._id.slice(-8).toUpperCase()}
                </p>
              </CardHeader>
              <CardContent>
                {/* Order Items */}
                <div className="space-y-3 mb-4">
                  {order.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <img
                        src={item.productId?.productImg[0]?.url}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-1">
                          {item.productName}
                        </p>
                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                        <p className="text-sm font-semibold">
                          NPR {item.price * item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-sm text-gray-600">
                      +{order.items.length - 3} more item(s)
                    </p>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>NPR {order.totalAmount - 100}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span>NPR 100</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>NPR {order.totalAmount}</span>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold text-sm mb-2">Delivery Address</h4>
                  <div className="text-sm text-gray-600">
                    <p>{user?.firstName} {user?.lastName}</p>
                    <p>{order.shippingAddress?.address}</p>
                    <p>
                      {order.shippingAddress?.city}, {order.shippingAddress?.zipCode}
                    </p>
                    <p>{order.shippingAddress?.phoneNo}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;