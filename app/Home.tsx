import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getOrdersByRestaurant, getOrdersByStatusAndRestaurant } from '@/services/orders';
import { getCategoriesByRestaurant } from '@/services/categoryService';
import { getMenusByCategory } from '@/services/menuService';
import { getUserById } from '@/services/users';
import { getRegularScheduleRestaurant, saveEmergencyClosure, getEmergencyClosure } from '@/services/scheduleService';

const { width, height } = Dimensions.get('window');

const AnimatedCard = ({ children, delay = 0, style }) => {
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(30);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

const StatCard = ({ title, value, icon, color, delay, onPress }) => {
  const scaleAnim = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <AnimatedCard delay={delay} style={styles.statCardContainer}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient
            colors={color}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.statIconContainer}>
              <View style={styles.statIcon}>
                <Ionicons name={icon} size={24} color="white" />
              </View>
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statTitle}>{title}</Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    </AnimatedCard>
  );
};

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [restaurantData, setRestaurantData] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    categories: 0,
    totalMenus: 0,
  });
  const [isOpen, setIsOpen] = useState(true);
  const [emergencyClosure, setEmergencyClosure] = useState(null);
  const [todayRevenue, setTodayRevenue] = useState(0);

  const pulseAnim = new Animated.Value(1);
  const rotateAnim = new Animated.Value(0);

  useEffect(() => {
    // Pulse animation for status indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotation animation for refresh icon
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const restaurantId = await AsyncStorage.getItem('id');
      
      if (!restaurantId) {
        console.error('Restaurant ID not found');
        return;
      }

      // Load restaurant data
      const restaurantResponse = await getUserById(restaurantId);
      setRestaurantData(restaurantResponse.data);

      // Load emergency closure status
      const emergencyData = await getEmergencyClosure(restaurantId);
      setEmergencyClosure(emergencyData);
      setIsOpen(!emergencyData?.isClosed);

      // Load statistics
      await loadStatistics(restaurantId);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async (restaurantId) => {
    try {
      // Get all orders
      const allOrders = await getOrdersByRestaurant(restaurantId);
      
      // Get pending orders
      const pendingOrders = await getOrdersByStatusAndRestaurant(restaurantId);
      
      // Get categories
      const categoriesResponse = await getCategoriesByRestaurant(restaurantId);
      const categories = categoriesResponse.data || [];
      
      // Count total menus across all categories
      let totalMenus = 0;
      for (const category of categories) {
        try {
          const menus = await getMenusByCategory(category.id);
          totalMenus += menus.length;
        } catch (error) {
          console.error('Error loading menus for category:', category.id);
        }
      }

      // Calculate today's revenue
      const today = new Date();
      const todayOrders = allOrders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.toDateString() === today.toDateString() && 
               order.status === 'delivered';
      });
      
      const revenue = todayOrders.reduce((sum, order) => {
        return sum + (parseFloat(order.total) || 0);
      }, 0);

      setStats({
        totalOrders: allOrders.length,
        pendingOrders: pendingOrders.length,
        categories: categories.length,
        totalMenus,
      });
      
      setTodayRevenue(revenue);

    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const toggleRestaurantStatus = async () => {
    try {
      const restaurantId = await AsyncStorage.getItem('id');
      const newStatus = !isOpen;
      
      const emergencyClosureData = {
        isClosed: newStatus,
        reason: newStatus ? 'Restaurant temporarily closed' : '',
        reopenDate: newStatus ? null : new Date().toISOString(),
      };

      await saveEmergencyClosure(restaurantId, emergencyClosureData);
      setIsOpen(!newStatus);
      setEmergencyClosure(emergencyClosureData);
      
    } catch (error) {
      console.error('Error toggling restaurant status:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <AnimatedCard delay={0}>
        <LinearGradient
          colors={['#059669', '#047857']}
          style={styles.headerCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.greetingSection}>
              <Text style={styles.greetingText}>{getGreeting()}</Text>
              <Text style={styles.restaurantName}>
                {restaurantData?.name_restaurant || 'Restaurant'}
              </Text>
            </View>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons name="restaurant" size={32} color="white" />
            </Animated.View>
          </View>
        </LinearGradient>
      </AnimatedCard>

      {/* Restaurant Status Card */}
      <AnimatedCard delay={200}>
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>Restaurant Status</Text>
              <Text style={[styles.statusText, { color: isOpen ? '#22C55E' : '#EF4444' }]}>
                {isOpen ? 'Open' : 'Closed'}
              </Text>
            </View>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <View style={[styles.statusIndicator, { backgroundColor: isOpen ? '#22C55E' : '#EF4444' }]} />
            </Animated.View>
          </View>
          
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={toggleRestaurantStatus}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isOpen ? ['#EF4444', '#DC2626'] : ['#22C55E', '#059669']}
              style={styles.toggleButtonGradient}
            >
              <Ionicons 
                name={isOpen ? 'close-circle' : 'checkmark-circle'} 
                size={20} 
                color="white" 
              />
              <Text style={styles.toggleButtonText}>
                {isOpen ? 'Close Restaurant' : 'Open Restaurant'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </AnimatedCard>

      {/* Statistics Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Orders"
          value={stats.totalOrders.toString()}
          icon="receipt"
          color={['#3B82F6', '#2563EB']}
          delay={300}
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders.toString()}
          icon="time"
          color={['#F59E0B', '#D97706']}
          delay={400}
        />
        <StatCard
          title="Categories"
          value={stats.categories.toString()}
          icon="grid"
          color={['#8B5CF6', '#7C3AED']}
          delay={500}
        />
        <StatCard
          title="Menu Items"
          value={stats.totalMenus.toString()}
          icon="restaurant"
          color={['#059669', '#047857']}
          delay={600}
        />
      </View>

      {/* Revenue Card */}
      <AnimatedCard delay={700}>
        <View style={styles.revenueCard}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.revenueGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.revenueHeader}>
              <View style={styles.revenueIcon}>
                <Ionicons name="cash" size={28} color="white" />
              </View>
              <View style={styles.revenueInfo}>
                <Text style={styles.revenueTitle}>Today's Revenue</Text>
                <Text style={styles.revenueAmount}>{todayRevenue.toFixed(2)} TND</Text>
              </View>
            </View>
            <View style={styles.revenueDetails}>
              <Text style={styles.revenueSubtext}>
                From {stats.totalOrders} total orders
              </Text>
            </View>
          </LinearGradient>
        </View>
      </AnimatedCard>

      {/* Quick Actions */}
      <AnimatedCard delay={800}>
        <View style={styles.quickActionsCard}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionItem} activeOpacity={0.8}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#3B82F6' }]}>
                <Ionicons name="add-circle" size={24} color="white" />
              </View>
              <Text style={styles.quickActionText}>Add Menu</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionItem} activeOpacity={0.8}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#F59E0B' }]}>
                <Ionicons name="notifications" size={24} color="white" />
              </View>
              <Text style={styles.quickActionText}>Orders</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionItem} activeOpacity={0.8}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#8B5CF6' }]}>
                <Ionicons name="analytics" size={24} color="white" />
              </View>
              <Text style={styles.quickActionText}>Analytics</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionItem} activeOpacity={0.8}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#059669' }]}>
                <Ionicons name="settings" size={24} color="white" />
              </View>
              <Text style={styles.quickActionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </AnimatedCard>

      {/* Bottom Padding */}
      <View style={styles.bottomPadding} />
    </ScrollView>
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
  headerCard: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingSection: {
    flex: 1,
  },
  greetingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  statusCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 8,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  toggleButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  toggleButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCardContainer: {
    width: (width - 44) / 2,
  },
  statCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  statIconContainer: {
    marginBottom: 12,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  revenueCard: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  revenueGradient: {
    padding: 24,
  },
  revenueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  revenueIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  revenueInfo: {
    flex: 1,
  },
  revenueTitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginBottom: 4,
  },
  revenueAmount: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
  },
  revenueDetails: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  revenueSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  quickActionsCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  quickActionItem: {
    width: (width - 80) / 4,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 100,
  },
});

export default Home;