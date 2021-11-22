import React, { useState, useEffect } from 'react';
import { Text, Image, View, TouchableOpacity, ImageBackground, StyleSheet } from 'react-native';
import { createStackNavigator, HeaderTitle } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MapScreen from "./screens/Seller/MapScreen";
import MapScreenBuyer from "./screens/Buyer/MapScreen";
import ProfileScreen from "./screens/ProfileScreen";

import ProfileIcon from '../src/assets/user.png'
import ProfileIconWhite from '../src/assets/profile-white.png'
import PropertyIcon from '../src/assets/property.png'
import PropertyIconWhite from '../src/assets/property-white.png'
import MapIcon from '../src/assets/map.png'
import MapIconWhite from '../src/assets/map-white.png'
import Login from "./Login";
import SellerHome from "../src/screens/SellerHome";
import AddressScreen from "./screens/AddressScreen";
import PropertyScreen from "./screens/Seller/PropertyScreen";
import Dashboard from "./Dashboard";
import BuyerRegister from "./screens/BuyerRegister";
import BuyerHome from "./screens/BuyerHome";
import SellerRegister from "./screens/SellerRegister";
import AboutRivenn from "./screens/AboutRivenn";
import PaymentScreen from "./screens/PaymentScreen";
import PDFViewScreen from './screens/PDFViewScreen'


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="Login"
        component={Login}
      />
      <Stack.Screen
        name="Dashboard"
        component={Dashboard}
      />
      <Stack.Screen
        name="BuyerRegister"
        component={BuyerRegister}
      />
      <Stack.Screen
        name="HomeRegister"
        component={BuyerHome}
      />
      <Stack.Screen
        name="SellerRegister"
        component={SellerRegister}
      />
      <Stack.Screen
        name="AboutRivenn"
        component={AboutRivenn}
      />
      <Stack.Screen
        name="AddressScreen"
        component={AddressScreen}
      />
      <Stack.Screen
        name="PaymentScreen"
        component={PaymentScreen}
      />
      <Stack.Screen
        name="SellerHome"
        component={SellerHome}
      />
      <Stack.Screen
        name="PDFViewScreen"
        component={PDFViewScreen}
        options={({ route }) => ({
          headerShown: true,
          headerTitle: route.params.headerTitle || 'Document'
        })}
      />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator
      initialRouteName={'ProfileScreen'}
      screenOptions={{
        headerShown: false,
        gestureEnabled: true
      }}
    >
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{
          gestureEnabled: false
        }}
      />
      <Stack.Screen
        name="Login"
        component={Login}
      />
      <Stack.Screen
        name="BuyerHome"
        component={BuyerHome}
      />
      <Stack.Screen
        name="BuyerRegister"
        component={BuyerRegister}
      />
      <Stack.Screen
        name="SellerHome"
        component={SellerHome}
      />
      <Stack.Screen
        name="SellerRegister"
        component={SellerRegister}
      />
      <Stack.Screen
        name="AddressScreen"
        component={AddressScreen}
      />
      <Stack.Screen
        name="PaymentScreen"
        component={PaymentScreen}
      />
    </Stack.Navigator>
  );
}

function PropertyStack() {
  return (
    <Stack.Navigator
      initialRouteName={'PropertyScreen'}
      screenOptions={{
        headerShown: false,
        gestureEnabled: true
      }}
    >
      <Stack.Screen
        name="Propertycreen"
        component={PropertyScreen}
        options={{
          gestureEnabled: false
        }}
      />

      <Stack.Screen
        name="SellerHome"
        component={SellerHome}
      />
      <Stack.Screen
        name="AddressScreen"
        component={AddressScreen}
      />
    </Stack.Navigator>
  );
}

function MapStack() {
  return (
    <Stack.Navigator
      initialRouteName={'MapScreen'}
      screenOptions={{
        headerShown: false,
        gestureEnabled: true
      }}
    >
      <Stack.Screen
        name="MapScreen"
        component={MapScreen}
        options={{
          gestureEnabled: false
        }}
      />

    </Stack.Navigator>
  );
}
function MapStackBuyer() {
  return (
    <Stack.Navigator
      initialRouteName={'MapScreen'}
      screenOptions={{
        headerShown: false,
        gestureEnabled: true
      }}
    >
      <Stack.Screen
        name="MapScreen"
        component={MapScreenBuyer}
        options={{
          gestureEnabled: false
        }}
      />

    </Stack.Navigator>
  );
}

