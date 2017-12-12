/**
 * React native app create for vc 24. Create by Thai
 */
import React, { Component } from 'react';
import {
  TouchableOpacity,
  View,
  WebView,
  Platform,
  StyleSheet,
  Alert,
  AsyncStorage,
  Text,
} from 'react-native';
// import DeviceInfo from 'react-native-device-info';
// import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType} from "react-native-fcm";

// const url = 'http://vanchuyen24.com/';
const url = 'http://drupalplus.org/';
const urlGetUid = 'http://vanchuyen24.com/getuid.html?act=getid';
const uriLogedIn1 = 'http://vanchuyen24.com/vc-dat-don.html';
const uriLogedIn2 = 'http://vanchuyen24.com/vc-quan-huyen.html';
const uriLogedIn3 = "http://vanchuyen24.com/vi/vc-quan-huyen.html";
const uriLogedIn4 = "http://vanchuyen24.com/vi/home.html";

const urlPost = 'http://fcm.drupalplus.org/fcm/apptoken';
const defaultTitle = 'Vận chuyển 24';
const authorization = 'vanchuyen24.com';
// const deviceId = DeviceInfo.getUniqueID();
const deviceId = "123";
// const deviceModel = DeviceInfo.getModel();
const deviceModel = "ipone7";
const WEBVIEW_REF = 'webview';

export default class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      token: '',
      url: url,
      receive: ''
    }
  }

  componentDidMount(){
    // console.log(DeviceInfo);
    // console.log(DeviceInfo.getUniqueID());
    /*FCM.getInitialNotification().then(notif => {
      this.setState({
        initNotif: notif
      })
    });

    try{
      let result = FCM.requestPermissions({badge: false, sound: true, alert: true});
    } catch(e){
      console.error(e);
      Alert.alert(
          defaultTitle,
          'Bạn phải bật thông báo cho Vận Chuyển 24 để có thể nhận các thông báo đơn hàng!',
          [
            {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
            {text: 'OK', onPress: () => console.log('OK Pressed')},
          ],
          { cancelable: false }
      )
    }

    FCM.getFCMToken().then(token => {
      this.setState({
        token: token
      });
      // this.onChangeToken(token);
    });

    if(Platform.OS === 'ios'){
      FCM.getAPNSToken().then(token => {
        this.setState({
          token: token
        });
        this.onChangeToken(token);
      });
    }

    this.notificationListener = FCM.on(FCMEvent.Notification, notif => {
      console.log("Notification", notif);
      if(notif.local_notification){
        return;
      }
      if(notif.opened_from_tray){
        return;
      }

      if(Platform.OS ==='ios'){
        //optional
        //iOS requires developers to call completionHandler to end notification process. If you do not call it your background remote notifications could be throttled, to read more about it see the above documentation link.
        //This library handles it for you automatically with default behavior (for remote notification, finish with NoData; for WillPresent, finish depend on "show_in_foreground"). However if you want to return different result, follow the following code to override
        //notif._notificationType is available for iOS platfrom
        switch(notif._notificationType){
          case NotificationType.Remote:
            notif.finish(RemoteNotificationResult.NewData) //other types available: RemoteNotificationResult.NewData, RemoteNotificationResult.ResultFailed
            break;
          case NotificationType.NotificationResponse:
            notif.finish();
            break;
          case NotificationType.WillPresent:
            notif.finish(WillPresentNotificationResult.All) //other types available: WillPresentNotificationResult.None
            break;
        }
      }

      this.refreshTokenListener = FCM.on(FCMEvent.RefreshToken, token => {
        console.log("TOKEN (refreshUnsubscribe)", token);
        this.onChangeToken(token);
      });

      // direct channel related methods are ios only
      // directly channel is truned off in iOS by default, this method enables it
      FCM.enableDirectChannel();
      this.channelConnectionListener = FCM.on(FCMEvent.DirectChannelConnectionChanged, (data) => {
        console.log('direct channel connected' + data);
      });
      setTimeout(function() {
        FCM.isDirectChannelEstablished().then(d => console.log(d));
      }, 1000);

      //Push msg to screen
      FCM.scheduleLocalNotification({
        id: notif.from || 'testnotif',
        fire_date: new Date().getTime()+3000,
        vibrate: 500,
        title: notif.fcm.title || "Vận chuyển 24",
        body: notif.fcm.body,
        sound: notif.fcm.sound || "default",
        priority: "high",
        show_in_foreground: true,
        icon: notif.fcm.icon || null,
      });
    })*/
  }

  componentWillUnmount() {
    /*this.notificationListener.remove();
    this.refreshTokenListener.remove();*/
  }

  onChangeToken(token) { console.log("url change")
    //Get stored rid
    /*AsyncStorage.getItem('receive', (err, result) => {
      if (result) {
        let receive_data = JSON.parse(result);
        this.updateReceive(token, receive_data);
      } else {
        let receive_data = {
          rid: 0,
          uid: 0,
          token: this.state.token
        }
        this.updateReceive(token, receive_data);
        /!*AsyncStorage.setItem('receive', JSON.stringify(receive_data), () => {
          AsyncStorage.getItem('receive', (err, result) => {
            let receive_data = JSON.parse(result);

          });
        });*!/
      }
    });*/
  }

  updateReceive(token, receive_data) {
    fetch(urlGetUid)
        .then((response) => { console.log(response); console.log(receive_data);
          if (response.status == 200) {
            try {
              let res_data = JSON.parse(response._bodyInit);
              if (res_data) {
                if (res_data.uid) { console.log(res_data.uid);
                  if (res_data.uid != receive_data.uid) {
                    if (receive_data.uid != 0) this.getReiceId(token, receive_data.uid, true);
                    this.getReiceId(token, res_data.uid);
                  }
                  else if (receive_data.token != token) {
                    this.getReiceId(token, res_data.uid);
                  }
                } else {
                  if (receive_data.uid != 0) this.getReiceId(token, receive_data.uid, true);
                  else AsyncStorage.removeItem('receive');
                }
              }
            } catch (err) {
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
        .then((response) => { console.log(response);
          if (response.status == 200) {
            try {
              let res_data = JSON.parse(response._bodyInit);
              if (res_data.status == 1) {
                if (remove) {
                  AsyncStorage.removeItem('receive');
                } else {
                  let receive_data = {
                    rid: res_data.rid,
                    uid: uid,
                    token: token
                  }
                  AsyncStorage.setItem('receive', JSON.stringify(receive_data));
                }
              }
            } catch (err) {
              console.log(err);
            }
          }
        })
        .catch((error) => {
          console.error(error);
        });
  }

  _onNavigationStateChange(webViewState){ console.log(webViewState.url);
    if (webViewState.url == uriLogedIn1 || webViewState.url == uriLogedIn2 || webViewState.url == uriLogedIn3 || webViewState.url == uriLogedIn4 || webViewState.url == url) {
      this.onChangeToken(this.state.token);
    }
  }

  renderError(errorDomain, errorCode, errorDesc) {
    return (
        <View style={styles.error}>
          <TouchableOpacity style={styles.button}>
            <Text style={{color:'white'}} onPress={this.reload}>Reload</Text>
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
    backgroundColor: '#F5FCFF',
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