import { useState } from "react";
import { CartContext } from "./CartContextObject";
import { validateCartForAdd } from "../utils/orderGuards";

export { CartContext } from "./CartContextObject";

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addToCart = (product, note = "") => {
    const validation = validateCartForAdd(cart, product);
    if (!validation.ok) {
      window.alert(validation.message);
      return false;
    }

    const cartItem = {
      ...product,
      note,
      cartItemId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };

    setCart((prev) => [...prev, cartItem]);
    return true;
  };

  const removeFromCart = (indexToRemove) => {
    setCart((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const updateCartItemNote = (cartItemId, note) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartItemId !== cartItemId) {
          return item;
        }

        return { ...item, note };
      })
    );
  };

  const removeOneByProductId = (productId, note) => {
    setCart((prev) => {
      const indexToRemove = prev.findIndex((item) => {
        if (item.id !== productId) {
          return false;
        }

        if (note === undefined) {
          return true;
        }

        return item.note === note;
      });

      if (indexToRemove === -1) {
        return prev;
      }

      return prev.filter((_, index) => index !== indexToRemove);
    });
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        removeOneByProductId,
        updateCartItemNote,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}