import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet, Image } from "react-native";

/* Pantallas */
import LandingScreen from "./screens/LandingScreen";
import HomeScreen from './screens/HomeScreen';
import EventScreen from './screens/EventScreen';
import ClubScreen from './screens/ClubScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === "Inicio") iconName = "home-outline";
        else if (route.name === "Eventos") iconName = "folder-outline";
        else if (route.name === "Clubes") iconName = "calendar-outline";

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: "lightgreen", 
      tabBarInactiveTintColor: "black", 
      tabBarStyle: styles.tabBar,
      headerShown: false,
    })}
  >
    <Tab.Screen name="Inicio" component={HomeScreen} />
    <Tab.Screen name="Eventos" component={EventScreen} />
    <Tab.Screen name="Clubes" component={ClubScreen} />
  </Tab.Navigator>
);

const CustomHeader = () => (
  <View style={styles.headerContainer}>
    <View style={styles.logoContainer}>
      <Image
        source={require("./assets/img/header/ZC.png")}
        style={styles.logo}
      />
    </View>
    <Text style={styles.appName}>Clubes</Text> {/*el nombre posiblemente cambie*/}
  </View>
);

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Landing">
        <Stack.Screen
          name="Landing"
          component={LandingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeTabs}
          options={{
            header: () => <CustomHeader />,
            headerShown: true,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ECEFF1",
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 4, 
  },
  
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 5,
    backgroundColor: "#fff",
    height: 75,
    shadowColor: "green", 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 4, 
  },
  
  logoContainer: {
    justifyContent: "center",
    alignItems: "flex-start",
    flex: 1,
    color: 'white',
  },

  logo: {
    width: 80,
    height: 50,
    marginTop: 20,
  },

  appName: {
    fontSize: 18,
    marginTop: 20,
    color: "#000",
    fontWeight: "bold",
    flex: 4,
    marginRight: -30,
    textAlign: "left",
  },
});
