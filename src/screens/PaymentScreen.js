// components/dashboard.js

import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Button, Dimensions, PLatform, TextInput, Platform, TouchableOpacity, ActivityIndicator } from "react-native";
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import database from "@react-native-firebase/database";
import auth from '@react-native-firebase/auth';
import { requestPurchase, requestSubscription, useIAP } from 'react-native-iap';


const { width, height } = Dimensions.get('window')

const productIDs = Platform.select({
  ios: {
    no_payment: [
      { value: 'standard', productID: 'com.BuyersSellersDatingFees.standard', title: 'Standard: $4.99 — One time fee' },
      { value: 'premium', productID: 'com.BuyersSellersDatingFees.premium', title: 'Premium: $14.99 — One time fee' }
    ],
    upgrade: [
      { value: 'premium', productID: 'com.BuyersSellersDatingFees.premiumUpgrade', title: 'Upgrade to premium: $9.99 — One time fee' }
    ]
  },
  android: {
    no_payment: [
      { value: 'standard', productID: 'fees.standart', title: 'Standard: $4.99 — One time fee' },
      { value: 'premium', productID: 'fees.premium', title: 'Premium: $14.99 — One time fee' }
    ],
    // no_payment: [
    //   { value: 'standard', productID: 'android.test.purchased', title: 'Standard: $4.99 — One time fee' },
    //   { value: 'premium', productID: 'android.test.purchased', title: 'Premium: $14.99 — One time fee' }
    // ],
    upgrade: [
      { value: 'premium', productID: 'fees.upgrade', title: 'Upgrade to premium: $9.99 — One time fee' }
    ]
  }
})

const allProductValues = Platform.select({
  ios: [
    { value: 'standard', productID: 'com.BuyersSellersDatingFees.standard', title: 'Standard: $4.99 — One time fee' },
    { value: 'premium', productID: 'com.BuyersSellersDatingFees.premium', title: 'Premium: $14.99 — One time fee' },
    { value: 'premium', productID: 'com.BuyersSellersDatingFees.premiumUpgrade', title: 'Upgrade to premium: $9.99 — One time fee' }
  ],
  android: [
    { value: 'standard', productID: 'fees.standart', title: 'Standard: $4.99 — One time fee' },
    { value: 'premium', productID: 'fees.premium', title: 'Premium: $14.99 — One time fee' },
    { value: 'premium', productID: 'fees.upgrade', title: 'Upgrade to premium: $9.99 — One time fee' }
  ]
})

console.log('IDS', productIDs)

