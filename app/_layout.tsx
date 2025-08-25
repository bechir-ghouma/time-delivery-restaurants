// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   StatusBar,
//   SafeAreaView,
//   Dimensions,
//   ActivityIndicator,
//   Modal,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import Home from './Home';
// import Orders from './Orders'; 
// import Menu from './Menu';
// import CategoryMenu from './CategoryMenu'; // Import CategoryMenu component
// import Recette from './Recette'; // Import Recette component
// import Login from './Login';

// const { width, height } = Dimensions.get('window');

// const RestaurantLayout = ({ children }) => {
//   const [activeTab, setActiveTab] = useState('dashboard');
//   const [isAuthenticated, setIsAuthenticated] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [showLogoutModal, setShowLogoutModal] = useState(false);
  
//   // New state for category menu navigation
//   const [showCategoryMenu, setShowCategoryMenu] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState(null);

//   useEffect(() => {
//     checkAuthStatus();
//   }, []);

//   const checkAuthStatus = async () => {
//     try {
//       const token = await AsyncStorage.getItem('authToken');
//       const userData = await AsyncStorage.getItem('userData');
      
//       if (token && userData) {
//         setIsAuthenticated(true);
//       } else {
//         setIsAuthenticated(false);
//       }
//     } catch (error) {
//       console.error('Error checking auth status:', error);
//       setIsAuthenticated(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogin = async (userData, token) => {
//     try {
//       await AsyncStorage.setItem('authToken', token);
//       await AsyncStorage.setItem('userData', JSON.stringify(userData));
//       setIsAuthenticated(true);
//     } catch (error) {
//       console.error('Error storing auth data:', error);
//     }
//   };

//   const confirmLogout = () => {
//     setShowLogoutModal(true);
//   };

//   const handleLogout = async () => {
//     try {
//       await AsyncStorage.removeItem('authToken');
//       await AsyncStorage.removeItem('userData');
//       setIsAuthenticated(false);
//       setActiveTab('dashboard');
//       // Reset category menu state on logout
//       setShowCategoryMenu(false);
//       setSelectedCategory(null);
//       setShowLogoutModal(false);
//     } catch (error) {
//       console.error('Error clearing auth data:', error);
//     }
//   };

//   const cancelLogout = () => {
//     setShowLogoutModal(false);
//   };

//   // Function to handle category selection from Menu component
//   const handleCategorySelect = async (categoryId, categoryName) => {
//     try {
//       await AsyncStorage.setItem("id_category", categoryId.toString());
//       await AsyncStorage.setItem("category_name", categoryName);
//       setSelectedCategory({ id: categoryId, name: categoryName });
//       setShowCategoryMenu(true);
//     } catch (error) {
//       console.error('Error setting category data:', error);
//     }
//   };

//   // Function to go back to menu from category menu
//   const handleBackToMenu = () => {
//     setShowCategoryMenu(false);
//     setSelectedCategory(null);
//   };

//   // Function to handle tab changes
//   const handleTabChange = (tabId) => {
//     setActiveTab(tabId);
//     // Reset category menu when switching tabs
//     if (tabId !== 'menu') {
//       setShowCategoryMenu(false);
//       setSelectedCategory(null);
//     }
//   };

//   // Function to render content based on active tab and current state
//   const renderContent = () => {
//     switch (activeTab) {
//       case 'dashboard':
//         return <Home />;
//       case 'orders':
//         return <Orders />;
//       case 'menu':
//         // Show CategoryMenu if a category is selected, otherwise show Menu
//         if (showCategoryMenu && selectedCategory) {
//           return <CategoryMenu onBack={handleBackToMenu} />;
//         }
//         return <Menu onCategorySelect={handleCategorySelect} />;
//       case 'recette': // Changed from 'tables' to 'recette'
//         return <Recette />; // Display Recette component
//       case 'staff':
//         return (
//           <View style={styles.placeholderContent}>
//             <Text style={styles.placeholderText}>Staff Component</Text>
//           </View>
//         );
//       default:
//         return children || <Home />;
//     }
//   };

