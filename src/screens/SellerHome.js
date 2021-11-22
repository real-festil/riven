// components/dashboard.js

import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from 'react-native-simple-radio-button';
import {TouchableOpacity} from 'react-native-gesture-handler';
import firebase from '../../database/fireBase';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width, height} = Dimensions.get('window');

const radio_props = [
  {label: 'Yes', value: 0},
  {label: 'No', value: 1},
];

const SellerHome = props => {
  const [radioValue, setRadioValue] = useState(0);
  const [address, setAddress] = useState('');
  const [coordinate, setCoordinate] = useState(null);
  const [placeId, setPlaceId] = useState(null);
  const [price, setPrice] = useState('');
  const [timeFrame, setTimeFrame] = useState('');
  const [whereNew, setWhereNew] = useState('');
  const [whereNewCoordinate, setWhereNewCoordinate] = useState(null);
  const [addressId, setAddressId] = useState(null);
  const [currentKey, setCurrentKey] = useState(null);
  const [isAccepted, setIsAccepted] = useState(false);

  useEffect(() => {
    if (props.route.params.addressId !== false) {
      const id = props.route.params.addressId;
      const home = props.route.params.home;
      const userId = props.route.params.userId;
      setAddressId(id);
      console.log(id, 'snapshot.val()');
      setAddress(home.address);
      setPrice(home.price);
      setCoordinate(home.coordinate);
      setTimeFrame(home.timeFrame);
      setRadioValue(home.needBuy);
      setWhereNew(home.whereNew);
    }
    const userId = auth().currentUser.uid;
    database()
      .ref('users/' + userId)
      .once('value')
      .then(snapshot => {
        console.log('User data: ', snapshot.val());
        if (snapshot.val() !== null) {
          setIsAccepted(snapshot.val().privacyAccepted);
        }
      });
  }, [props.route]);

  const onSubmit = async () => {
    if (address.length == 0 || price.length == 0 || timeFrame.length == 0) {
      if (props.route.params.goBack) {
        isAccepted
          ? Alert.alert('All fields are required.')
          : props.navigation.goBack();
      } else {
        props.navigation.navigate('AboutRivenn', {userType: 'Seller'});
      }
      return;
    }
    const userId = auth().currentUser.uid;
    // if (address.length == 0) {
    //   Alert.alert("Address can't be empty!", '', [
    //     {
    //       text: 'Ok',
    //       style: 'cancel',
    //     },
    //   ]);
    // }
    firebase
      .database()
      .ref('users/' + userId + '/homes/')
      .push({
        address: address,
        coordinate: coordinate,
        price: price,
        timeFrame: timeFrame,
        whereNew: whereNew,
        needBuy: radioValue,
      })
      .then(data => {
        let key = data.getKey();
        firebase
          .database()
          .ref('AllSellerHomes/' + key)
          .set({
            address: address,
            coordinate: coordinate,
            price: price,
            timeFrame: timeFrame,
            whereNew: whereNew,
            needBuy: radioValue,
            sellerId: userId,
          })
          .then(data => {
            console.log('Saved Data', data);
            if (props.route.params.goBack) {
              props.navigation.goBack();
            } else {
              props.navigation.navigate('AboutRivenn', {userType: 'Seller'});
            }
          });
      })
      .catch(error => {
        console.log('Storing Error', error);
      });
  };

  const onUpdate = () => {
    if (address.length == 0 || price.length == 0 || timeFrame.length == 0) {
      Alert.alert('All fields are required');
      return;
    }
    const userId = auth().currentUser.uid;
    firebase
      .database()
      .ref('users/' + userId + '/homes/' + addressId)
      .update({
        address: address,
        coordinate: coordinate,
        price: price,
        timeFrame: timeFrame,
        whereNew: whereNew,
        whereNewCoordinate: whereNewCoordinate,
        needBuy: radioValue,
      });
    firebase
      .database()
      .ref('AllSellerHomes/' + addressId)
      .update({
        address: address,
        coordinate: coordinate,
        price: price,
        timeFrame: timeFrame,
        whereNew: whereNew,
        whereNewCoordinate: whereNewCoordinate,
        needBuy: radioValue,
        userId: userId,
      })
      .then(data => {
        console.log('Updated', data);
        props.navigation.goBack();
      });
  };

  console.log('where', whereNew);

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.inputItem}>
          <Text style={styles.inputTitle}>My Address: </Text>
          <View style={styles.input}>
            <TouchableOpacity
              onPress={() =>
                props.navigation.navigate('AddressScreen', {
                  setAddress: setAddress,
                  setCoordinate: setCoordinate,
                  setPlaceId: setPlaceId,
                })
              }>
              <Text style={{fontSize: 17}}> {address}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.inputItem}>
          <Text style={styles.inputTitle}>Price: </Text>
          <TextInput
            style={styles.input}
            onChangeText={value => setPrice(value)}
            value={price}
          />
        </View>

        <View style={styles.inputItem}>
          <Text style={{width: '40%', fontSize: 17}}>Timeframe to sell: </Text>
          <TextInput
            style={{
              width: '60%',
              padding: 0,
              borderBottomWidth: 1,
              borderColor: '#3eadac',
              fontSize: 17,
            }}
            onChangeText={value => setTimeFrame(value)}
            value={timeFrame}
          />
        </View>
        <View style={styles.radioItem}>
          <Text style={styles.radioTitle}>
            Do you need to buy another home?
          </Text>
          <View style={styles.radioWrapper}>
            <RadioForm style={styles.radioForm}>
              {radio_props.map((obj, i) => {
                return (
                  <RadioButton
                    labelHorizontal={true}
                    key={i}
                    wrapStyle={{width: '50%', marginTop: 10}}>
                    {/*  You can set RadioButtonLabel before RadioButtonInput */}
                    <RadioButtonInput
                      obj={obj}
                      index={i}
                      isSelected={radioValue === obj.value}
                      onPress={value => setRadioValue(value)}
                      buttonInnerColor={'#3eadac'}
                      buttonOuterColor={'#3eadac'}
                      buttonSize={15}
                      buttonStyle={{}}
                    />
                    <RadioButtonLabel
                      obj={obj}
                      index={i}
                      labelHorizontal={true}
                      onPress={value => setRadioValue(value)}
                      labelStyle={{fontSize: 17, color: '#000'}}
                    />
                  </RadioButton>
                );
              })}
            </RadioForm>
          </View>
          <View style={styles.inputItem}>
            <Text style={{width: '40%', fontSize: 17}}>If yes, where: </Text>
            <View style={[styles.input, {width: '60%'}]}>
              <TouchableOpacity
                onPress={() =>
                  props.navigation.navigate('AddressScreen', {
                    setAddress: setWhereNew,
                    setCoordinate: setWhereNewCoordinate,
                    setPlaceId: () => {},
                  })
                }>
                <Text style={{fontSize: 17}}> {whereNew}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {console.log('props', props.route.params)}

      {!props.route.params.addressId && (
        <View style={[styles.buttonWrapper, {justifyContent: 'space-between'}]}>
          {/*<TouchableOpacity style={styles.submit} onPress={() => props.navigation.goBack() }>*/}
          {/*  <Text style={styles.textStyle}>Previous</Text>*/}
          {/*</TouchableOpacity>*/}
          <TouchableOpacity
            style={styles.submit}
            onPress={() => props.navigation.goBack()}>
            <Text style={styles.textStyle}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submit} onPress={() => onSubmit()}>
            <Text style={styles.textStyle}>Next</Text>
          </TouchableOpacity>
        </View>
      )}

      {props.route.params.addressId && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}>
          <TouchableOpacity
            style={styles.cancel}
            onPress={() => props.navigation.goBack()}>
            <Text
              style={{
                color: '#3eadac',
                textTransform: 'uppercase',
                fontWeight: '500',
                fontSize: 15,
              }}>
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submit} onPress={() => onUpdate()}>
            <Text style={styles.textStyle}>Update</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default SellerHome;
