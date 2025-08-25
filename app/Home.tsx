import { getUserById } from '@/services/userService';
import { useNotification } from '@/context/NotificationContext';
import {
  getOrderByIdWithLineOrders,
  getOrdersByRestaurant,
  getOrdersByStatusAndRestaurant,
  markOrderAsReady,
  updateOrderStatusRes,
  updateUserPushToken,
} from '../services/orderService';
import { Text } from 'react-native'


export default function Home() {
 return (
    <Text>Hello  world !!!
    </Text>
  );
}