//   // Show loading spinner while checking authentication
//   if (loading) {
//     return (
//       <SafeAreaView style={styles.loadingContainer}>
//         <StatusBar barStyle="light-content" backgroundColor="#047857" />
//         <View style={styles.loadingContent}>
//           <ActivityIndicator size="large" color="#059669" />
//           <Text style={styles.loadingText}>Loading...</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   // Show login screen if not authenticated
//   if (!isAuthenticated) {
//     return <Login onLogin={handleLogin} />;
//   }

//   const navigationItems = [
//     {
//       id: 'dashboard',
//       title: 'Dashboard',
//       icon: 'grid-outline',
//       activeIcon: 'grid',
//     },
//     {
//       id: 'orders',
//       title: 'Orders',
//       icon: 'receipt-outline',
//       activeIcon: 'receipt',
//     },
//     {
//       id: 'menu',
//       title: 'Menu',
//       icon: 'book-outline',
//       activeIcon: 'book',
//     },
//     {
//       id: 'recette', // Changed from 'tables' to 'recette'
//       title: 'Recette', // Changed from 'Tables' to 'Recette'
//       icon: 'analytics-outline', // Changed icon to analytics
//       activeIcon: 'analytics',
//     },
//     {
//       id: 'staff',
//       title: 'Staff',
//       icon: 'people-outline',
//       activeIcon: 'people',
//     },
//   ];

//   const NavItem = ({ item }) => {
//     const isActive = activeTab === item.id;
    
//     return (
//       <TouchableOpacity
//         style={[styles.navItem, isActive && styles.navItemActive]}
//         onPress={() => handleTabChange(item.id)}
//         activeOpacity={0.7}
//       >
//         {isActive && <View style={styles.activeIndicator} />}
//         <View style={[styles.navIconContainer, isActive && styles.navIconActive]}>
//           <Ionicons
//             name={isActive ? item.activeIcon : item.icon}
//             size={22}
//             color={isActive ? '#ffffff' : '#6B7280'}
//           />
//         </View>
//         <Text style={[styles.navText, isActive && styles.navTextActive]}>
//           {item.title}
//         </Text>
//       </TouchableOpacity>
//     );
//   };

//   // Dynamic header title based on current view
//   const getHeaderTitle = () => {
//     if (activeTab === 'menu' && showCategoryMenu && selectedCategory) {
//       return selectedCategory.name;
//     }
    
//     const activeItem = navigationItems.find(item => item.id === activeTab);
//     return activeItem ? activeItem.title : 'Dashboard';
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor="#047857" />
      
//       {/* Top Header */}
//       <LinearGradient
//         colors={['#059669', '#047857']}
//         style={styles.topHeader}
//       >
//         <View style={styles.headerContent}>
//           {/* Logo Section */}
//           <View style={styles.logoSection}>
//             {/* Back button for CategoryMenu */}
//             {activeTab === 'menu' && showCategoryMenu && (
//               <TouchableOpacity 
//                 style={styles.backButton}
//                 onPress={handleBackToMenu}
//                 activeOpacity={0.8}
//               >
//                 <Ionicons name="arrow-back" size={22} color="white" />
//               </TouchableOpacity>
//             )}
            
//             <View style={styles.logoContainer}>
//               <View style={styles.logo}>
//                 <Text style={styles.logoText}>🍃</Text>
//               </View>
//             </View>
//             <View style={styles.brandInfo}>
//               <Text style={styles.brandName}>Time Delivery</Text>
//               <Text style={styles.brandSubtitle}>{getHeaderTitle()}</Text>
//             </View>
//           </View>

//           {/* Header Actions - Only Logout */}
//           <View style={styles.headerActions}>
//             <TouchableOpacity 
//               style={styles.logoutButton} 
//               onPress={confirmLogout}
//               activeOpacity={0.8}
//             >
//               <Ionicons name="log-out-outline" size={22} color="white" />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </LinearGradient>