function BottomTabsSeller() {
  return (
    <Tab.Navigator
      initialRouteName={'MapScreen'}
      activeColor="rgba(97, 109, 120, 0.6)"
      tabBarOptions={{
        showIcon: true,
        activeTintColor: '#fff',
        inactiveTintColor: '#000',
        activeBackgroundColor: '#3eadac',
        inactiveBackgroundColor: 'rgba(62, 173, 172, 0.7)',
        tabStyle: {
          height: 80,
          padding: 20,
          justifyContent: 'center',
          alignItems: 'center',
        },
        labelStyle: {
          fontSize: 15,
        },
        style: {
          height: 80,
          bottom: 0,
          elevation: 0,
          borderTopWidth: 0
        }
      }}
      shifting={false}
    >
      <Tab.Screen
        name="MapScreen"
        component={MapStack}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: ({ focused, color }) => focused ?
            <Image style={{ width: 25, marginBottom: 5, height: 25 }} source={MapIconWhite} />
            : <Image style={{ width: 25, marginBottom: 5, height: 25 }} source={MapIcon} />
        }}

      />
      <Tab.Screen
        name="PropertyScreen"
        component={PropertyStack}
        options={{
          tabBarLabel: 'Property',
          tabBarIcon: ({ focused, color }) => focused ?
            <Image style={{ width: 25, marginBottom: 5, height: 25 }} source={PropertyIconWhite} />
            : <Image style={{ width: 25, marginBottom: 5, height: 25 }} source={PropertyIcon} />
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused, color }) => focused ?
            <Image style={{ width: 25, marginBottom: 5, height: 25 }} source={ProfileIconWhite} />
            : <Image style={{ width: 25, marginBottom: 5, height: 25 }} source={ProfileIcon} />
        }}
      />
    </Tab.Navigator>
  );
}

function BottomTabsBuyer() {
  return (
    <Tab.Navigator
      initialRouteName={'Map'}
      activeColor="rgba(97, 109, 120, 0.6)"
      tabBarOptions={{
        showIcon: true,
        activeTintColor: '#fff',
        inactiveTintColor: '#000',
        activeBackgroundColor: '#3eadac',
        inactiveBackgroundColor: 'rgba(62, 173, 172, 0.7)',
        tabStyle: {
          height: 80,
          padding: 10,
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        labelStyle: {
          fontSize: 15,
        },
        style: {
          height: 80,
          bottom: 0,
          elevation: 0,
          borderTopWidth: 0
        }
      }}
      shifting={false}
    >
      <Tab.Screen
        name="Map"
        component={MapStackBuyer}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: ({ focused, color }) => focused ?
            <Image style={{ width: 25, marginBottom: 5, height: 25 }} source={MapIconWhite} />
            : <Image style={{ width: 25, marginBottom: 5, height: 25 }} source={MapIcon} />
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused, color }) => focused ?
            <Image style={{ width: 25, marginBottom: 5, height: 25 }} source={ProfileIconWhite} />
            : <Image style={{ width: 25, marginBottom: 5, height: 25 }} source={ProfileIcon} />
        }}
      />
    </Tab.Navigator>
  );
}
const AppNavigator = (props) => {
  console.log('stack', props.initialRouteName)
  return (
    <Stack.Navigator
      initialRouteName={props.initialRouteName}
      screenOptions={{
        headerShown: false,
        gestureEnabled: false
      }}
    >
      <Stack.Screen name="AuthStack" component={AuthStack} />
      <Stack.Screen name="MainStack" component={BottomTabsSeller} />
      <Stack.Screen name="MainStackBuyer" component={BottomTabsBuyer} />
      <Stack.Screen name="NoPaymentScreen" component={PaymentScreen} />
    </Stack.Navigator>
  );
};


export default AppNavigator;
