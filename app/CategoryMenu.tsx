import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Modal, 
  Image, 
  Platform, 
  TouchableOpacity, 
  ImageBackground,
  Animated,
  KeyboardAvoidingView,
  TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Input } from 'react-native-elements';
import { Button } from '@rneui/base';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMenusByCategory, updateMenu, deleteMenu, recoverMenu } from '@/services/menuService';
import SearchWithButton from '@/components/SearchWithButton';
import ModalAddMenu from '@/components/ModalAddMenu'; // Import ModalAddMenu directly

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
        <Animated.View style={[styles.skeletonPrice, { opacity }]} />
        <Animated.View style={[styles.skeletonActions, { opacity }]} />
      </View>
    </View>
  );
};

const CategoryMenu = ({ onBack }) => {
  const [filteredData, setFilteredData] = useState([]);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newPriceProm, setNewPriceProm] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newImage, setNewImage] = useState('');
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [actionType, setActionType] = useState('');
  const [dishToConfirm, setDishToConfirm] = useState(null);
  const [isAddMenuModalVisible, setIsAddMenuModalVisible] = useState(false); // For direct ModalAddMenu
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCategoryName();
    fetchMenus();
  }, []);

  const loadCategoryName = async () => {
    try {
      const name = await AsyncStorage.getItem('category_name');
      setCategoryName(name || 'Menu Items');
    } catch (error) {
      console.error('Error loading category name:', error);
    }
  };

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const id_category = (await AsyncStorage.getItem('id_category')) || '';
      const response = await getMenusByCategory(id_category);
      setMenus(response);
      setFilteredData(response || []);
    } catch (error) {
      console.error("Error fetching menus:", error);
      setMenus([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleModalSave = () => {
    fetchMenus();
  };

  const handleDelete = async (dishId) => {
    try {
      await deleteMenu(dishId);
      fetchMenus();
    } catch (error) {
      console.error('Error deleting menu:', error);
    }
  };

  const handleRecover = async (dishId) => {
    try {
      await recoverMenu(dishId);
      fetchMenus();
    } catch (error) {
      console.error('Error recovering menu:', error);
    }
  };

  const showConfirmationOverlay = (dish, action) => {
    setActionType(action);
    setDishToConfirm(dish);
    setIsConfirmationVisible(true);
  };

  const handleConfirmation = async () => {
    if (actionType === 'delete') {
      await handleDelete(dishToConfirm.id);
    } else if (actionType === 'recover') {
      await handleRecover(dishToConfirm.id);
    }
    setIsConfirmationVisible(false);
  };

  // Fixed handleEdit function with proper state initialization
  const handleEdit = (dish) => {
    console.log('Editing dish:', dish); // Debug log
    setSelectedDish(dish);
    setNewName(dish.name || '');
    setNewPrice(dish.price ? dish.price.toString() : '');
    setNewPriceProm(dish.promotion ? dish.promotion.toString() : '');
    setNewDescription(dish.description || '');
    setNewImage(dish.image || '');
    setIsModalVisible(true);
  };

  // Fixed modal close function
  const closeModal = () => {
    setIsModalVisible(false);
    // Reset form data when closing
    setSelectedDish(null);
    setNewName('');
    setNewPrice('');
    setNewPriceProm('');
    setNewDescription('');
    setNewImage('');
  };

  const handleSaveEdit = async () => {
    try {
      if (!selectedDish) {
        console.error('No dish selected for editing');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('name', newName);
      formDataToSend.append('description', newDescription);
      formDataToSend.append('price', newPrice);
      formDataToSend.append('promotion', newPriceProm);

      if (newImage && newImage !== selectedDish.image) {
        let fileUri;
        let fileName;
        let mimeType = 'image/jpeg';

        if (Platform.OS === 'web') {
          const response = await fetch(newImage);
          const blob = await response.blob();
          const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
          formDataToSend.append('image', file);
        } else {
          fileUri = newImage;
          fileName = fileUri.split('/').pop();
          mimeType = mimeType || 'image/jpeg';

          formDataToSend.append('image', {
            uri: fileUri,
            name: fileName,
            type: mimeType,
          });
        }
      }

      await updateMenu(selectedDish.id, formDataToSend);
      closeModal();
      fetchMenus();
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update menu');
    }
  };

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedAsset = result.assets[0];
      setNewImage(selectedAsset.uri);
    }
  };

  // Updated function to handle opening add menu modal directly
  const handleOpenAddMenuModal = () => {
    setIsAddMenuModalVisible(true);
  };

  // Updated function to handle add menu modal save and close
  const handleAddMenuSave = () => {
    setIsAddMenuModalVisible(false);
    fetchMenus(); // Refresh the menu list
  };

  const handleAddMenuClose = () => {
    setIsAddMenuModalVisible(false);
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
            {actionType === 'delete' ? 'Delete Menu Item' : 'Restore Menu Item'}
          </Text>
          
          <Text style={styles.modalText}>
            {actionType === 'delete' 
              ? 'Are you sure you want to delete this menu item? This action cannot be undone.' 
              : 'Are you sure you want to restore this menu item?'}
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
                {actionType === 'delete' ? 'Delete' : 'Restore'}
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
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => onBack && onBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{categoryName}</Text>
            <Text style={styles.headerSubtitle}>
              {filteredData.length} {filteredData.length === 1 ? 'item' : 'items'} available
            </Text>
          </View>

          {/* Add Menu Button */}
          <TouchableOpacity
            style={styles.addMenuButtonContainer}
            onPress={handleOpenAddMenuModal}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#22C55E', '#059669']}
              style={styles.addMenuButton}
            >
              <Text style={styles.addMenuButtonText}>Ajouter</Text>
              <Ionicons name="add" size={16} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons 
              name="search-outline" 
              size={20} 
              color="#6B7280" 
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search menu items..."
              placeholderTextColor="#9CA3AF"
              value={searchTerm}
              onChangeText={(text) => {
                setSearchTerm(text);
                const lowerCaseText = text.toLowerCase();
                if (lowerCaseText === '') {
                  setFilteredData(menus);
                } else {
                  const filtered = menus.filter((item) =>
                    item.name.toLowerCase().includes(lowerCaseText) ||
                    item.description.toLowerCase().includes(lowerCaseText)
                  );
                  setFilteredData(filtered);
                }
              }}
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity 
                onPress={() => {
                  setSearchTerm('');
                  setFilteredData(menus);
                }} 
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Content Section */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.gridContainer}>
            {renderSkeletonLoaders()}
          </View>
        ) : filteredData.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="restaurant-outline" size={64} color="#D1D5DB" />
            </View>
            <Text style={styles.emptyTitle}>No Menu Items Found</Text>
            <Text style={styles.emptyText}>
              Start by adding your first menu item to this category.
            </Text>
            <TouchableOpacity style={styles.emptyAction} onPress={handleOpenAddMenuModal}>
              <LinearGradient
                colors={['#059669', '#047857']}
                style={styles.emptyButton}
              >
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.emptyButtonText}>Add Menu Item</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {filteredData.map((dish) => (
              <View key={dish.id} style={styles.menuCard}>
                <View style={styles.cardImageContainer}>
                  <ImageBackground 
                    source={{ uri: dish.image }} 
                    style={styles.cardImage}
                    imageStyle={styles.cardImageStyle}
                  >
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.7)']}
                      style={styles.cardGradient}
                    />
                    
                    {dish.deleted && (
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusBadgeText}>Deleted</Text>
                      </View>
                    )}
                    
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEdit(dish)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="pencil" color="white" size={16} />
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[styles.actionButton, {
                          backgroundColor: dish.deleted ? '#22C55E' : '#EF4444'
                        }]}
                        onPress={() => showConfirmationOverlay(dish, dish.deleted ? 'recover' : 'delete')}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name={dish.deleted ? "refresh" : "trash"}
                          color="white"
                          size={16}
                        />
                      </TouchableOpacity>
                    </View>
                  </ImageBackground>
                </View>

                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {dish.name}
                  </Text>
                  <Text style={styles.cardDescription} numberOfLines={2}>
                    {dish.description}
                  </Text>
                  
                  <View style={styles.priceContainer}>
                    {dish.promotion && dish.promotion > 0 ? (
                      <View style={styles.promotionPriceContainer}>
                        <Text style={styles.originalPrice}>{dish.price} TND</Text>
                        <Text style={styles.promotedPrice}>
                          {(dish.price - (dish.price * (dish.promotion / 100))).toFixed(2)} TND
                        </Text>
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountText}>-{dish.promotion}%</Text>
                        </View>
                      </View>
                    ) : (
                      <Text style={styles.dishPrice}>{dish.price} TND</Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
        
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Direct ModalAddMenu Integration */}
      <ModalAddMenu
        visible={isAddMenuModalVisible}
        onClose={handleAddMenuClose}
        onSave={handleAddMenuSave}
        title="Ajouter Menu"
        onUserCreated={handleAddMenuSave}
      />

      {/* Fixed Edit Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView 
          style={styles.editModalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.editModalContent}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Edit Menu Item</Text>
              <TouchableOpacity 
                onPress={closeModal}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.editModalBody}>
              {/* Replace Input components with TextInput for better control */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Name"
                  value={newName}
                  onChangeText={setNewName}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Price (TND)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Price"
                  keyboardType="numeric"
                  value={newPrice}
                  onChangeText={setNewPrice}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textAreaInput]}
                  placeholder="Description"
                  value={newDescription}
                  onChangeText={setNewDescription}
                  multiline
                  numberOfLines={3}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Promotion Percentage</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Promotion (%)"
                  keyboardType="numeric"
                  value={newPriceProm}
                  onChangeText={setNewPriceProm}
                />
              </View>
              
              <TouchableOpacity 
                style={styles.imagePicker}
                onPress={handleImagePicker}
                activeOpacity={0.7}
              >
                {newImage ? (
                  <Image source={{ uri: newImage }} style={styles.imagePreview} />
                ) : (
                  <View style={styles.imagePickerPlaceholder}>
                    <Ionicons name="camera" size={32} color="#6B7280" />
                    <Text style={styles.imagePickerText}>Select an Image</Text>
                  </View>
                )}
              </TouchableOpacity>
            </ScrollView>
            
            <View style={styles.editModalFooter}>
              <TouchableOpacity 
                style={styles.editCancelButton}
                onPress={closeModal}
              >
                <Text style={styles.editCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.editSaveButton}
                onPress={handleSaveEdit}
              >
                <LinearGradient
                  colors={['#059669', '#047857']}
                  style={styles.editSaveButtonGradient}
                >
                  <Text style={styles.editSaveButtonText}>Save Changes</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <ConfirmationModal />
    </View>
  );
};

// Add missing styles for the new components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  addMenuButtonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addMenuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 40,
  },
  addMenuButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardImageContainer: {
    position: 'relative',
  },
  cardImage: {
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  cardImageStyle: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
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
    fontWeight: 'bold',
  },
  actionButtons: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dishPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  promotionPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  promotedPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
    marginRight: 8,
  },
  discountBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 10,
    color: '#F59E0B',
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  emptyAction: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  skeletonCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  skeletonImage: {
    height: 120,
    backgroundColor: '#E5E7EB',
  },
  skeletonContent: {
    padding: 12,
  },
  skeletonTitle: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonDescription: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
    width: '80%',
  },
  skeletonPrice: {
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: '60%',
    marginBottom: 8,
  },
  skeletonActions: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: '40%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
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
    fontWeight: 'bold',
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
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  editModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  editModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    flex: 1,
    marginTop: 50,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  editModalBody: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: 'white',
  },
  textAreaInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  imagePicker: {
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imagePickerPlaceholder: {
    alignItems: 'center',
  },
  imagePickerText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  editModalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  editCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  editCancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  editSaveButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  editSaveButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  editSaveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  bottomPadding: {
    height: 20,
  },
});

export default CategoryMenu;