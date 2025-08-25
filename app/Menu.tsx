// import React, { useEffect, useState } from 'react';
// import { View, StyleSheet, ScrollView, Animated, ImageBackground, Text, TouchableOpacity, Modal } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import { getCategoriesByRestaurant, deleteCategory, recoverCategory } from '@/services/categoryService';
// import SearchWithButton from '@/components/SearchWithButton';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useRouter } from 'expo-router';

// const SkeletonCard = () => {
//   const animatedValue = new Animated.Value(0);

//   useEffect(() => {
//     const animation = Animated.loop(
//       Animated.sequence([
//         Animated.timing(animatedValue, {
//           toValue: 1,
//           duration: 1000,
//           useNativeDriver: true,
//         }),
//         Animated.timing(animatedValue, {
//           toValue: 0,
//           duration: 1000,
//           useNativeDriver: true,
//         }),
//       ])
//     );
//     animation.start();
//     return () => animation.stop();
//   }, []);

//   const opacity = animatedValue.interpolate({
//     inputRange: [0, 1],
//     outputRange: [0.3, 0.7],
//   });

//   return (
//     <View style={styles.skeletonCard}>
//       <Animated.View style={[styles.skeletonImage, { opacity }]} />
//       <View style={styles.skeletonContent}>
//         <Animated.View style={[styles.skeletonTitle, { opacity }]} />
//         <Animated.View style={[styles.skeletonDescription, { opacity }]} />
//         <Animated.View style={[styles.skeletonButton, { opacity }]} />
//       </View>
//     </View>
//   );
// };

// const Menu = () => {
//   const router = useRouter();
//   const [filteredData, setFilteredData] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
//   const [actionType, setActionType] = useState('');
//   const [categoryToConfirm, setCategoryToConfirm] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const route = useRouter();

