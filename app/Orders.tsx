// import AsyncStorage from '@react-native-async-storage/async-storage';
// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   Modal,
//   Button,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';

// // Import your services
// import {
//   getOrderByIdWithLineOrders,
//   getOrdersByStatusAndRestaurant,
//   markOrderAsReady,
//   updateOrderStatusRes,
// } from '../services/orders';

// const Orders = ({ userId: propUserId }) => {
//   // State management
//   const [pendingOrders, setPendingOrders] = useState([]);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [orderLines, setOrderLines] = useState([]);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [userId, setUserId] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isAcceptRefuseModalVisible, setIsAcceptRefuseModalVisible] = useState(false);
//   const [selectedOrderForDecision, setSelectedOrderForDecision] = useState(null);
//   const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
//   const [selectedOrderForStatus, setSelectedOrderForStatus] = useState(null);
//   const [isReadyStatusModalVisible, setIsReadyStatusModalVisible] = useState(false);
//   const [selectedOrderForReadyStatus, setSelectedOrderForReadyStatus] = useState(null);

//   // Refs
//   const isMounted = useRef(true);

//   // Load user ID from AsyncStorage if not provided as prop
//   const loadUserId = useCallback(async () => {
//     try {
//       const id = await AsyncStorage.getItem('id');
//       if (!id) {
//         console.error('User ID not found');
//         return null;
//       }
//       return id;
//     } catch (error) {
//       console.error('Error loading user ID:', error);
//       return null;
//     }
//   }, []);

//   // Use prop userId or load from storage
//   useEffect(() => {
//     const initializeUserId = async () => {
//       if (propUserId) {
//         setUserId(propUserId);
//       } else {
//         const id = await loadUserId();
//         if (id) {
//           setUserId(id);
//         }
//       }
//     };
//     initializeUserId();
//   }, [propUserId, loadUserId]);

//   // Memoized sort function for orders
//   const sortedPendingOrders = useMemo(() => {
//     return [...pendingOrders].sort(
//       (a, b) => new Date(b.order_date) - new Date(a.order_date),
//     );
//   }, [pendingOrders]);

//   // Fetch orders
//   const fetchOrders = useCallback(async (currentUserId) => {
//     if (!currentUserId) return;
//     console.log('Fetching orders for user:', currentUserId);

//     try {
//       const orders = await getOrdersByStatusAndRestaurant(currentUserId);

//       if (!isMounted.current) return;

//       const formattedOrders = orders
//         .map((order) => ({
//           ...order,
//           isReady: order.status === 'Prête' || order.restaurant_status === 'Prête',
//         }))
//         .sort((a, b) => new Date(b.order_date) - new Date(a.order_date));

//       setPendingOrders(formattedOrders);
//     } catch (error) {
//       console.error('Error fetching orders:', error);
//       throw error;
//     }
//   }, []);

//   // Initialize component
//   useEffect(() => {
//     const initialize = async () => {
//       if (!userId) return;
      
//       console.log('Initializing order display');
//       setIsLoading(true);
//       try {
//         await fetchOrders(userId);
//       } catch (error) {
//         console.error('Initialization error:', error);
//         setError('Failed to load orders');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     initialize();
//   }, [userId, fetchOrders]);

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       console.log('OrderDisplay component unmounting');
//       isMounted.current = false;
//     };
//   }, []);

//   // Check if order is cancelled
//   const checkIfOrderCancelled = async (orderId) => {
//     try {
//       const response = await getOrderByIdWithLineOrders(orderId);
//       if (!response) {
//         Alert.alert(
//           'Commande introuvable',
//           "Cette commande n'existe plus. Merci d'actualiser la page.",
//           [
//             {
//               text: 'Actualiser',
//               onPress: async () => {
//                 if (userId) {
//                   await fetchOrders(userId);
//                 }
//               },
//             },
//           ],
//           { cancelable: false }
//         );
//         return true;
//       }

//       const orderStatus = response.restaurant_status || response.status;
//       if (orderStatus === 'Annulée') {
//         Alert.alert(
//           'Commande annulée',
//           "Cette commande a été annulée. Merci d'actualiser la page.",
//           [
//             {
//               text: 'Actualiser',
//               onPress: async () => {
//                 if (userId) {
//                   await fetchOrders(userId);
//                 }
//               },
//             },
//           ],
//           { cancelable: false }
//         );
//         return true;
//       }

//       return false;
//     } catch (error) {
//       console.error('Error checking if order is cancelled:', error);
//       return false;
//     }
//   };

//   // Handle order ready
//   const handleOrderReady = async (orderId) => {
//     try {
//       const response = await getOrderByIdWithLineOrders(orderId);

//       if (!response) {
//         throw new Error('Commande non trouvée');
//       }

//       const orderStatus = response.status || response.restaurant_status;
//       if (orderStatus === 'Annulée') {
//         Alert.alert(
//           'Commande annulée',
//           "Cette commande a été annulée. Merci d'actualiser la page.",
//           [
//             {
//               text: 'Actualiser',
//               onPress: async () => {
//                 if (userId) {
//                   await fetchOrders(userId);
//                 }
//               },
//             },
//           ],
//           { cancelable: false }
//         );
//         return;
//       }

//       await markOrderAsReady(orderId);
//       await fetchOrders(userId);

//     } catch (error) {
//       console.error('Erreur lors de la tentative de marquer la commande comme prête:', error);
//       Alert.alert('Erreur', 'Impossible de marquer la commande comme prête');
//     }
//   };

//   // Show order details
//   const showOrderDetails = async (order) => {
//     try {
//       const response = await getOrderByIdWithLineOrders(order.id);

//       if (!response) {
//         throw new Error('Commande non trouvée');
//       }

//       const orderStatus = response.status || response.restaurant_status;
//       if (orderStatus === 'Annulée') {
//         Alert.alert(
//           'Commande annulée',
//           "Cette commande a été annulée. Merci d'actualiser la page.",
//           [
//             {
//               text: 'Actualiser',
//               onPress: async () => {
//                 if (userId) {
//                   await fetchOrders(userId);
//                 }
//               },
//             },
//           ],
//           { cancelable: false }
//         );
//         return;
//       }

//       setSelectedOrder(response);
//       setOrderLines(response?.lines_order || []);
//       setIsModalVisible(true);

//     } catch (error) {
//       console.error('Erreur lors de l\'affichage des détails de la commande:', error);
//       Alert.alert('Erreur', 'Impossible de charger les détails de la commande');
//     }
//   };

