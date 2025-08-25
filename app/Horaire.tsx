import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import the same services as RestaurantSchedule
import { 
  saveRegularScheduleRestaurant, 
  getRegularScheduleRestaurant, 
  saveEmergencyClosure, 
  getEmergencyClosure 
} from '@/services/scheduleService';

const Horaire = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success'); // success, error, warning
  const [restaurantId, setRestaurantId] = useState(null);
  
  const [schedule, setSchedule] = useState({
    monday: { enabled: false, openTime: '09:00', closeTime: '22:00' },
    tuesday: { enabled: false, openTime: '09:00', closeTime: '22:00' },
    wednesday: { enabled: false, openTime: '09:00', closeTime: '22:00' },
    thursday: { enabled: false, openTime: '09:00', closeTime: '22:00' },
    friday: { enabled: false, openTime: '09:00', closeTime: '22:00' },
    saturday: { enabled: false, openTime: '09:00', closeTime: '22:00' },
    sunday: { enabled: false, openTime: '09:00', closeTime: '22:00' },
  });
  
  const days = [
    { key: 'monday', label: 'Lundi', icon: 'calendar-outline' },
    { key: 'tuesday', label: 'Mardi', icon: 'calendar-outline' },
    { key: 'wednesday', label: 'Mercredi', icon: 'calendar-outline' },
    { key: 'thursday', label: 'Jeudi', icon: 'calendar-outline' },
    { key: 'friday', label: 'Vendredi', icon: 'calendar-outline' },
    { key: 'saturday', label: 'Samedi', icon: 'calendar-outline' },
    { key: 'sunday', label: 'Dimanche', icon: 'calendar-outline' },
  ];
  
  const [emergencyClosure, setEmergencyClosure] = useState({
    isClosed: false,
    reason: '',
    reopenDate: '',
  });
  
  // State for custom date picker modal
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // Simple date formatting function
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const getCurrentDate = () => {
    const now = new Date();
    return {
      day: now.getDate().toString().padStart(2, '0'),
      month: (now.getMonth() + 1).toString().padStart(2, '0'),
      year: now.getFullYear().toString()
    };
  };

  useEffect(() => {
    initializeComponent();
  }, []);

  const initializeComponent = async () => {
    try {
      const id = await AsyncStorage.getItem('id');
      if (id) {
        setRestaurantId(id);
        await Promise.all([
          loadScheduleData(id),
          loadEmergencyClosureData(id)
        ]);
      } else {
        showAlert('error', 'ID du restaurant non trouvé');
      }
    } catch (error) {
      console.error('Error initializing component:', error);
      showAlert('error', 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadScheduleData = async (id) => {
    try {
      const data = await getRegularScheduleRestaurant(id);
      const updatedSchedule = {
        monday: { enabled: false, openTime: '09:00', closeTime: '22:00' },
        tuesday: { enabled: false, openTime: '09:00', closeTime: '22:00' },
        wednesday: { enabled: false, openTime: '09:00', closeTime: '22:00' },
        thursday: { enabled: false, openTime: '09:00', closeTime: '22:00' },
        friday: { enabled: false, openTime: '09:00', closeTime: '22:00' },
        saturday: { enabled: false, openTime: '09:00', closeTime: '22:00' },
        sunday: { enabled: false, openTime: '09:00', closeTime: '22:00' },
      };

      data.forEach((day) => {
        if (updatedSchedule[day.day]) {
          updatedSchedule[day.day] = {
            enabled: day.enabled ?? false,
            openTime: day.openTime ?? '09:00',
            closeTime: day.closeTime ?? '22:00',
          };
        }
      });

      setSchedule(updatedSchedule);
    } catch (error) {
      console.error('Error loading schedule data:', error);
      showAlert('error', 'Erreur lors du chargement des horaires');
    }
  };

  const loadEmergencyClosureData = async (id) => {
    try {
      const data = await getEmergencyClosure(id);
      if (data) {
        setEmergencyClosure({
          isClosed: data.isClosed,
          reason: data.reason,
          reopenDate: data.reopenDate,
        });
      }
    } catch (error) {
      console.error('Error loading emergency closure data:', error);
      showAlert('error', 'Erreur lors du chargement des fermetures d\'urgence');
    }
  };

  const showAlert = (type, message) => {
    setAlertType(type);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const handleSave = async () => {
    if (!restaurantId) {
      showAlert('error', 'ID du restaurant manquant');
      return;
    }

    // Validate enabled days have valid times
    const invalidDays = Object.entries(schedule)
      .filter(([_, value]) => value.enabled)
      .find(([_, value]) => !value.openTime || !value.closeTime);

    if (invalidDays) {
      showAlert('warning', 'Veuillez définir les heures d\'ouverture et de fermeture pour tous les jours activés');
      return;
    }

    if (emergencyClosure.isClosed && !emergencyClosure.reason) {
      showAlert('warning', 'Veuillez fournir une raison pour la fermeture d\'urgence');
      return;
    }

    setSaving(true);
    try {
      await Promise.all([
        saveRegularScheduleRestaurant(restaurantId, schedule),
        saveEmergencyClosure(restaurantId, emergencyClosure)
      ]);
      showAlert('success', 'Horaires sauvegardés avec succès');
    } catch (error) {
      console.error('Error saving schedule:', error);
      showAlert('error', 'Erreur lors de la sauvegarde des horaires');
    } finally {
      setSaving(false);
    }
  };

  const handleDayToggle = (day) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...(prev[day] || {}),
        enabled: !prev[day]?.enabled,
      }
    }));
  };

  const handleTimeChange = (day, type, value) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: value,
      }
    }));
  };

  const toggleEmergencyClosure = () => {
    setEmergencyClosure(prev => ({
      ...prev,
      isClosed: !prev.isClosed,
      reason: !prev.isClosed ? prev.reason : '',
      reopenDate: !prev.isClosed ? prev.reopenDate : '',
    }));
  };

  const handleDatePickerShow = () => {
    const current = getCurrentDate();
    setSelectedDay(current.day);
    setSelectedMonth(current.month);
    setSelectedYear(current.year);
    setShowDateModal(true);
  };

  const handleDateConfirm = () => {
    if (selectedDay && selectedMonth && selectedYear) {
      const formattedDate = `${selectedYear}-${selectedMonth}-${selectedDay} 23:00:00`;
      setEmergencyClosure(prev => ({
        ...prev,
        reopenDate: formattedDate
      }));
    }
    setShowDateModal(false);
  };

  const handleDateCancel = () => {
    setShowDateModal(false);
  };

  const getAlertIcon = () => {
    switch (alertType) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'close-circle';
      case 'warning': return 'warning';
      default: return 'information-circle';
    }
  };

  const getAlertColor = () => {
    switch (alertType) {
      case 'success': return '#22C55E';
      case 'error': return '#EF4444';
      case 'warning': return '#F59E0B';
      default: return '#059669';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>Chargement des horaires...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <LinearGradient
            colors={['#059669', '#047857']}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <Ionicons name="time-outline" size={32} color="white" />
              <Text style={styles.headerTitle}>Gestion des Horaires</Text>
              <Text style={styles.headerSubtitle}>Configurez vos heures d'ouverture</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Regular Schedule Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={24} color="#059669" />
            <Text style={styles.sectionTitle}>Horaires Réguliers</Text>
          </View>
          
          {days.map(({ key, label, icon }) => (
            <View key={key} style={styles.dayCard}>
              <TouchableOpacity 
                style={[
                  styles.dayHeader,
                  schedule[key]?.enabled && styles.dayHeaderActive
                ]}
                onPress={() => handleDayToggle(key)}
                activeOpacity={0.7}
              >
                <View style={styles.dayInfo}>
                  <Ionicons 
                    name={icon} 
                    size={20} 
                    color={schedule[key]?.enabled ? 'white' : '#6B7280'} 
                  />
                  <Text style={[
                    styles.dayLabel,
                    schedule[key]?.enabled && styles.dayLabelActive
                  ]}>
                    {label}
                  </Text>
                </View>
                <View style={[
                  styles.toggleSwitch,
                  schedule[key]?.enabled && styles.toggleSwitchActive
                ]}>
                  <View style={[
                    styles.toggleThumb,
                    schedule[key]?.enabled && styles.toggleThumbActive
                  ]} />
                </View>
              </TouchableOpacity>
              
              {schedule[key]?.enabled && (
                <View style={styles.timeInputsContainer}>
                  <View style={styles.timeInputGroup}>
                    <Text style={styles.timeLabel}>Ouverture</Text>
                    <View style={styles.timeInputWrapper}>
                      <Ionicons name="time-outline" size={16} color="#6B7280" />
                      <TextInput
                        style={styles.timeInput}
                        placeholder="09:00"
                        value={schedule[key].openTime}
                        onChangeText={(text) => handleTimeChange(key, 'openTime', text)}
                        keyboardType="numbers-and-punctuation"
                      />
                    </View>
                  </View>
                  
                  <View style={styles.timeSeparator}>
                    <Ionicons name="arrow-forward" size={16} color="#6B7280" />
                  </View>
                  
                  <View style={styles.timeInputGroup}>
                    <Text style={styles.timeLabel}>Fermeture</Text>
                    <View style={styles.timeInputWrapper}>
                      <Ionicons name="time-outline" size={16} color="#6B7280" />
                      <TextInput
                        style={styles.timeInput}
                        placeholder="22:00"
                        value={schedule[key].closeTime}
                        onChangeText={(text) => handleTimeChange(key, 'closeTime', text)}
                        keyboardType="numbers-and-punctuation"
                      />
                    </View>
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Emergency Closure Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="warning" size={24} color="#EF4444" />
            <Text style={styles.sectionTitle}>Fermeture d'Urgence</Text>
          </View>
          
          <View style={styles.emergencyCard}>
            <TouchableOpacity 
              style={[
                styles.emergencyHeader,
                emergencyClosure.isClosed && styles.emergencyHeaderActive
              ]}
              onPress={toggleEmergencyClosure}
              activeOpacity={0.7}
            >
              <View style={styles.emergencyInfo}>
                <Ionicons 
                  name="close-circle" 
                  size={20} 
                  color={emergencyClosure.isClosed ? 'white' : '#EF4444'} 
                />
                <Text style={[
                  styles.emergencyLabel,
                  emergencyClosure.isClosed && styles.emergencyLabelActive
                ]}>
                  Fermeture Temporaire
                </Text>
              </View>
              <View style={[
                styles.toggleSwitch,
                emergencyClosure.isClosed && styles.toggleSwitchEmergency
              ]}>
                <View style={[
                  styles.toggleThumb,
                  emergencyClosure.isClosed && styles.toggleThumbActive
                ]} />
              </View>
            </TouchableOpacity>
            
            {emergencyClosure.isClosed && (
              <View style={styles.emergencyInputsContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Raison de la fermeture</Text>
                  <View style={styles.textInputWrapper}>
                    <Ionicons name="document-text-outline" size={16} color="#6B7280" />
                    <TextInput
                      style={[styles.textInput, styles.textInputMultiline]}
                      placeholder="Décrivez la raison de la fermeture..."
                      value={emergencyClosure.reason}
                      onChangeText={(text) => setEmergencyClosure(prev => ({ ...prev, reason: text }))}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Date de réouverture</Text>
                  <TouchableOpacity 
                    style={styles.dateInputWrapper}
                    onPress={handleDatePickerShow}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                    <Text style={[
                      styles.dateInput,
                      !emergencyClosure.reopenDate && styles.dateInputPlaceholder
                    ]}>
                      {emergencyClosure.reopenDate 
                        ? formatDate(emergencyClosure.reopenDate)
                        : 'Sélectionner une date'
                      }
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.saveContainer}>
          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={saving ? ['#9CA3AF', '#6B7280'] : ['#22C55E', '#059669']}
              style={styles.saveButtonGradient}
            >
              {saving ? (
                <>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.saveButtonText}>Sauvegarde...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color="white" />
                  <Text style={styles.saveButtonText}>Enregistrer les Modifications</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Add some bottom padding for better scrolling */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Custom Alert Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={alertVisible}
        onRequestClose={() => setAlertVisible(false)}
      >
        <View style={styles.alertOverlay}>
          <View style={styles.alertContainer}>
            <View style={[styles.alertIconContainer, { backgroundColor: `${getAlertColor()}20` }]}>
              <Ionicons name={getAlertIcon()} size={32} color={getAlertColor()} />
            </View>
            <Text style={styles.alertTitle}>
              {alertType === 'success' ? 'Succès' : 
               alertType === 'error' ? 'Erreur' : 
               alertType === 'warning' ? 'Attention' : 'Information'}
            </Text>
            <Text style={styles.alertMessage}>{alertMessage}</Text>
            <TouchableOpacity 
              style={[styles.alertButton, { backgroundColor: getAlertColor() }]}
              onPress={() => setAlertVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.alertButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Custom Date Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDateModal}
        onRequestClose={handleDateCancel}
      >
        <View style={styles.dateModalOverlay}>
          <View style={styles.dateModalContainer}>
            <View style={styles.dateModalHeader}>
              <Text style={styles.dateModalTitle}>Sélectionner une date</Text>
            </View>
            
            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerLabel}>Jour</Text>
                <ScrollView style={styles.datePickerScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.datePickerOption,
                        selectedDay === day.toString().padStart(2, '0') && styles.datePickerOptionSelected
                      ]}
                      onPress={() => setSelectedDay(day.toString().padStart(2, '0'))}
                    >
                      <Text style={[
                        styles.datePickerOptionText,
                        selectedDay === day.toString().padStart(2, '0') && styles.datePickerOptionTextSelected
                      ]}>
                        {day.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerLabel}>Mois</Text>
                <ScrollView style={styles.datePickerScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <TouchableOpacity
                      key={month}
                      style={[
                        styles.datePickerOption,
                        selectedMonth === month.toString().padStart(2, '0') && styles.datePickerOptionSelected
                      ]}
                      onPress={() => setSelectedMonth(month.toString().padStart(2, '0'))}
                    >
                      <Text style={[
                        styles.datePickerOptionText,
                        selectedMonth === month.toString().padStart(2, '0') && styles.datePickerOptionTextSelected
                      ]}>
                        {month.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerLabel}>Année</Text>
                <ScrollView style={styles.datePickerScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i).map(year => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.datePickerOption,
                        selectedYear === year.toString() && styles.datePickerOptionSelected
                      ]}
                      onPress={() => setSelectedYear(year.toString())}
                    >
                      <Text style={[
                        styles.datePickerOptionText,
                        selectedYear === year.toString() && styles.datePickerOptionTextSelected
                      ]}>
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            
            <View style={styles.dateModalButtons}>
              <TouchableOpacity 
                style={styles.dateModalCancelButton}
                onPress={handleDateCancel}
                activeOpacity={0.8}
              >
                <Text style={styles.dateModalCancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.dateModalConfirmButton}
                onPress={handleDateConfirm}
                activeOpacity={0.8}
              >
                <Text style={styles.dateModalConfirmButtonText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  headerGradient: {
    padding: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  dayCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  dayHeaderActive: {
    backgroundColor: '#059669',
  },
  dayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  dayLabelActive: {
    color: 'white',
  },
  toggleSwitch: {
    width: 50,
    height: 30,
    backgroundColor: '#E5E7EB',
    borderRadius: 15,
    justifyContent: 'center',
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: '#D1FAE5',
  },
  toggleSwitchEmergency: {
    backgroundColor: '#FEE2E2',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    backgroundColor: 'white',
    borderRadius: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  timeInputsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 0,
  },
  timeInputGroup: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  timeInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  timeInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 8,
  },
  timeSeparator: {
    marginHorizontal: 16,
    alignItems: 'center',
  },
  emergencyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emergencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
  },
  emergencyHeaderActive: {
    backgroundColor: '#EF4444',
  },
  emergencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
  emergencyLabelActive: {
    color: 'white',
  },
  emergencyInputsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  textInputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 8,
  },
  textInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dateInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 8,
  },
  dateInputPlaceholder: {
    color: '#9CA3AF',
  },
  // Custom Date Picker Modal Styles
  dateModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  dateModalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: '70%',
  },
  dateModalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dateModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  datePickerColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  datePickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 10,
  },
  datePickerScroll: {
    maxHeight: 200,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  datePickerOption: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  datePickerOptionSelected: {
    backgroundColor: '#059669',
  },
  datePickerOptionText: {
    fontSize: 16,
    color: '#1F2937',
  },
  datePickerOptionTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  dateModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  dateModalCancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dateModalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  dateModalConfirmButton: {
    flex: 1,
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dateModalConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  saveContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonDisabled: {
    shadowOpacity: 0.1,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 100, // Extra space for bottom navigation
  },
  // Alert Modal Styles
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  alertContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  alertIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  alertButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 100,
  },
  alertButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
});

export default Horaire;