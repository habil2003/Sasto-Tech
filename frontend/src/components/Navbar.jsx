import { ShoppingCart } from "lucide-react";
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/redux/userSlice";
import { setCartCount } from "@/redux/cartSlice";
import axios from "axios";

const Navbar = () => {
  const { user } = useSelector((store) => store.user);
  const { cartCount } = useSelector((store) => store.cart);
  const accessToken = localStorage.getItem("accessToken");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchCartCount = async () => {
    if (!user || !accessToken) return;
    
    try {
      const res = await axios.get(`http://localhost:8000/api/v1/cart/get`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      if (res.data.success) {
        const totalItems = res.data.cart.items?.reduce(
          (sum, item) => sum + item.quantity,
          0
        ) || 0;
        dispatch(setCartCount(totalItems));
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, [user, accessToken]);
const logoutHandler = async () => {
  // Clear local data first
  dispatch(setUser(null));
  dispatch(setCartCount(0));
  localStorage.removeItem("accessToken");

  try {
    await axios.post(
      `http://localhost:8000/api/v1/user/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    toast.success("Logged out successfully");
  } catch (error) {
    console.log(error);
    toast.error("Logout failed on server");
  } finally {
    navigate("/login");
  }
};


  return (
    <header className="bg-pink-50 fixed w-full z-20 border-b border-pink-200">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-3 h-16 px-4">
        {/* logo section */}
        <div>
          <Link to="/">
            <img src="/sastotech.png" alt="" className="w-[100px]" />
          </Link>
        </div>
        {/* nav section */}
        <nav className="flex gap-10 justify-between items-center">
          <ul className="flex gap-7 items-center text-xl font-semibold">
            <Link to={"/"}>
              <li>Home</li>
            </Link>
            <Link to={"/products"}>
              <li>Products</li>
            </Link>
            {user && (
              <>
                <Link to={`/profile/${user._id}`}>
                  <li>Hello, {user.firstName}</li>
                </Link>
                {user.role === "admin" && (
                  <Link to={"/admin"}>
                    <li className="text-purple-600">Admin Panel</li>
                  </Link>
                )}
              </>
            )}
          </ul>
          {user && (
            <Link to={"/cart"} className="relative">
              <ShoppingCart />
              {cartCount > 0 && (
                <span className="bg-pink-500 rounded-full absolute text-white -top-3 -right-5 px-2 text-sm min-w-[24px] text-center">
                  {cartCount}
                </span>
              )}
            </Link>
          )}
          {user ? (
            <Button
              onClick={logoutHandler}
              className="bg-pink-600 text-white cursor-pointer"
            >
              Logout
            </Button>
          ) : (
            <Button
              onClick={() => navigate("/login")}
              className="bg-gradient-to-tl from-blue-600 to-purple-600 text-white cursor-pointer"
            >
              Login
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;