import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  stock: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, stock }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@ShopCartLiven:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const productAlreadyInCart = cart.find(product => product.id === productId)

      if(!productAlreadyInCart) {
        const { data: product } = await api.get<Product>(`product/${productId}`)

        if(product.stock > 0) {
          setCart([...cart, {...product, stock: 1}])
          localStorage.setItem('@ShopCartLiven:cart', JSON.stringify([...cart, {...product, stock: 1}]))
          toast('Adicionado')
          return;
        }
      }

      if(productAlreadyInCart) {
        const { data: product } = await api.get(`product/${productId}`)

        if (product.stock > productAlreadyInCart.stock) {
          const updatedCart = cart.map(cartItem => cartItem.id === productId ? {
            ...cartItem,
            stock: Number(cartItem.stock) + 1
          } : cartItem)
  
          setCart(updatedCart)
          localStorage.setItem('@ShopCartLiven:cart', JSON.stringify(updatedCart))
          return;
        } else {
          toast.error('Quantidade solicitada fora de estoque')
        }
      }
    } catch {
      toast.error('Erro na adição do produto')
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const productExists = cart.some(cartProduct => cartProduct.id === productId)
      if(!productExists) {
        toast.error('Erro na remoção do produto');
        return
      }

      const updatedCart = cart.filter(cartItem => cartItem.id !== productId)
      setCart(updatedCart)
      localStorage.setItem('@ShopCartLiven:cart', JSON.stringify(updatedCart))
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    stock,
  }: UpdateProductAmount) => {
    try {
      if(stock < 1){
        toast.error('Erro na alteração de quantidade do produto');
        return
      }

      const response = await api.get(`/product/${productId}`);
      const productAmount = response.data.stock;
      const stockIsFree = stock > productAmount

      if(stockIsFree) {
        toast.error('Quantidade solicitada fora de estoque')
        return
      }

      const productExists = cart.some(cartProduct => cartProduct.id === productId)
      if(!productExists) {
        toast.error('Erro na alteração de quantidade do produto');
        return
      }

      const updatedCart = cart.map(cartItem => cartItem.id === productId ? {
        ...cartItem,
        stock: stock
      } : cartItem)
      setCart(updatedCart)
      localStorage.setItem('@ShopCartLiven:cart', JSON.stringify(updatedCart))
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
