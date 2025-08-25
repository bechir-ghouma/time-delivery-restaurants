import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getOrdersByRestaurantAndDate } from '@/services/orders';

const Recette = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [profitData, setProfitData] = useState({ ordersCount: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(false);

  // Generate date options for the past 30 days
  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date);
    }
    
    return dates;
  };

  const dateOptions = generateDateOptions();

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  // Show date picker modal
  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  // Hide date picker modal
  const hideDatePicker = () => {
    setShowDatePicker(false);
  };

  // Récupérer les données de recette
  const fetchProfitData = async () => {
    try {
      setLoading(true);
      const storedUserId = await AsyncStorage.getItem('id');
      
      if (!storedUserId) {
        Alert.alert('Erreur', 'ID du restaurant non trouvé');
        return;
      }

      const response = await getOrdersByRestaurantAndDate(storedUserId, selectedDate);
  
      const ordersCount = response.length;
      const totalRevenue = response.reduce((sum, order) => {
        const orderTotal = typeof order.total === 'number' ? order.total : parseFloat(order.total) || 0;
        return sum + orderTotal;
      }, 0);
  
      setProfitData({
        ordersCount,
        totalRevenue,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des données de recette:', error);
      Alert.alert('Erreur', 'Échec de la récupération des données de recette. Veuillez réessayer.');
      setProfitData({ ordersCount: 0, totalRevenue: 0 });
    } finally {
      setLoading(false);
    }
  };

  // Formater la date pour l'affichage
  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format date for list item
  const formatDateShort = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hier";
    } else {
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'short'
      });
    }
  };

  // Render date picker item
  const renderDateItem = ({ item }) => {
    const isSelected = item.toDateString() === selectedDate.toDateString();
    
    return (
      <TouchableOpacity
        style={[styles.dateItem, isSelected && styles.selectedDateItem]}
        onPress={() => handleDateSelect(item)}
        activeOpacity={0.7}
      >
        <Text style={[styles.dateItemText, isSelected && styles.selectedDateItemText]}>
          {formatDateShort(item)}
        </Text>
        <Text style={[styles.dateItemSubtext, isSelected && styles.selectedDateItemSubtext]}>
          {item.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <LinearGradient
          colors={['#059669', '#047857']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Ionicons name="analytics" size={28} color="white" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Visualisation des Recettes</Text>
              <Text style={styles.headerSubtitle}>Suivez vos revenus quotidiens</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Date Selection Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="calendar" size={20} color="#059669" />
          <Text style={styles.cardTitle}>Sélectionner une Date</Text>
        </View>
        
        <TouchableOpacity
          style={styles.dateSelector}
          onPress={showDatePickerModal}
          activeOpacity={0.7}
        >
          <View style={styles.dateSelectorContent}>
            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
            <Ionicons name="chevron-down" size={16} color="#6B7280" />
          </View>
        </TouchableOpacity>

        {/* Modal with improved web compatibility */}
        <Modal
          animationType={Platform.OS === 'web' ? 'none' : 'slide'}
          transparent={true}
          visible={showDatePicker}
          onRequestClose={hideDatePicker}
          presentationStyle={Platform.OS === 'ios' ? 'overFullScreen' : 'overFullScreen'}
          statusBarTranslucent={true}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity 
              style={styles.modalBackdrop} 
              onPress={hideDatePicker}
              activeOpacity={1}
            />
            <View style={styles.datePickerModal}>
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>Sélectionner une Date</Text>
                <TouchableOpacity onPress={hideDatePicker} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              <ScrollView 
                style={styles.dateScrollView}
                contentContainerStyle={styles.dateScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {dateOptions.map((date, index) => {
                  const isSelected = date.toDateString() === selectedDate.toDateString();
                  return (
                    <TouchableOpacity
                      key={date.toISOString()}
                      style={[styles.dateItem, isSelected && styles.selectedDateItem]}
                      onPress={() => handleDateSelect(date)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.dateItemText, isSelected && styles.selectedDateItemText]}>
                        {formatDateShort(date)}
                      </Text>
                      <Text style={[styles.dateItemSubtext, isSelected && styles.selectedDateItemSubtext]}>
                        {date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              
              <View style={styles.datePickerFooter}>
                <TouchableOpacity
                  style={styles.confirmDateButton}
                  onPress={hideDatePicker}
                >
                  <Text style={styles.confirmDateButtonText}>Confirmer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <TouchableOpacity
          style={[styles.showProfitButton, loading && styles.disabledButton]}
          onPress={fetchProfitData}
          disabled={loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={loading ? ['#9CA3AF', '#6B7280'] : ['#22C55E', '#059669']}
            style={styles.buttonGradient}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="analytics" size={20} color="white" />
            )}
            <Text style={styles.buttonText}>
              {loading ? 'Chargement...' : 'Afficher les Recettes'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Profit Data Display */}
      {(profitData.ordersCount > 0 || profitData.totalRevenue > 0) && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Résultats pour {formatDate(selectedDate)}</Text>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.ordersCard]}>
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={styles.statGradient}
              >
                <View style={styles.statIcon}>
                  <Ionicons name="receipt" size={24} color="white" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statLabel}>Commandes</Text>
                  <Text style={styles.statValue}>{profitData.ordersCount}</Text>
                </View>
              </LinearGradient>
            </View>

            <View style={[styles.statCard, styles.revenueCard]}>
              <LinearGradient
                colors={['#059669', '#047857']}
                style={styles.statGradient}
              >
                <View style={styles.statIcon}>
                  <Ionicons name="cash" size={24} color="white" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statLabel}>Recettes Totales</Text>
                  <Text style={styles.statValue}>{profitData.totalRevenue.toFixed(2)} TND</Text>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Average Order Value */}
          <View style={styles.additionalCard}>
            <View style={styles.additionalCardContent}>
              <View style={styles.additionalIcon}>
                <Ionicons name="trending-up" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.additionalInfo}>
                <Text style={styles.additionalLabel}>Valeur Moyenne par Commande</Text>
                <Text style={styles.additionalValue}>
                  {profitData.ordersCount > 0 
                    ? (profitData.totalRevenue / profitData.ordersCount).toFixed(2) 
                    : '0.00'} TND
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* No Data Message */}
      {!loading && profitData.ordersCount === 0 && profitData.totalRevenue === 0 && (
        <View style={styles.noDataCard}>
          <View style={styles.noDataIcon}>
            <Ionicons name="document-outline" size={48} color="#9CA3AF" />
          </View>
          <Text style={styles.noDataTitle}>Aucune donnée disponible</Text>
          <Text style={styles.noDataText}>
            Aucune commande trouvée pour {formatDate(selectedDate)}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
  },
  headerCard: {
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  headerGradient: {
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  dateSelector: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  dateSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
    marginLeft: 12,
  },
  // Enhanced modal styles for better web compatibility
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
    }),
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  datePickerModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: Platform.OS === 'web' ? '90%' : '100%',
    maxWidth: Platform.OS === 'web' ? 400 : '100%',
    maxHeight: Platform.OS === 'web' ? 500 : '80%',
    margin: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
    }),
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
    borderRadius: 8,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  dateScrollView: {
    maxHeight: 300,
    minHeight: 200,
  },
  dateScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  dateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 2,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    minHeight: 56,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  selectedDateItem: {
    backgroundColor: '#059669',
  },
  dateItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  selectedDateItemText: {
    color: 'white',
  },
  dateItemSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedDateItemSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  datePickerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  confirmDateButton: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  confirmDateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  showProfitButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  resultsContainer: {
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statGradient: {
    padding: 16,
    minHeight: 120,
  },
  statIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  additionalCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  additionalCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  additionalIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  additionalInfo: {
    flex: 1,
  },
  additionalLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  additionalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  noDataCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  noDataIcon: {
    marginBottom: 16,
  },
  noDataTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  noDataText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default Recette;