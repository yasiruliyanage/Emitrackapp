import React,{PureComponent} from 'react';
import { View, Text, Button, StyleSheet, StatusBar,ScrollView,Dimensions } from 'react-native';
import { useTheme } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import Category from '../components/Category';
import BluetoothSerial, {
    withSubscription
  } from "react-native-bluetooth-serial-next";
  import BackgroundFetch from "react-native-background-fetch";
let deviceWidth = Dimensions.get('screen').width;
let deviceHeight = Dimensions.get('screen').height;
var date = new Date().getDate(); //Current Date
var month = new Date().getMonth() + 1; //Current Month
var year = new Date().getFullYear(); //Current Year
var hours = new Date().getHours(); //Current Hours
var min = new Date().getMinutes(); //Current Minutes
var sec = new Date().getSeconds(); //Current Seconds

var SQLite = require('react-native-sqlite-storage');
import AsyncStorage from '@react-native-community/async-storage';



export default class HomeFunctions extends PureComponent {

    intervalID;
   
    constructor(props){
  
        super(props);
       
        this.state={
          connection_Status : "",
          note:"",
          search: '',
          isoffline:false,
          isloaded:false,
          notesData:null,
          loading: true,
           gridView: true, 
           btnIcon: 'view-module' ,
           co2level:0,
           hclevel:0,
           hcstatus:'',
           costatus:'',
           marginCO:400,
           marginHC:6000,
           sensorValues : [],
           sensorValue :'',
           userToken:"",
           emissionstatus:'',
           lastupdatemessage:'',
           lastupdatestatus:false,
           vehicle_type:0,
        }
        
  

        this.WEBVIEW_REF = React.createRef();
    
       
      }

 componentDidMount() {

    NetInfo.isConnected.addEventListener(
        'connectionChange',
        this._handleConnectivityChange

    );
   var  userToken = await AsyncStorage.getItem('userToken');

    this.setState({userToken : userToken});
     BackgroundFetch.configure({
        minimumFetchInterval: 15,     // <-- minutes (15 is minimum allowed)
        // Android options
        stopOnTerminate: false,
        enableHeadless: true,
        forceAlarmManager: true,    // <-- Set true to bypass JobScheduler.
        startOnBoot: true,
        requiredNetworkType: BackgroundFetch.NETWORK_TYPE_NONE, // Default
        requiresCharging: false,      // Default
        requiresDeviceIdle: false,    // Default
        requiresBatteryNotLow: false, // Default
        requiresStorageNotLow: false , // Default
      }, (FETCH_RESULT_NEW_DATA) => {
       // console.log("[js] Received background-fetch event: ", FETCH_RESULT_NEW_DATA);
        // Required: Signal completion of your task to native code
        // If you fail to do this, the OS can terminate your app
        // or assign battery-blame for consuming too much background-time
        BackgroundFetch.finish(FETCH_RESULT_NEW_DATA);
      }, (error) => {
        //console.log("[js] RNBackgroundFetch failed to start");
      });
     
     // Optional: Query the authorization status.
     BackgroundFetch.status((status) => {
        switch(status) {
          case BackgroundFetch.STATUS_RESTRICTED:
            console.log("BackgroundFetch restricted");
            break;
          case BackgroundFetch.STATUS_DENIED:
            console.log("BackgroundFetch denied");
            break;
          case BackgroundFetch.STATUS_AVAILABLE:
            console.log("BackgroundFetch is enabled");
            break;
        }
      });

      NetInfo.isConnected.fetch().done((isConnected) => {

        if(isConnected == true)
        {
          this.setState({connection_Status : "Online",isoffline:false})
          //this.getData();
          this.getVehicleProfile();
          this.getVehicleTypeData();
          console.log(this.state.connection_Status);
  
        }
        else
        {
        //  this.getLocalDb();
         
          this.setState({connection_Status : "Offline",isoffline:true})
          console.log(this.state.connection_Status);
          console.log('this from component did mount block'+this.state.localrecovereddb);
        }
  
      });
      

      var counter = 1;
   
    BluetoothSerial.readEvery(
        (data, intervalId) => {
         
          var sensorValues = data.split(',');
          
          var CoLevel = sensorValues[0];
          var HcLevel = sensorValues[1];


        
          //storing values on local storage 

        ///  await AsyncStorage.setItem('colevel', CoLevel);
        //  await AsyncStorage.setItem('hclevel', HcLevel);
          var newcolevel = CoLevel-300;
          var comargin = this.state.marginCO;
          var hcmargin = this.state.marginHC;
          
          if(newcolevel>comargin){
            this.setState({
                costatus:'Bad',
            })
           }else{
               this.setState({
                   costatus:'Good',
               })  
           }

           if(HcLevel>hcmargin){
               this.setState({
                   hcstatus:'Bad',
               })
              }else{
                  this.setState({
                      hcstatus:'Good',
                  })  
              }

              if(this.state.connection_Status =="Online"){

            
        
          this.setState({
             co2level: newcolevel,
             hclevel: HcLevel,
          })

          this.uploadEmissionData();

          



        }else {
            this.setState({
                co2level: newcolevel,
                hclevel: HcLevel,
             }) 
            this.storeEmissionData();

        }




          console.log(sensorValues);
         // console.log(data);
         
        // await AsyncStorage.setItem('messuredcount', count);



         counter = counter++;

        

          
          if (this.imBoredNow && intervalId) {
            clearInterval(intervalId);
          }
        },
        30000,
        "\r\n"
      );
   // this.getEmissionReadings()
   // this.intervalID = setInterval(this.getEmissionReadings.bind(this), 5000); 
    }
  
    

