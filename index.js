/**
 * @format
 */
import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';
//import BackgroundFetch from "react-native-background-fetch";
//import PushNotification from 'react-native-push-notification';
import {name as appName} from './app.json';
var SQLite = require('react-native-sqlite-storage');
//import BluetoothSerial, {
  //  withSubscription
 // } from "react-native-bluetooth-serial-next";



AppRegistry.registerComponent(appName, () => App);
