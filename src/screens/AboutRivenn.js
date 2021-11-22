// components/dashboard.js

import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Button,
  Dimensions,
  Platform,
  TextInput,
} from 'react-native';
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from 'react-native-simple-radio-button';
import {TouchableOpacity} from 'react-native-gesture-handler';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import firebase from '../../database/fireBase';

const {width, height} = Dimensions.get('window');

const AboutRivenn = props => {
  const [understand, setunerstand] = useState(false);
  const [termsAgree, setTermsAgree] = useState(false);
  const [error, setErrore] = useState(false);
  const [userType, setUserType] = useState('');

  useEffect(() => {
    database()
      .ref(`users/${auth().currentUser.uid}`)
      .once('value')
      .then(snapshot => {
        setUserType(snapshot.val().userType);
      });
  }, []);

  const onSubmit = () => {
    if (termsAgree) {
      setErrore(false);
      console.log(props.route.params);
      const userId = auth().currentUser.uid;
      firebase
        .database()
        .ref('users/' + userId + '/')
        .update({
          privacyAccepted: true,
        })
        .then(data => {
          userType === 'Buyer'
            ? props.navigation.navigate('MainStackBuyer')
            : props.navigation.navigate('MainStack');
        })
        .catch(error => {
          console.log('Storing Error', error);
        });
    } else {
      setErrore(true);
    }
  };

  const handleTerms = () => {
    props.navigation.navigate('PDFViewScreen', {
      source: {uri: require('../assets/Terms_Conditions.json').base64},
      headerTitle: 'Terms and conditions',
    });
  };

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>About Rivenn</Text>
      <View style={styles.inputItem}>
        <Text style={styles.inputTitle}>How the Rivenn system works </Text>
        <TouchableOpacity style={styles.uploadBtn}>
          <Text style={styles.uploadText}>Click to read</Text>
        </TouchableOpacity>
      </View> */}

      {/* <View style={styles.radioWrapper}>
        <RadioButton
          obj={{ label: 'I understand how Rivenn works', value: true }}
          isSelected={understand}
          onPress={() => understand ? setunerstand(false) : setunerstand(true)}
          buttonColor={'#3eadac'}
          selectedButtonColor={'#3eadac'}
        />
      </View> */}

      <View style={styles.inputItem}>
        <Text style={styles.inputTitle}>Terms and Agreement</Text>
        <TouchableOpacity style={styles.uploadBtn} onPress={handleTerms}>
          <Text style={styles.uploadText}>Click to read</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.radioWrapper}>
        <RadioButton
          obj={{
            label:
              'I have read, understood and agree with \nthe Terms and  Agreement',
            value: true,
          }}
          isSelected={termsAgree}
          style={{alignItems: 'center'}}
          onPress={() =>
            termsAgree ? setTermsAgree(false) : setTermsAgree(true)
          }
          buttonColor={'#3eadac'}
          selectedButtonColor={'#3eadac'}
        />
      </View>
      {error && (
        <Text style={{color: 'red', fontSize: 15, marginTop: 10}}>
          Please, agree the terms
        </Text>
      )}
      <TouchableOpacity style={styles.submit} onPress={() => onSubmit()}>
        <Text style={styles.textStyle}>
          I'ready to have Rivenn help me find a home
        </Text>
      </TouchableOpacity>
      {/*<Button*/}
      {/*  color="#3740FE"*/}
      {/*  title="Logout"*/}
      {/*  onPress={() => this.signOut()}*/}
      {/*/>*/}
    </View>
  );
};

export default AboutRivenn;
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
  },
  inputItem: {
    width: '100%',
    marginTop: 10,
    display: 'flex',
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
    fontSize: Platform.OS === 'ios' ? 15 : 13,
    color: '#3eadac',
  },
  radioWrapper: {
    marginTop: 20,
  },
  submit: {
    marginTop: 30,
    width: width - 40,
    display: 'flex',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3eadac',
  },
  textStyle: {
    color: '#fff',
    fontSize: 17,
  },
});
