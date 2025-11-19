import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Checkout = () => {
  const { user } = useSelector((store) => store.user);
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('accessToken');
  const [cart, setCart] = useState({ items: [] });
  const [total, setTotal] = useState(0);

  const [shippingInfo, setShippingInfo] = useState({
    address: user?.address || '',
    city: user?.city || '',
    zipCode: user?.zipCode || '',
    phoneNo: user?.phoneNo || ''
  });

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/v1/cart/get`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.data.success) {
        setCart(res.data.cart);
        setTotal(res.data.total);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleCODPayment = async (e) => {
    e.preventDefault();

    if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.zipCode || !shippingInfo.phoneNo) {
      toast.error('Please fill all shipping details');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `http://localhost:8000/api/v1/order/create`,
        {
          shippingAddress: shippingInfo,
          paymentMethod: 'COD'
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (res.data.success) {
        toast.success('Order placed successfully!');
        navigate(`/payment?orderId=${res.data.order._id}`);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleEsewaPayment = async (e) => {
    e.preventDefault();

    if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.zipCode || !shippingInfo.phoneNo) {
      toast.error('Please fill all shipping details');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `http://localhost:8000/api/v1/payment/esewa/initiate`,
        { shippingAddress: shippingInfo },
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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (paymentMethod === 'COD') {
      handleCODPayment(e);
    } else {
      handleEsewaPayment(e);
    }
  };

  return (
    <div className="pt-20 pb-10 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Shipping & Payment Form */}
          <div className="md:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleChange}
                      placeholder="Enter your address"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleChange}
                        placeholder="City"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">Zip Code</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={shippingInfo.zipCode}
                        onChange={handleChange}
                        placeholder="Zip Code"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phoneNo">Phone Number</Label>
                    <Input
                      id="phoneNo"
                      name="phoneNo"
                      value={shippingInfo.phoneNo}
                      onChange={handleChange}
                      placeholder="Phone Number"
                      required
                    />
                  </div>

                  <div>
                    <Label>Payment Method</Label>
                    <div className="flex flex-col gap-3 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer border rounded-lg p-4 hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="COD"
                          checked={paymentMethod === 'COD'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <div className="flex-1">
                          <span className="font-medium">Cash on Delivery</span>
                          <p className="text-sm text-gray-600">Pay when you receive</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer border rounded-lg p-4 hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="eSewa"
                          checked={paymentMethod === 'eSewa'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <div className="flex-1">
                          <span className="font-medium">eSewa Payment</span>
                          <p className="text-sm text-gray-600">Pay securely with eSewa</p>
                        </div>
                        <img
                          src="https://esewa.com.np/common/images/esewa-logo.png"
                          alt="eSewa"
                          className="h-8"
                        />
                      </label>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-pink-600"
                  >
                    {loading ? 'Processing...' : paymentMethod === 'COD' ? 'Place Order' : 'Proceed to Pay'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cart.items?.map((item) => (
                    <div key={item._id} className="flex gap-3 text-sm">
                      <img
                        src={item.productId?.productImg[0]?.url}
                        alt={item.productId?.productName}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium line-clamp-1">
                          {item.productId?.productName}
                        </p>
                        <p className="text-gray-600">Qty: {item.quantity}</p>
                        <p className="font-semibold">NPR {item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-4 pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>NPR {total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>NPR 100</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>NPR {total + 100}</span>
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

export default Checkout;