//   // Modal functions
//   const showAcceptRefuseModal = (order) => {
//     setSelectedOrderForDecision(order);
//     setIsAcceptRefuseModalVisible(true);
//   };

//   const showStatusModal = (order) => {
//     setSelectedOrderForStatus(order);
//     setIsStatusModalVisible(true);
//   };

//   const showReadyStatusModal = (order) => {
//     setSelectedOrderForReadyStatus(order);
//     setIsReadyStatusModalVisible(true);
//   };

//   // Handle accept order
//   const handleAcceptOrder = async () => {
//     console.log('Accepting order:', selectedOrderForDecision);
    
//     const isCancelled = await checkIfOrderCancelled(selectedOrderForDecision.id);
//     if (isCancelled) {
//       setIsAcceptRefuseModalVisible(false);
//       setSelectedOrderForDecision(null);
//       return;
//     }

//     try {
//       await updateOrderStatusRes(selectedOrderForDecision.id, 'accepted_by_restaurant');
      
//       setPendingOrders((prevOrders) =>
//         prevOrders.map((order) =>
//           order.id === selectedOrderForDecision.id
//             ? { ...order, status: 'accepted_by_restaurant', restaurant_status: 'accepted_by_restaurant', isReady: false }
//             : order,
//         ),
//       );

//       await fetchOrders(userId);
//       setIsAcceptRefuseModalVisible(false);
//       setSelectedOrderForDecision(null);
//       Alert.alert('Succès', 'Commande acceptée avec succès');
//     } catch (error) {
//       console.error('Error accepting order:', error);
//       Alert.alert('Erreur', 'Impossible d\'accepter la commande');
//     }
//   };

//   // Handle refuse order
//   const handleRefuseOrder = async () => {
//     console.log('Refusing order:', selectedOrderForDecision);
    
//     const isCancelled = await checkIfOrderCancelled(selectedOrderForDecision.id);
//     if (isCancelled) {
//       setIsAcceptRefuseModalVisible(false);
//       setSelectedOrderForDecision(null);
//       return;
//     }

//     try {
//       await updateOrderStatusRes(selectedOrderForDecision.id, 'refused_by_restaurant');
      
//       setPendingOrders((prevOrders) =>
//         prevOrders.map((order) =>
//           order.id === selectedOrderForDecision.id
//             ? { ...order, status: 'refused_by_restaurant', restaurant_status: 'refused_by_restaurant' }
//             : order,
//         ),
//       );

//       await fetchOrders(userId);
//       setIsAcceptRefuseModalVisible(false);
//       setSelectedOrderForDecision(null);
//       Alert.alert('Succès', 'Commande refusée');
//     } catch (error) {
//       console.error('Error refusing order:', error);
//       Alert.alert('Erreur', 'Impossible de refuser la commande');
//     }
//   };

//   // Handle status change
//   const handleStatusChange = async () => {
//     if (!selectedOrderForStatus) return;
    
//     try {
//       const isCancelled = await checkIfOrderCancelled(selectedOrderForStatus.id);
//       if (isCancelled) {
//         setIsStatusModalVisible(false);
//         setSelectedOrderForStatus(null);
//         return;
//       }

//       await updateOrderStatusRes(selectedOrderForStatus.id, 'Prête');
      
//       setPendingOrders((prevOrders) =>
//         prevOrders.map((order) =>
//           order.id === selectedOrderForStatus.id
//             ? { ...order, status: 'Prête', restaurant_status: 'Prête', isReady: true }
//             : order,
//         ),
//       );

//       await fetchOrders(userId);
//       setIsStatusModalVisible(false);
//       setSelectedOrderForStatus(null);
//       Alert.alert('Succès', 'Statut de la commande mis à jour');
//     } catch (error) {
//       console.error('Error updating order status:', error);
//       Alert.alert('Erreur', 'Impossible de mettre à jour le statut de la commande');
//     }
//   };

//   // Handle ready status change
//   const handleReadyStatusChange = async (newStatus) => {
//     if (!selectedOrderForReadyStatus) return;
    
//     try {
//       const isCancelled = await checkIfOrderCancelled(selectedOrderForReadyStatus.id);
//       if (isCancelled) {
//         setIsReadyStatusModalVisible(false);
//         setSelectedOrderForReadyStatus(null);
//         return;
//       }

//       await updateOrderStatusRes(selectedOrderForReadyStatus.id, newStatus);
      
//       setPendingOrders((prevOrders) =>
//         prevOrders.map((order) =>
//           order.id === selectedOrderForReadyStatus.id
//             ? { ...order, status: newStatus, restaurant_status: newStatus, isReady: newStatus === 'Prête' }
//             : order,
//         ),
//       );

//       await fetchOrders(userId);
//       setIsReadyStatusModalVisible(false);
//       setSelectedOrderForReadyStatus(null);
//       Alert.alert('Succès', 'Statut de la commande mis à jour');
//     } catch (error) {
//       console.error('Error updating order status:', error);
//       Alert.alert('Erreur', 'Impossible de mettre à jour le statut de la commande');
//     }
//   };

//   // Retry function
//   const handleRetry = useCallback(async () => {
//     setError(null);
//     setIsLoading(true);

//     try {
//       if (userId && isMounted.current) {
//         await fetchOrders(userId);
//       }
//     } catch (error) {
//       console.error('Retry error:', error);
//       setError('Failed to load orders');
//     } finally {
//       if (isMounted.current) {
//         setIsLoading(false);
//       }
//     }
//   }, [userId, fetchOrders]);

//   // Render order card
//   const renderOrderCard = (order) => {
//     const orderStatus = order.restaurant_status || order.status;
    
//     const canAcceptRefuse = orderStatus !== 'accepted_by_restaurant' && 
//                            orderStatus !== 'refused_by_restaurant' && 
//                            orderStatus !== 'Annulée' && 
//                            orderStatus !== 'Prête';
    
//     const canChangeStatus = orderStatus === 'accepted_by_restaurant' && 
//                            orderStatus !== 'Prête' && 
//                            orderStatus !== 'Annulée';
                           
//     const canChangeReadyStatus = orderStatus === 'Prête' && 
//                                 orderStatus !== 'Annulée';
    
