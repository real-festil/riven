// components/dashboard.js

import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from 'react-native-simple-radio-button';
import {TouchableOpacity} from 'react-native-gesture-handler';
import firebase from '../../database/fireBase';
import auth from '@react-native-firebase/auth';

const {width, height} = Dimensions.get('window');

const radio_props = [
  {label: 'Yes', value: 'Yes'},
  {label: 'No', value: 'No'},
  {label: "I don't have a mortgage12332", value: "I don't have a mortgage"},
];
const primary_props = [
  {label: 'Yes', value: 'Yes'},
  {label: 'No', value: 'No'},
];

const how_quick_props = [
  {label: '1-3 months', value: '1-3'},
  {label: '3-6 months', value: '3-6'},
  {label: '1+ year', value: '12+'},
];

const SellerRegister = props => {
  const [radioValue, setRadioValue] = useState('');
  const [errorMessage, setErrorMesasge] = useState('');
  const [isLogged, setIsLogged] = useState('');

  const [primaryValue, setPrimaryValue] = useState('');
  const [howQuick, setHowQuick] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (props.route.params.profileData) {
      console.log(props.route.params.profileData, 'tut');
      setFirstName(props.route.params.profileData.firstName);
      setLastName(props.route.params.profileData.lastName);
      setEmail(props.route.params.profileData.email);
      setMobile(props.route.params.profileData.mobileNumber);
    }
  }, [props.route.params.profileData]);

  const validateEmail = email => {
    console.log(email);
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    if (reg.test(email) === false) {
      console.log('Email is Not Correct');
      setEmailError(true);
      setEmail(email);
      return false;
    } else {
      setEmailError(false);
      setEmail(email);
      console.log('Email is Correct');
    }
  };
  const registerUser = () => {
    if (
      email === '' ||
      password === '' ||
      firstName === '' ||
      lastName === '' ||
      mobile === '' ||
      mobile.length < 5 ||
      password.length < 5
    ) {
      Alert.alert('Enter details to signup!');
    } else {
      auth()
        .createUserWithEmailAndPassword(email, password)
        .then(res => {
          res.user.updateProfile({
            displayName: firstName + ' ' + lastName,
            phoneNumber: mobile,
          });
          console.log('registered', res.user.uid);
          setIsLogged(true);

          if (res.user.uid) {
            const userId = res.user.uid;
            firebase
              .database()
              .ref('users/' + userId + '/')
              .set({
                firstName: firstName,
                lastName: lastName,
                userType: 'Seller',
                email: email,
                mobileNumber: mobile,
                mortgage: radioValue,
                isPrimary: primaryValue,
                howQuick: howQuick,
              })
              .then(data => {
                props.navigation.navigate('SellerHome', {
                  addressId: false,
                  profileData: false,
                });
              })
              .catch(error => {
                console.log('Storing Error', error);
              });
          }
        })
        .catch(error => {
          setErrorMesasge(error.message);
          Alert.alert(error.message, '', [
            {
              text: 'Login',
              onPress: () => props.navigation.navigate('Login'),
            },
            {
              text: 'Cancel',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
          ]);
          console.log(error.message);
        });
    }
  };
  const onUpdate = () => {
    const userId = auth().currentUser.uid;

    auth()
      .currentUser.updateEmail(email)
      .then(function () {
        console.log('emsil updated');
      })
      .catch(function (error) {
        console.log('error emsil updated', error.name);
        if (error.code === 'auth/requires-recent-login') {
          Alert.alert(error.message.split('] ')[1].split('.')[0], '', [
            {text: 'OK', onPress: () => auth().signOut()},
          ]);
        }
      });

    firebase
      .database()
      .ref('users/' + userId + '/')
      .update({
        firstName: firstName,
        lastName: lastName,
        userType: 'Seller',
        email: email,
        mobileNumber: mobile,
        financing: radioValue,
      })
      .then(() => {
        props.navigation.navigate('ProfileScreen', {update: true});
      });
  };
  const onSubmit = () => {
    registerUser();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={{width: width - 40}}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Register as Seller</Text>

        <View style={styles.wrapper}>
          <View style={styles.inputItem}>
            <Text style={styles.inputTitle}>First Name: </Text>
            <TextInput
              style={styles.input}
              onChangeText={value => setFirstName(value)}
              value={firstName}
            />
          </View>
          <View style={styles.inputItem}>
            <Text style={styles.inputTitle}>Last Name: </Text>
            <TextInput
              style={styles.input}
              onChangeText={value => setLastName(value)}
              value={lastName}
            />
          </View>
          <View style={styles.inputItem}>
            <Text style={styles.inputTitle}>Email: </Text>
            <TextInput
              style={styles.input}
              autoCompleteType={'email'}
              keyboardType="email-address"
              onChangeText={value => validateEmail(value)}
              value={email}
            />
          </View>
          {emailError && (
            <Text style={styles.errorText}>Email is not valid</Text>
          )}
          <View style={styles.inputItem}>
            <Text style={styles.inputTitle}>Phone: </Text>
            <TextInput
              style={styles.input}
              onChangeText={value => setMobile(value)}
              keyboardType={'phone-pad'}
              value={mobile}
            />
          </View>
          <View>
            {mobile !== '' && mobile.length < 5 && (
              <Text style={styles.errorText}>
                Phone should be at least 5 digits long
              </Text>
            )}
          </View>
          {!props.route.params.profileData && (
            <View style={styles.inputItem}>
              <Text style={styles.inputTitle}>Password: </Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={val => setPassword(val)}
                maxLength={15}
                secureTextEntry={true}
              />
            </View>
          )}
          <View>
            {password !== '' && password.length < 6 && (
              <Text style={styles.errorText}>
                Phone should be at least 6 symbols long
              </Text>
            )}
          </View>
          {!props.route.params.profileData && (
            <View style={styles.radioItem}>
              <Text style={styles.radioTitle}>More information </Text>
              <View style={styles.radioWrapper}>
                <Text style={styles.radioSubTitle}>
                  Are you current on your mortage?
                </Text>
                <RadioForm style={styles.radioForm}>
                  {radio_props.map((obj, i) => {
                    return (
                      <RadioButton
                        labelHorizontal={true}
                        key={i}
                        wrapStyle={{
                          width: i == 2 ? '55%' : '22%',
                          marginTop: 10,
                        }}>
                        {/*  You can set RadioButtonLabel before RadioButtonInput */}
                        <RadioButtonInput
                          obj={obj}
                          index={i}
                          isSelected={radioValue === obj.value}
                          onPress={value => setRadioValue(value)}
                          buttonInnerColor={'#3eadac'}
                          buttonOuterColor={'#3eadac'}
                          buttonSize={12}
                          buttonStyle={{}}
                        />
                        <RadioButtonLabel
                          obj={obj}
                          index={i}
                          labelHorizontal={true}
                          onPress={value => setRadioValue(value)}
                          labelStyle={{fontSize: 13, color: '#000'}}
                        />
                      </RadioButton>
                    );
                  })}
                </RadioForm>
              </View>
              <View style={styles.radioWrapper}>
                <Text style={styles.radioSubTitle}>
                  Is the property you're selling your primary residence?
                </Text>
                <RadioForm style={styles.radioForm}>
                  {primary_props.map((obj, i) => {
                    return (
                      <RadioButton
                        labelHorizontal={true}
                        key={i}
                        wrapStyle={{width: '50%', marginTop: 10}}>
                        {/*  You can set RadioButtonLabel before RadioButtonInput */}
                        <RadioButtonInput
                          obj={obj}
                          index={i}
                          isSelected={primaryValue === obj.value}
                          onPress={value => setPrimaryValue(value)}
                          buttonInnerColor={'#3eadac'}
                          buttonOuterColor={'#3eadac'}
                          buttonSize={12}
                          buttonStyle={{}}
                        />
                        <RadioButtonLabel
                          obj={obj}
                          index={i}
                          labelHorizontal={true}
                          onPress={value => setRadioValue(value)}
                          labelStyle={{fontSize: 13, color: '#000'}}
                        />
                      </RadioButton>
                    );
                  })}
                </RadioForm>
              </View>
              <View style={styles.radioWrapper}>
                <Text style={styles.radioSubTitle}>
                  How quickly do you want to sell your property?
                </Text>
                <RadioForm style={styles.radioForm}>
                  {how_quick_props.map((obj, i) => {
                    return (
                      <RadioButton
                        labelHorizontal={true}
                        key={i}
                        wrapStyle={{width: '50%', marginTop: 10}}>
                        {/*  You can set RadioButtonLabel before RadioButtonInput */}
                        <RadioButtonInput
                          obj={obj}
                          index={i}
                          isSelected={howQuick === obj.value}
                          onPress={value => setHowQuick(value)}
                          buttonInnerColor={'#3eadac'}
                          buttonOuterColor={'#3eadac'}
                          buttonSize={12}
                          buttonStyle={{}}
                        />
                        <RadioButtonLabel
                          obj={obj}
                          index={i}
                          labelHorizontal={true}
                          onPress={value => setHowQuick(value)}
                          labelStyle={{fontSize: 13, color: '#000'}}
                        />
                      </RadioButton>
                    );
                  })}
                </RadioForm>
              </View>
            </View>
          )}
        </View>

        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={styles.submit}
            onPress={() => props.navigation.goBack()}>
            <Text style={styles.textStyle}>Previous</Text>
          </TouchableOpacity>
          {props.route.params.profileData ? (
            <TouchableOpacity style={styles.submit} onPress={() => onUpdate()}>
              <Text style={styles.textStyle}>Submit</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.submit} onPress={() => onSubmit()}>
              <Text style={styles.textStyle}>Next</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default SellerRegister;
const styles = StyleSheet.create({
  buttonWrap: {
    backgroundColor: 'red',
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
    paddingBottom: 30,
    textAlign: 'center',
    color: '#000',
    fontWeight: '600',
  },
  wrapper: {
    width: '100%',
  },
  inputItem: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 15,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  radioForm: {
    marginTop: 15,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  radioItem: {
    flexDirection: 'column',
    marginTop: 15,
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
    textAlign: 'center',
    fontWeight: '600',
  },
  radioSubTitle: {
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
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  submit: {
    marginTop: 30,
    width: width / 2 - 30,
    display: 'flex',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3eadac',
  },
  textStyle: {
    textTransform: 'uppercase',
    textAlign: 'center',
    fontWeight: '500',
    color: '#fff',
    fontSize: 15,
  },
  errorText: {
    color: 'red',
    marginTop: 5,
  },
});
