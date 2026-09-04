import React from 'react';
import { Card, Button, Space, Typography, Divider } from 'antd';
import { useGlobalState } from '../../src/index';
import type { Cart } from '../types';

const { Text } = Typography;

const initialCart: Cart = { items: [], total: 0 };

const ShoppingCart: React.FC = () => {
  const [cart, setCart, resetCart] = useGlobalState('cart', initialCart);

  const removeItem = (index: number) => {
    const newItems = [...cart.items];
    const removedItem = newItems.splice(index, 1)[0];
    setCart({
      items: newItems,
      total: cart.total - removedItem.price,
    });
  };

  return (
    <Card title="Shopping Cart" className="use-global-state-example__card">
      <Space direction="vertical" style={{ width: '100%' }}>
        {cart.items.length === 0 ? (
          <Text type="secondary">Cart is empty</Text>
        ) : (
          <>
            {cart.items.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="use-global-state-example__cart-item"
              >
                <div>
                  <Text>{item.name}</Text>
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    ${item.price}
                  </Text>
                </div>
                <Button size="small" danger onClick={() => removeItem(index)}>
                  Remove
                </Button>
              </div>
            ))}
            <Divider />
            <div className="use-global-state-example__total">
              <Text strong>Total:</Text>
              <Text strong style={{ fontSize: 20, color: '#f5222d' }}>
                ${cart.total}
              </Text>
            </div>
            <Button block onClick={resetCart}>
              Clear Cart
            </Button>
          </>
        )}
      </Space>
    </Card>
  );
};

export default ShoppingCart;
