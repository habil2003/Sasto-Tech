import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js'; // Make sure this is installed

const Cart = () => {
  const [cart, setCart] = useState({ items: [] });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('accessToken');

  // Fetch cart data
  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/api/v1/cart/get", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.data.success) {
        setCart(res.data.cart);
        setTotal(res.data.total);
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  // Update quantity
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const res = await axios.put(
        "http://localhost:8000/api/v1/cart/update",
        { productId, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (res.data.success) {
        fetchCart();
        toast.success('Cart updated');
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to update cart');
    }
  };

  // Remove item
  const removeItem = async (productId) => {
    try {
      const res = await axios.delete(
        `http://localhost:8000/api/v1/cart/remove/${productId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (res.data.success) {
        fetchCart();
        toast.success('Item removed from cart');
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to remove item');
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      const res = await axios.delete("http://localhost:8000/api/v1/cart/clear", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.data.success) {
        setCart({ items: [] });
        setTotal(0);
        toast.success('Cart cleared');
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to clear cart');
    }
  };

  // eSewa Payment Handler
  const handleEsewaPayment = () => {
    if (cart.items.length === 0) return toast.error('Cart is empty');
    
    const transaction_uuid = `TXN-${Date.now()}`;
    const amount = total.toFixed(0);
    const tax_amount = (total * 0.1).toFixed(0); // 10% tax
    const total_amount = (parseFloat(amount) + parseFloat(tax_amount)).toFixed(0);
    const product_code = "EPAYTEST";
    const secret = "8gBm/:&EnhH.1/q";
    const signed_field_names = "total_amount,transaction_uuid,product_code";

    const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const hash = CryptoJS.HmacSHA256(message, secret);
    const signature = CryptoJS.enc.Base64.stringify(hash);

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

    const fields = {
      amount,
      tax_amount,
      total_amount,
      transaction_uuid,
      product_code,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: `${window.location.origin}/payment/success?txn=${transaction_uuid}`,
      failure_url: `${window.location.origin}/payment/failure?txn=${transaction_uuid}`,
      signed_field_names,
      signature,
    };

    Object.entries(fields).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value.toString();
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  useEffect(() => { fetchCart(); }, []);

  if (loading) return <div className="pt-20 min-h-screen flex items-center justify-center"><p>Loading cart...</p></div>;
  if (!cart.items || cart.items.length === 0) return (
    <div className="pt-20 min-h-screen flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
      <Button onClick={() => navigate('/products')} className="bg-pink-600">Continue Shopping</Button>
    </div>
  );

  return (
    <div className="pt-20 pb-10 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <Button onClick={clearCart} variant="outline" className="text-red-600 border-red-600">Clear Cart</Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {cart.items.map(item => (
              <div key={item._id} className="bg-white p-4 rounded-lg shadow flex gap-4">
                <img src={item.productId?.productImg[0]?.url} alt={item.productId?.productName} className="w-24 h-24 object-cover rounded"/>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.productId?.productName}</h3>
                  <p className="text-gray-600">NPR {item.price}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <Button size="icon-sm" variant="outline" onClick={() => updateQuantity(item.productId._id, item.quantity - 1)} disabled={item.quantity <= 1}><Minus className="h-4 w-4"/></Button>
                    <span className="font-semibold">{item.quantity}</span>
                    <Button size="icon-sm" variant="outline" onClick={() => updateQuantity(item.productId._id, item.quantity + 1)}><Plus className="h-4 w-4"/></Button>
                  </div>
                </div>
                <div className="flex flex-col justify-between items-end">
                  <Button size="icon-sm" variant="ghost" onClick={() => removeItem(item.productId._id)} className="text-red-600"><Trash2 className="h-5 w-5"/></Button>
                  <p className="font-bold">NPR {item.price * item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Summary */}
          <div className="bg-white p-4 rounded-lg shadow h-fit">
            <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
            <p className="mb-2">Subtotal: NPR {total.toFixed(0)}</p>
            <p className="mb-4">Tax (10%): NPR {(total * 0.1).toFixed(0)}</p>
            <p className="font-bold mb-4">Total: NPR {(total * 1.1).toFixed(0)}</p>
            <Button onClick={handleEsewaPayment} className="w-full">Pay with eSewa</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
