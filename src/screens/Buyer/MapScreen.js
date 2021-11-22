// components/dashboard.js
import React, {useEffect, useState, useRef} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Button,
  Platform,
  TouchableOpacity,
  Dimensions,
  Image,
  Modal,
  Alert,
  Pressable,
  TextInput,
  ScrollView,
} from 'react-native';
import MapView, {Circle, Marker, Polyline, Callout} from 'react-native-maps';
import firebase from '../../../database/fireBase';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import {useIsFocused} from '@react-navigation/native';
import {getDistance} from 'geolib';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';

const {width, height} = Dimensions.get('window');
const MapScreen = props => {
  const isFocused = useIsFocused();

  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [addressList, setAddressList] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [shadowMode, setShadowMode] = useState(false);
  const [newMarker, setNewMarker] = useState({
    latitude: 50.4501,
    longitude: 30.523,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  });
  const [buyerMarkers, setBuyerMarkers] = useState([]);
  const [interested, setInterested] = useState(false);
  const [alreadyInterested, setAlreadyInterested] = useState(false);
  const [interestedData, setInterestedData] = useState({});
  const [interestedKey, setInterestedKey] = useState(null);
  const [markerList, setMarkerList] = useState([]);
  const [markerKeys, setMarkerKeys] = useState([]);
  const [searchHeight, setSearchHeight] = useState(50);
  const [mapData, setMapData] = useState(null);
  const [mapValue, setMapValue] = useState(null);
  const [searchRegion, setSearchRegion] = useState(null);

  const ref = useRef();

  useEffect(() => {
    const isFocused = ref.current?.isFocused();
    console.log('isFocused', isFocused);
    if (isFocused) {
      setSearchHeight(320);
    } else {
      setSearchHeight(50);
    }
  }, [ref, mapData, mapValue]);

  useEffect(() => {
    database()
      .ref('AllSellerHomes/')
      .once('value')
      .then(snapshot => {
        if (snapshot.val() !== null) {
          setUserData(snapshot.val());
          setAddressList([snapshot.val()]);
        }
      })
      .catch(error => console.log(error, 'user Data error'));
  }, [isFocused]);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  useEffect(() => {
    if (addMode) {
      database()
        .ref('users/' + userId + '/desire_homes/buyerMarkers')
        .once('value')
        .then(snapshot => {
          if (snapshot.val() !== null) {
            setBuyerMarkers(snapshot.val());
          }
        });
    }
  }, [addMode]);

  useEffect(() => {
    database()
      .ref('AllSellerHomes/')
      .once('value')
      .then(snapshot => {
        if (snapshot.val() !== null) {
          setUserData(snapshot.val());
          setAddressList([snapshot.val()]);
        } else {
          console.log('user not register');
        }
      })
      .catch(error => console.log(error, 'user Data error'));
  }, [userId]);
  useEffect(() => {
    database()
      .ref('users/' + userId + '/desire_homes/')
      .update({buyerMarkers})
      .then(data => {
        console.log('added to user', data);
      })
      .catch(error => {
        console.log('error', error);
      });
  }, [buyerMarkers]);

  const onAuthStateChanged = user => {
    if (user) {
      setUserId(user.uid);
    }
    if (!user) {
      props.navigation.navigate('Login');
    }
  };
  const changeMode = () => {
    setAddMode(!addMode);
  };
  const addMarker = e => {
    if (buyerMarkers.length < 5) {
      database()
        .ref('desire_homes/')
        .push(e.nativeEvent.coordinate)
        .then(data => {
          console.log('added to all', data);
        })
        .catch(error => {
          console.log('Storing Error', error);
        });

      setBuyerMarkers([...buyerMarkers, {latlng: e.nativeEvent.coordinate}]);
      setShadowMode(false);
    } else {
      Alert.alert('You are limited to only 5 markers');
    }
  };
  const deleteMarker = coord => {
    const filteredMarkers = buyerMarkers.filter(marker => {
      return marker.latlng.latitude !== coord.latitude;
    });
    database()
      .ref('desire_homes/')
      .once('value')
      .then(snapshot => {
        const homesValue = Object.values(snapshot.val());
        const homesKeys = Object.keys(snapshot.val());
        homesValue.filter((marker, index) => {
          console.log(marker.latitude == coord.latitude);
          if (marker.latitude == coord.latitude) {
            setShadowMode(false);
            database()
              .ref('desire_homes/' + homesKeys[index])
              .remove();
          }
        });
      });
    setBuyerMarkers(filteredMarkers);
  };
  const deleteAlert = coord => {
    if (!shadowMode) {
      return;
    }
    Alert.alert('Remove marker?', '', [
      {
        text: 'Yes',
        onPress: () => deleteMarker(coord),
        style: 'cancel',
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  const onInterested = (marker, index) => {
    if (marker.userId && Object.values(marker.userId).includes(userId)) {
      setAlreadyInterested(true);
    } else {
      setAlreadyInterested(false);
    }

    setInterested(true);
    setInterestedData(marker);
    setInterestedKey(markerKeys.flat()[index]);
  };
  const saveInterested = () => {
    database()
      .ref(`users/${userId}`)
      .once('value')
      .then(snap => {
        console.log(snap.val().todayInterestsCount);
        console.log(
          new Date(snap.val().lastInterestTime || 0).getDate(),
          new Date().getDate(),
        );
        // if (
        //   (snap.val().todayInterestsCount || 0) < 10 ||
        //   new Date(snap.val().lastInterestTime || 0).getDate() !==
        //     new Date().getDate() ||
        //   snap.val().payment === 'premium' ||
        //   snap.val().payment === 'standard' ||
        //   snap.val().payment === undefined
        // ) {
        database()
          .ref('InterestedUsers/' + interestedKey)
          .child('userId')
          .push({
            buyerId: userId,
            sellerId: interestedKey,
          })
          .then(() => {
            setInterested(false);
          });

        database()
          .ref('AllSellerHomes/' + interestedKey)
          .child('userId')
          .push(userId)
          .then(() => {
            setInterested(false);
            database()
              .ref('AllSellerHomes/')
              .once('value')
              .then(snapshot => {
                console.log('Update home data ', snapshot.val());
                if (snapshot.val() !== null) {
                  setUserData(snapshot.val());
                  setAddressList([snapshot.val()]);
                }
              });
            Alert.alert(
              'We received your request, thank you! We will contact you soon',
            );
          });
        database()
          .ref(`users/${userId}/todayInterestsCount`)
          .set(
            new Date(snap.val().lastInterestTime || 0).getDate() ===
              new Date().getDate()
              ? (snap.val().todayInterestsCount || 0) + 1
              : 0,
          );

        database().ref(`users/${userId}/lastInterestTime`).set(Date.now());
        // } else {
        //   alert(
        //     "You're out of limit for this action with this plan – 10 property interest requests per day, please upgrade the plan to 'Premium' to get unlimited actions",
        //   );
        // }
      });
  };

  useEffect(() => {
    if (addressList[0] !== undefined) {
      setMarkerList(
        addressList.map(item =>
          (item !== null) & (item !== undefined) ? Object.values(item) : {},
        ),
      );
      setMarkerKeys(addressList.map(item => Object.keys(item)));
    }
  }, [addressList]);

  return (
    <>
      <GooglePlacesAutocomplete
        placeholder="Enter Location"
        minLength={2}
        autoFocus={true}
        ref={ref}
        returnKeyType={'default'}
        fetchDetails={true}
        textInputProps={{
          onChangeText: data => {
            setMapValue(data);
          },
          onBlur: () => {
            setSearchHeight(50);
          },
        }}
        onFail={error => console.error(error)}
        styles={{
          container: {
            position: 'absolute',
            left: Platform.OS == 'ios' ? '5%' : 20,
            top: Platform.OS == 'ios' ? 60 : 10,
            zIndex: 102,
            width: '90%',
            height: searchHeight,
            backgroundColor: 'white',
            borderColor: 'gray',
            borderWidth: 1,
            borderRadius: 15,
            paddingHorizontal: 20,
          },
          listView: {
            position: 'absolute',
            zIndex: 103,
            elevation: 3,
            top: 40,
            paddingHorizontal: 15,
          },
        }}
        onPress={(data, details) => {
          console.log(details.geometry.location);
          setMapData(data);
          setSearchRegion({
            latitude: details.geometry.location.lat,
            longitude: details.geometry.location.lng,
            latitudeDelta: 0.04,
            longitudeDelta: 0.05,
          });
        }}
        query={{
          key: 'AIzaSyBT-kPnfNowPW7n3tdTXhVwgZtLW7cFNeE',
          language: 'en',
        }}
      />
      <View style={styles.container} keyboardShouldPersistTaps={'always'}>
        <TouchableOpacity
          style={addMode ? styles.addAddress : styles.addAddressMOde}
          onPress={() => changeMode()}>
          {addMode ? (
            <Image
              style={{width: 30, height: 30}}
              source={require('../../assets/house-empt.png')}
            />
          ) : (
            <Image
              style={{width: 30, height: 30}}
              source={require('../../assets/house-Icon.png')}
            />
          )}
        </TouchableOpacity>

        {addMode && (
          <TouchableOpacity
            style={styles.plusIcon}
            onPress={() => setShadowMode(!shadowMode)}>
            {shadowMode ? (
              <Text
                style={{
                  fontSize: 30,
                  fontWeight: 'bold',
                  margin: 0,
                  lineHeight: 38,
                  color: '#3eadac',
                }}>
                ✕
              </Text>
            ) : (
              <Text
                style={{
                  fontSize: 40,
                  margin: 0,
                  lineHeight: 45,
                  color: '#3eadac',
                }}>
                ±
              </Text>
            )}
          </TouchableOpacity>
        )}

        {addMode ? (
          <MapView
            style={{flex: 1, opacity: shadowMode ? 0.7 : 1}}
            region={searchRegion || newMarker}
            onPress={e => (shadowMode ? addMarker(e) : e.stopPropagation())}>
            {buyerMarkers.map((marker, i) => (
              <Marker
                key={i}
                coordinate={marker.latlng}
                title={marker.address}
                onPress={e => {
                  e.stopPropagation();
                  deleteAlert(marker.latlng);
                }}>
                <Image
                  source={require('../../assets/seller-marker.png')}
                  style={{width: 30, height: 40}}
                  resizeMode="contain"
                />
              </Marker>
            ))}
          </MapView>
        ) : (
          <MapView
            style={{flex: 1}}
            onPress={event => {
              const coordinates = event.nativeEvent.coordinate;
              markerList.flat().map((zone, index) => {
                if (zone.coordinate) {
                  const distance = getDistance(
                    {
                      latitude: coordinates.latitude,
                      longitude: coordinates.longitude,
                    },
                    {
                      latitude: zone.coordinate.lat,
                      longitude: zone.coordinate.lng,
                    },
                  );
                  if (distance <= 5000) {
                    onInterested(zone, index);
                  }
                }
              });
            }}
            region={searchRegion}
            initialRegion={{
              latitude: 50.4501,
              longitude: 30.523,
              latitudeDelta: 0.5,
              longitudeDelta: 0.5,
            }}>
            {markerList.flat().map((marker, index) => {
              let alredyInterested;
              if (marker.userId) {
                alredyInterested = Object.values(marker.userId).includes(
                  userId,
                );
              }

              if (!marker.coordinate) {
                return null;
              }

              return (
                <Circle
                  key={index}
                  onPress={e => onInterested(marker, index)}
                  radius={5000}
                  fillColor={
                    alredyInterested
                      ? 'rgba(123, 239, 178, .5)'
                      : 'rgba(62, 173, 172, 0.5)'
                  }
                  strokeColor={'rgba(62, 173, 172, 1)'}
                  center={{
                    latitude: marker.coordinate.lat,
                    longitude: marker.coordinate.lng,
                  }}
                />
              );
            })}
          </MapView>
        )}

        <Modal transparent={true} animationType={'fade'} visible={interested}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <TouchableOpacity
                style={{position: 'absolute', right: 15, top: 15}}
                onPress={() => setInterested(false)}>
                <Image
                  style={{width: 15, height: 15}}
                  source={require('../../assets/cancel.png')}
                />
              </TouchableOpacity>
              <Text style={{fontSize: 20, fontWeight: '600'}}>
                About this home
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  width: '80%',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                  <Text
                    style={{fontSize: 18, marginTop: 15, fontWeight: '600'}}>
                    Price
                  </Text>
                  <Text style={styles.modalText}>{interestedData.price} $</Text>
                </View>
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                  <Text
                    style={{fontSize: 18, marginTop: 15, fontWeight: '600'}}>
                    Time Frame
                  </Text>
                  <Text style={styles.modalText}>
                    {interestedData.timeFrame} D
                  </Text>
                </View>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 20,
                }}>
                {alreadyInterested ? (
                  <View
                    style={{
                      width: '100%',
                      borderTopWidth: 1,
                      padding: 10,
                      alignItems: 'center',
                      borderColor: '#3eadac',
                    }}>
                    <Text
                      style={{
                        fontSize: 15,
                        textTransform: 'uppercase',
                        fontWeight: '600',
                        color: '#3eadac',
                      }}>
                      You’re already interested in it
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={{
                      width: '100%',
                      borderTopWidth: 1,
                      padding: 10,
                      alignItems: 'center',
                      borderColor: '#3eadac',
                    }}
                    onPress={() => saveInterested()}>
                    <Text
                      style={{
                        fontSize: 15,
                        textTransform: 'uppercase',
                        fontWeight: '600',
                        color: '#3eadac',
                      }}>
                      I’m interested in it
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  buttonWrap: {
    top: 100,
  },
  searchInput: {
    position: 'absolute',
    left: Platform.OS == 'ios' ? 30 : 20,
    top: Platform.OS == 'ios' ? 20 : 10,
    zIndex: 2,
    width: '90%',
    height: 40,
    backgroundColor: 'white',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 20,
  },
  logout: {
    backgroundColor: '#3eadac',
    padding: 10,
    marginTop: 50,
  },
  addAddress: {
    position: 'absolute',
    right: Platform.OS == 'ios' ? 30 : 20,
    top: Platform.OS == 'ios' ? 120 : 70,
    zIndex: 1,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3eadac',
    borderRadius: 100,
  },
  addAddressMOde: {
    position: 'absolute',
    right: Platform.OS == 'ios' ? 30 : 20,
    top: Platform.OS == 'ios' ? 120 : 70,
    zIndex: 1,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',

    borderRadius: 100,
  },
  plusIcon: {
    position: 'absolute',
    right: Platform.OS == 'ios' ? 30 : 20,
    top: 180,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    backgroundColor: '#fff',
    borderRadius: 100,
  },
  textLogout: {
    color: '#fff',
    fontSize: 15,
  },
  container: {
    flex: 1,
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    display: 'flex',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3eadac',
  },
  textStyle: {
    width: '100%',
    textAlign: 'center',
    color: '#000',
    fontSize: 15,
  },
  centeredView: {
    flex: 1,
    zIndex: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalView: {
    width: width - 100,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingBottom: 0,
    paddingTop: 20,
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
  modalText: {
    fontSize: 15,
    marginTop: 7,
  },
});
export default MapScreen;
