import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NavbarWithSearch = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const [role, setRole] = useState("");

  useEffect(() => {
    const fetchRole = async () => {
      try {
        // Ensure the layout has mounted fully before fetching the role
        await new Promise(resolve => setTimeout(resolve, 0));

        const storedRole = await AsyncStorage.getItem('role');

        if (!storedRole) {
          // Wait until the root layout is fully ready before navigating
          router.replace('/'); // Use `replace` to avoid going back to this screen
        } else {
          setRole(storedRole);
        }
      } catch (error) {
        console.error('Failed to load role from AsyncStorage:', error);
      } 
    };

    fetchRole();
  }, []);

  const goToHome = () => {
    if (role === "Restaurant") {
      router.push({
        pathname: "/restaurantHome"
      });
    } else if (role === "Admin") {
      router.push({
        pathname: "/home"
      });
    } else if (role === "Livreur") {
      router.push({
        pathname: "/livreurHome"
      });
    }
  };

  const handleMenuPress = () => {
    navigation.toggleDrawer();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#047857" />
      <LinearGradient
        colors={['#059669', '#047857']}
        style={styles.headerContainer}
      >
        <View style={styles.headerContent}>
          {/* Left Component - Menu Button */}
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleMenuPress}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="menu" size={24} color="white" />
            </View>
          </TouchableOpacity>

          {/* Center Component - Title */}
          <View style={styles.centerContainer}>
            <Text style={styles.headerTitle}>Time Delivery</Text>
          </View>

          {/* Right Component - Home Button */}
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={goToHome}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="home" size={24} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#047857',
  },
  headerContainer: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
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
    minHeight: 44,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});

export default NavbarWithSearch;