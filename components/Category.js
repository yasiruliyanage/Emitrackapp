import React, { Component } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity
} from "react-native";

class Category extends Component {
    render() {
        return (
            <TouchableOpacity>
            <View style={{ height: 105, width: 105, marginLeft: 10 }}>
                <View style={{ flex: 2 }}>
                    <Image source={this.props.imageUri}
                        style={{ flex: 1, width: null, height: null, resizeMode: 'contain' }}
                    />
                </View>
                <View style={{ flex: 1, paddingLeft: 10, paddingTop: 5}}>
                    <Text style={styles.counttext}>{this.props.count}</Text>
                </View>
                <View style={{ flex: 1, paddingLeft: 10, paddingTop: 5}}>
                    <Text style={{textAlign:'center',fontFamily:'Poppins-Light',color:'#0c163e'}}>{this.props.name}</Text>
                </View>
            </View>
            </TouchableOpacity>
        );
    }
}
export default Category;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    counttext:{
        fontSize:18,
         fontWeight:'200',
        // marginLeft:15,
         color:'#0b9c56',
         textAlign:'center',
         fontFamily:'Poppins-Medium'
    }
});