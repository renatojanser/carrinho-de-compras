import React from 'react';
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from 'react-icons/md';

import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../util/format';
import { Container, ProductTable, Total } from './styles';

interface Product {
  id: number;
  createdAt: string;
  name: string;
  price: number;
  image: string;
  stock: number;
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();

  const cartFormatted = cart.map(product => ({
    ...product, priceFormatted: formatPrice(product.price), subtotal: formatPrice(product.price * product.stock)
  }))
  const total =
    formatPrice(
      cartFormatted.reduce((sumTotal, product) => {
        sumTotal += product.price * product.stock

        return sumTotal
      }, 0)
    )

  function handleProductIncrement(product: Product) {
    const IncrementArguments = {
      productId: product.id,
      stock: product.stock + 1
    }
    updateProductAmount(IncrementArguments)
  }

  function handleProductDecrement(product: Product) {
    const IncrementArguments = {
      productId: product.id,
      stock: product.stock - 1
    }
    updateProductAmount(IncrementArguments)
  }

  function handleRemoveProduct(productId: number) {
    removeProduct(productId)
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          {cartFormatted.map(product => (
            <tr data-testid="product" key={product.id}>
            <td>
              <img src={product.image} alt={product.name} />
            </td>
            <td>
              <strong>{product.name}</strong>
              <span>{product.priceFormatted}</span>
            </td>
            <td>
              <div>
                <button
                  type="button"
                  data-testid="decrement-product"
                  disabled={product.stock <= 1}
                  onClick={() => handleProductDecrement(product)}
                >
                  <MdRemoveCircleOutline size={20} />
                </button>
                <input
                  type="text"
                  data-testid="product-amount"
                  readOnly
                  value={product.stock}
                />
                <button
                  type="button"
                  data-testid="increment-product"
                onClick={() => handleProductIncrement(product)}
                >
                  <MdAddCircleOutline size={20} />
                </button>
              </div>
            </td>
            <td>
              <strong>{product.subtotal}</strong>
            </td>
            <td>
              <button
                type="button"
                data-testid="remove-product"
              onClick={() => handleRemoveProduct(product.id)}
              >
                <MdDelete size={20} />
              </button>
            </td>
          </tr>
          ))}
        </tbody>
      </ProductTable>

      <footer>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