//     return (
//       <View
//         key={order.id}
//         styles={[
//           styles.orderCard, 
//           order.isReady && styles.orderReady,
//           orderStatus === 'refused_by_restaurant' && styles.orderRefused
//         ]}
//       >
//         <View style={styles.orderInfo}>
//           <Text style={styles.orderTitle}>Commande #{order.id}</Text>
//           <Text>
//             Client:{' '}
//             {order.client?.first_name
//               ? `${order.client.first_name} ${order.client.last_name}`
//               : order.name_client}
//           </Text>
//           <Text>Total: {order.total.toFixed(2)} TND</Text>
//           <Text>Statut: {orderStatus}</Text>
//           <Text style={styles.orderDate}>
//             {new Date(order.order_date).toLocaleDateString('fr-FR', {
//               day: '2-digit',
//               month: '2-digit',
//               year: 'numeric',
//               hour: '2-digit',
//               minute: '2-digit'
//             })}
//           </Text>
//         </View>
//         <View style={styles.iconGroup}>
//           {/* Accept/Refuse Icon */}
//           {canAcceptRefuse && (
//             <TouchableOpacity 
//               style={styles.actionButton}
//               onPress={() => showAcceptRefuseModal(order)}
//             >
//               <Text style={[styles.iconText, { color: '#FF9800' }]}>❓</Text>
//             </TouchableOpacity>
//           )}
          
//           {/* Status Change Icon */}
//           {canChangeStatus && (
//             <TouchableOpacity 
//               style={styles.actionButton}
//               onPress={() => showStatusModal(order)}
//             >
//               <Text style={[styles.iconText, { color: '#2196F3' }]}>🍽️</Text>
//             </TouchableOpacity>
//           )}
          
//           {/* Ready Status Change Icon */}
//           {canChangeReadyStatus && (
//             <TouchableOpacity 
//               style={styles.actionButton}
//               onPress={() => showReadyStatusModal(order)}
//             >
//               <Text style={[styles.iconText, { color: '#4CAF50' }]}>🔄</Text>
//             </TouchableOpacity>
//           )}
          
//           {/* Ready Icon */}
//           {orderStatus === 'accepted_by_restaurant' && (
//             <TouchableOpacity
//               style={styles.actionButton}
//               onPress={() => !order.isReady && handleOrderReady(order.id)}
//               disabled={order.isReady}
//             >
//               <Text style={[styles.iconText, { color: order.isReady ? 'green' : 'gray' }]}>
//                 {order.isReady ? '✅' : '⭕'}
//               </Text>
//             </TouchableOpacity>
//           )}
          
//           {/* View Details Icon */}
//           <TouchableOpacity 
//             style={styles.actionButton}
//             onPress={() => showOrderDetails(order)}
//           >
//             <Text style={[styles.iconText, { color: '#666' }]}>👁️</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#2196F3" />
//         <Text style={styles.loadingText}>Chargement des commandes...</Text>
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.errorContainer}>
//         <Text style={styles.errorText}>{error}</Text>
//         <TouchableOpacity
//           style={styles.retryButton}
//           onPress={handleRetry}
//         >
//           <Text style={styles.retryButtonText}>Réessayer</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* Orders List */}
//       <Text style={styles.sectionTitle}>Commandes ({pendingOrders.length})</Text>
//       <ScrollView style={styles.orderList} showsVerticalScrollIndicator={false}>
//         {sortedPendingOrders.length > 0 ? (
//           sortedPendingOrders.map(renderOrderCard)
//         ) : (
//           <View style={styles.noOrdersContainer}>
//             <Text style={styles.noOrdersEmoji}>📋</Text>
//             <Text style={styles.noOrders}>Aucune commande en attente</Text>
//           </View>
//         )}
//       </ScrollView>

//       {/* Order Details Modal */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={isModalVisible}
//         onRequestClose={() => setIsModalVisible(false)}
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>
//               Détails de la commande #{selectedOrder?.id}
//             </Text>

//             {selectedOrder && (
//               <>
//                 <View style={styles.orderDetailSection}>
//                   <Text style={styles.detailLabel}>Client:</Text>
//                   <Text style={styles.detailValue}>
//                     {selectedOrder.client?.first_name
//                       ? `${selectedOrder.client.first_name} ${selectedOrder.client.last_name}`
//                       : selectedOrder.name_client}
//                   </Text>
//                 </View>

//                 <View style={styles.orderDetailSection}>
//                   <Text style={styles.detailLabel}>Total:</Text>
//                   <Text style={styles.detailValue}>{selectedOrder.total.toFixed(2)} TND</Text>
//                 </View>

//                 <View style={styles.orderDetailSection}>
//                   <Text style={styles.detailLabel}>Statut:</Text>
//                   <Text style={styles.detailValue}>{selectedOrder.restaurant_status || selectedOrder.status}</Text>
//                 </View>

//                 <View style={styles.orderDetailSection}>
//                   <Text style={styles.detailLabel}>Date:</Text>
//                   <Text style={styles.detailValue}>
//                     {new Date(selectedOrder.order_date).toLocaleDateString('fr-FR', {
//                       day: '2-digit',
//                       month: '2-digit',
//                       year: 'numeric',
//                       hour: '2-digit',
//                       minute: '2-digit'
//                     })}
//                   </Text>
//                 </View>

//                 {selectedOrder.ingredientExclure && (
//                   <View style={styles.orderDetailSection}>
//                     <Text style={styles.detailLabel}>Ingrédients à exclure:</Text>
//                     <Text style={styles.detailValue}>{selectedOrder.ingredientExclure}</Text>
//                   </View>
//                 )}

//                 <Text style={styles.sectionTitle}>Articles commandés</Text>
//                 <ScrollView style={styles.lineOrderContainer}>
//                   {orderLines.map((line, index) => (
//                     <View key={index} style={styles.lineOrderItem}>
//                       <Text style={styles.lineOrderText}>Quantité: {line.quantity}</Text>
//                       <Text style={styles.lineOrderText}>
//                         Prix unitaire: {line.unit_price.toFixed(2)} TND
//                       </Text>
//                       {line.menu && <Text style={styles.lineOrderText}>Menu: {line.menu.name}</Text>}
//                     </View>
//                   ))}
//                 </ScrollView>
//               </>
//             )}

//             <TouchableOpacity
//               style={styles.closeModalButton}
//               onPress={() => setIsModalVisible(false)}
//             >
//               <Text style={styles.closeModalButtonText}>Fermer</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       {/* Accept/Refuse Modal */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={isAcceptRefuseModalVisible}
//         onRequestClose={() => setIsAcceptRefuseModalVisible(false)}
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>
//               Décision pour la commande #{selectedOrderForDecision?.id}
//             </Text>
            