    componentWillUnmount() {

        NetInfo.isConnected.removeEventListener(
            'connectionChange',
            this._handleConnectivityChange
        );

        clearInterval(this.intervalID);
        
    }
   
    /*function for handle network connectivity*/
    _handleConnectivityChange = (isConnected) => {

        if(isConnected == true)
          {
            this.setState({connection_Status : "Online",isoffline:false})
             this.getVehicleProfile();
             this.getVehicleTypeData();
            console.log(this.state.connection_Status);
           
          }
          else
          {
           // this.getLocalDb();
            this.setState({connection_Status :"Offline",isoffline:true});
           // console.log('this data from handleconnectivity function '+this.state.localrecovereddb);
           // console.log(this.state.connection_Status);
          }
      };

    /*function for store emission data on cloud*/
  
    uploadEmissionData = () =>{
        return fetch("https://emitrack.sisuelearn.com/api/emissionhistory/save",{
            method:'POST',
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization:"Bearer "+this.state.userToken,
            },
            body: JSON.stringify({
                vehicle_id: 1169,
                co_level: this.state.co2level,
                hc_level:this.state.hclevel,
                hc_emission_status:this.state.hcstatus,
                co_emission_status:this.state.costatus,
                emission_status:this.state.emissionstatus,
            }),
        })
        .then((response) => response.json())
        .then((responseJson)=>{
          this.setState({
            lastupdatemessage:responseJson.message,
            lastupdatestatus:responseJson.success,
          });
       

         



        })
        .catch((error)=>{
          console.log(error)
        })
      }


      /*function for store emission data on local database */

      storeEmissionData = () => {
            // console.log(db);
        if (Platform.OS === 'ios') {
            var db = SQLite.openDatabase({name: 'test.db', createFromLocation: 1}, (open) => {}, (e) => {});
        }
        else {
            var db = SQLite.openDatabase({name: 'test.db', createFromLocation: '~/emitrackdb.db'}, (open) => {
             // console.log('successfully opened db');
            }, (e) => {
              console.log('error opening db');
            });
        }

        const  co  = this.state.co2level;
        const  hc  = this.state.hclevel;
        const  hc_status = this.state.hcstatus;
        const  co_status = this.state.costatus;
        const  created_at =  date + '/' + month + '/' + year + ' ' + hours + ':' + min + ':' + sec;
        const emission_status = this.state.emissionstatus;
        db.transaction(function (tx) {
            tx.executeSql(
              'INSERT INTO  em_history(co,hc,hc_status,co_status,created_at,year,month,emission_status) VALUES (?,?,?,?,?,?,?,?)',
              [co,hc,hc_status,co_status,created_at,year,month,emission_status],
              (tx, results) => {
                console.log('Results', results.rowsAffected);
                if (results.rowsAffected > 0) {
                    console.log('Emission History data saved successfully')
                //  Alert.alert('Data Inserted Successfully....');
                } else{
                   console.log('Emission History saving failed')
                } 
              }
            );
          });
    }
    
  /*function for get vehicle profile data*/
  getVehicleProfile = () =>{
    return fetch("https://emitrack.sisuelearn.com/api/vehicleprofile/profile/"+1169,{
        method:'GET',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization:"Bearer "+this.state.userToken,
        },
    })
    .then((response) => response.json())
    .then((responseJson)=>{
      this.setState({
        vehicle_type:responseJson.data.vehicle_type,
      });
   
    })
    .catch((error)=>{
      console.log(error)
    })
  }


