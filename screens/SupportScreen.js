import React,{PureComponent} from 'react';
import { View, Text,  StyleSheet,TouchableHighlight,Image,StatusBar,Dimensions,ActivityIndicator,BackHandler,TouchableOpacity,FlatList,ScrollView,ImageBackground } from 'react-native';
import {Container,Header,Content,Left,Body,Title,Right,StyleProvider,Item,Input,Button} from 'native-base';
import NetInfo from '@react-native-community/netinfo';
import { Icon,SearchBar,ThemeProvider} from 'react-native-elements';
var SQLite = require('react-native-sqlite-storage');
let deviceWidth = Dimensions.get('screen').width;
let deviceHeight = Dimensions.get('screen').height;




const formatData = (data,numColumns) =>{
  const numberOfFullRows = Math.floor(data.length/numColumns);
 
  let numberOfElementsLastRow = data.length -(numberOfFullRows*numColumns);
  while (numberOfElementsLastRow !== numColumns && numberOfElementsLastRow !== 0){
      data.push({key:`blank-${numberOfElementsRow}`, empty:true});
      numberOfElementsLastRow = numberOfElementsLastRow + 1;

  }
  return data;
}
const numColumns = 1;
let a;
export default class SupportScreen extends PureComponent{
  intervalID;
  static navigationOptions={
      drawerLabel:'History',
      drawerIcon:({tintColor})=>(
          <Icon name='local-hospital' 
          type='material'
          color={tintColor}
          />
      ),

  }
  constructor(props){

    super(props);

    this.state={

      connection_Status : "",
      note:"",
      search: '',
      emissionData:[],
      healthData:[],
      hospitalData:[],
      hospitalDataBackup:[],
      isoffline:false,
      loading: true,
      searchView: false,
      searchTextState:false,
      gridView: true, 
      localnewcases:0,
      totallocalcases:0,
      localrecovered:0,
      localdeaths:0,
      localnewdeaths:0,
      globalnewcases:0,
      globalnewdeaths:0,
      globaltotalcases:0,
      globalrecovered:0,
      globaldeath:0,
      i:0,
      cumulativelocal:0,
      cumulativeforeign:0,
      treatmentlocal:0,
      traeatmentforeign:0,
      cumulativetotal:0,
      treatmenttotal:0,
      latupdateddate:0,
      localnewcasesdb:0,
      totallocalcasesdb:0,
      localrecovereddb:0,
      localdeathsdb:0,
      localnewdeathsdb:0,
      globalnewcasesdb:0,
      globalnewdeathsdb:0,
      globaltotalcasesdb:0,
      globalrecovereddb:0,
      globaldeathdb:0,
      cumulativelocaldb:0,
      cumulativeforeigndb:0,
      treatmentlocaldb:0,
      traeatmentforeigndb:0,
      cumulativetotaldb:0,
      treatmenttotaldb:0,
      lastupdatedatedb:0,
      hospitalDatadb:[],
      hospitalDatadbBackup:[],
      btnIcon:"search",
      textSearch:"",
      
    }
    
  

   
    this.WEBVIEW_REF = React.createRef();

   

  }
  

