import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Platform, TextInput, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { createMenu } from '../services/menuService'; 
import CustomAlert from './CustomAlert';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ModalAddMenu = ({ visible, onClose, onSave, title, onUserCreated }) => {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [menusData, setMenusData] = useState({
    name: '',
    description: '',
    id_category: '',
    price: '',
    promotion: '',
    image: null,
  });

  const handleInputChange = (name, value) => {
    setMenusData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
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
        console.log('Selected Image URI:', selectedAsset.uri);
        handleInputChange('image', selectedAsset.uri); 
    }
  };

  const handleModalClose = () => {
    onClose();
    setMenusData({
        name: '',
        description: '',
        id_category: '',
        price: '',
        promotion: '',
        image: null,
    });
  };

  const handleSave = async () => {
    console.log('Name:', menusData.name);
    console.log('description:', menusData.description);
    console.log('id_category:', menusData.id_category);
    console.log('price:', menusData.price);
    console.log('promotion:', menusData.promotion);
    console.log('Image URI:', menusData.image);
    
    menusData.id_category = (await AsyncStorage.getItem('id_category')) || '';
    
    if (!menusData.name || !menusData.description || !menusData.id_category || !menusData.price || !menusData.image) {
        setAlertMessage('Please fill out all required fields.');
        setAlertVisible(true);
        return;
    }

    try {
        const formData = new FormData();

        formData.append('name', menusData.name);
        formData.append('description', menusData.description);
        formData.append('promotion', menusData.promotion);
        formData.append('price', menusData.price);
        formData.append('id_category', menusData.id_category);

        if (menusData.image) {
            let fileUri;
            let fileName;
            let mimeType = 'image/jpeg'; // Default to JPEG

            if (Platform.OS === 'web') {
                const response = await fetch(menusData.image);
                const blob = await response.blob();
                const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
                formData.append('image', file);
            } else {
                // Mobile: Use the direct URI from Expo
                fileUri = menusData.image;
                fileName = fileUri.split('/').pop();
                mimeType = mimeType || 'image/jpeg'; // Adjust MIME type if necessary

                formData.append('image', {
                    uri: fileUri,
                    name: fileName,
                    type: mimeType,
                });
            }
        }
  
        const response = await createMenu(formData);
        if (response.status === 201) {
            onSave();
            handleModalClose();
            onUserCreated(); // Refresh the user list
        }
    } catch (error) {
        console.error('Error creating menu:', error);
    }
  };

  const inputs = [
    { name: 'name', placeholder: 'Nom Menu', keyboardType: 'default', icon: 'restaurant-outline' },
    { name: 'description', placeholder: 'Description Menu', keyboardType: 'default', icon: 'document-text-outline' },
    { name: 'price', placeholder: 'Prix Menu', keyboardType: 'numeric', icon: 'pricetag-outline' },
    { name: 'promotion', placeholder: 'Prix Promotion (Optional)', keyboardType: 'numeric', icon: 'gift-outline' },
  ];

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity 
              style={styles.closeIconContainer}
              onPress={handleModalClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Form Content */}
          <ScrollView 
            style={styles.formScrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formContainer}>
              {/* Input Fields */}
              {inputs.map((input, index) => (
                <View key={index} style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <Ionicons 
                      name={input.icon} 
                      size={20} 
                      color="#6B7280" 
                      style={styles.inputIcon}
                    />
                    <TextInput
                      placeholder={input.placeholder}
                      placeholderTextColor="#9CA3AF"
                      value={menusData[input.name]}
                      onChangeText={(text) => handleInputChange(input.name, text)}
                      keyboardType={input.keyboardType}
                      style={styles.textInput}
                    />
                    {input.name === 'price' && (
                      <Text style={styles.currencySymbol}>€</Text>
                    )}
                    {input.name === 'promotion' && menusData.promotion && (
                      <Text style={styles.currencySymbol}>€</Text>
                    )}
                  </View>
                </View>
              ))}

              {/* Image Picker */}
              <View style={styles.imagePickerContainer}>
                <Text style={styles.imageLabel}>Menu Image</Text>
                <TouchableOpacity 
                  style={styles.imagePicker} 
                  onPress={handleImagePicker}
                  activeOpacity={0.8}
                >
                  {menusData.image ? (
                    <View style={styles.imagePreviewContainer}>
                      <Image source={{ uri: menusData.image }} style={styles.imagePreview} />
                      <View style={styles.imageOverlay}>
                        <Ionicons name="camera" size={24} color="white" />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.imagePickerContent}>
                      <View style={styles.imagePickerIcon}>
                        <Ionicons name="camera-outline" size={32} color="#6B7280" />
                      </View>
                      <Text style={styles.imagePickerText}>Select Menu Image</Text>
                      <Text style={styles.imagePickerSubtext}>Tap to choose from gallery</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Price Summary */}
              {(menusData.price || menusData.promotion) && (
                <View style={styles.priceSummaryContainer}>
                  <Text style={styles.priceSummaryTitle}>Price Summary</Text>
                  <View style={styles.priceSummaryContent}>
                    {menusData.price && (
                      <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Regular Price:</Text>
                        <Text style={[styles.priceValue, menusData.promotion && styles.originalPrice]}>
                          €{menusData.price}
                        </Text>
                      </View>
                    )}
                    {menusData.promotion && (
                      <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Promotion Price:</Text>
                        <Text style={styles.promotionPrice}>€{menusData.promotion}</Text>
                      </View>
                    )}
                    {menusData.price && menusData.promotion && (
                      <View style={styles.savingsRow}>
                        <Text style={styles.savingsLabel}>You save:</Text>
                        <Text style={styles.savingsValue}>
                          €{(parseFloat(menusData.price) - parseFloat(menusData.promotion)).toFixed(2)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButtonContainer}
              onPress={handleModalClose}
              activeOpacity={0.8}
            >
              <View style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Fermer</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButtonContainer}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#22C55E', '#059669']}
                style={styles.saveButton}
              >
                <Ionicons name="checkmark" size={20} color="white" />
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <CustomAlert
        visible={alertVisible}
        title="Missing Information"
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  closeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formScrollView: {
    maxHeight: 400,
  },
  formContainer: {
    padding: 24,
    paddingTop: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    fontWeight: '400',
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22C55E',
    marginLeft: 8,
  },
  imagePickerContainer: {
    marginBottom: 20,
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  imagePicker: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },
  imagePickerContent: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  imagePickerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  imagePickerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  imagePickerSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  imagePreviewContainer: {
    position: 'relative',
    height: 120,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceSummaryContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  priceSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 12,
  },
  priceSummaryContent: {
    gap: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  promotionPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#22C55E',
  },
  savingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#BBF7D0',
    marginTop: 4,
  },
  savingsLabel: {
    fontSize: 14,
    color: '#166534',
    fontWeight: '600',
  },
  savingsValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 0,
    gap: 12,
  },
  cancelButtonContainer: {
    flex: 1,
  },
  cancelButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButtonContainer: {
    flex: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#059669',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default ModalAddMenu;