//             {selectedOrderForDecision && (
//               <View style={styles.orderSummary}>
//                 <Text style={styles.orderSummaryText}>
//                   Client: {selectedOrderForDecision.client?.first_name
//                     ? `${selectedOrderForDecision.client.first_name} ${selectedOrderForDecision.client.last_name}`
//                     : selectedOrderForDecision.name_client}
//                 </Text>
//                 <Text style={styles.orderSummaryText}>
//                   Total: {selectedOrderForDecision.total.toFixed(2)} TND
//                 </Text>
//                 <Text style={styles.orderSummaryText}>
//                   Date: {new Date(selectedOrderForDecision.order_date).toLocaleDateString('fr-FR')}
//                 </Text>
//               </View>
//             )}
            
//             <Text style={styles.decisionQuestion}>
//               Voulez-vous accepter ou refuser cette commande ?
//             </Text>
            
//             <View style={styles.decisionButtons}>
//               <TouchableOpacity
//                 style={[styles.decisionButton, styles.acceptButton]}
//                 onPress={handleAcceptOrder}
//               >
//                 <Text style={styles.buttonTitle}>Accepter</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[styles.decisionButton, styles.refuseButton]}
//                 onPress={handleRefuseOrder}
//               >
//                 <Text style={styles.buttonTitle}>Refuser</Text>
//               </TouchableOpacity>
//             </View>
            
//             <TouchableOpacity
//               style={styles.cancelButton}
//               onPress={() => setIsAcceptRefuseModalVisible(false)}
//             >
//               <Text style={styles.buttonTitle}>Annuler</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       {/* Status Modal */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={isStatusModalVisible}
//         onRequestClose={() => setIsStatusModalVisible(false)}
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>
//               Statut de la commande #{selectedOrderForStatus?.id}
//             </Text>
            
//             {selectedOrderForStatus && (
//               <View style={styles.orderSummary}>
//                 <Text style={styles.orderSummaryText}>
//                   Client: {selectedOrderForStatus.client?.first_name
//                     ? `${selectedOrderForStatus.client.first_name} ${selectedOrderForStatus.client.last_name}`
//                     : selectedOrderForStatus.name_client}
//                 </Text>
//                 <Text style={styles.orderSummaryText}>
//                   Total: {selectedOrderForStatus.total.toFixed(2)} TND
//                 </Text>
//               </View>
//             )}
            
//             <Text style={styles.decisionQuestion}>
//               La commande est-elle prête ?
//             </Text>
            
//             <View style={styles.decisionButtons}>
//               <TouchableOpacity
//                 style={[styles.decisionButton, styles.acceptButton]}
//                 onPress={handleStatusChange}
//               >
//                 <Text style={styles.buttonTitle}>Oui</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[styles.decisionButton, styles.refuseButton]}
//                 onPress={() => setIsStatusModalVisible(false)}
//               >
//                 <Text style={styles.buttonTitle}>Non</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* Ready Status Modal */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={isReadyStatusModalVisible}
//         onRequestClose={() => setIsReadyStatusModalVisible(false)}
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>
//               Changer le statut de la commande #{selectedOrderForReadyStatus?.id}
//             </Text>
            
//             {selectedOrderForReadyStatus && (
//               <View style={styles.orderSummary}>
//                 <Text style={styles.orderSummaryText}>
//                   Client: {selectedOrderForReadyStatus.client?.first_name
//                     ? `${selectedOrderForReadyStatus.client.first_name} ${selectedOrderForReadyStatus.client.last_name}`
//                     : selectedOrderForReadyStatus.name_client}
//                 </Text>
//                 <Text style={styles.orderSummaryText}>
//                   Total: {selectedOrderForReadyStatus.total.toFixed(2)} TND
//                 </Text>
//                 <Text style={styles.orderSummaryText}>
//                   Statut actuel: {selectedOrderForReadyStatus.restaurant_status || selectedOrderForReadyStatus.status}
//                 </Text>
//               </View>
//             )}
            
//             <Text style={styles.decisionQuestion}>
//               Choisissez le nouveau statut :
//             </Text>
            
//             <View style={styles.decisionButtons}>
//               <TouchableOpacity
//                 style={[styles.decisionButton, styles.acceptButton]}
//                 onPress={() => handleReadyStatusChange('En cours')}
//               >
//                 <Text style={styles.buttonTitle}>En cours</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[styles.decisionButton, styles.refuseButton]}
//                 onPress={() => handleReadyStatusChange('Prête')}
//               >
//                 <Text style={styles.buttonTitle}>Prête</Text>
//               </TouchableOpacity>
//             </View>
            