//   const goToMenuItems = async (categoryId, categoryName) => {
//     await AsyncStorage.setItem("id_category", categoryId.toString());
//     await AsyncStorage.setItem("category_name", categoryName);
//     console.log(`Will navigate to menu items for category: ${categoryName} (ID: ${categoryId})`);
//     router.push('/CategoryMenu');
//   };

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   const fetchCategories = async () => {
//     setIsLoading(true);
//     try {
//       const restaurantId = await AsyncStorage.getItem('id') || '';
//       const response = await getCategoriesByRestaurant(restaurantId);
//       setCategories(response.data || []);
//       setFilteredData(response.data || []);
//     } catch (error) {
//       console.error('Error fetching categories:', error);
//       setCategories([]);
//       setFilteredData([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDelete = async (categoryId) => {
//     try {
//       await deleteCategory(categoryId);
//       fetchCategories();
//     } catch (error) {
//       console.error('Error deleting category:', error);
//     }
//   };

//   const handleRecover = async (categoryId) => {
//     try {
//       await recoverCategory(categoryId);
//       fetchCategories();
//     } catch (error) {
//       console.error('Error recovering category:', error);
//     }
//   };

//   const showConfirmationOverlay = (category, action) => {
//     setActionType(action);
//     setCategoryToConfirm(category);
//     setIsConfirmationVisible(true);
//   };

//   const handleConfirmation = async () => {
//     if (actionType === 'delete') {
//       await handleDelete(categoryToConfirm.id);
//     } else if (actionType === 'recover') {
//       await handleRecover(categoryToConfirm.id);
//     }
//     setIsConfirmationVisible(false);
//   };

//   const renderSkeletonLoaders = () => {
//     return [...Array(6)].map((_, index) => (
//       <SkeletonCard key={`skeleton-${index}`} />
//     ));
//   };

//   const ConfirmationModal = () => (
//     <Modal
//       visible={isConfirmationVisible}
//       transparent={true}
//       animationType="fade"
//       onRequestClose={() => setIsConfirmationVisible(false)}
//     >
//       <View style={styles.modalOverlay}>
//         <View style={styles.modalContent}>
//           <View style={styles.modalIconContainer}>
//             <View style={[
//               styles.modalIcon,
//               { backgroundColor: actionType === 'delete' ? '#FEE2E2' : '#DCFCE7' }
//             ]}>
//               <Ionicons 
//                 name={actionType === 'delete' ? 'trash-outline' : 'refresh-outline'} 
//                 size={32} 
//                 color={actionType === 'delete' ? '#EF4444' : '#22C55E'}
//               />
//             </View>
//           </View>
          
//           <Text style={styles.modalTitle}>
//             {actionType === 'delete' ? 'Delete Category' : 'Recover Category'}
//           </Text>
          
//           <Text style={styles.modalText}>
//             {actionType === 'delete' 
//               ? 'Are you sure you want to delete this category? This action cannot be undone.' 
//               : 'Are you sure you want to recover this category?'}
//           </Text>

//           <View style={styles.modalActions}>
//             <TouchableOpacity
//               style={styles.cancelButton}
//               onPress={() => setIsConfirmationVisible(false)}
//               activeOpacity={0.8}
//             >
//               <Text style={styles.cancelButtonText}>Cancel</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.confirmButton, {
//                 backgroundColor: actionType === 'delete' ? '#EF4444' : '#22C55E'
//               }]}
//               onPress={handleConfirmation}
//               activeOpacity={0.8}
//             >
//               <Text style={styles.confirmButtonText}>
//                 {actionType === 'delete' ? 'Delete' : 'Recover'}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );

//   return (
//     <View style={styles.container}>
//       {/* Header Section */}
//       <View style={styles.header}>
//         <View style={styles.headerTop}>
//           <View>
//             <Text style={styles.headerTitle}>Menu Categories</Text>
//             <Text style={styles.headerSubtitle}>
//               {filteredData.length} {filteredData.length === 1 ? 'category' : 'categories'} available
//             </Text>
//           </View>
//           {/* <TouchableOpacity style={styles.headerAction}>
//             <Ionicons name="filter-outline" size={20} color="#6B7280" />
//           </TouchableOpacity> */}
//         </View>
        
//         <SearchWithButton
//           data={categories}
//           titleModal={"Add Category"}
//           onSearch={(filteredData) => setFilteredData(filteredData)}
//           onSave={fetchCategories}
//         />
//       </View>

//       {/* Content Section */}
//       <ScrollView 
//         style={styles.scrollView}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         {isLoading ? (
//           <View style={styles.gridContainer}>
//             {renderSkeletonLoaders()}
//           </View>
//         ) : filteredData.length === 0 ? (
//           <View style={styles.emptyState}>
//             <View style={styles.emptyIconContainer}>
//               <Ionicons name="restaurant-outline" size={64} color="#D1D5DB" />
//             </View>
//             <Text style={styles.emptyTitle}>No Categories Found</Text>
//             <Text style={styles.emptyText}>
//               Start by adding your first menu category to organize your dishes.
//             </Text>
//             <TouchableOpacity style={styles.emptyAction}>
//               <LinearGradient
//                 colors={['#059669', '#047857']}
//                 style={styles.emptyButton}
//               >
//                 <Ionicons name="add" size={20} color="white" />
//                 <Text style={styles.emptyButtonText}>Add Category</Text>
//               </LinearGradient>
//             </TouchableOpacity>
//           </View>
//         ) : (
//           <View style={styles.gridContainer}>
//             {filteredData.map((category) => (
//               <View key={category.id} style={styles.categoryCard}>
//                 <View style={styles.cardImageContainer}>
//                   <ImageBackground 
//                     source={{ uri: category.image }} 
//                     style={styles.cardImage}
//                     imageStyle={styles.cardImageStyle}
//                   >
//                     <LinearGradient
//                       colors={['transparent', 'rgba(0,0,0,0.7)']}
//                       style={styles.cardGradient}
//                     />
                    
//                     {/* Status Badge */}
//                     {category.deleted && (
//                       <View style={styles.statusBadge}>
//                         <Text style={styles.statusBadgeText}>Deleted</Text>
//                       </View>
//                     )}
                    
//                     {/* Action Button */}
//                     <TouchableOpacity
//                       style={[styles.actionButton, {
//                         backgroundColor: category.deleted ? '#22C55E' : '#EF4444'
//                       }]}
//                       onPress={() => showConfirmationOverlay(category, category.deleted ? 'recover' : 'delete')}
//                       activeOpacity={0.8}
//                     >
//                       <Ionicons
//                         name={category.deleted ? "refresh" : "trash"}
//                         color="white"
//                         size={16}
//                       />
//                     </TouchableOpacity>
//                   </ImageBackground>
//                 </View>

//                 <View style={styles.cardContent}>
//                   <Text style={styles.cardTitle} numberOfLines={1}>
//                     {category.name}
//                   </Text>
//                   <Text style={styles.cardDescription} numberOfLines={2}>
//                     {category.description}
//                   </Text>
                  
//                   <TouchableOpacity
//                     style={styles.exploreButton}
//                     onPress={() => goToMenuItems(category.id, category.name)}
//                     activeOpacity={0.8}
//                   >
//                     <Text style={styles.exploreButtonText}>Explore</Text>
//                     <Ionicons name="arrow-forward" size={16} color="#059669" />
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             ))}
//           </View>
//         )}
        
