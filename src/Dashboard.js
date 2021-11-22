// components/dashboard.js

import React, { Component } from 'react';
import { StyleSheet, View, Text, Button ,Platform, Dimensions} from 'react-native';
import firebase from '../database/fireBase';
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';
import { TouchableOpacity } from "react-native-gesture-handler";
import AsyncStorage from '@react-native-async-storage/async-storage';

const radio_props = [
  {label: 'I want to buy a home', value: 0 },
  {label: 'I want to sell my house', value: 1 },
];

const {width, height} = Dimensions.get('window')
export default class Dashboard extends Component {
  constructor() {
    super();
    this.state = {
      value: 0,
    }
  }

  async componentDidMount() {

  }

  onCheck = (value) => {
    this.setState({
      value: value,
    })
  }
  onSubmit = () => {

    if( this.state.value === 1) {
      this.props.navigation.navigate('SellerRegister', { profileData: false })
    } else {
      this.props.navigation.navigate('BuyerRegister', { profileData: false })
    }
  }
  render() {


    return (
      <View style={styles.container}>
        <Text style={styles.title}>Please select what you need</Text>

        <RadioForm
          style={{justifyContent: 'space-between', height: 90,}}
          radio_props={radio_props}
          initial={this.state.value}
          onPress={(value) => this.onCheck(value)}
          buttonColor={'#3eadac'}
          selectedButtonColor={'#3eadac'}

        />

        <TouchableOpacity style={styles.submit} onPress={this.onSubmit}>
          <Text style={styles.textStyle}>Submit</Text>
        </TouchableOpacity>

        <Text
          style={styles.loginText}
          onPress={() => this.props.navigation.navigate('Login')}>
          Already have account? Click here to login
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  buttonWrap: {
    backgroundColor: 'red',
    top: 100,
  },
  loginText: {
    width: '100%',
    color: '#000',
    marginTop: 25,
    opacity: 0.5,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    display: "flex",
    paddingTop: Platform.OS === 'ios' ?  130 : 50,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 35,
    backgroundColor: '#fff'
  },
  title: {
    width: '100%',
    fontSize: 20,
    paddingBottom: 30,
    textAlign: 'center',
    color: '#000',
  },
  submit: {
    marginTop: 30,
    width: width - 70,
    display: "flex",
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3eadac',
  },
  textStyle: {
    color: '#fff',
    fontSize: 15,
  }
});
