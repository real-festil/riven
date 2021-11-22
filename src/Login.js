// components/login.js

import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import firebase from '../database/fireBase';
import auth from '@react-native-firebase/auth';
import {TouchableOpacity} from 'react-native-gesture-handler';
import database from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
const {width, height} = Dimensions.get('window');

const payments = ['standard', 'premium'];

export default class Login extends Component {
  constructor() {
    super();
    this.state = {
      email: '',
      password: '',
      isLoading: false,
      isLogged: false,
    };
    this.onAuthStateChanged = this.onAuthStateChanged.bind(this);
  }
  async componentDidMount() {
    const subscriber = auth().onAuthStateChanged(this.onAuthStateChanged);

    return subscriber; // unsubscribe on unmount
  }
  onAuthStateChanged = user => {
    console.log('user login screen', user);
    if (user) {
      //this.props.navigation.navigate('ProfileScreen');
    }
  };
  updateInputVal = (val, prop) => {
    const state = this.state;
    state[prop] = val;
    this.setState(state);
  };

  userLogin = () => {
    if (this.state.email === '' && this.state.password === '') {
      Alert.alert('Enter details to signin!');
    } else {
      this.setState({
        isLoading: true,
      });
      auth()
        .signInWithEmailAndPassword(this.state.email, this.state.password)
        .then(res => {
          console.log(res);
          console.log('User logged-in successfully!');
          this.setState({
            isLoading: false,
            isLogged: true,
            email: '',
            password: '',
          });
          AsyncStorage.setItem('Login', JSON.stringify(this.state.isLogged));
          database()
            .ref('users/' + res.user.uid)
            .once('value')
            .then(snapshot => {
              if (
                !snapshot.val().payment ||
                !payments.includes(snapshot.val().payment)
              ) {
                console.log('User have no payment');
                // return this.props.navigation.navigate('NoPaymentScreen')
              }
              if (snapshot.val().userType === 'Seller') {
                this.props.navigation.navigate('MainStack');
              } else {
                this.props.navigation.navigate('MainStackBuyer');
              }
            });
        })
        .catch(error => {
          console.log(error);
          this.setState({
            isLoading: false,
          });
          Alert.alert(
            'Email or password is wrong!',
            'Please, recheck your credentials and try again.',
            [
              {
                text: 'Ok',
                style: 'cancel',
              },
            ],
          );
          this.props.navigation.navigate('AuthStack');
        });
    }
  };

  render() {
    if (this.state.isLoading) {
      return (
        <View style={styles.preloader}>
          <ActivityIndicator size="large" color="#9E9E9E" />
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Buyers & Sellers</Text>
        <TextInput
          style={styles.inputStyle}
          placeholder="Email"
          value={this.state.email}
          onChangeText={val => this.updateInputVal(val, 'email')}
        />
        <TextInput
          style={styles.inputStyle}
          placeholder="Password"
          value={this.state.password}
          onChangeText={val => this.updateInputVal(val, 'password')}
          maxLength={15}
          secureTextEntry={true}
        />

        <TouchableOpacity
          style={[
            styles.loginBtn,
            {backgroundColor: '#3eadac', padding: 10, borderColor: '#3eadac'},
          ]}
          onPress={() => this.userLogin()}>
          <Text style={styles.btnText}>Login</Text>
        </TouchableOpacity>

        <Text
          style={styles.loginText}
          onPress={() => this.props.navigation.navigate('Dashboard')}>
          Don't have account? Click here to signup
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 35,
    paddingTop: 0,
    backgroundColor: '#fff',
  },
  title: {
    width: '100%',
    fontSize: 27,
    paddingBottom: 30,
    textAlign: 'center',
    color: '#000',
  },
  inputStyle: {
    width: '100%',
    marginBottom: 15,
    paddingBottom: 15,
    alignSelf: 'center',
    borderBottomWidth: 1,
    borderColor: '#3eadac',
    fontSize: 17,
  },
  loginBtn: {
    width: width - 60,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginTop: 20,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
    marginBottom: 10,
  },
  btnText: {
    color: '#fff',
    fontSize: 17,
  },
  loginText: {
    color: '#000',
    marginTop: 25,
    opacity: 0.5,
    textAlign: 'center',
  },
  preloader: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
});