//         {/* Bottom Padding for Navigation */}
//         <View style={styles.bottomPadding} />
//       </ScrollView>

//       <ConfirmationModal />
//     </View>
//   );
// };

// // Make sure to export the component properly
// export default Menu;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F8FAFC',
//   },
//   header: {
//     backgroundColor: 'white',
//     paddingHorizontal: 20,
//     paddingTop: 20,
//     paddingBottom: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//   },
//   headerTop: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 16,
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#111827',
//     marginBottom: 4,
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: '#6B7280',
//     fontWeight: '500',
//   },
//   headerAction: {
//     width: 40,
//     height: 40,
//     borderRadius: 12,
//     backgroundColor: '#F3F4F6',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     flexGrow: 1,
//   },
//   gridContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     padding: 20,
//     gap: 16,
//   },
//   categoryCard: {
//     width: '47%',
//     backgroundColor: 'white',
//     borderRadius: 16,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.08,
//     shadowRadius: 12,
//     elevation: 4,
//     overflow: 'hidden',
//   },
//   cardImageContainer: {
//     height: 140,
//     position: 'relative',
//   },
//   cardImage: {
//     width: '100%',
//     height: '100%',
//     justifyContent: 'space-between',
//   },
//   cardImageStyle: {
//     borderTopLeftRadius: 16,
//     borderTopRightRadius: 16,
//   },
//   cardGradient: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     height: '60%',
//   },
//   statusBadge: {
//     position: 'absolute',
//     top: 12,
//     left: 12,
//     backgroundColor: 'rgba(239, 68, 68, 0.9)',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 6,
//   },
//   statusBadgeText: {
//     color: 'white',
//     fontSize: 10,
//     fontWeight: '600',
//   },
//   actionButton: {
//     position: 'absolute',
//     top: 12,
//     right: 12,
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   cardContent: {
//     padding: 16,
//   },
//   cardTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#111827',
//     marginBottom: 6,
//   },
//   cardDescription: {
//     fontSize: 13,
//     color: '#6B7280',
//     lineHeight: 18,
//     marginBottom: 12,
//   },
//   exploreButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     backgroundColor: '#F0FDF4',
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: '#BBF7D0',
//     gap: 6,
//   },
//   exploreButtonText: {
//     color: '#059669',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   // Empty State
//   emptyState: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 32,
//     paddingVertical: 64,
//   },
//   emptyIconContainer: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     backgroundColor: '#F3F4F6',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 24,
//   },
//   emptyTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#111827',
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   emptyText: {
//     fontSize: 14,
//     color: '#6B7280',
//     textAlign: 'center',
//     lineHeight: 20,
//     marginBottom: 32,
//   },
//   emptyAction: {
//     shadowColor: '#059669',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   emptyButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 14,
//     paddingHorizontal: 24,
//     borderRadius: 12,
//     gap: 8,
//   },
//   emptyButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   // Modal Styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   modalContent: {
//     backgroundColor: 'white',
//     borderRadius: 20,
//     padding: 24,
//     width: '100%',
//     maxWidth: 320,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 10,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 20,
//     elevation: 15,
//   },
//   modalIconContainer: {
//     marginBottom: 20,
//   },
//   modalIcon: {
//     width: 72,
//     height: 72,
//     borderRadius: 36,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#111827',
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   modalText: {
//     fontSize: 14,
//     color: '#6B7280',
//     textAlign: 'center',
//     lineHeight: 20,
//     marginBottom: 24,
//   },
//   modalActions: {
//     flexDirection: 'row',
//     gap: 12,
//     width: '100%',
//   },
//   cancelButton: {
//     flex: 1,
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 12,
//     backgroundColor: '#F3F4F6',
//     alignItems: 'center',
//   },
//   cancelButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#6B7280',
//   },
//   confirmButton: {
//     flex: 1,
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   confirmButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: 'white',
//   },
//   // Skeleton Styles
//   skeletonCard: {
//     width: '47%',
//     backgroundColor: 'white',
//     borderRadius: 16,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   skeletonImage: {
//     width: '100%',
//     height: 140,
//     backgroundColor: '#E5E7EB',
//   },
//   skeletonContent: {
//     padding: 16,
//   },
//   skeletonTitle: {
//     width: '80%',
//     height: 16,
//     backgroundColor: '#E5E7EB',
//     borderRadius: 4,
//     marginBottom: 8,
//   },
//   skeletonDescription: {
//     width: '100%',
//     height: 12,
//     backgroundColor: '#E5E7EB',
//     borderRadius: 4,
//     marginBottom: 6,
//   },
//   skeletonButton: {
//     width: '100%',
//     height: 36,
//     backgroundColor: '#E5E7EB',
//     borderRadius: 10,
//     marginTop: 8,
//   },
//   bottomPadding: {
//     height: 120, // Space for bottom navigation
//   },
// });
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Animated, ImageBackground, Text, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getCategoriesByRestaurant, deleteCategory, recoverCategory } from '@/services/categoryService';
import SearchWithButton from '@/components/SearchWithButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SkeletonCard = () => {
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.skeletonCard}>
      <Animated.View style={[styles.skeletonImage, { opacity }]} />
      <View style={styles.skeletonContent}>
        <Animated.View style={[styles.skeletonTitle, { opacity }]} />
        <Animated.View style={[styles.skeletonDescription, { opacity }]} />
        <Animated.View style={[styles.skeletonButton, { opacity }]} />
      </View>
    </View>
  );
};

