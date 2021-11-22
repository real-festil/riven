// components/dashboard.js

import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ScrollView,
  Platform,
  Dimensions,
  PermissionsAndroid,
} from 'react-native';
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from 'react-native-simple-radio-button';
import {TouchableOpacity} from 'react-native-gesture-handler';
import firebase from '../../database/fireBase';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DocumentPicker from 'react-native-document-picker';
import storage from '@react-native-firebase/storage';
import RNFetchBlob from 'rn-fetch-blob';

const {width, height} = Dimensions.get('window');

const radio_props = [
  {label: 'I need a pre approval letter', value: 0},
  {label: 'I have a pre approval letter', value: 1},
];

const BuyerHome = props => {
  const [radioValue, setRadioValue] = useState(0);
  const [town, setTown] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [bedroomsMin, setBedroomsMin] = useState(0);
  const [bedroomsMax, setBedroomsMax] = useState(0);
  const [bathroomsMin, setBathroomsMin] = useState(0);
  const [bathroomsMax, setBathroomsMax] = useState(0);
  const [minSize, setMinSize] = useState(0);
  const [maxSize, setMaxSize] = useState(0);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [letter, setLetter] = useState(null);

  useEffect(() => {
    if (props.route.params.profileData) {
      const data = [props.route.params.profileData];

      setTown(data[0].town);
      setNeighborhood(data[0].neighborhood);
      setBedroomsMin(data[0].bedrooms[0]);
      setBedroomsMax(data[0].bedrooms[1]);
      setBathroomsMin(data[0].bathrooms[0]);
      setBathroomsMax(data[0].bathrooms[1]);
      setMinSize(data[0].homeSize[0]);
      setMaxSize(data[0].homeSize[1]);
      setMinPrice(data[0].homePrice[0]);
      setMaxPrice(data[0].homePrice[1]);
    }
  }, [props.route.params.profileData]);

  const onFileUpload = async () => {
    console.log('uploading');
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Read External Storage',
          message: '',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the external storage');
      } else {
        console.log('Camera permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
    try {
      console.log('uploading');
      const res = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.pdf,
          DocumentPicker.types.doc,
          DocumentPicker.types.docx,
          DocumentPicker.types.xls,
        ],
      });
      console.log(
        res.uri,
        res.type, // mime type
        res.name,
        res.size,
      );
      setLetter(res);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
      } else {
        throw err;
      }
    }
  };

  async function getPathForFirebaseStorage(uri) {
    if (Platform.OS == 'ios') {
      return uri;
    }
    const stat = await RNFetchBlob.fs.stat(uri);
    return stat.path;
  }

  const onSubmit = async () => {
    const userId = auth().currentUser.uid;
    const reference = storage().ref(userId);
    firebase
      .database()
      .ref('users/' + userId + '/homeParam/')
      .set({
        town: town,
        neighborhood: neighborhood,
        bedrooms: [bedroomsMin, bedroomsMax],
        bathrooms: [bathroomsMin, bathroomsMax],
        homeSize: [minSize, maxSize],
        homePrice: [minPrice, maxPrice],
      })
      .then(data => {
        console.log('Saved Data', data);

        props.navigation.navigate('AboutRivenn', {userType: 'Buyer'});
      })
      .catch(error => {
        console.log('Storing Error', error);
      });
    if (letter) {
      const fileUri = await getPathForFirebaseStorage(letter.uri);
      const uploadTask = reference.putFile(fileUri);
      await uploadTask;
      console.log('uploadTask', uploadTask);
    }
  };

  const onUpdate = async () => {
    const userId = auth().currentUser.uid;
    const reference = storage().ref(userId);
    firebase
      .database()
      .ref('users/' + userId + '/homeParam/')
      .set({
        town: town,
        neighborhood: neighborhood,
        bedrooms: [bedroomsMin, bedroomsMax],
        bathrooms: [bathroomsMin, bathroomsMax],
        homeSize: [minSize, maxSize],
        homePrice: [minPrice, maxPrice],
      })
      .then(data => {
        console.log('Saved Data', data);
        props.navigation.navigate('ProfileScreen', {update: true});
      })
      .catch(error => {
        console.log('Storing Error', error);
      });
    if (letter) {
      const fileUri = await getPathForFirebaseStorage(letter.uri);
      console.log('fileUri', fileUri);
      const uploadTask = reference.putFile(fileUri).catch(error => {
        throw error;
      });
      await uploadTask;
      console.log('uploadTask', uploadTask);
    }
  };
  console.log(props.route);
  return (
    <View style={styles.container}>
      <ScrollView
        style={{width: width - 40}}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>About Home</Text>

        <View style={styles.wrapper}>
          <View style={styles.radioItem}>
            <View style={styles.radioWrapper}>
              <RadioForm style={styles.radioForm}>
                {radio_props.map((obj, i) => {
                  return (
                    <RadioButton
                      labelHorizontal={true}
                      key={i}
                      wrapStyle={{width: '100%', marginTop: 10}}>
                      {/*  You can set RadioButtonLabel before RadioButtonInput */}
                      <RadioButtonInput
                        obj={obj}
                        index={i}
                        isSelected={radioValue === obj.value}
                        onPress={value => {
                          setRadioValue(value);
                          setLetter(null);
                        }}
                        buttonInnerColor={'#3eadac'}
                        buttonOuterColor={'#3eadac'}
                        buttonSize={15}
                        buttonStyle={{}}
                      />
                      <RadioButtonLabel
                        obj={obj}
                        index={i}
                        labelHorizontal={true}
                        onPress={value => {
                          setRadioValue(value);
                          setLetter(null);
                        }}
                        labelStyle={{fontSize: 17, color: '#000'}}
                      />
                    </RadioButton>
                  );
                })}
              </RadioForm>
            </View>
            {radioValue == 1 && (
              <TouchableOpacity style={styles.uploadBtn} onPress={onFileUpload}>
                <Text style={styles.uploadText}>Upload File</Text>
              </TouchableOpacity>
            )}
            {letter && <Text style={styles.requiresTitle}>{letter.name}</Text>}
          </View>
          <View style={styles.requiresWrapper}>
            <Text style={styles.requiresTitle}>Home Requirements</Text>
          </View>
          <View style={styles.inputItem}>
            <Text style={styles.inputTitle}>City/Town: </Text>
            <TextInput
              style={styles.input}
              onChangeText={value => setTown(value)}
              value={town}
            />
          </View>
          <View style={styles.inputItemCol}>
            <Text style={styles.inputTitleCol}>Neighborhood/Area: </Text>
            <TextInput
              style={styles.inputCol}
              onChangeText={value => setNeighborhood(value)}
              value={neighborhood}
              multiline={true}
            />
          </View>
          <View style={styles.inputItem}>
            <Text style={{width: '37%', fontSize: 17}}># of bedrooms: </Text>
            <TextInput
              style={{
                width: '30%',
                padding: 0,
                borderBottomWidth: 1,
                borderColor: '#3eadac',
                fontSize: 17,
              }}
              onChangeText={value => setBedroomsMin(value)}
              value={bedroomsMin}
              placeholder={'min'}
              keyboardType={'numeric'}
            />
            <TextInput
              style={{
                width: '30%',
                left: 10,
                padding: 0,
                borderBottomWidth: 1,
                borderColor: '#3eadac',
                fontSize: 17,
              }}
              onChangeText={value => setBedroomsMax(value)}
              value={bedroomsMax}
              placeholder={'max'}
              keyboardType={'numeric'}
            />
          </View>
          <View style={styles.inputItem}>
            <Text style={{width: '37%', fontSize: 17}}># of bathrooms: </Text>
            <TextInput
              style={{
                width: '30%',
                padding: 0,
                borderBottomWidth: 1,
                borderColor: '#3eadac',
                fontSize: 17,
              }}
              onChangeText={value => setBathroomsMin(value)}
              value={bathroomsMin}
              placeholder={'min'}
              keyboardType={'numeric'}
            />
            <TextInput
              style={{
                width: '30%',
                padding: 0,
                left: 10,
                borderBottomWidth: 1,
                borderColor: '#3eadac',
                fontSize: 17,
              }}
              onChangeText={value => setBathroomsMax(value)}
              value={bathroomsMax}
              placeholder={'max'}
              keyboardType={'numeric'}
            />
          </View>
          <View style={styles.inputItem}>
            <Text style={{width: '37%', fontSize: 17}}>Size of home: </Text>
            <TextInput
              style={{
                width: '30%',
                padding: 0,
                borderBottomWidth: 1,
                borderColor: '#3eadac',
                fontSize: 17,
              }}
              onChangeText={value => setMinSize(value)}
              value={minSize}
              placeholder={'min sq.ft'}
              keyboardType={'numeric'}
            />
            <TextInput
              style={{
                width: '30%',
                padding: 0,
                left: 10,
                borderBottomWidth: 1,
                borderColor: '#3eadac',
                fontSize: 17,
              }}
              onChangeText={value => setMaxSize(value)}
              value={maxSize}
              placeholder={'max sq.ft'}
              keyboardType={'numeric'}
            />
          </View>
          <View style={styles.inputItem}>
            <Text style={{width: '37%', fontSize: 20}}>Price: </Text>
            <TextInput
              style={{
                width: '30%',
                padding: 0,
                borderBottomWidth: 1,
                borderColor: '#3eadac',
                fontSize: 17,
              }}
              onChangeText={value => setMinPrice(value)}
              value={minPrice}
              placeholder={'min'}
              keyboardType={'numeric'}
            />
            <TextInput
              style={{
                width: '30%',
                padding: 0,
                left: 10,
                borderBottomWidth: 1,
                borderColor: '#3eadac',
                fontSize: 17,
              }}
              onChangeText={value => setMaxPrice(value)}
              value={maxPrice}
              placeholder={'max'}
              keyboardType={'numeric'}
            />
          </View>
        </View>

        <View
          style={[
            styles.buttonWrapper,
            {
              justifyContent: props.route.params.profileData
                ? 'space-between'
                : 'center',
            },
          ]}>
          {props.route.params.profileData && (
            <TouchableOpacity
              style={styles.submit}
              onPress={() => props.navigation.goBack()}>
              <Text style={styles.textStyle}>Previous</Text>
            </TouchableOpacity>
          )}

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

export default BuyerHome;
const styles = StyleSheet.create({
  buttonWrap: {
    backgroundColor: 'red',
    top: 100,
  },
  container: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 0,
    backgroundColor: '#fff',
  },
  title: {
    paddingTop: Platform.OS === 'ios' ? 100 : 30,
    width: '100%',
    fontSize: 20,
    fontWeight: '600',
    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
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
  inputItemCol: {
    display: 'flex',
    marginTop: 15,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  radioForm: {
    marginTop: 15,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  radioItem: {
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
  inputTitleCol: {
    width: '100%',
    fontSize: 17,
  },
  radioTitle: {
    width: '100%',
    paddingTop: 10,
    fontSize: 17,
    textAlign: 'center',
  },
  input: {
    width: '70%',
    borderBottomWidth: 1,
    borderColor: '#3eadac',
    fontSize: 17,
    padding: 0,
  },
  inputCol: {
    marginTop: Platform.OS === 'ios' ? 15 : 0,
    width: '100%',
    borderBottomWidth: 1,
    borderColor: '#3eadac',
    fontSize: 17,
    padding: 0,
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
