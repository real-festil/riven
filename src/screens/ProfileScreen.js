// components/dashboard.js

import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Button,
  Image,
  Platform,
  Dimensions,
  ActivityIndicator,
  BackHandler,
  ScrollView,
} from 'react-native';

import {TouchableOpacity} from 'react-native-gesture-handler';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width, height} = Dimensions.get('window');

const paymentTypes = {
  standard: 'Standard one time fee',
  premium: 'Premium one time fee',
};

export default class ProfileScreen extends Component {
  constructor() {
    super();
    this.state = {
      value: 0,
      user: null,
      profileData: null,
      userImage: null,
      withoutPhoto: false,
    };
    this.onAuthStateChanged = this.onAuthStateChanged.bind(this);
  }

  signOut = () => {
    this.setState({
      profileData: null,
      user: null,
      uId: null,
    });
    auth().signOut();
    this.props.navigation.navigate('AuthStack');
  };
  componentDidMount() {
    //this.signOut()
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
    const subscriber = auth().onAuthStateChanged(this.onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
  }

  componentWillReceiveProps(newProps) {
    console.log(newProps.route.params.update, 'upfdfd');
    if (newProps.route.params.update) {
      this.onRefresh(this.state.uId);
    }
  }

  onBackPress = () => {
    if (this.state.profileData) {
      return true;
    }
  };

  onEdit = profile => {
    if (this.state.profileData && this.state.profileData.userType == 'Buyer') {
      if (profile) {
        console.log('tut', this.state.profileData);
        this.props.navigation.navigate('BuyerRegister', {
          profileData: this.state.profileData,
        });
      } else {
        this.props.navigation.navigate('BuyerHome', {
          profileData: this.state.profileData.homeParam,
        });
      }
    } else {
      console.log(this.state.uId);
      this.props.navigation.navigate('SellerRegister', {
        profileData: this.state.profileData,
        onRefresh: this.onRefresh,
        uId: this.state.uId,
      });
    }
  };

  onUpgrade() {
    this.props.navigation.navigate('PaymentScreen', {context: 'upgrade'});
  }

  onRefresh(id) {
    database()
      .ref('users/' + id)
      .once('value')
      .then(snapshot => {
        console.log('User data: ', snapshot.val());
        if (snapshot.val() !== null) {
          console.log('tut');
          this.setState({
            profileData: snapshot.val(),
          });
        }
      })
      .catch(error => console.log(error, 'user Data error'));
  }
  onAuthStateChanged(user) {
    if (user) {
      this.setState({
        user: user,
      });

      // unsubscribe before subscribing
      if (this.db_subscriber) {
        this.db_subscriber();
      }

      this.db_subscriber = database()
        .ref('users/' + user.uid)
        .on('value', snapshot => {
          if (!snapshot) {
            return;
          }
          console.log('User data: ', snapshot.val());
          if (snapshot.val() !== null) {
            this.setState({
              profileData: snapshot.val(),
              uId: user.uid,
            });
          }
        });
    }
    if (!user) {
      this.props.navigation.navigate('AuthStack');
    }
  }

  renderHomeParam() {
    let homeValues = [];
    if (this.state.profileData && this.state.profileData.homeParam) {
      const homeParam = [this.state.profileData.homeParam];
      console.log(' this.state.profileData.homeParam', homeParam);
      homeValues = homeParam
        .filter(item => !!item)
        .map((item, index) => {
          return (
            <View style={{flexShrink: 1}}>
              {item.bathrooms && item.bathrooms[0] && item.bathrooms[1] ? (
                <View
                  style={[styles.testWrapper, {merginTop: 0, paddingTop: 0}]}>
                  <Text style={[styles.subTitle]}>Bathrooms</Text>
                  <View style={{flexDirection: 'row'}} />
                </View>
              ) : null}
              {item.bedrooms && item.bedrooms[0] && item.bedrooms[1] ? (
                <View
                  style={[styles.testWrapper, {merginTop: 0, paddingTop: 0}]}>
                  <Text style={[styles.subTitle, {}]}>Bedrooms</Text>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={[styles.textStyle, {width: '50%'}]}>
                      MIn: {item.bedrooms[0]}
                    </Text>
                    <Text
                      style={[
                        styles.textStyle,
                        {width: '50%', textAlign: 'right'},
                      ]}>
                      Max: {item.bedrooms[1]}
                    </Text>
                  </View>
                </View>
              ) : null}
              {item.homePrice && item.homePrice[0] && item.homePrice[1] ? (
                <View
                  style={[styles.testWrapper, {merginTop: 0, paddingTop: 0}]}>
                  <Text style={[styles.subTitle, {}]}>Home Price</Text>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={[styles.textStyle, {width: '50%'}]}>
                      MIn: {item.homePrice[0]} $
                    </Text>
                    <Text
                      style={[
                        styles.textStyle,
                        {width: '50%', textAlign: 'right'},
                      ]}>
                      Max: {item.homePrice[1]} $
                    </Text>
                  </View>
                </View>
              ) : null}
              {item.homeSize && item.homeSize[0] && item.homeSize[1] ? (
                <View
                  style={[styles.testWrapper, {merginTop: 0, paddingTop: 0}]}>
                  <Text style={[styles.subTitle, {}]}>Home Size</Text>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={[styles.textStyle, {width: '50%'}]}>
                      MIn: {item.homeSize[0]} sq.ft
                    </Text>
                    <Text
                      style={[
                        styles.textStyle,
                        {width: '50%', textAlign: 'right'},
                      ]}>
                      Max: {item.homeSize[1]} sq.ft
                    </Text>
                  </View>
                </View>
              ) : null}
              {item.neighborhood ? (
                <View
                  style={[styles.testWrapper, {merginTop: 0, paddingTop: 0}]}>
                  <Text style={[styles.subTitle, {}]}>Address</Text>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={[styles.textStyle, {width: '50%'}]}>
                      Neighborhood: {item.neighborhood}
                    </Text>
                    <Text
                      style={[
                        styles.textStyle,
                        {width: '50%', textAlign: 'right'},
                      ]}>
                      Town: {item.town}
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>
          );
        });

      if (homeValues.length <= 0) {
        return <Text>You have no home data</Text>;
      }
    }
    return homeValues;
  }
  render() {
    // if (this.state.isLoading) {
    //   return (
    //       <View style={styles.preloader}>
    //         <ActivityIndicator size="large" color="#9E9E9E" />
    //       </View>
    //   )
    // }

    return (
      <View style={styles.container}>
        <ScrollView
          style={{width: width - 40}}
          showsVerticalScrollIndicator={false}>
          {/*{this.state.profileData && this.state.profileData.userPhoto && this.state.profileData.userPhoto !== 'none' || this.state.profileData && this.state.profileData.photoURL   ?*/}
          {/*  <View style={styles.userImage}>*/}
          {/*    <Image source={{uri: this.state.profileData.userPhoto  ? this.state.profileData.userPhoto   : this.state.profileData.photoURL}} width={100} height={100} style={{borderRadius: 100,width: 100, height: 100}}/>*/}
          {/*  </View>*/}

          {/*  : <TouchableOpacity style={styles.userImage} onPress={() => selectPhoto()}>*/}
          {/*    <Image style={{width: 100,height:100, resizeMode: 'contain'}} source={require('../assets/profile_photo.png')} />*/}
          {/*  </TouchableOpacity>*/}
          {/*}*/}

          <Text style={styles.title}>
            {this.state.profileData
              ? this.state.profileData.firstName +
                ' ' +
                this.state.profileData.lastName
              : null}
          </Text>
          <Text style={[styles.textStyle, {textAlign: 'center'}]}>
            {this.state.profileData ? this.state.profileData.userType : ''}
          </Text>

          <View style={styles.testWrapper}>
            <Text style={styles.subTitle}>Email</Text>
            <Text style={styles.textStyle}>
              {this.state.profileData ? this.state.profileData.email : ''}
            </Text>
          </View>
          <View style={styles.testWrapper}>
            <Text style={styles.subTitle}>Mobile Number</Text>
            <Text style={styles.textStyle}>
              {this.state.profileData
                ? this.state.profileData.mobileNumber
                : ''}
            </Text>
          </View>
          {/* <View style={styles.testWrapper}>
            <Text style={styles.subTitle}>Account type</Text>
            <Text style={styles.textStyle}>{this.state.profileData ? paymentTypes[this.state.profileData.payment] || 'No payment' : ''}</Text>
          </View> */}
          {this.state.profileData &&
            this.state.profileData.userType == 'Buyer' && (
              <View style={styles.testWrapper}>
                <Text style={styles.subTitle}>Financing</Text>
                <Text style={styles.textStyle}>
                  {this.state.profileData
                    ? this.state.profileData.financing
                    : ''}
                </Text>
              </View>
            )}
          <TouchableOpacity
            style={[
              styles.logout,
              {backgroundColor: '#3eadac', padding: 10, borderColor: '#3eadac'},
            ]}
            onPress={() => this.onEdit(true)}>
            <Text style={[styles.textLogout, {color: '#fff'}]}>
              Edit Profile Data
            </Text>
          </TouchableOpacity>
          {/* {this.state.profileData &&
            this.state.profileData.payment === 'standard' && (
              <TouchableOpacity
                style={[
                  styles.logout,
                  {
                    backgroundColor: '#3eadac',
                    padding: 10,
                    borderColor: '#3eadac',
                  },
                ]}
                onPress={() => this.onUpgrade()}>
                <Text style={[styles.textLogout, {color: '#fff'}]}>
                  Upgrade to premium
                </Text>
              </TouchableOpacity>
            )} */}
          {this.state.profileData &&
            this.state.profileData.userType == 'Buyer' && (
              <View style={[styles.testWrapper]}>
                <Text
                  style={[
                    styles.subTitle,
                    {textAlign: 'center', fontSize: 22, width: '100%'},
                  ]}>
                  About Home
                </Text>

                {this.renderHomeParam()}

                <TouchableOpacity
                  style={[
                    styles.logout,
                    {
                      backgroundColor: '#3eadac',
                      padding: 10,
                      borderColor: '#3eadac',
                    },
                  ]}
                  onPress={() => this.onEdit()}>
                  <Text style={[styles.textLogout, {color: '#fff'}]}>
                    Edit Home Data
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          <TouchableOpacity
            style={styles.logout}
            onPress={() => this.signOut()}>
            <Text style={styles.textLogout}>Logout</Text>
          </TouchableOpacity>
          <Text>Version: 1.0.14 (build 1)</Text>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    paddingTop: Platform.OS === 'ios' ? 100 : 50,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 30,
    backgroundColor: '#fff',
  },
  subTitle: {
    fontWeight: '600',
    fontSize: 18,
  },
  buttonWrap: {
    top: 100,
  },
  userImage: {
    marginBottom: 20,
  },
  logout: {
    width: width - 60,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginTop: 20,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
    marginBottom: 10,
  },

  textLogout: {
    color: '#000',
    fontSize: 17,
  },

  title: {
    width: '100%',
    fontSize: 30,
    marginBottom: 0,
    textAlign: 'center',
    color: '#000',
  },

  submit: {
    marginTop: 30,
    width: width - 70,
    display: 'flex',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#21191A',
    borderRadius: 25,
  },
  testWrapper: {
    width: width - 60,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    padding: 10,
    paddingLeft: 0,
    borderColor: '#3eadac',
  },
  textStyle: {
    width: '100%',
    color: '#000',
    fontSize: 15,
    marginTop: 10,
  },
  preloader: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
});