const Menu = ({ onCategorySelect }) => { // Accept onCategorySelect prop
  const [filteredData, setFilteredData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [actionType, setActionType] = useState('');
  const [categoryToConfirm, setCategoryToConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const goToMenuItems = async (categoryId, categoryName) => {
    // Use the onCategorySelect callback instead of router.push
    if (onCategorySelect) {
      onCategorySelect(categoryId, categoryName);
    } else {
      // Fallback: still store in AsyncStorage for direct navigation
      await AsyncStorage.setItem("id_category", categoryId.toString());
      await AsyncStorage.setItem("category_name", categoryName);
      console.log(`Will navigate to menu items for category: ${categoryName} (ID: ${categoryId})`);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const restaurantId = await AsyncStorage.getItem('id') || '';
      const response = await getCategoriesByRestaurant(restaurantId);
      setCategories(response.data || []);
      setFilteredData(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (categoryId) => {
    try {
      await deleteCategory(categoryId);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleRecover = async (categoryId) => {
    try {
      await recoverCategory(categoryId);
      fetchCategories();
    } catch (error) {
      console.error('Error recovering category:', error);
    }
  };

  const showConfirmationOverlay = (category, action) => {
    setActionType(action);
    setCategoryToConfirm(category);
    setIsConfirmationVisible(true);
  };

  const handleConfirmation = async () => {
    if (actionType === 'delete') {
      await handleDelete(categoryToConfirm.id);
    } else if (actionType === 'recover') {
      await handleRecover(categoryToConfirm.id);
    }
    setIsConfirmationVisible(false);
  };

  const renderSkeletonLoaders = () => {
    return [...Array(6)].map((_, index) => (
      <SkeletonCard key={`skeleton-${index}`} />
    ));
  };

  const ConfirmationModal = () => (
    <Modal
      visible={isConfirmationVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setIsConfirmationVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalIconContainer}>
            <View style={[
              styles.modalIcon,
              { backgroundColor: actionType === 'delete' ? '#FEE2E2' : '#DCFCE7' }
            ]}>
              <Ionicons 
                name={actionType === 'delete' ? 'trash-outline' : 'refresh-outline'} 
                size={32} 
                color={actionType === 'delete' ? '#EF4444' : '#22C55E'}
              />
            </View>
          </View>
          
          <Text style={styles.modalTitle}>
            {actionType === 'delete' ? 'Delete Category' : 'Recover Category'}
          </Text>
          
          <Text style={styles.modalText}>
            {actionType === 'delete' 
              ? 'Are you sure you want to delete this category? This action cannot be undone.' 
              : 'Are you sure you want to recover this category?'}
          </Text>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsConfirmationVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmButton, {
                backgroundColor: actionType === 'delete' ? '#EF4444' : '#22C55E'
              }]}
              onPress={handleConfirmation}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>
                {actionType === 'delete' ? 'Delete' : 'Recover'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Menu Categories</Text>
            <Text style={styles.headerSubtitle}>
              {filteredData.length} {filteredData.length === 1 ? 'category' : 'categories'} available
            </Text>
          </View>
        </View>
        
        <SearchWithButton
          data={categories}
          titleModal={"Add Category"}
          onSearch={(filteredData) => setFilteredData(filteredData)}
          onSave={fetchCategories}
        />
      </View>

      {/* Content Section */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.gridContainer}>
            {renderSkeletonLoaders()}
          </View>
        ) : filteredData.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="restaurant-outline" size={64} color="#D1D5DB" />
            </View>
            <Text style={styles.emptyTitle}>No Categories Found</Text>
            <Text style={styles.emptyText}>
              Start by adding your first menu category to organize your dishes.
            </Text>
            <TouchableOpacity style={styles.emptyAction}>
              <LinearGradient
                colors={['#059669', '#047857']}
                style={styles.emptyButton}
              >
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.emptyButtonText}>Add Category</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {filteredData.map((category) => (
              <View key={category.id} style={styles.categoryCard}>
                <View style={styles.cardImageContainer}>
                  <ImageBackground 
                    source={{ uri: category.image }} 
                    style={styles.cardImage}
                    imageStyle={styles.cardImageStyle}
                  >
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.7)']}
                      style={styles.cardGradient}
                    />
                    
                    {/* Status Badge */}
                    {category.deleted && (
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusBadgeText}>Deleted</Text>
                      </View>
                    )}
                    
                    {/* Action Button */}
                    <TouchableOpacity
                      style={[styles.actionButton, {
                        backgroundColor: category.deleted ? '#22C55E' : '#EF4444'
                      }]}
                      onPress={() => showConfirmationOverlay(category, category.deleted ? 'recover' : 'delete')}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={category.deleted ? "refresh" : "trash"}
                        color="white"
                        size={16}
                      />
                    </TouchableOpacity>
                  </ImageBackground>
                </View>

                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {category.name}
                  </Text>
                  <Text style={styles.cardDescription} numberOfLines={2}>
                    {category.description}
                  </Text>
                  
                  <TouchableOpacity
                    style={styles.exploreButton}
                    onPress={() => goToMenuItems(category.id, category.name)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.exploreButtonText}>Explore</Text>
                    <Ionicons name="arrow-forward" size={16} color="#059669" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
        
        {/* Bottom Padding for Navigation */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      <ConfirmationModal />
    </View>
  );
};

// Add styles - you'll need to include all the styles from your original Menu component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardImageContainer: {
    height: 120,
    position: 'relative',
  },
  cardImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardImageStyle: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  actionButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  exploreButtonText: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '600',
    marginRight: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#F9FAFB',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  emptyAction: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 100,
  },
  skeletonCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  skeletonImage: {
    height: 120,
    backgroundColor: '#E5E7EB',
  },
  skeletonContent: {
    padding: 16,
  },
  skeletonTitle: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonDescription: {
    height: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginBottom: 6,
  },
  skeletonButton: {
    height: 32,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    minWidth: 280,
  },
  modalIconContainer: {
    marginBottom: 16,
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
});

export default Menu;