const styles = StyleSheet.create({
  buttonWrap: {
    top: 100,
  },
  container: {
    flex: 1,
    display: 'flex',
    paddingTop: Platform.OS === 'ios' ? 100 : 50,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    width: '100%',
    fontSize: 20,
    fontWeight: '600',
    paddingBottom: 30,
    textAlign: 'center',
    color: '#000',
  },
  uploadBtn: {
    marginTop: 10,
    borderColor: '#3eadac',
    borderWidth: 1,
    padding: 10,
  },
  uploadText: {
    textTransform: 'uppercase',
    fontSize: 17,
    color: '#3eadac',
  },
  requiresWrapper: {
    marginTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requiresTitle: {
    textTransform: 'uppercase',
    fontWeight: '600',
    fontSize: 17,
  },
  wrapper: {
    width: '100%',
  },
  inputItem: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioForm: {
    marginTop: 15,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  radioItem: {
    marginTop: 20,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioWrapper: {
    width: '100%',
  },
  inputTitle: {
    width: '30%',
    fontSize: 17,
  },
  radioTitle: {
    width: '100%',
    paddingTop: 10,
    fontSize: 17,
    textAlign: 'left',
  },
  input: {
    width: '70%',
    padding: 0,
    borderBottomWidth: 1,
    borderColor: '#3eadac',
    fontSize: 17,
  },
  inputDescribe: {
    width: '100%',
    padding: 5,
    borderBottomWidth: 1,
    borderColor: '#3eadac',
    fontSize: 17,
    marginTop: 15,
  },
  buttonWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  submit: {
    marginTop: 30,
    width: width / 2 - 50,
    display: 'flex',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3eadac',
  },
  cancel: {
    marginTop: 30,
    width: width / 2 - 30,
    display: 'flex',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3eadac',
  },
  textStyle: {
    textTransform: 'uppercase',
    fontWeight: '500',
    color: '#fff',
    fontSize: 15,
  },
  errorText: {
    color: 'red',
    marginTop: 5,
  },
});