const PaymentScreen = (props) => {
  const [radioSelect, setRadioSelect] = useState(null)
  const userType = useRef(null)
  const [isPaymentInProgress, setPaymentInProgress] = useState(false);

  // 'upgrade' | 'no_payment'
  const [context, setContext] = useState(null)

  const {
    connected,
    products,
    subscriptions,
    getProducts,
    getSubscriptions,
    finishTransaction,
    currentPurchase,
    currentPurchaseError,
  } = useIAP();

  // console.log({
  //   connected,
  //   products,
  //   subscriptions,
  //   getProducts,
  //   getSubscriptions,
  //   finishTransaction,
  //   currentPurchase,
  //   currentPurchaseError,
  // });

  useEffect(() => {
    const checkCurrentPurchase = async (purchase) => {
      if (purchase) {
        const receipt = purchase.transactionReceipt;
        if (receipt) {
          onSuccessfulPayment(purchase)
        }
      }
    };
    if (currentPurchaseError) {
      setPaymentInProgress(false);
      alert('Error while processing payment')
      console.log('ERR', currentPurchaseError)
    }
    checkCurrentPurchase(currentPurchase);
    // console.log('CUR', currentPurchase)
  }, [currentPurchase, finishTransaction, currentPurchaseError]);


  useEffect(async () => {
    if (connected && context) {
      console.log('Trying to get products', productIDs[context].map(el => el.productID))
      await getProducts(productIDs[context].map(el => el.productID))
    }
  }, [connected, getProducts, context])

  const signOut = () => {
    auth().signOut()
    props.navigation.navigate('AuthStack')
  }

  const init = async () => {
    if (!auth().currentUser.uid) return this.props.navigation.navigate('Login');
    if (props.route.params && props.route.params.userType) {
      userType.current = props.route.params.userType
    } else {
      database()
        .ref(`users/${auth().currentUser.uid}`)
        .once('value')
        .then(snapshot => {
          userType.current = snapshot.val().userType
        })
    }

    if (props.route.params && props.route.params.context) {
      setContext(props.route.params.context)
    } else {
      setContext('no_payment')
    }
  }

  useEffect(() => {
    init()
  }, [])

  const onPaymentClick = async () => {
    if (!radioSelect) return alert('Please select one of the options');
    try {
      console.log('Requesting payment', radioSelect)
      setPaymentInProgress(true)
      await requestPurchase(radioSelect);
    } catch (err) {
      console.log(err);
    }
  }

  const onSuccessfulPayment = async (receipt) => {
    console.log('Handling successfull payment', receipt.productId)
    setPaymentInProgress(false);
    if (typeof receipt === 'string') {
      try {
        receipt = JSON.parse(receipt)
      } catch (err) {
        alert(`Parse error\nFailed to finish transation, contact support\n${err.message}`)
        return;
      }
    }

    try {
      await database().ref(`users/${auth().currentUser.uid}`).update({
        payment: allProductValues.find(el => el.productID === receipt.productId).value
      })
    } catch (err) {
      console.log('Database error', err);
      alert(`Database error\nFailed to finish transation, contact support\n${err.message}`)
      return;
    }

    try {
      const ackResult = await finishTransaction(receipt);
      console.log('ackResult', ackResult);
    } catch (err) {
      alert(`ACK error\nFailed to finish transation, contact support\n${err.message}`)
      console.warn('err', err);
      return;
    }

    if (context === 'upgrade') {
      props.navigation.goBack();
    } else if (context === 'no_payment') {
      userType.current == 'Buyer' ?
        props.navigation.navigate('MainStackBuyer')
        : props.navigation.navigate('MainStack')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment</Text>
      {
        context === 'no_payment' && <>
          <Text style={{ marginBottom: 10 }}>In order to use app, you have to pay a one time fee, please select one below or log out</Text>
          <Text>Your email: {auth().currentUser.email}</Text>
        </>
      }
      {
        context === 'upgrade' && <>
          <Text>You can upgrade your Standart account to Premium by $10 payment</Text>
        </>
      }
      <View style={styles.radioWrapper}>
        {
          products && products.length > 0 && <RadioForm
            style={{ justifyContent: 'space-between', height: 100, }}
            radio_props={products.map(product => ({
              label: productIDs[context].find(el => el.productID === product.productId).title,
              value: product.productId
            }))}
            initial={radioSelect}
            onPress={(value) => setRadioSelect(value)}
            buttonColor={'#3eadac'}
            selectedButtonColor={'#3eadac'}
          />
        }

        {
          (!products || products.length <= 0) && <View style={{ alignItems: 'center', justifyContent: 'center', width: width - 40, height: 80 }}><ActivityIndicator size={'large'} color='black'></ActivityIndicator></View>
        }
      </View>

      <TouchableOpacity style={styles.submit} onPress={() => onPaymentClick()}>
        {
          isPaymentInProgress
            ? <ActivityIndicator size={'small'} color={'white'}></ActivityIndicator>
            : <Text style={styles.textStyle}>Proceed payment</Text>
        }
      </TouchableOpacity>
      {
        context === 'no_payment' &&
        <TouchableOpacity
          style={styles.logout}
          onPress={signOut}
        >
          <Text>Logout</Text>
        </TouchableOpacity>
      }
      {
        context === 'upgrade' &&
        <TouchableOpacity
          style={styles.logout}
          onPress={() => props.navigation.goBack()}
        >
          <Text>Back</Text>
        </TouchableOpacity>
      }
    </View>
  )
}

export default PaymentScreen
const styles = StyleSheet.create({
  buttonWrap: {
    top: 100,
  },
  container: {
    flex: 1,
    display: "flex",
    paddingTop: Platform.OS === 'ios' ? 100 : 50,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    width: '100%',
    fontSize: 20,
    paddingBottom: 30,
    textAlign: 'center',
    color: '#000',
  },
  inputItem: {
    width: '100%',
    marginTop: 10,
    display: "flex",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputTitle: {
    fontSize: 17,
  },
  uploadBtn: {
    borderColor: '#3eadac',
    borderWidth: 1,
    padding: 10,
  },
  uploadText: {
    textTransform: 'uppercase',
    fontSize: 15,
    color: '#3eadac'
  },
  radioWrapper: {
    marginTop: 20,
  },
  submit: {
    marginTop: 30,
    width: width - 40,
    display: "flex",
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3eadac',
  },
  textStyle: {
    color: '#fff',
    fontSize: 17,
  },
  logout: {
    width: width - 40,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginTop: 20,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
    marginBottom: 10,
    position: 'absolute',

    bottom: 50,
    left: 20,
  },
});