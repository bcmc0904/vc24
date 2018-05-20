/**
 * React native app create for vc 24. Create by Thai
 */
import React, {Component} from 'react';
import {
  TouchableOpacity,
  View,
  WebView,
  Platform,
  StyleSheet,
  Alert,
  AsyncStorage,
  Text,
  AppState,
  Linking
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import FCM, {
  FCMEvent,
  RemoteNotificationResult,
  WillPresentNotificationResult,
  NotificationType
} from "react-native-fcm";

const url = 'http://vanchuyen24.com/';
const urlGetUid = 'http://vanchuyen24.com/getuid.html?act=getid';
const checkUpdateUrl = "http://fcm.drupalplus.org/app/vc24/update.json";

const urlPost = 'http://fcm.drupalplus.org/fcm/apptoken';
const defaultTitle = 'Vận chuyển 24';
const authorization = 'vanchuyen24.com';
const deviceId = DeviceInfo.getUniqueID();
const deviceModel = DeviceInfo.getModel();
const WEBVIEW_REF = 'webview';

export default class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      token: '',
      url: url,
      receive: ''
    }
    this.getMatchUrl = this.getMatchUrl.bind(this);
  }

  checkAppUpdate() {
    let appver = DeviceInfo.getVersion();
    console.log('app version:', appver);

    try {
      fetch(checkUpdateUrl).then(async res => {
        if (res.status == 200) {
          try {
            let res_data = JSON.parse(res._bodyInit);
            if (res_data.ios.version > appver) {
              await Alert.alert(
                'Nâng cấp phiên bản',
                'Đã có bản nâng cấp mới cho điện thoại của bạn',
                [
                  {
                    text: 'Nhắc tôi sau',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel'
                  },
                  {
                    text: 'Cập nhật', onPress: () => {
                      console.log(res_data.ios.storeUrl)
                      Linking.canOpenURL(res_data.ios.storeUrl).then(supported => {
                        supported && Linking.openURL(res_data.ios.storeUrl);
                      }, (err) => console.log(err));
                    }
                  },
                ],
                {cancelable: false}
              )
            }
          } catch (err) {
            console.log(err);
          }
        }
      });
    } catch (err) {
      console.log(err);
    }
  }

  componentDidMount() {
    this.checkAppUpdate();
    AppState.addEventListener('change', this._handleAppStateChange);
    FCM.setBadgeNumber(0);
    FCM.getInitialNotification().then(notif => {
      this.setState({
        initNotif: notif
      });
    });

    try {
      let result = FCM.requestPermissions({
        badge: true,
        sound: true,
        alert: true
      });
    }
    catch (e) {
      // console.error(e);
      Alert.alert(
          defaultTitle,
          'Bạn phải bật thông báo cho Vận Chuyển 24 để có thể nhận các thông báo đơn hàng!',
          [
            {
              text: 'Cancel',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel'
            },
            {text: 'OK', onPress: () => console.log('OK Pressed')},
          ],
          {cancelable: false}
      )
    }

    FCM.getFCMToken().then(token => {
      // console.log("line 82 (getFCMToken)", token);
      this.setState({
        token: token
      });
      this.onChangeToken(token);
    });

    this.notificationListener = FCM.on(FCMEvent.Notification, notif => {
      if (notif.local_notification) {
        return;
      }
      if (notif.opened_from_tray) {
        FCM.setBadgeNumber(0);
        this.refs[WEBVIEW_REF].reload();
        return;
      }

      this.refreshTokenListener = FCM.on(FCMEvent.RefreshToken, token => {
        // console.log("TOKEN (refreshUnsubscribe)", token);
        this.onChangeToken(token);
      });
    })
  }

  componentWillUnmount() {
    this.notificationListener.remove();
    this.refreshTokenListener.remove();
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    if (AppState.currentState = 'active')
      FCM.setBadgeNumber(0);
  }

  onChangeToken(token) {
    //Get stored rid
    AsyncStorage.getItem('receive', (err, result) => {
      if (result) {
        let receive_data = JSON.parse(result);
        this.updateReceive(token, receive_data);
      }
      else {
        let receive_data = {
          rid: 0,
          uid: 0,
          token: this.state.token
        }
        this.updateReceive(token, receive_data);
      }
    });
  }

  updateReceive(token, receive_data) {
    fetch(urlGetUid)
      .then((response) => {
        if (response.status == 200) {
          try {
            let res_data = JSON.parse(response._bodyInit);
            if (res_data) {
              if (res_data.uid) {
                // console.log(res_data.uid);
                if (res_data.uid != receive_data.uid) {
                  if (receive_data.uid != 0) {
                    this.getReiceId(token, receive_data.uid, true);
                  }
                  this.getReiceId(token, res_data.uid);
                }
                else if (receive_data.token != token) {
                  this.getReiceId(token, res_data.uid);
                }
              }
              else {
                if (receive_data.uid != 0) {
                  this.getReiceId(token, receive_data.uid, true);
                }
                else {
                  AsyncStorage.removeItem('receive');
                }
              }
            }
          }
          catch (err) {
            console.log(err);
          }
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  getReiceId(token, uid, remove = false) {
    fetch(urlPost, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authorization,
      },
      body: JSON.stringify({
        uid: uid,
        deviceUniqueId: deviceId,
        deviceModel: deviceModel,
        token: token,
        remove: remove
      })
    })
    .then((response) => {
      // console.log(response);
      if (response.status == 200) {
        try {
          let res_data = JSON.parse(response._bodyInit);
          if (res_data.status == 1) {
            if (remove) {
              AsyncStorage.removeItem('receive');
            }
            else {
              let receive_data = {
                rid: res_data.rid,
                uid: uid,
                token: token
              }
              AsyncStorage.setItem('receive', JSON.stringify(receive_data));
            }
          }
        }
        catch (err) {
          console.log(err);
        }
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  getMatchUrl(curUrl) {
    if (curUrl.indexOf('vc-dat-don.html') > 0 ||
      curUrl.indexOf('vc-quan-huyen.html') > 0 ||
      curUrl.indexOf('oto.html') > 0 ||
      curUrl.indexOf('home.html') > 0 ||
      curUrl == url) {
      return true;
    }
    return false;
  }

  async _onNavigationStateChange(webViewState) {
    if (this.getMatchUrl(webViewState.url)) {
      this.onChangeToken(this.state.token);
    }

    // Open url in default brower
    if (webViewState.url === 'http://vanchuyen24.com/viec-vat.html') {
      // let receive = await this.getStore();
      let viec_vat = webViewState.url;// + '?app=' + receive;
      Linking.canOpenURL(viec_vat).then(supported => {
        supported && Linking.openURL(viec_vat);
        if (webViewState.canGoBack) {
          this.refs[WEBVIEW_REF].goBack();
        }
      }, (err) => console.log(err));
    }
  }

  async getStore() {
    return await AsyncStorage.getItem('receive', (err, result) => {
      if (result) {
        return result;
      } else {
        return {
          rid: 0,
          uid: 0,
          token: this.state.token
        };
      }
    });
  }

  renderError(errorDomain, errorCode, errorDesc) {
    return (
        <View style={styles.error}>
          <TouchableOpacity style={styles.button}>
            <Text style={{color: 'white'}} onPress={this.reload}>Reload</Text>
          </TouchableOpacity>
        </View>
    );
  }

  reload() {
    this.refs[WEBVIEW_REF].reload();
  }

  render() {
    return (
        <View style={styles.container}>
          <WebView
              style={{flex: 1}}
              ref={WEBVIEW_REF}
              automaticallyAdjustContentInsets={true}
              onNavigationStateChange={this._onNavigationStateChange.bind(this)}
              source={{uri: this.state.url}}
              javaScriptEnabled={true}
              renderError={this.renderError}
              startInLoadingState={true}
          />
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: '#eee',
    paddingTop: 19
  },
  error: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  button: {
    backgroundColor: '#FF0000',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 3
  }
});