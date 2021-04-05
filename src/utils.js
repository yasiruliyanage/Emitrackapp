import ConnectivityTracker from 'react-native-connectivity-tracker';
let isNetwork;

const onConnectivityChange = (isConnected,timestamp,connectionInfo) => {
    console.log('connection state change');
    isNetwork = isConnected;
};

ConnectivityTracker.init({
    onConnectivityChange,
    attachConnectionInfo:false,
    onError:msg => console.log(msg)
});

const getNetwork = value =>{

    return isNetwork;

}


module.exports ={
    getNetwork
}
