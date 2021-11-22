// components/dashboard.js
import React, {useEffect, useState, useRef} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Button,
  Platform,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import firebase from '../../../database/fireBase';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import {useIsFocused} from '@react-navigation/native';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';

const {width, height} = Dimensions.get('window');
const MapScreen = props => {
  const isFocused = useIsFocused();

  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [addressList, setAddressList] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [newMarker, setNewMarker] = useState({
    latitude: 50.4501,
    longitude: 30.523,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  });
  const [buyerMarkers, setBuyerMarkers] = useState([]);
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
      .ref('users/' + userId)
      .once('value')
      .then(snapshot => {
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
      .once('value')
      .then(snapshot => {
        //console.log('User Map screen: ', snapshot.val());
        if (snapshot.val() !== null) {
          setUserData(snapshot.val());
          setAddressList([snapshot.val().homes]);
        } else {
          //  console.log( 'user not register')
        }
      })
      .catch(error => console.log(error, 'user Data error'));
  }, [userId]);

  useEffect(() => {
    if (addMode) {
      database()
        .ref('desire_homes/')
        .once('value')
        .then(snapshot => {
          if (snapshot.val() !== null) {
            setBuyerMarkers(Object.values(snapshot.val()));
          }
        });
    }
  }, [addMode]);

  const onAuthStateChanged = user => {
    if (user) {
      setUserId(user.uid);
    }
    if (!user) {
      props.navigation.navigate('Login');
    }
  };
  const changeMode = () => {
    setAddMode(addMode ? false : true);
  };
  let markerList = [];

  if (addressList[0] !== undefined) {
    markerList = addressList.map(item => Object.values(item));
  }

  return (
    <View style={styles.container}>
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

      {addMode ? (
        <MapView style={{flex: 1}} region={searchRegion || newMarker}>
          {buyerMarkers.map((marker, i) => (
            <Marker
              key={i}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              title={marker.address}
              onPress={e => {
                e.stopPropagation();
              }}>
              <Image
                source={require('../../assets/seller-marker.png')}
                style={{width: 20, height: 30}}
                resizeMode="contain"
              />
            </Marker>
          ))}
        </MapView>
      ) : (
        <MapView
          style={{flex: 1}}
          region={searchRegion}
          initialRegion={{
            latitude: 50.4501,
            longitude: 30.523,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          }}>
          {markerList.flat().map((marker, index) => {
            if (!marker.coordinate) {
              return null;
            }
            return (
              <Marker
                key={index}
                style={{height: 40, width: 30}}
                // image={{uri: 'map_pin'}}
                coordinate={{
                  latitude: marker.coordinate.lat || 40.73061,
                  longitude: marker.coordinate.lng || -73.935242,
                }}
                title={marker.address}>
                <Image
                  source={require('../../assets/buyer-marker.png')}
                  style={{width: 20, height: 30, resizeMode: 'cover'}}
                />
              </Marker>
            );
          })}
        </MapView>
      )}
    </View>
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
  textLogout: {
    color: '#fff',
    fontSize: 15,
  },
  container: {
    flex: 1,
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
});
export default MapScreen;