  updateSearch = search => {
      this.setState({ search });
    };

  
    componentDidMount() {

      NetInfo.isConnected.addEventListener(
        'connectionChange',
        this._handleConnectivityChange

    );
  
    this.timeoutHandle = setTimeout(()=>{
     this.setState({isloaded:true})
    }, 500);
    
    NetInfo.isConnected.fetch().done((isConnected) => {

      if(isConnected == true)
      {
        this.setState({connection_Status : "Online",isoffline:false})
        this.getData();
        this.getDataEmit();
                console.log(this.state.connection_Status);

      }
      else
      {
        this.getLocalDb();
       
        this.setState({connection_Status : "Offline",isoffline:true})
        console.log(this.state.connection_Status);
        console.log('this from component did mount block'+this.state.localrecovereddb);
      }

    });

     this.getData();
     this.getDataEmit();
     this.getLocalDb();
      
    }
    componentWillUnmount() {
      clearTimeout(this.intervalID);
    NetInfo.isConnected.removeEventListener(
      'connectionChange',
      this._handleConnectivityChange

  );
      clearTimeout(this.intervalID);
    }

    
    _handleConnectivityChange = (isConnected) => {

      if(isConnected == true)
        {
          this.setState({connection_Status : "Online",isoffline:false})
          this.getData();
          console.log(this.state.connection_Status);
         
        }
        else
        {
          this.getLocalDb();
          this.setState({connection_Status :"Offline",isoffline:true});
          console.log('this data from handleconnectivity function '+this.state.localrecovereddb);
          console.log(this.state.connection_Status);
        }
    };
    
  
    changeView = () => {
      this.setState({ gridView: !this.state.gridView }, () => {
        if (this.state.gridView) {
          this.setState({ btnIcon: 'view-module' });
        }
        else {
          this.setState({ btnIcon: 'view-stream' });
        }
      });
    }
    
   
   getDataEmit = () => {
     return  fetch('https://emitrack.sisuelearn.com/api/emissionhistory/profile/1169', {
      method: 'GET',
      headers: {
          "Authorization":'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjU0YmU4YjgzNTE2ZWUxNjIyM2Y0MGVhYTFlZTNhZmY5MmQ4ZTBjNjE3YmVjZGE2YTYyY2YzZjk0NjdmYTc4Mzk4NTVkODQ5ODAzY2JkYmVmIn0.eyJhdWQiOiIxIiwianRpIjoiNTRiZThiODM1MTZlZTE2MjIzZjQwZWFhMWVlM2FmZjkyZDhlMGM2MTdiZWNkYTZhNjJjZjNmOTQ2N2ZhNzgzOTg1NWQ4NDk4MDNjYmRiZWYiLCJpYXQiOjE2MTQ1Nzg4NjksIm5iZiI6MTYxNDU3ODg2OSwiZXhwIjoxNjMwNDc2NDY3LCJzdWIiOiIxMTY5Iiwic2NvcGVzIjpbXX0.a06M6Tu4NSb5rR2o7svVJQqSeKtGJDevpguIszNNLD5EkAYeIhrPvx2p-QSpjLXOFAxUQiCBIWhf18hEKnp2mM1CuYZt-6DXNCRY2g59Om_xSFdJ-wTzAdbIxB9hmF5Uyo76LQD-5nyM59qjnR9UlGUzqfsciNoevsF4CoozuVgYbdIh-1HcR3j0sO7fVpzBGOR7PSbNrkpYTbpGPWbl7EbmQvQM2ZL_heUsSKw0lAdwZvl3gjcMgslpX1FhM0fmgpRr7filldxlTnSxCGdy8aqZssVplbXlTVOXN0k4AGPybDrPZCEOG5U5nwvBO4vIHuFn09kW5qEb8wh7tfSTmM_IYfMp3btxlMFirWB2iCtv2Imwc9bPuFkQy_HVTUUAXfEGIfHSi_LCDK62HgS4iNPSX4p5QuSvHEzqtlAXv8oMn1Q9IUjnxJjfjoit2PxXMEdtprBBG8jKxlT9qgrjHKEVtqy3OPBQb9-UKs9VNwHtLxo0R0kK1K1E_WDkDRRtYLc1LqVlYAR9MYtGB5AZ5Iqhc0gqWsQuVDX3EiFkloO7anLsyr-jDwMZxfVcqMtPZmHsu2OMHZRhrfdeFpIDlXF4nioJoDWdv2jQLt_7qWyZUSxM0MvScmGRydH6yae51QpNwAIkz6N3byCJ3lbYNvXNl1mwlDCsl9LLmQv1YRg',
          "Accept": 'application/json',
          "Content-Type": 'application/json',
      }
  })
  .then(response => response.json())
  .then(data => {
    this.setState({
      emissionData:data.data,
    }) 

    console.log(data.data);
    console.log(data.id);
     /*if(data.status == 1) {
          Global.category_list = data.data;
      } else {
          Alert.alert("Warning!", 'Error');
      }*/

  })
  .catch(function(error) {
      Alert.alert('Warning!', 'Network error.');
  });
   }
    
