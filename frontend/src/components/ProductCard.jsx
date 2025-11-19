import React, { useState } from "react";
import { Button } from "./ui/button";
import { ShoppingCart } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";
import axios from "axios";
import { addToCartSuccess, addToCartStart, addToCartFailure } from "../redux/cartSlice"; 
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product, loading }) => {
  const { productImg, productPrice, productName, _id } = product;
  const [addingToCart, setAddingToCart] = useState(false);
  const { user } = useSelector((store) => store.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const accessToken = localStorage.getItem("accessToken");

  const handleAddToCart = async () => {
    // Check if user is logged in
    if (!user || !accessToken) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    try {
      dispatch(addToCartStart());
      setAddingToCart(true);
      const res = await axios.post(
        "http://localhost:8000/api/v1/cart/add",
        {
          productId: _id,
          quantity: 1
        },
        {
          headers: {
            Authorization:`Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (res.data.success) {
        dispatch(addToCartSuccess(res.data.cart));
        toast.success("Product added to cart!");
      }
    } catch (error) {
      console.log(error);
      dispatch(addToCartFailure(error.response?.data?.message || "Failed to add to cart"));
      toast.error(error.response?.data?.message || "Failed to add to cart");
    }
  };

  return (
    <div className="shadow-lg rounded-lg overflow-hidden h-max">
      <div className="w-full h-full aspect-square overflow-hidden">
        {loading ? (
          <Skeleton className="w-full h-full rounded-lg" />
        ) : (
          <img
            src={productImg[0]?.url}
            alt={productName}
            className="w-full h-full transition-transform duration-300 hover:scale-105"
          />
        )}
      </div>
      {loading ? (
        <div className="px-2 space-y-2 my-2">
          <Skeleton className="w-[200px] h-4" />
          <Skeleton className="w-[100px] h-4" />
          <Skeleton className="w-[150px] h-8" />
        </div>
      ) : (
        <div className="px-2 space-y-1">
          <h1 className="font-semibold h-12 line-clamp-2">{productName}</h1>
          <h2 className="font-bold">NPR {productPrice}</h2>
          <Button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className="bg-pink-600 mb-3 w-full"
          >
            <ShoppingCart />
            {addingToCart ? "Adding..." : "Add to Cart"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;