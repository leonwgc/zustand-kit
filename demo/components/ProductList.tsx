import React from 'react';
import { Card, Button, Space, Typography } from 'antd';
import { useGlobalState } from '../../src/index';
import type { Cart, CartItem } from '../types';

const { Text } = Typography;

const initialCart: Cart = { items: [], total: 0 };

const products: CartItem[] = [
  { id: 1, name: 'Laptop', price: 999 },
  { id: 2, name: 'Mouse', price: 29 },
  { id: 3, name: 'Keyboard', price: 79 },
  { id: 4, name: 'Monitor', price: 299 },
];

const ProductList: React.FC = () => {
  const [cart, setCart] = useGlobalState('cart', initialCart);

  const addToCart = (product: CartItem) => {
    setCart({
      items: [...cart.items, product],
      total: cart.total + product.price,
    });
  };

  return (
    <Card title="Product List" className="use-global-state-example__card">
      <Space direction="vertical" style={{ width: '100%' }}>
        {products.map((product) => (
          <div key={product.id} className="use-global-state-example__product">
            <div>
              <Text strong>{product.name}</Text>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                ${product.price}
              </Text>
            </div>
            <Button
              size="small"
              type="primary"
              onClick={() => addToCart(product)}
            >
              Add to Cart
            </Button>
          </div>
        ))}
      </Space>
    </Card>
  );
};

export default ProductList;