//       {/* Main Content Area */}
//       <View style={styles.mainContent}>
//         {renderContent()}
//       </View>

//       {/* Bottom Navigation */}
//       <View style={styles.bottomNavContainer}>
//         <LinearGradient
//           colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 1)']}
//           style={styles.bottomNav}
//         >
//           <View style={styles.navItems}>
//             {navigationItems.map((item) => (
//               <NavItem key={item.id} item={item} />
//             ))}
//           </View>
//         </LinearGradient>
//       </View>

//       {/* Floating Action Button */}
//       <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
//         <LinearGradient
//           colors={['#22C55E', '#059669']}
//           style={styles.fabGradient}
//         >
//           <Ionicons name="add" size={26} color="white" />
//         </LinearGradient>
//       </TouchableOpacity>

//       {/* Logout Confirmation Modal */}
//       <Modal
//         animationType="fade"
//         transparent={true}
//         visible={showLogoutModal}
//         onRequestClose={cancelLogout}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <View style={styles.modalHeader}>
//               <View style={styles.modalIconContainer}>
//                 <Ionicons name="log-out-outline" size={32} color="#EF4444" />
//               </View>
//               <Text style={styles.modalTitle}>Confirm Logout</Text>
//               <Text style={styles.modalMessage}>
//                 Are you sure you want to logout? You will need to login again to access the app.
//               </Text>
//             </View>
            