    getData = () =>{
      return fetch("https://hpb.health.gov.lk/api/get-current-statistical")
      .then((response) => response.json())
      .then((responseJson)=>{
        this.setState({
          healthData:responseJson,
          localnewcases:responseJson.data.local_new_cases,
          totallocalcases:responseJson.data.local_total_cases,
          localrecovered:responseJson.data.local_recovered,
          localdeaths:responseJson.data.local_deaths,
          localnewdeaths:responseJson.data.local_new_deaths,
          globalnewcases:responseJson.data.global_new_cases,
          globalnewdeaths:responseJson.data.global_new_deaths,
          globaltotalcases:responseJson.data.global_total_cases,
          globalrecovered:responseJson.data.global_recovered,
          globaldeath:responseJson.data.global_deaths,
          cumulativelocal:responseJson.data.hospital_data[0].cumulative_local,
         cumulativeforeign:responseJson.data.hospital_data[0].cumulative_foreign,
         treatmentlocal:responseJson.data.hospital_data[0].treatment_local,
         traeatmentforeign:responseJson.data.hospital_data[0].treatment_foreign,
         cumulativetotal:responseJson.data.hospital_data[0].cumulative_total,
         treatmenttotal:responseJson.data.hospital_data[0].treatment_total,
         hospitalData:responseJson.data.hospital_data,
        i:this.state.i+1,
        hospitalDataBackup:responseJson.data.hospital_data,
        });
       // this.intervalID = setTimeout(this.getData.bind(this), 3000);
        console.log(this.state.healthData.data.hospital_data[8].hospital.name);

        if(this.state.connection_Status =="Online"){
          // console.log(db);
          if (Platform.OS === 'ios') {
            var db = SQLite.openDatabase({name: 'test.db', createFromLocation: 1}, (open) => {}, (e) => {});
        }
        else {
            var db = SQLite.openDatabase({name: 'test.db', createFromLocation: '~/floatingnotes.db'}, (open) => {
             // console.log('successfully opened db');
            }, (e) => {
              console.log('error opening db');
            });
        }
       
  
  
       
       db.transaction((tx)=>{
  
        tx.executeSql('SELECT * FROM corona_main_info WHERE id=?',[1],(tx,results)=>{
          var len = results.rows.length;
          if(len>0){
            var row = results.rows.item(0);
            
           /*console.log(row);*/
           var newrow = JSON.parse(row.info);
           //console.log(newrow);
           this.setState({newHealthData:newrow,localnewcasesdb:newrow.data.local_new_cases,totallocalcasesdb:newrow.data.local_total_cases, localrecovereddb:responseJson.data.local_recovered,localdeathsdb:newrow.data.local_deaths,
            localnewdeathsdb:newrow.data.local_new_deaths,
            globalnewcasesdb:newrow.data.global_new_cases,
            globalnewdeathsdb:newrow.data.global_new_deaths,
            globaltotalcasesdb:newrow.data.global_total_cases,
            globalrecovereddb:newrow.data.global_recovered,
            globaldeathdb:newrow.data.global_deaths,
            lastupdatedatedb:newrow.data.update_date_time,
            cumulativelocaldb:newrow.data.hospital_data[0].cumulative_local,
           cumulativeforeigndb:newrow.data.hospital_data[0].cumulative_foreign,
           treatmentlocaldb:newrow.data.hospital_data[0].treatment_local,
           traeatmentforeigndb:newrow.data.hospital_data[0].treatment_foreign,
           cumulativetotaldb:newrow.data.hospital_data[0].cumulative_total,
           treatmenttotaldb:newrow.data.hospital_data[0].treatment_total,
           hospitalDatadb:newrow.data.hospital_data,
           hospitalDatadbBackup:newrow.data.hospital_data
          });
          
          }
        })
  
  
       }) 
  
      }else {
        // console.log(db);
        console.log(this.state.connection_Status);
        if (Platform.OS === 'ios') {
          var db = SQLite.openDatabase({name: 'test.db', createFromLocation: 1}, (open) => {}, (e) => {});
      }
      else {
          var db = SQLite.openDatabase({name: 'test.db', createFromLocation: '~/floatingnotes.db'}, (open) => {
           // console.log('successfully opened db');
          }, (e) => {
            console.log('error opening db');
          });
      }
        db.transaction((tx)=>{
  
          tx.executeSql('SELECT * FROM corona_main_info WHERE id=?',[1],(tx,results)=>{
            var len = results.rows.length;
            if(len>0){
              var row = results.rows.item(0);
              
             /*console.log(row);*/
             var newrow = JSON.parse(row.info);
             //console.log(newrow);
             this.setState({newHealthData:newrow,localnewcasesdb:newrow.data.local_new_cases,totallocalcasesdb:newrow.data.local_total_cases, localrecovereddb:newrow.data.local_recovered,localdeathsdb:newrow.data.local_deaths,
              localnewdeathsdb:newrow.data.local_new_deaths,
              globalnewcasesdb:newrow.data.global_new_cases,
              globalnewdeathsdb:newrow.data.global_new_deaths,
              globaltotalcasesdb:newrow.data.global_total_cases,
              globalrecovereddb:newrow.data.global_recovered,
              globaldeathdb:newrow.data.global_deaths,
              lastupdatedatedb:newrow.data.update_date_time,
              cumulativelocaldb:newrow.data.hospital_data[0].cumulative_local,
             cumulativeforeigndb:newrow.data.hospital_data[0].cumulative_foreign,
             treatmentlocaldb:newrow.data.hospital_data[0].treatment_local,
             traeatmentforeigndb:newrow.data.hospital_data[0].treatment_foreign,
             cumulativetotaldb:newrow.data.hospital_data[0].cumulative_total,
             treatmenttotaldb:newrow.data.hospital_data[0].treatment_total,
             hospitalDatadb:newrow.data.hospital_data,
             hospitalDatadbBackup:newrow.data.hospital_data,
            
             });
             
            
  
            }
          })
    
    
         }) 
  
      }



      })
      .catch((error)=>{
        console.log(error)
      })
    }