//             <TouchableOpacity
//               style={styles.cancelButton}
//               onPress={() => setIsReadyStatusModalVisible(false)}
//             >
//               <Text style={styles.buttonTitle}>Annuler</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: '#f8f9fa',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f8f9fa',
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#666',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 16,
//     backgroundColor: '#f8f9fa',
//   },
//   errorText: {
//     fontSize: 16,
//     color: '#d32f2f',
//     textAlign: 'center',
//     marginBottom: 16,
//   },
//   retryButton: {
//     backgroundColor: '#2196F3',
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 8,
//   },
//   retryButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 16,
//     color: '#333',
//   },
//   orderList: {
//     flex: 1,
//   },
//   orderCard: {
//     backgroundColor: 'white',
//     padding: 16,
//     marginBottom: 12,
//     borderRadius: 12,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   orderReady: {
//     backgroundColor: '#e8f5e8',
//     borderLeftWidth: 4,
//     borderLeftColor: '#4CAF50',
//   },
//   orderRefused: {
//     backgroundColor: '#ffebee',
//     borderLeftWidth: 4,
//     borderLeftColor: '#f44336',
//   },
//   orderInfo: {
//     flex: 1,
//     paddingRight: 10,
//   },
//   orderTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 4,
//     color: '#333',
//   },
//   orderDate: {
//     fontSize: 12,
//     color: '#666',
//     marginTop: 4,
//   },
//   iconGroup: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   actionButton: {
//     padding: 8,
//     borderRadius: 8,
//     backgroundColor: '#f0f0f0',
//   },
//   iconText: {
//     fontSize: 20,
//   },
//   noOrdersContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 40,
//   },
//   noOrdersEmoji: {
//     fontSize: 48,
//     marginBottom: 16,
//   },
//   noOrders: {
//     textAlign: 'center',
//     fontSize: 16,
//     color: '#666',
//     fontStyle: 'italic',
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   modalContent: {
//     backgroundColor: 'white',
//     padding: 24,
//     borderRadius: 16,
//     width: '90%',
//     maxHeight: '80%',
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//     color: '#333',
//   },
//   orderDetailSection: {
//     flexDirection: 'row',
//     marginBottom: 8,
//     alignItems: 'flex-start',
//   },
//   detailLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#666',
//     width: 80,
//     marginRight: 8,
//   },
//   detailValue: {
//     fontSize: 14,
//     color: '#333',
//     flex: 1,
//   },
//   lineOrderContainer: {
//     maxHeight: 200,
//     marginBottom: 20,
//   },
//   lineOrderItem: {
//     backgroundColor: '#f8f9fa',
//     padding: 12,
//     marginBottom: 8,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#e9ecef',
//   },
//   lineOrderText: {
//     fontSize: 14,
//     color: '#333',
//     marginBottom: 2,
//   },
//   closeModalButton: {
//     backgroundColor: '#6c757d',
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   closeModalButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   orderSummary: {
//     backgroundColor: '#f8f9fa',
//     padding: 16,
//     borderRadius: 8,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: '#e9ecef',
//   },
//   orderSummaryText: {
//     fontSize: 14,
//     marginBottom: 6,
//     color: '#333',
//   },
//   decisionQuestion: {
//     fontSize: 16,
//     textAlign: 'center',
//     marginBottom: 24,
//     color: '#333',
//     fontWeight: '500',
//   },
//   decisionButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginBottom: 16,
//     gap: 12,
//   },
//   decisionButton: {
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 8,
//     flex: 1,
//     alignItems: 'center',
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 2,
//   },
//   acceptButton: {
//     backgroundColor: '#28a745',
//   },
//   refuseButton: {
//     backgroundColor: '#dc3545',
//   },
//   cancelButton: {
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 8,
//     backgroundColor: '#6c757d',
//     alignItems: 'center',
//   },
//   buttonTitle: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
//   }
// });
// export default Orders;
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Import your services
import {
  getOrderByIdWithLineOrders,
  getOrdersByStatusAndRestaurant,
  markOrderAsReady,
  updateOrderStatusRes,
} from '../services/orders';

const { width } = Dimensions.get('window');

const Orders = ({ userId: propUserId }) => {
  // State management
  const [pendingOrders, setPendingOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderLines, setOrderLines] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAcceptRefuseModalVisible, setIsAcceptRefuseModalVisible] = useState(false);
  const [selectedOrderForDecision, setSelectedOrderForDecision] = useState(null);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState(null);
  const [isReadyStatusModalVisible, setIsReadyStatusModalVisible] = useState(false);
  const [selectedOrderForReadyStatus, setSelectedOrderForReadyStatus] = useState(null);

  // Refs
  const isMounted = useRef(true);

  // Load user ID from AsyncStorage if not provided as prop
  const loadUserId = useCallback(async () => {
    try {
      const id = await AsyncStorage.getItem('id');
      if (!id) {
        console.error('User ID not found');
        return null;
      }
      return id;
    } catch (error) {
      console.error('Error loading user ID:', error);
      return null;
    }
  }, []);

  // Use prop userId or load from storage
  useEffect(() => {
    const initializeUserId = async () => {
      if (propUserId) {
        setUserId(propUserId);
      } else {
        const id = await loadUserId();
        if (id) {
          setUserId(id);
        }
      }
    };
    initializeUserId();
  }, [propUserId, loadUserId]);

  // Memoized sort function for orders
  const sortedPendingOrders = useMemo(() => {
    return [...pendingOrders].sort(
      (a, b) => new Date(b.order_date) - new Date(a.order_date),
    );
  }, [pendingOrders]);

  // Fetch orders
  const fetchOrders = useCallback(async (currentUserId) => {
    if (!currentUserId) return;
    console.log('Fetching orders for user:', currentUserId);

    try {
      const orders = await getOrdersByStatusAndRestaurant(currentUserId);

      if (!isMounted.current) return;

      const formattedOrders = orders
        .map((order) => ({
          ...order,
          isReady: order.status === 'Prête' || order.restaurant_status === 'Prête',
        }))
        .sort((a, b) => new Date(b.order_date) - new Date(a.order_date));

      setPendingOrders(formattedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }, []);

  // Initialize component
  useEffect(() => {
    const initialize = async () => {
      if (!userId) return;
      
      console.log('Initializing order display');
      setIsLoading(true);
      try {
        await fetchOrders(userId);
      } catch (error) {
        console.error('Initialization error:', error);
        setError('Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [userId, fetchOrders]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('OrderDisplay component unmounting');
      isMounted.current = false;
    };
  }, []);

  // Check if order is cancelled
  const checkIfOrderCancelled = async (orderId) => {
    try {
      const response = await getOrderByIdWithLineOrders(orderId);
      if (!response) {
        Alert.alert(
          'Commande introuvable',
          "Cette commande n'existe plus. Merci d'actualiser la page.",
          [
            {
              text: 'Actualiser',
              onPress: async () => {
                if (userId) {
                  await fetchOrders(userId);
                }
              },
            },
          ],
          { cancelable: false }
        );
        return true;
      }

      const orderStatus = response.restaurant_status || response.status;
      if (orderStatus === 'Annulée') {
        Alert.alert(
          'Commande annulée',
          "Cette commande a été annulée. Merci d'actualiser la page.",
          [
            {
              text: 'Actualiser',
              onPress: async () => {
                if (userId) {
                  await fetchOrders(userId);
                }
              },
            },
          ],
          { cancelable: false }
        );
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking if order is cancelled:', error);
      return false;
    }
  };

  // Handle order ready
  const handleOrderReady = async (orderId) => {
    try {
      const response = await getOrderByIdWithLineOrders(orderId);

      if (!response) {
        throw new Error('Commande non trouvée');
      }

      const orderStatus = response.status || response.restaurant_status;
      if (orderStatus === 'Annulée') {
        Alert.alert(
          'Commande annulée',
          "Cette commande a été annulée. Merci d'actualiser la page.",
          [
            {
              text: 'Actualiser',
              onPress: async () => {
                if (userId) {
                  await fetchOrders(userId);
                }
              },
            },
          ],
          { cancelable: false }
        );
        return;
      }

      await markOrderAsReady(orderId);
      await fetchOrders(userId);

    } catch (error) {
      console.error('Erreur lors de la tentative de marquer la commande comme prête:', error);
      Alert.alert('Erreur', 'Impossible de marquer la commande comme prête');
    }
  };

  // Show order details
  const showOrderDetails = async (order) => {
    try {
      const response = await getOrderByIdWithLineOrders(order.id);

      if (!response) {
        throw new Error('Commande non trouvée');
      }

      const orderStatus = response.status || response.restaurant_status;
      if (orderStatus === 'Annulée') {
        Alert.alert(
          'Commande annulée',
          "Cette commande a été annulée. Merci d'actualiser la page.",
          [
            {
              text: 'Actualiser',
              onPress: async () => {
                if (userId) {
                  await fetchOrders(userId);
                }
              },
            },
          ],
          { cancelable: false }
        );
        return;
      }

      setSelectedOrder(response);
      setOrderLines(response?.lines_order || []);
      setIsModalVisible(true);

    } catch (error) {
      console.error('Erreur lors de l\'affichage des détails de la commande:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails de la commande');
    }
  };

  // Modal functions
  const showAcceptRefuseModal = (order) => {
    setSelectedOrderForDecision(order);
    setIsAcceptRefuseModalVisible(true);
  };

  const showStatusModal = (order) => {
    setSelectedOrderForStatus(order);
    setIsStatusModalVisible(true);
  };

  const showReadyStatusModal = (order) => {
    setSelectedOrderForReadyStatus(order);
    setIsReadyStatusModalVisible(true);
  };

  // Handle accept order
  const handleAcceptOrder = async () => {
    console.log('Accepting order:', selectedOrderForDecision);
    
    const isCancelled = await checkIfOrderCancelled(selectedOrderForDecision.id);
    if (isCancelled) {
      setIsAcceptRefuseModalVisible(false);
      setSelectedOrderForDecision(null);
      return;
    }

    try {
      await updateOrderStatusRes(selectedOrderForDecision.id, 'accepted_by_restaurant');
      
      setPendingOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === selectedOrderForDecision.id
            ? { ...order, status: 'accepted_by_restaurant', restaurant_status: 'accepted_by_restaurant', isReady: false }
            : order,
        ),
      );

      await fetchOrders(userId);
      setIsAcceptRefuseModalVisible(false);
      setSelectedOrderForDecision(null);
      Alert.alert('Succès', 'Commande acceptée avec succès');
    } catch (error) {
      console.error('Error accepting order:', error);
      Alert.alert('Erreur', 'Impossible d\'accepter la commande');
    }
  };

  // Handle refuse order
  const handleRefuseOrder = async () => {
    console.log('Refusing order:', selectedOrderForDecision);
    
    const isCancelled = await checkIfOrderCancelled(selectedOrderForDecision.id);
    if (isCancelled) {
      setIsAcceptRefuseModalVisible(false);
      setSelectedOrderForDecision(null);
      return;
    }

    try {
      await updateOrderStatusRes(selectedOrderForDecision.id, 'refused_by_restaurant');
      
      setPendingOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === selectedOrderForDecision.id
            ? { ...order, status: 'refused_by_restaurant', restaurant_status: 'refused_by_restaurant' }
            : order,
        ),
      );

      await fetchOrders(userId);
      setIsAcceptRefuseModalVisible(false);
      setSelectedOrderForDecision(null);
      Alert.alert('Succès', 'Commande refusée');
    } catch (error) {
      console.error('Error refusing order:', error);
      Alert.alert('Erreur', 'Impossible de refuser la commande');
    }
  };

  // Handle status change
  const handleStatusChange = async () => {
    if (!selectedOrderForStatus) return;
    
    try {
      const isCancelled = await checkIfOrderCancelled(selectedOrderForStatus.id);
      if (isCancelled) {
        setIsStatusModalVisible(false);
        setSelectedOrderForStatus(null);
        return;
      }

      await updateOrderStatusRes(selectedOrderForStatus.id, 'Prête');
      
      setPendingOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === selectedOrderForStatus.id
            ? { ...order, status: 'Prête', restaurant_status: 'Prête', isReady: true }
            : order,
        ),
      );

      await fetchOrders(userId);
      setIsStatusModalVisible(false);
      setSelectedOrderForStatus(null);
      Alert.alert('Succès', 'Statut de la commande mis à jour');
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut de la commande');
    }
  };

  // Handle ready status change
  const handleReadyStatusChange = async (newStatus) => {
    if (!selectedOrderForReadyStatus) return;
    
    try {
      const isCancelled = await checkIfOrderCancelled(selectedOrderForReadyStatus.id);
      if (isCancelled) {
        setIsReadyStatusModalVisible(false);
        setSelectedOrderForReadyStatus(null);
        return;
      }

      await updateOrderStatusRes(selectedOrderForReadyStatus.id, newStatus);
      
      setPendingOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === selectedOrderForReadyStatus.id
            ? { ...order, status: newStatus, restaurant_status: newStatus, isReady: newStatus === 'Prête' }
            : order,
        ),
      );

      await fetchOrders(userId);
      setIsReadyStatusModalVisible(false);
      setSelectedOrderForReadyStatus(null);
      Alert.alert('Succès', 'Statut de la commande mis à jour');
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut de la commande');
    }
  };

  // Retry function
  const handleRetry = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      if (userId && isMounted.current) {
        await fetchOrders(userId);
      }
    } catch (error) {
      console.error('Retry error:', error);
      setError('Failed to load orders');
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [userId, fetchOrders]);

  // Get status color and style
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Prête':
        return {
          backgroundColor: '#ECFDF5',
          borderColor: '#10B981',
          textColor: '#059669',
          icon: '✓'
        };
      case 'accepted_by_restaurant':
        return {
          backgroundColor: '#EFF6FF',
          borderColor: '#3B82F6',
          textColor: '#1E40AF',
          icon: '🍳'
        };
      case 'refused_by_restaurant':
        return {
          backgroundColor: '#FEF2F2',
          borderColor: '#EF4444',
          textColor: '#DC2626',
          icon: '✗'
        };
      case 'En cours':
        return {
          backgroundColor: '#FFFBEB',
          borderColor: '#F59E0B',
          textColor: '#D97706',
          icon: '⏳'
        };
      default:
        return {
          backgroundColor: '#F3F4F6',
          borderColor: '#9CA3AF',
          textColor: '#6B7280',
          icon: '❓'
        };
    }
  };

  // Render order card
  const renderOrderCard = (order) => {
    const orderStatus = order.restaurant_status || order.status;
    const statusStyle = getStatusStyle(orderStatus);
    
    const canAcceptRefuse = orderStatus !== 'accepted_by_restaurant' && 
                           orderStatus !== 'refused_by_restaurant' && 
                           orderStatus !== 'Annulée' && 
                           orderStatus !== 'Prête';
    
    const canChangeStatus = orderStatus === 'accepted_by_restaurant' && 
                           orderStatus !== 'Prête' && 
                           orderStatus !== 'Annulée';
                           
    const canChangeReadyStatus = orderStatus === 'Prête' && 
                                orderStatus !== 'Annulée';
    
    return (
      <View key={order.id} style={styles.orderCard}>
        {/* Status Indicator */}
        <View style={[styles.statusIndicator, { backgroundColor: statusStyle.borderColor }]} />
        
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderTitleRow}>
            <Text style={styles.orderNumber}>#{order.id}</Text>
            <View style={[styles.statusBadge, { 
              backgroundColor: statusStyle.backgroundColor, 
              borderColor: statusStyle.borderColor 
            }]}>
              <Text style={styles.statusIcon}>{statusStyle.icon}</Text>
              <Text style={[styles.statusText, { color: statusStyle.textColor }]}>
                {orderStatus}
              </Text>
            </View>
          </View>
          
          <Text style={styles.orderDate}>
            {new Date(order.order_date).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>

        {/* Order Content */}
        <View style={styles.orderContent}>
          <View style={styles.clientInfo}>
            <View style={styles.clientIcon}>
              <Text style={styles.clientIconText}>👤</Text>
            </View>
            <View style={styles.clientDetails}>
              <Text style={styles.clientName}>
                {order.client?.first_name
                  ? `${order.client.first_name} ${order.client.last_name}`
                  : order.name_client}
              </Text>
              <Text style={styles.orderTotal}>{order.total.toFixed(2)} TND</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.actionButtons}
            contentContainerStyle={styles.actionButtonsContent}
          >
            {/* Accept/Refuse Button */}
            {canAcceptRefuse && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.decisionButton]}
                onPress={() => showAcceptRefuseModal(order)}
              >
                <Text style={styles.actionButtonIcon}>⚡</Text>
                <Text style={styles.actionButtonText}>Décider</Text>
              </TouchableOpacity>
            )}
            
            {/* Status Change Button */}
            {canChangeStatus && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.readyButton]}
                onPress={() => showStatusModal(order)}
              >
                <Text style={styles.actionButtonIcon}>🍽️</Text>
                <Text style={styles.actionButtonText}>Prêt</Text>
              </TouchableOpacity>
            )}
            
            {/* Ready Status Change Button */}
            {canChangeReadyStatus && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.statusButton]}
                onPress={() => showReadyStatusModal(order)}
              >
                <Text style={styles.actionButtonIcon}>🔄</Text>
                <Text style={styles.actionButtonText}>Modifier</Text>
              </TouchableOpacity>
            )}
            
            {/* View Details Button */}
            <TouchableOpacity 
              style={[styles.actionButton, styles.detailsButton]}
              onPress={() => showOrderDetails(order)}
            >
              <Text style={styles.actionButtonIcon}>👁️</Text>
              <Text style={styles.actionButtonText}>Détails</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Chargement des commandes...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
          >
            <LinearGradient
              colors={['#059669', '#047857']}
              style={styles.retryButtonGradient}
            >
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Commandes</Text>
          <View style={styles.orderCount}>
            <Text style={styles.orderCountText}>{pendingOrders.length}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={() => fetchOrders(userId)}
        >
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      <ScrollView 
        style={styles.orderList} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.orderListContent}
      >
        {sortedPendingOrders.length > 0 ? (
          sortedPendingOrders.map(renderOrderCard)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📋</Text>
            <Text style={styles.emptyStateTitle}>Aucune commande</Text>
            <Text style={styles.emptyStateSubtitle}>
              Toutes vos commandes apparaîtront ici
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Order Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Commande #{selectedOrder?.id}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {selectedOrder && (
                <>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Informations client</Text>
                    <View style={styles.modalInfoCard}>
                      <View style={styles.modalInfoRow}>
                        <Text style={styles.modalLabel}>Client:</Text>
                        <Text style={styles.modalValue}>
                          {selectedOrder.client?.first_name
                            ? `${selectedOrder.client.first_name} ${selectedOrder.client.last_name}`
                            : selectedOrder.name_client}
                        </Text>
                      </View>
                      <View style={styles.modalInfoRow}>
                        <Text style={styles.modalLabel}>Total:</Text>
                        <Text style={[styles.modalValue, styles.totalValue]}>
                          {selectedOrder.total.toFixed(2)} TND
                        </Text>
                      </View>
                      <View style={styles.modalInfoRow}>
                        <Text style={styles.modalLabel}>Statut:</Text>
                        <Text style={styles.modalValue}>
                          {selectedOrder.restaurant_status || selectedOrder.status}
                        </Text>
                      </View>
                      <View style={styles.modalInfoRow}>
                        <Text style={styles.modalLabel}>Date:</Text>
                        <Text style={styles.modalValue}>
                          {new Date(selectedOrder.order_date).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {selectedOrder.ingredientExclure && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Instructions spéciales</Text>
                      <View style={styles.modalInfoCard}>
                        <Text style={styles.modalValue}>{selectedOrder.ingredientExclure}</Text>
                      </View>
                    </View>
                  )}

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Articles commandés</Text>
                    {orderLines.map((line, index) => (
                      <View key={index} style={styles.orderLineCard}>
                        <View style={styles.orderLineHeader}>
                          <Text style={styles.orderLineQuantity}>×{line.quantity}</Text>
                          <Text style={styles.orderLinePrice}>
                            {line.unit_price.toFixed(2)} TND
                          </Text>
                        </View>
                        {line.menu && (
                          <Text style={styles.orderLineName}>{line.menu.name}</Text>
                        )}
                      </View>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Accept/Refuse Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isAcceptRefuseModalVisible}
        onRequestClose={() => setIsAcceptRefuseModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.decisionModalContainer}>
            <View style={styles.decisionModalHeader}>
              <Text style={styles.decisionModalTitle}>
                Commande #{selectedOrderForDecision?.id}
              </Text>
            </View>
            
            {selectedOrderForDecision && (
              <View style={styles.decisionOrderInfo}>
                <Text style={styles.decisionOrderText}>
                  {selectedOrderForDecision.client?.first_name
                    ? `${selectedOrderForDecision.client.first_name} ${selectedOrderForDecision.client.last_name}`
                    : selectedOrderForDecision.name_client}
                </Text>
                <Text style={styles.decisionOrderAmount}>
                  {selectedOrderForDecision.total.toFixed(2)} TND
                </Text>
              </View>
            )}
            
            <Text style={styles.decisionQuestion}>
              Voulez-vous accepter cette commande ?
            </Text>
            
            <View style={styles.decisionButtons}>
              <TouchableOpacity
                style={[styles.decisionButton, styles.acceptDecisionButton]}
                onPress={handleAcceptOrder}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.decisionButtonGradient}
                >
                  <Text style={styles.decisionButtonText}>✓ Accepter</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.decisionButton, styles.refuseDecisionButton]}
                onPress={handleRefuseOrder}
              >
                <LinearGradient
                  colors={['#EF4444', '#DC2626']}
                  style={styles.decisionButtonGradient}
                >
                  <Text style={styles.decisionButtonText}>✗ Refuser</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.cancelDecisionButton}
              onPress={() => setIsAcceptRefuseModalVisible(false)}
            >
              <Text style={styles.cancelDecisionText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Status Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isStatusModalVisible}
        onRequestClose={() => setIsStatusModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.decisionModalContainer}>
            <View style={styles.decisionModalHeader}>
              <Text style={styles.decisionModalTitle}>
                Commande #{selectedOrderForStatus?.id}
              </Text>
            </View>
            
            {selectedOrderForStatus && (
              <View style={styles.decisionOrderInfo}>
                <Text style={styles.decisionOrderText}>
                  {selectedOrderForStatus.client?.first_name
                    ? `${selectedOrderForStatus.client.first_name} ${selectedOrderForStatus.client.last_name}`
                    : selectedOrderForStatus.name_client}
                </Text>
                <Text style={styles.decisionOrderAmount}>
                  {selectedOrderForStatus.total.toFixed(2)} TND
                </Text>
              </View>
            )}
            
            <Text style={styles.decisionQuestion}>
              La commande est-elle prête ?
            </Text>
            
            <View style={styles.decisionButtons}>
              <TouchableOpacity
                style={[styles.decisionButton, styles.acceptDecisionButton]}
                onPress={handleStatusChange}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.decisionButtonGradient}
                >
                  <Text style={styles.decisionButtonText}>✓ Oui, prête</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.decisionButton, styles.refuseDecisionButton]}
                onPress={() => setIsStatusModalVisible(false)}
              >
                <Text style={styles.cancelDecisionText}>Pas encore</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Ready Status Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isReadyStatusModalVisible}
        onRequestClose={() => setIsReadyStatusModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.decisionModalContainer}>
            <View style={styles.decisionModalHeader}>
              <Text style={styles.decisionModalTitle}>
                Modifier le statut #{selectedOrderForReadyStatus?.id}
              </Text>
            </View>
            
            {selectedOrderForReadyStatus && (
              <View style={styles.decisionOrderInfo}>
                <Text style={styles.decisionOrderText}>
                  {selectedOrderForReadyStatus.client?.first_name
                    ? `${selectedOrderForReadyStatus.client.first_name} ${selectedOrderForReadyStatus.client.last_name}`
                    : selectedOrderForReadyStatus.name_client}
                </Text>
                <Text style={styles.decisionOrderAmount}>
                  {selectedOrderForReadyStatus.total.toFixed(2)} TND
                </Text>
              </View>
            )}
            
            <Text style={styles.decisionQuestion}>
              Choisissez le nouveau statut :
            </Text>
            
            <View style={styles.decisionButtons}>
              <TouchableOpacity
                style={[styles.decisionButton, styles.acceptDecisionButton]}
                onPress={() => handleReadyStatusChange('En cours')}
              >
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}
                  style={styles.decisionButtonGradient}
                >
                  <Text style={styles.decisionButtonText}>⏳ En cours</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.decisionButton, styles.refuseDecisionButton]}
                onPress={() => handleReadyStatusChange('Prête')}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.decisionButtonGradient}
                >
                  <Text style={styles.decisionButtonText}>✓ Prête</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.cancelDecisionButton}
              onPress={() => setIsReadyStatusModalVisible(false)}
            >
              <Text style={styles.cancelDecisionText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  // Loading States
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  
  // Error States
  errorContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  retryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  retryButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginRight: 12,
  },
  orderCount: {
    backgroundColor: '#059669',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    minWidth: 32,
    alignItems: 'center',
  },
  orderCountText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  refreshButton: {
    width: 44,
    height: 44,
    backgroundColor: 'white',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  refreshIcon: {
    fontSize: 18,
  },
  
  // Orders List
  orderList: {
    flex: 1,
  },
  orderListContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  
  // Order Card
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statusIndicator: {
    height: 4,
    width: '100%',
  },
  orderHeader: {
    padding: 16,
    paddingBottom: 12,
  },
  orderTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  
  // Order Content
  orderContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  clientIconText: {
    fontSize: 20,
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  
  // Action Section
  actionSection: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FAFBFC',
  },
  actionButtons: {
    paddingVertical: 12,
  },
  actionButtonsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  decisionButton: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  readyButton: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  statusButton: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  detailsButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#9CA3AF',
  },
  
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  modalInfoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  modalValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  totalValue: {
    color: '#059669',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderLineCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
  },
  orderLineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderLineQuantity: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  orderLinePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  orderLineName: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  
  // Decision Modal
  decisionModalContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 'auto',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  decisionModalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  decisionModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  decisionOrderInfo: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  decisionOrderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  decisionOrderAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
  },
  decisionQuestion: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 24,
    fontWeight: '500',
  },
  decisionButtons: {
    gap: 12,
    marginBottom: 16,
  },
  decisionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  decisionButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  decisionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  acceptDecisionButton: {
    // Styles applied via gradient
  },
  refuseDecisionButton: {
    // Styles applied via gradient
  },
  cancelDecisionButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelDecisionText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Orders;