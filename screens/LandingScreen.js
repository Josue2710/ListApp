import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';

const LandingScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/img/header/Logo.png')}
        style={styles.logo}
        imageStyle={styles.logoImage}
      >
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.loginButtonText}>Iniciar</Text>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#AEEBFF", 
  },
  logo: {
    width: 360,
    height: 400,
    justifyContent: "flex-start",  
    alignItems: "center", 
    marginBottom: 100,  
  },
  loginButton: {
    backgroundColor: "#000000",
    width: 150,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginTop: 400,  
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default LandingScreen;