    getLocalDb = () =>{
      // console.log(db);
      if (Platform.OS === 'ios') {
       var db = SQLite.openDatabase({name: 'test.db', createFromLocation: 1}, (open) => {}, (e) => {});
   }
   else {
       var db = SQLite.openDatabase({name: 'test.db', createFromLocation: '~/floatingnotes.db'}, (open) => {
        // console.log('successfully opened db');
       }, (e) => {
         console.log('error opening db');
       });
   }
     db.transaction((tx)=>{

       tx.executeSql('SELECT * FROM corona_main_info WHERE id=?',[1],(tx,results)=>{
         var len = results.rows.length;
         if(len>0){
           var row = results.rows.item(0);
          // alert('im in db function success section');
          /*console.log(row);*/
          var newrow = JSON.parse(row.info);
          //console.log(newrow);
          this.setState({newHealthData:newrow,localnewcasesdb:newrow.data.local_new_cases,totallocalcasesdb:newrow.data.local_total_cases, localrecovereddb:newrow.data.local_recovered,localdeathsdb:newrow.data.local_deaths,
           localnewdeathsdb:newrow.data.local_new_deaths,
           globalnewcasesdb:newrow.data.global_new_cases,
           globalnewdeathsdb:newrow.data.global_new_deaths,
           globaltotalcasesdb:newrow.data.global_total_cases,
           globalrecovereddb:newrow.data.global_recovered,
           globaldeathdb:newrow.data.global_deaths,
           lastupdatedatedb:newrow.data.update_date_time,
           cumulativelocaldb:newrow.data.hospital_data[0].cumulative_local,
          cumulativeforeigndb:newrow.data.hospital_data[0].cumulative_foreign,
          treatmentlocaldb:newrow.data.hospital_data[0].treatment_local,
          traeatmentforeigndb:newrow.data.hospital_data[0].treatment_foreign,
          cumulativetotaldb:newrow.data.hospital_data[0].cumulative_total,
          treatmenttotaldb:newrow.data.hospital_data[0].treatment_total,
          hospitalDatadb:newrow.data.hospital_data,
          hospitalDatadbBackup:newrow.data.hospital_data,
        });
         // alert(this.state.localrecovereddb);
         
         }
       })
 
 
      }) 
   } 
  
   changeHeader = () => {
    this.setState({ searchView:this.state.searchView }, () => {
      if (!this.state.searchView) {module
        this.setState({ btnIcon: 'clear',
         searchView:true, });
      }
      else {
        this.setState({ btnIcon: 'search',
      searchView:false, });
      }
    });
  }
  

  clearSearchText=() =>{
    if(this.state.connection_Status =="Online"){ 
    this.setState({
      textSearch:'',
      searchTextState:false,
      hospitalData:this.state.hospitalDataBackup,
    })
  }else{
    this.setState({
      textSearch:'',
      searchTextState:false,
      hospitalData:this.state.hospitalDatadbBackup,
    })
  }
  }

