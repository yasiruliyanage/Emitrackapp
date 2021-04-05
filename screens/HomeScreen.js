import React from 'react';
import { View, Text, Button, StyleSheet, StatusBar,ScrollView,Dimensions } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Category from '../components/Category';
import HomeFunctions from './HomeFunctions';
let deviceWidth = Dimensions.get('screen').width;
let deviceHeight = Dimensions.get('screen').height;
var SQLite = require('react-native-sqlite-storage');

var   intervalID;


const HomeScreen = ({navigation}) => {


   
  const { colors } = useTheme();

  const theme = useTheme();
  

  

  
    return (
      <View style={styles.container}>
        <StatusBar barStyle= { theme.dark ? "light-content" : "dark-content" }/>
         <HomeFunctions/>
     
      </View>
    );

  


};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center'
  },  imageHolder: {
    margin: 5,
    height: 160,
    flex: 1,
    position: 'relative'
  },
  image: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover'
  },
  textViewHolder: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 10,
    paddingVertical: 13,
    alignItems: 'center'
  },
  textOnImage: {
    color: 'white'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    paddingTop: 10,
    fontSize: 18,
    color: 'black'
  },
  buttonDesign: {
    padding: 15,
    backgroundColor: '#e91e63'
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    alignSelf: 'stretch'
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  featuredItemText:{
    color:'#ffffff',
    fontSize:18,
    fontWeight:'bold',
    textAlign:'left'
  },
  btnText:{
    color:'#ffffff',
    fontSize:15,
    fontWeight:'bold'
  },
  offlineContainer: {
    backgroundColor: '#b52424',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width:deviceWidth,
    position: 'relative',
    top: 0
  },
  offlineText: { color: '#ffffff',
fontSize:16,
fontFamily:'Poppins-Medium' }
});
