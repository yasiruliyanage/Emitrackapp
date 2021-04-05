import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const ProfileScreen = () => {
    return (
      <View style={styles.container}>
        <Text>Profile Screen</Text>
        <Text style={styles.text} >
                      User:testapiuser
                   </Text>
                <Text style={styles.text}>
                   Vehicle No: 64-2345
                </Text>
                <Text style={styles.text}>
                    Engine CC: 90cc
                </Text>
                <Text style={styles.text} >
                    Engine Type : 2 Stroke
                </Text>
                <Text style={styles.text} >
                    Passenger Count: 1
                </Text>
                <Text style={styles.text} >
                    isloded: No
                </Text>
                <Text style={styles.text} >
                    Vehicle Type : Bike
                </Text>
                <Text style={styles.text} >
                    Co Margin:300 PPM
                </Text>
                <Text style={styles.text} >
                    HC Margin:6000 PPM
                </Text>
      </View>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center'
  },
  text: {
    fontSize: 12,
    color: '#0c163e',
    textAlign: 'center',
    paddingVertical: 10,
    fontFamily:'Poppins-Light',
  },
});