   onChangeSearch(text) {
    console.log(text);
    if(this.state.connection_Status =="Online"){

      if(this.state.textSearch != ''){
        const data = this.state.emissionData;
        const datanew = data.filter(function(item){
          const itemData = item.created_at.toUpperCase()
          //console.log(item.Country);
          const textData = text.toUpperCase()
         // console.log(textData);
          return itemData.indexOf(textData) > -1
  
  
        } )
       
  
        this.setState({
          emissionData:datanew,
          textSearch:text,
          searchTextState:true,
        })
      }else{
        this.setState({
          emissionData:this.state.emissionData,
          textSearch:text,
          searchTextState:false,
        })
      }
   

 
  }else{
    if(this.state.textSearch != ''){
    const data = this.state.emissionData;
    const datanew = data.filter(function(item){
      const itemData = item.hospital.name.toUpperCase()
      //console.log(itemData);
      const textData = text.toUpperCase()
      return itemData.indexOf(textData) > -1


    } )

    this.setState({
      hospitalDatadb:datanew,
      textSearch:text,
      searchTextState:true,
    })
  }else{
    this.setState({
      hospitalDatadb:this.state.hospitalDatadbBackup,
      textSearch:text,
      searchTextState:false
    })
  }
   
  }
  }
  renderLoading =()=>{return(<ActivityIndicator  size="large" color="#790000" style = {{position: 'absolute',left: 0,right: 0, top: 0,bottom: 0,alignItems: 'center',justifyContent: 'center'}}/>)}
  

  renderItem = ({item,index}) =>{
    if(item.empty === true ){
      return <View style={[styles.item, styles.itemInvisible]} />;
  }
  return(
       
      <ImageBackground style={{height:200,marginTop:20,marginLeft:10,marginRight:10,marginBottom:10,padding:15}} imageStyle={{ borderRadius: 20}}  source={require('../src/images/featured_banner-2.jpg')}  >
     
      <Text style={styles.featuredItemText}> Date - {item.created_at}  </Text>
      <Text style={styles.featuredIteminfoTextsm}> Emission Status {item.emision_status} </Text>
      <Text style={styles.featuredIteminfoText}> CO Level - {item.co_level} </Text>
      <Text style={styles.featuredIteminfoText}> HC Level - {item.hc_level} </Text>
      
     
    </ImageBackground>
  
  );
  }
 /* renderItem =() => {this.state.emissionData.map((item,index) => {
    console.log('Item data',item);

    if(item.empty === true ){
        return <View style={[styles.item, styles.itemInvisible]} />;
    }
    return(
         
        <ImageBackground style={{height:200,marginTop:20,marginLeft:10,marginRight:10,marginBottom:10,padding:15}} imageStyle={{ borderRadius: 20}}  source={require('../src/images/featured_banner-2.jpg')}  >
       
        <Text style={styles.featuredItemText}> Date - {item.created_at}  </Text>
        <Text style={styles.featuredIteminfoTextsm}> Emission Status {item.emision_status} </Text>
        <Text style={styles.featuredIteminfoText}> CO Level - {item.co_level} </Text>
        <Text style={styles.featuredIteminfoText}> HC Level - {item.hc_level} </Text>
        
       
      </ImageBackground>
    
    );
});
  }*/

 
  render() {
      const theme = {
          SearchBar: {
              inputContainerStyle: {
              backgroundColor: '#ffffff',
            },
            containerStyle:{
              backgroundColor: '#ffffff',
              borderColor:'#ffffff',
            }

          },
        };
      const { search } = this.state;
        return(
        
        <Container >
             
             {this.state.searchView ?   
          <Header style={{backgroundColor:'#ffffff'}}  >
              <Left>
              <Button transparent>
                  <Icon name="keyboard-backspace" 
                  type='material'
                  color='#e91e63'
                  size={40}
                  onPress={this.changeHeader}/>
                   </Button>
              </Left>
              <Body>
          
                <Item regular  style={{width:deviceWidth-150,borderColor:'#ffffff'}}>
            
              <Input placeholder='Search Hospital ' style={styles.input} value={this.state.textSearch} onChangeText={(text)=>this.onChangeSearch(text)} /> 
             

              </Item>
            
          
        </Body>
        <Right>
        {this.state.searchTextState?
          <TouchableOpacity  >
         
        <Button transparent  onPress={this.clearSearchText} >
            <Icon name= {this.state.btnIcon}
             type='material'
             color='#e91e63'
             size={40}
             style={{fontSize:60}}/>
          </Button>
          </TouchableOpacity>:<View></View>}

          
        </Right>
          </Header>:<Header style={{backgroundColor:'#ffffff'}}>
              <Left>
              <Button transparent>
                  <Icon name="bars" 
                  type='font-awesome'
                  color='#e91e63'
                  onPress={()=>
                  this.props.navigation.openDrawer()}/>
                   </Button>
              </Left>
              <Body>
          <Title style={{color:'#e91e63',fontSize:14,fontFamily:'Poppins-Medium'}} > Emission History </Title>
        </Body>
        <Right>
        <TouchableOpacity   >
        <Button transparent onPress={this.changeHeader}    >
            <Icon name= {this.state.btnIcon}
             type='material'
             color='#e91e63'
             size = {40}
             style={{fontSize:60}}
             />
        </Button>
          </TouchableOpacity>
          
        </Right>
          </Header>}
          <ThemeProvider theme={theme}>
          
    </ThemeProvider>
            <Content contentContainerStyle={{
                flex:1,
              //  alignItems:'center',
                justifyContent:'center',
                

            }}>
           
           <StatusBar backgroundColor="#FF416C" barStyle="light-content"/>
 
            {this.state.isoffline ?
             <View style={styles.offlineContainer}>
             <Text style={styles.offlineText}> No Internet Connection </Text>
            </View>: <View></View>}
               
           <ScrollView style={{paddingLeft:5,paddingRight:5}} >
           {this.state.isoffline ?
       <FlatList data = {this.state.hospitalDatadb} style={styles.container }
       renderItem={this.renderItem} numColumns={numColumns}/>: <FlatList data = { this.state.emissionData} style={styles.container }
       renderItem={this.renderItem} numColumns={numColumns}/>}
           </ScrollView>
                </Content>

          </Container>
         
        )
      
  }
  
 
}