/*function for get vehicle type data*/
getVehicleTypeData = () =>{
    return fetch("https://emitrack.sisuelearn.com/api/vehicletypes/singletype",{
        method:'POST',
        headers: {
            Accept: "application/json",
            "Content-Type":"application/json",
            Authorization:"Bearer "+this.state.userToken,
        },
        body: JSON.stringify({
            vehicle_type_id:this.state.vehicle_type,
        }),
    })
    .then((response) => response.json())
    .then((responseJson)=>{
      this.setState({
        marginCO:responseJson.data.co_margin,
        marginHC:responseJson.data.hc_margin,
      });
    })
    .catch((error)=>{
      console.log(error)
    })
  }


    



    render() {

        return(
            <ScrollView>
              
            <View style={{ flex: 1, backgroundColor: 'white', paddingTop: 10 }}>
                      
                       <Text style={{ fontSize: 24, fontWeight: '200', paddingHorizontal: 20,fontFamily:'Poppins-SemiBold',color:'#0c163e'}}>
                           Live Emission
                       </Text>

                       <View style={{ height: 130, marginTop: 20 }}>
                           <ScrollView
                               horizontal={true}
                               showsHorizontalScrollIndicator={false}
                           >
                               <Category imageUri={require('../src/images/categories/new-case.png')}
                                   name="CO Level" count={this.state.co2level}
                               />
                               <Category imageUri={require('../src/images/categories/tot-case.png')}
                                   name="HC Level" count ={this.state.hclevel}
                               />
                                
                             
                               
                               
                           </ScrollView>
                       </View>

                      
                    
           </View>
         
         <View style={{ flex: 1, backgroundColor: 'white', paddingTop: 20 }}>
                       <Text style={{ fontSize: 24, fontWeight: '200', paddingHorizontal: 20, fontFamily:'Poppins-SemiBold',color:'#0c163e' }}>
                           Emission Status 
                       </Text>

                       <View style={{ height: 130, marginTop: 20 }}>
                           <ScrollView
                               horizontal={true}
                               showsHorizontalScrollIndicator={false}
                           >
                               <Category imageUri={require('../src/images/categories/new-case.png')}
                                   name="CO" count={this.state.costatus}
                               />
                               <Category imageUri={require('../src/images/categories/tot-case.png')}
                                   name="HC" count ={this.state.hcstatus}
                               />
                             
                               
                               
                           </ScrollView>
                       </View>

                      
                    
           </View>
          
         </ScrollView>  
        )
    }
}

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