//             <View style={styles.modalButtons}>
//               <TouchableOpacity 
//                 style={styles.cancelButton}
//                 onPress={cancelLogout}
//                 activeOpacity={0.8}
//               >
//                 <Text style={styles.cancelButtonText}>Cancel</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity 
//                 style={styles.confirmButton}
//                 onPress={handleLogout}
//                 activeOpacity={0.8}
//               >
//                 <Text style={styles.confirmButtonText}>Logout</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F8FAFC',
//   },
//   loadingContainer: {
//     flex: 1,
//     backgroundColor: '#F8FAFC',
//   },
//   loadingContent: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 16,
//     fontSize: 16,
//     color: '#6B7280',
//     fontWeight: '500',
//   },
//   topHeader: {
//     paddingTop: 10,
//     paddingBottom: 20,
//     paddingHorizontal: 16,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   headerContent: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   logoSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   backButton: {
//     width: 36,
//     height: 36,
//     backgroundColor: 'rgba(255, 255, 255, 0.15)',
//     borderRadius: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 10,
//   },
//   logoContainer: {
//     marginRight: 10,
//   },
//   logo: {
//     width: 40,
//     height: 40,
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     borderRadius: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: 'rgba(255, 255, 255, 0.3)',
//   },
//   logoText: {
//     fontSize: 20,
//   },
//   brandInfo: {
//     flex: 1,
//   },
//   brandName: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: 'bold',
//     letterSpacing: 0.5,
//   },
//   brandSubtitle: {
//     color: 'rgba(255, 255, 255, 0.8)',
//     fontSize: 12,
//     fontWeight: '500',
//     marginTop: 2,
//   },
//   headerActions: {
//     alignItems: 'center',
//   },
//   logoutButton: {
//     width: 40,
//     height: 40,
//     backgroundColor: 'rgba(255, 255, 255, 0.15)',
//     borderRadius: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   mainContent: {
//     flex: 1,
//     backgroundColor: '#F8FAFC',
//   },
//   bottomNavContainer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     zIndex: 10,
//   },
//   bottomNav: {
//     paddingTop: 12,
//     paddingBottom: 20,
//     paddingHorizontal: 8,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: -4,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 12,
//   },
//   navItems: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center',
//   },
//   navItem: {
//     alignItems: 'center',
//     paddingVertical: 6,
//     paddingHorizontal: 8,
//     borderRadius: 14,
//     minWidth: 50,
//     position: 'relative',
//   },
//   navItemActive: {
//     backgroundColor: 'rgba(5, 150, 105, 0.1)',
//   },
//   activeIndicator: {
//     position: 'absolute',
//     top: -2,
//     width: 20,
//     height: 3,
//     backgroundColor: '#059669',
//     borderRadius: 2,
//   },
//   navIconContainer: {
//     width: 36,
//     height: 36,
//     borderRadius: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 4,
//   },
//   navIconActive: {
//     backgroundColor: '#059669',
//   },
//   navText: {
//     fontSize: 10,
//     fontWeight: '600',
//     color: '#6B7280',
//   },
//   navTextActive: {
//     color: '#059669',
//   },
//   fab: {
//     position: 'absolute',
//     bottom: 85,
//     right: 16,
//     zIndex: 20,
//   },
//   fabGradient: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#059669',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   placeholderContent: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F8FAFC',
//   },
//   placeholderText: {
//     fontSize: 18,
//     color: '#6B7280',
//     fontWeight: '500',
//   },
//   // Modal Styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   modalContainer: {
//     backgroundColor: 'white',
//     borderRadius: 16,
//     padding: 24,
//     width: '100%',
//     maxWidth: 340,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 10,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 20,
//     elevation: 20,
//   },
//   modalHeader: {
//     alignItems: 'center',
//     marginBottom: 24,
//   },
//   modalIconContainer: {
//     width: 64,
//     height: 64,
//     backgroundColor: '#FEF2F2',
//     borderRadius: 32,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#1F2937',
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   modalMessage: {
//     fontSize: 14,
//     color: '#6B7280',
//     textAlign: 'center',
//     lineHeight: 20,
//   },
//   modalButtons: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   cancelButton: {
//     flex: 1,
//     backgroundColor: '#F3F4F6',
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   cancelButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#6B7280',
//   },
//   confirmButton: {
//     flex: 1,
//     backgroundColor: '#EF4444',
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   confirmButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: 'white',
//   },
// });

// export default RestaurantLayout;
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Home from './Home';
import Orders from './Orders'; 
import Menu from './Menu';
import Recette from './Recette'; // Import Recette component
import Horaire from './Horaire'; // Import Horaire component
import Login from './Login';
import CategoryMenu from './CategoryMenu'; // Import CategoryMenu const { width, height } = Dimensions.get('window');

const RestaurantLayout = ({ children }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // New state for category menu navigation
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (userData, token) => {
    try {
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error storing auth data:', error);
    }
  };

  const confirmLogout = () => {
    setShowLogoutModal(true);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      setIsAuthenticated(false);
      setActiveTab('dashboard');
      // Reset category menu state on logout
      setShowCategoryMenu(false);
      setSelectedCategory(null);
      setShowLogoutModal(false);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  // Function to handle category selection from Menu component
  const handleCategorySelect = async (categoryId, categoryName) => {
    try {
      await AsyncStorage.setItem("id_category", categoryId.toString());
      await AsyncStorage.setItem("category_name", categoryName);
      setSelectedCategory({ id: categoryId, name: categoryName });
      setShowCategoryMenu(true);
    } catch (error) {
      console.error('Error setting category data:', error);
    }
  };

  // Function to go back to menu from category menu
  const handleBackToMenu = () => {
    setShowCategoryMenu(false);
    setSelectedCategory(null);
  };

  // Function to handle tab changes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    // Reset category menu when switching tabs
    if (tabId !== 'menu') {
      setShowCategoryMenu(false);
      setSelectedCategory(null);
    }
  };

  // Function to render content based on active tab and current state
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Home />;
      case 'orders':
        return <Orders />;
      case 'menu':
        // Show CategoryMenu if a category is selected, otherwise show Menu
        if (showCategoryMenu && selectedCategory) {
          return <CategoryMenu onBack={handleBackToMenu} />;
        }
        return <Menu onCategorySelect={handleCategorySelect} />;
      case 'recette': // Changed from 'tables' to 'recette'
        return <Recette />; // Display Recette component
      case 'staff':
        return <Horaire />; // Display Horaire component instead of placeholder
      default:
        return children || <Home />;
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#047857" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const navigationItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: 'grid-outline',
      activeIcon: 'grid',
    },
    {
      id: 'orders',
      title: 'Orders',
      icon: 'receipt-outline',
      activeIcon: 'receipt',
    },
    {
      id: 'menu',
      title: 'Menu',
      icon: 'book-outline',
      activeIcon: 'book',
    },
    {
      id: 'recette', // Changed from 'tables' to 'recette'
      title: 'Recette', // Changed from 'Tables' to 'Recette'
      icon: 'analytics-outline', // Changed icon to analytics
      activeIcon: 'analytics',
    },
    {
      id: 'staff',
      title: 'Horaire', // Changed from 'Staff' to 'Horaire'
      icon: 'time-outline', // Changed icon to time
      activeIcon: 'time',
    },
  ];

  const NavItem = ({ item }) => {
    const isActive = activeTab === item.id;
    
    return (
      <TouchableOpacity
        style={[styles.navItem, isActive && styles.navItemActive]}
        onPress={() => handleTabChange(item.id)}
        activeOpacity={0.7}
      >
        {isActive && <View style={styles.activeIndicator} />}
        <View style={[styles.navIconContainer, isActive && styles.navIconActive]}>
          <Ionicons
            name={isActive ? item.activeIcon : item.icon}
            size={22}
            color={isActive ? '#ffffff' : '#6B7280'}
          />
        </View>
        <Text style={[styles.navText, isActive && styles.navTextActive]}>
          {item.title}
        </Text>
      </TouchableOpacity>
    );
  };

  // Dynamic header title based on current view
  const getHeaderTitle = () => {
    if (activeTab === 'menu' && showCategoryMenu && selectedCategory) {
      return selectedCategory.name;
    }
    
    const activeItem = navigationItems.find(item => item.id === activeTab);
    return activeItem ? activeItem.title : 'Dashboard';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#047857" />
      
      {/* Top Header */}
      <LinearGradient
        colors={['#059669', '#047857']}
        style={styles.topHeader}
      >
        <View style={styles.headerContent}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            {/* Back button for CategoryMenu */}
            {activeTab === 'menu' && showCategoryMenu && (
              <TouchableOpacity 
                style={styles.backButton}
                onPress={handleBackToMenu}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-back" size={22} color="white" />
              </TouchableOpacity>
            )}
            
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>🍃</Text>
              </View>
            </View>
            <View style={styles.brandInfo}>
              <Text style={styles.brandName}>Time Delivery</Text>
              <Text style={styles.brandSubtitle}>{getHeaderTitle()}</Text>
            </View>
          </View>

          {/* Header Actions - Only Logout */}
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={confirmLogout}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {renderContent()}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavContainer}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 1)']}
          style={styles.bottomNav}
        >
          <View style={styles.navItems}>
            {navigationItems.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </View>
        </LinearGradient>
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
        <LinearGradient
          colors={['#22C55E', '#059669']}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={26} color="white" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Logout Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showLogoutModal}
        onRequestClose={cancelLogout}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="log-out-outline" size={32} color="#EF4444" />
              </View>
              <Text style={styles.modalTitle}>Confirm Logout</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to logout? You will need to login again to access the app.
              </Text>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={cancelLogout}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  topHeader: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoContainer: {
    marginRight: 10,
  },
  logo: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoText: {
    fontSize: 20,
  },
  brandInfo: {
    flex: 1,
  },
  brandName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  headerActions: {
    alignItems: 'center',
  },
  logoutButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  bottomNav: {
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 12,
  },
  navItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 14,
    minWidth: 50,
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
  },
  activeIndicator: {
    position: 'absolute',
    top: -2,
    width: 20,
    height: 3,
    backgroundColor: '#059669',
    borderRadius: 2,
  },
  navIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  navIconActive: {
    backgroundColor: '#059669',
  },
  navText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  navTextActive: {
    color: '#059669',
  },
  fab: {
    position: 'absolute',
    bottom: 85,
    right: 16,
    zIndex: 20,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#FEF2F2',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default RestaurantLayout;
