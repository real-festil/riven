// App.js

import React, {useEffect, useState} from 'react';
import auth from '@react-native-firebase/auth';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Login from './src/Login';
import database from '@react-native-firebase/database';
import AppNavigation from './src/AppNavigation';
import firebase from './database/fireBase';

const Stack = createStackNavigator();

const payments = ['standard', 'premium'];

export default function App() {
  // Handle user state changes
  const [isLogged, setIsLogged] = useState(false);
  const [userType, setUserType] = useState(false);
  const [initialRouteName, setInitialRouteName] = useState('None');

  useEffect(async () => {
    const login = await AsyncStorage.getItem('Login');

    console.log('login', login);
    try {
      const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
      return subscriber; // unsubscribe on unmount
    } catch (error) {
      console.log(error);
    }
  }, []);

  const onAuthStateChanged = user => {
    if (user) {
      database()
        .ref('users/' + user.uid)
        .once('value')
        .then(snapshot => {
          if (snapshot.val() !== null) {
            // if (!snapshot.val().payment || !payments.includes(snapshot.val().payment)) {
            //   console.log('User have no payment')
            //   return setInitialRouteName('NoPaymentScreen')
            // }
            setUserType(snapshot.val().userType);
            setInitialRouteName(
              snapshot.val().userType === 'Seller'
                ? 'MainStack'
                : 'MainStackBuyer',
            );
          } else {
            console.log(user, 'user not register');
            setInitialRouteName('AuthStack');
          }
        })
        .catch(error => console.log(error, 'user Data error'));
    } else {
      setInitialRouteName('AuthStack');
    }
  };
  if (initialRouteName === 'None') {
    return null;
  }
  return (
    <NavigationContainer>
      <AppNavigation initialRouteName={initialRouteName} />
    </NavigationContainer>
  );
}
