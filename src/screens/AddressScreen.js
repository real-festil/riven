import React from 'react';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import {Platform, StyleSheet, Text, View, Button, Image} from "react-native";
import {TouchableOpacity} from "react-native-gesture-handler";

const AddressScreen = (props) => {
  return (

    <View style={styles.container}>
      <TouchableOpacity
        style={{backgroundColor: 'transparent',marginBottom: 25, }}
        onPress={() => {
          props.navigation.goBack();
        }}
      >
        <Image source={require('../assets/back.png')} width={35} height={20} style={{width: 35, height: 20}} />
      </TouchableOpacity>
      <Text style={styles.title}>Select Address</Text>
      <GooglePlacesAutocomplete
        placeholder='Enter Location'
        minLength={2}
        autoFocus={true}
        returnKeyType={'default'}
        fetchDetails={true}
        onFail={error => console.error(error)}
        styles={{
          textInputContainer: {
            width: '100%',
            borderRadius: 15,
          },
          textInput: {
            padding: 13,
            borderWidth: 2,
            borderColor: '#3eadac',
            fontSize: 17,
          },
          predefinedPlacesDescription: {
            color: '#1faadb',
          },
        }}
        onPress={(data, details = null) => {
          console.log(data);
          props.route.params.setAddress(data.description)
          props.route.params.setCoordinate(details.geometry.location)
          props.route.params.setPlaceId(data.place_id)

          props.navigation.goBack()
        }}
        query={{
          key: 'AIzaSyBT-kPnfNowPW7n3tdTXhVwgZtLW7cFNeE',
          language: 'en',
        }}
      />
    </View>
  );
};

export default AddressScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    paddingTop: Platform.OS === 'ios' ? 80 : 30,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    width: '100%',
    fontSize: 27,
    paddingBottom: 30,
    textAlign: 'center',
    color: '#000',
  },
})
