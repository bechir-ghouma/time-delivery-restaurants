import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ModalAddCatgeory from './ModalAddCategory';
import ModalAddMenu from './ModalAddMenu';

const SearchWithButton = ({ data, titleModal, onSearch, onSave }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleSearch = (text) => {
    setSearchTerm(text);
    const lowerCaseText = text.toLowerCase();

    if (lowerCaseText === '') {
      onSearch(data); // Show all data if search is cleared
    } else {
      const filteredData = data.filter((item) => {
        if (titleModal === "Ajouter Livreur" || titleModal === "Add Delivery" || titleModal === "Ajouter une categorie" ) {
          return (
            item.first_name.toLowerCase().includes(lowerCaseText) ||
            item.last_name.toLowerCase().includes(lowerCaseText) ||
            item.email.toLowerCase().includes(lowerCaseText) ||
            item.phone_number.toLowerCase().includes(lowerCaseText) ||
            (item.address && item.address.toLowerCase().includes(lowerCaseText))
          );
        } else if (titleModal === "Ajouter Restaurant" || titleModal === "Add Restaurant") {
          return (
            item.name_restaurant.toLowerCase().includes(lowerCaseText) ||
            item.email.toLowerCase().includes(lowerCaseText) ||
            item.phone_number.toLowerCase().includes(lowerCaseText) ||
            (item.address && item.address.toLowerCase().includes(lowerCaseText))
          );
          
        }
        else if (titleModal === "Ajouter Catégorie" || titleModal === "Add Category") {
          return (
            item.name.toLowerCase().includes(lowerCaseText) ||
            item.description.toLowerCase().includes(lowerCaseText)
          );
          
        }
        else if (titleModal === "Ajouter Menu" || titleModal === "Add Menu") {
          return (
            item.name.toLowerCase().includes(lowerCaseText) ||
            item.description.toLowerCase().includes(lowerCaseText)
          );
          
        }
        else if(titleModal === "Home Livreur"){
          return (
            (item.client?.first_name?.toLowerCase().includes(lowerCaseText) ||
             item.client?.last_name?.toLowerCase().includes(lowerCaseText)) ||
            (item.name_client && item.name_client.toLowerCase().includes(lowerCaseText))
          );
        }

        return false; // Default case, if needed
      });

      onSearch(filteredData);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearch(data);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const handleSave = (data) => {
    onSave(data);
    setModalVisible(false);
  };

  const renderModal = () => {
    if (titleModal === "Add Category" || titleModal === "Ajouter Catégorie"){
      return (
        <ModalAddCatgeory
          visible={isModalVisible}
          onClose={handleModalClose}
          onSave={handleSave}
          title={titleModal}
          onUserCreated={handleSave}
        />
      ); 
    }
    else if (titleModal === "Add Menu" || titleModal === "Ajouter Menu"){
      return (
        <ModalAddMenu
          visible={isModalVisible}
          onClose={handleModalClose}
          onSave={handleSave}
          title={titleModal}
          onUserCreated={handleSave}
        />
      );
    }
    
    // Return null if no matching modal
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        {/* Custom Search Input */}
        <View style={styles.searchInputContainer}>
          <Ionicons 
            name="search-outline" 
            size={20} 
            color="#6B7280" 
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search here..."
            placeholderTextColor="#9CA3AF"
            value={searchTerm}
            onChangeText={handleSearch}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        {/* Custom Add Button */}
        <TouchableOpacity
          style={styles.addButtonContainer}
          onPress={toggleModal}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#22C55E', '#059669']}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>Ajouter</Text>
            <Ionicons name="add" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
      {renderModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
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
    marginRight: 12,
    height: 48,
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
  addButtonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 48,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default SearchWithButton;