const styles = StyleSheet.create({
  container: {
      flex: 1, 
      backgroundColor:'#ffffff'

    },
  item:{
      flex:1,
      margin:1,
      //height: Dimensions.get('window').width/numColumns,
      height: 150,
     // width: (Dimensions.get('window').width-15)/numColumns,
      width: Dimensions.get('window').width,
  },
  itemInvisible:{
  backgroundColor:'transparent',
  },
  itemText:{
      color:'#fff',
      justifyContent:'center',
      alignItems:'center',
      backgroundColor:'rgba(51,51,51,0.6)',
      borderBottomLeftRadius:15,
      borderBottomRightRadius:15,
      marginTop:(Dimensions.get('window').width/numColumns)-42,
      padding:10,
  },
  itemTextCaption:{
    color:'#fff'
  },
  welcomeTextContainer:{
      marginLeft:1,
      paddingVertical:20
  },
  welcomeText:{
      color:'#383a3d',
      fontSize:22,
      fontFamily:'HelveticaNeueBd'
  },
  button:{
      width:300,
      backgroundColor:'#1c313a',
      borderRadius:25,
      marginVertical:10,
      paddingVertical:13,
      alignItems:'center',
      textAlign:'center',
      paddingVertical:20
     },
     buttonText:{
         fontSize:10,
         fontWeight:'500',
         color:"#ffffff",
         textAlign:'center'
     },
     btnContainer:{
      alignItems:'center', 
     },
     featuredItemText:{
      color:'#ffffff',
      fontSize:14,
      fontWeight:'bold',
      textAlign:'left',
      marginBottom:10,
      fontFamily:'Poppins-Light'
    },
    featuredIteminfoText:{
      color:'#ffffff',
      fontSize:12,
      fontWeight:'200',
      textAlign:'left',
      marginBottom:5,
      fontFamily:'Poppins-Light'
    },
    featuredIteminfoTextsm:{
      color:'#ffffff',
      fontSize:12.5,
      fontWeight:'200',
      textAlign:'left',
      marginBottom:6,
      fontFamily:'Poppins-Medium'
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
