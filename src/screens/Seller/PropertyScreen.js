// components/dashboard.js
import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Modal,
  Button,
  Platform,
  Dimensions,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import firebase from '../../../database/fireBase';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import {useIsFocused} from '@react-navigation/native';
import Geocoder from 'react-native-geocoding';

const {width, height} = Dimensions.get('window');
const PropertyScreen = props => {
  const isFocused = useIsFocused();

  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [addressList, setAddressList] = useState([]);

  Geocoder.init('AIzaSyBT-kPnfNowPW7n3tdTXhVwgZtLW7cFNeE');

  useEffect(() => {
    database()
      .ref('users/' + userId)
      .once('value')
      .then(snapshot => {
        console.log(snapshot.val());
        if (snapshot.val() !== null) {
          setUserData(snapshot.val());
          setAddressList([snapshot.val().homes]);
        }
      })
      .catch(error => console.log(error, 'user Data error'));
  }, [isFocused]);
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  useEffect(() => {
    database()
      .ref('users/' + userId)
      .on('value', snapshot => {
        console.log('User Property screen: ', snapshot.val());
        if (snapshot.val() !== null) {
          setUserData(snapshot.val());
          setAddressList([snapshot.val().homes]);
        } else {
          console.log('user not register');
        }
      });
    // .catch(error => console.log(error, 'user Data error'));
  }, [userId]);

  //{"lat": 50.4501, "lng": 30.5234}

  const onAuthStateChanged = user => {
    if (user) {
      setUserId(user.uid);
    }
    if (!user) {
      props.navigation.navigate('Login');
    }
  };
  const addHome = () => {
    // if (Object.values(userData.homes || {}).length >= 5 && userData.payment !== 'premium') {
    //   return alert("You're out of limit for this action with this plan –  can be only 5 created property, please upgrade the plan to 'Premium' to get unlimited actions to create the properties")
    // }
    props.navigation.navigate('SellerHome', {addressId: false, goBack: true});
  };
  const onDeleteHome = homeId => {
    Alert.alert('Delete home?', '', [
      {
        text: 'Yes',
        onPress: () => deleteHome(homeId),
      },
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
    ]);
  };
  const deleteHome = homeId => {
    database()
      .ref('AllSellerHomes/' + homeId)
      .remove();
    database()
      .ref('users/' + userId + '/homes/' + homeId)
      .remove()
      .then(() => {
        database()
          .ref('users/' + userId)
          .once('value')
          .then(snapshot => {
            console.log(snapshot.val());
            if (snapshot.val() !== null) {
              setUserData(snapshot.val());
              setAddressList([snapshot.val().homes]);
            }
          })
          .catch(error => console.log(error, 'user Data error'));
      });
  };
  const editHome = (id, home) => {
    console.log(id, 'id');
    props.navigation.navigate('SellerHome', {
      addressId: id,
      userId: userId,
      goBack: true,
      home: home,
    });
  };
  const itemList = addressList
    .map(item =>
      item !== null && item !== undefined ? Object.values(item) : null,
    )
    .filter(item => !!item);
  const keyList = addressList.map(item =>
    item !== null && item !== undefined ? Object.keys(item).flat() : null,
  );
  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Text
          style={{
            fontSize: 27,
            fontWeight: '600',
            marginTop: 15,
            paddingBottom: 10,
          }}>
          My Adress
        </Text>
        <TouchableOpacity style={styles.addHome} onPress={() => addHome()}>
          <Text style={{fontSize: 37}}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {itemList.length <= 0 && (
          <View style={styles.emptyContainer}>
            <Text>There is no property, click + to add some</Text>
          </View>
        )}
        {itemList.flat().map((item, index) => {
          return (
            <TouchableOpacity
              style={styles.propItem}
              key={index}
              onPress={() => editHome(keyList.flat()[index], item)}>
              <TouchableOpacity
                style={styles.deleteHome}
                onPress={() => onDeleteHome(keyList.flat()[index], item)}>
                <Image
                  style={{width: 10, height: 10}}
                  source={require('../../assets/cancel.png')}
                />
              </TouchableOpacity>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text style={{fontSize: 17, fontWeight: '600'}}>Address</Text>
                <Image
                  style={{width: 35, height: 35}}
                  source={require('../../assets/house.jpeg')}
                />
              </View>
              <Text style={{fontSize: 13, fontWeight: '500', marginTop: 15}}>
                {item.address}
              </Text>
              <ZipCodeText
                lat={item.coordinate.lat}
                lng={item.coordinate.lng}
              />
              {item.status && (
                <Text style={{fontSize: 13, fontWeight: '500', marginTop: 15}}>
                  Status: {item.status}
                </Text>
              )}
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{fontSize: 15, fontWeight: '600', marginTop: 15}}>
                    Price:{' '}
                  </Text>
                  <Text
                    style={{fontSize: 13, fontWeight: '400', marginTop: 15}}>
                    {item.price}
                  </Text>
                </View>
              </View>
              <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{fontSize: 15, fontWeight: '600', marginTop: 15}}>
                    Time Frame:{' '}
                  </Text>
                  <Text
                    style={{fontSize: 13, fontWeight: '400', marginTop: 15}}>
                    {item.timeFrame}
                  </Text>
                </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {/*<Modal*/}
      {/*  animationType="slide"*/}
      {/*  transparent={true}*/}
      {/*  visible={modalVisible}*/}
      {/*  onRequestClose={() => {*/}
      {/*    setModalVisible(!modalVisible);*/}
      {/*  }}*/}
      {/*>*/}
      {/*  <TouchableOpacity style={styles.centeredView} onPress={() => setModalVisible(false)}>*/}
      {/*    <View style={styles.modalView}>*/}
      {/*      <Text style={styles.modalText}>Hello World!</Text>*/}
      {/*    </View>*/}
      {/*  </TouchableOpacity>*/}
      {/*</Modal>*/}
    </View>
  );
};

const ZipCodeText = ({lat, lng}) => {
  const [zipCode, setZipCode] = useState('');

  useEffect(() => {
    getZipCode();
  }, [lat, lng]);

  const getZipCode = () => {
    Geocoder.from(lat, lng)
      .then(json => {
        const zipCode =
          json.results[0].address_components[
            json.results[0].address_components.length - 1
          ].long_name;
        console.log('zipCode', zipCode);
        setZipCode(zipCode);
      })
      .catch(error => 'Error while handling zip-code');
  };

  return <Text>{zipCode}</Text>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    paddingTop: Platform.OS == 'ios' ? 50 : 20,
    paddingBottom: 0,
    backgroundColor: '#fff',
  },
  addHome: {},
  propItem: {
    width: width - 60,
    padding: 15,
    paddingTop: 20,
    borderWidth: 2,
    borderColor: '#3eadac',
    marginTop: 20,
  },
  centeredView: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0, 0.7)',
  },
  deleteHome: {
    position: 'absolute',
    left: 5,
    zIndex: 10,
    top: 10,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  emptyContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: height - 270,
  },
});
export default PropertyScreen;
