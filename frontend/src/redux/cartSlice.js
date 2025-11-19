import { createSlice } from "@reduxjs/toolkit";

// Helper function to calculate the total quantity
const calculateTotalItems = (cart) => {
    if (!cart || !cart.items || cart.items.length === 0) {
        return 0;
    }
    // Sums up the 'quantity' field from all items in the array
    return cart.items.reduce((total, item) => total + item.quantity, 0);
};

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cart: null, // This will hold the entire cart object from the backend
    loading: false,
    cartItems: [],
    cartCount: 0,
    error: null,
  },
  reducers: {
    // 1. Action to be dispatched when the API call STARTS
    addToCartStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    
    // 2. Action to be dispatched when the API call SUCCEEDS
    addToCartSuccess: (state, action) => {
      state.loading = false;
      // The backend should return the new/updated cart object.
      state.cart = action.payload; 
    },


    // 3. Action to be dispatched when the API call FAILS
    addToCartFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // A general setter, still useful for initial cart fetch
   setCartItems: (state, action) => {
            state.cartItems = action.payload;
            state.cartCount = action.payload.reduce((sum, item) => sum + item.quantity, 0);
        },
        setCartCount: (state, action) => {
            state.cartCount = action.payload;
        },
        clearCart: (state) => {
            state.cartItems = [];
            state.cartCount = 0;
        }
  },
});

export const { 
    addToCartStart, 
    addToCartSuccess, 
    addToCartFailure, 
    setCartItems,
    setCartCount,
    clearCart

} = cartSlice.actions;

export default cartSlice.reducer;