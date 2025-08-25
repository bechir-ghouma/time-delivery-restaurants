import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Platform, TextInput, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { createCategory } from '../services/categoryService'; 
import CustomAlert from './CustomAlert';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ModalAddCategory = ({ visible, onClose, onSave, title, onUserCreated }) => {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state
  const [categoriesData, setCategoriesData] = useState({
    name: '',
    description: '',
    image: null,
    id_restaurant: '',
  });

  const handleInputChange = (name, value) => {
    setCategoriesData((prevState) => ({
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
    // Prevent closing modal while loading
    if (loading) return;
    
    onClose();
    setCategoriesData({
      name: '',
      description: '',
      image: null,
      id_restaurant: '',
    });
  };

  const handleSave = async () => {
    console.log('Name:', categoriesData.name);
    console.log('Description:', categoriesData.description);
    console.log('Restaurant ID:', categoriesData.id_restaurant);
    console.log('Image URI:', categoriesData.image);
    
    categoriesData.id_restaurant = (await AsyncStorage.getItem('id')) || '';

    if (!categoriesData.name || !categoriesData.description || !categoriesData.id_restaurant || !categoriesData.image) {
        setAlertMessage('Please fill out all required fields.');
        setAlertVisible(true);
        return;
    }

    setLoading(true); // Start loading

    try {
        const formData = new FormData();

        formData.append('name', categoriesData.name);
        formData.append('description', categoriesData.description);
        formData.append('id_restaurant', categoriesData.id_restaurant);

        if (categoriesData.image) {
            let fileUri;
            let fileName;
            let mimeType = 'image/jpeg'; // Default to JPEG

            if (Platform.OS === 'web') {
                const response = await fetch(categoriesData.image);
                const blob = await response.blob();
                const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
                formData.append('image', file);
            } else {
                // Mobile: Use the direct URI from Expo
                fileUri = categoriesData.image;
                fileName = fileUri.split('/').pop();
                mimeType = mimeType || 'image/jpeg'; // Adjust MIME type if necessary

                formData.append('image', {
                    uri: fileUri,
                    name: fileName,
                    type: mimeType,
                });
            }
        }
  
        const response = await createCategory(formData);
        if (response.status === 201) {
            onSave();
            handleModalClose();
            onUserCreated(); // Refresh the user list
        }
    } catch (error) {
        console.error('Error creating category:', error);
        setAlertMessage('An error occurred while creating the category. Please try again.');
        setAlertVisible(true);
    } finally {
        setLoading(false); // Stop loading
    }
  };

  const inputs = [
    { name: 'name', placeholder: 'Nom Catégorie', keyboardType: 'default' },
    { name: 'description', placeholder: 'Description Catégorie', keyboardType: 'default' },
  ];

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={handleModalClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Loading Overlay */}
          {loading && (
            <View style={styles.loadingOverlay}>
              <View style={styles.loadingContent}>
                <ActivityIndicator size="large" color="#059669" />
                <Text style={styles.loadingText}>Creating category...</Text>
              </View>
            </View>
          )}

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity 
              style={[styles.closeIconContainer, loading && styles.disabledButton]}
              onPress={handleModalClose}
              activeOpacity={loading ? 1 : 0.7}
              disabled={loading}
            >
              <Ionicons name="close" size={24} color={loading ? "#D1D5DB" : "#6B7280"} />
            </TouchableOpacity>
          </View>

          {/* Form Content */}
          <View style={styles.formContainer}>
            {/* Input Fields */}
            {inputs.map((input, index) => (
              <View key={index} style={styles.inputContainer}>
                <View style={[styles.inputWrapper, loading && styles.disabledInput]}>
                  <Ionicons 
                    name={input.name === 'name' ? 'pricetag-outline' : 'document-text-outline'} 
                    size={20} 
                    color={loading ? "#D1D5DB" : "#6B7280"} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder={input.placeholder}
                    placeholderTextColor={loading ? "#D1D5DB" : "#9CA3AF"}
                    value={categoriesData[input.name]}
                    onChangeText={(text) => handleInputChange(input.name, text)}
                    keyboardType={input.keyboardType}
                    style={[styles.textInput, loading && styles.disabledTextInput]}
                    editable={!loading}
                  />
                </View>
              </View>
            ))}

            {/* Image Picker */}
            <View style={styles.imagePickerContainer}>
              <Text style={[styles.imageLabel, loading && styles.disabledText]}>Category Image</Text>
              <TouchableOpacity 
                style={[styles.imagePicker, loading && styles.disabledButton]} 
                onPress={handleImagePicker}
                activeOpacity={loading ? 1 : 0.8}
                disabled={loading}
              >
                {categoriesData.image ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: categoriesData.image }} style={[styles.imagePreview, loading && styles.disabledImage]} />
                    <View style={[styles.imageOverlay, loading && styles.disabledOverlay]}>
                      <Ionicons name="camera" size={24} color={loading ? "#D1D5DB" : "white"} />
                    </View>
                  </View>
                ) : (
                  <View style={styles.imagePickerContent}>
                    <View style={[styles.imagePickerIcon, loading && styles.disabledImageIcon]}>
                      <Ionicons name="camera-outline" size={32} color={loading ? "#D1D5DB" : "#6B7280"} />
                    </View>
                    <Text style={[styles.imagePickerText, loading && styles.disabledText]}>Select an Image</Text>
                    <Text style={[styles.imagePickerSubtext, loading && styles.disabledText]}>Tap to choose from gallery</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.cancelButtonContainer, loading && styles.disabledButton]}
              onPress={handleModalClose}
              activeOpacity={loading ? 1 : 0.8}
              disabled={loading}
            >
              <View style={[styles.cancelButton, loading && styles.disabledCancelButton]}>
                <Text style={[styles.cancelButtonText, loading && styles.disabledButtonText]}>Fermer</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButtonContainer, loading && styles.disabledButton]}
              onPress={handleSave}
              activeOpacity={loading ? 1 : 0.8}
              disabled={loading}
            >
              <LinearGradient
                colors={loading ? ['#D1D5DB', '#D1D5DB'] : ['#22C55E', '#059669']}
                style={styles.saveButton}
              >
                {loading ? (
                  <ActivityIndicator size={20} color="white" />
                ) : (
                  <Ionicons name="checkmark" size={20} color="white" />
                )}
                <Text style={styles.saveButtonText}>
                  {loading ? 'Saving...' : 'Enregistrer'}
                </Text>
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
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  // Loading Overlay Styles
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    borderRadius: 20,
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  // Disabled States
  disabledButton: {
    opacity: 0.6,
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  disabledTextInput: {
    color: '#9CA3AF',
  },
  disabledText: {
    color: '#D1D5DB',
  },
  disabledImage: {
    opacity: 0.6,
  },
  disabledOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  disabledImageIcon: {
    backgroundColor: '#F3F4F6',
  },
  disabledCancelButton: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  disabledButtonText: {
    color: '#D1D5DB',
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

export default ModalAddCategory;