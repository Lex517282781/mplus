;(function () {
  var mplusConfig = {
    hint: true // plus服务操作回调提示是否开启 默认开启
  }

  function setConfig (config) {
    if (Object.prototype.toString.call(config) !== '[object Object]') {
      alert('请配置对象参数')
    }

    for (var k in config) {
      if (config.hasOwnProperty(k)) {
        mplusConfig[k] = config[k]
      }
    }
  }

  function initfn (config) {
    console.log('plus应用尚未初始化')
    config = config || {}
    if (!('h5' in config)) {
      alert('请配置h5参数')
      return
    }
    var success = config.h5.success
    success && success()
  }

  var shareServices = {} // 分享服务
  var oauthServices = {} // 签权服务
  var payServices = {} // 支付服务

  var WXSceneSessionShare = initfn // 微信好友分享
  var WXSceneTimelineShare = initfn // 微信朋友圈分享
  var MiniProgramShare = initfn // 微信小程序分享
  var wxLogin = initfn // 微信登录
  var wxLogout = initfn // 微信注销登录
  var getCurrentPosition = function (config) {
    // 获取定位
    config = config || {}
    var success = config.h5.success
    var error = config.h5.error
    var options = config.h5.options
    window.navigator.geolocation.getCurrentPosition(success, error, options)
  }
  var createBarcode = initfn // 创建扫码
  var closeBarcode = initfn // 关闭扫码
  var chooseImgToScan = initfn // 选择图片扫码
  var wxPay = initfn // 选择图片扫码

  function _html5PlusEnv (callback) {
    if (!navigator.userAgent.match(/Html5Plus/i)) {
      // 非5+引擎环境，直接return;
      return
    }

    callback && callback()
  }

  _html5PlusEnv(function () {
    function _toast (msg) {
      if (mplusConfig.hint) {
        window.plus.nativeUI.toast(msg)
      } else {
        console.log(msg)
      }
    }

    function _alert (msg) {
      if (mplusConfig.hint) {
        window.plus.nativeUI.alert(msg)
      } else {
        console.log(msg)
      }
    }

    // plusReady
    var _plusReady = function (callback) {
      if (window.plus) {
        callback && callback(window.plus)
      } else {
        document.addEventListener('plusready', function () {
          callback && callback(window.plus)
        })
      }
    }

    // 获取服务
    var initServices = function () {
      // 获取分享服务
      window.plus.share.getServices(
        function (services) {
          for (var i = 0, len = services.length; i < len; i++) {
            shareServices[services[i].id] = services[i]
          }
        },
        function (e) {
          console.log('获取分享服务列表失败：' + e.message + ' - ' + e.code)
        }
      )

      // 获取鉴权服务
      window.plus.oauth.getServices(
        function (services) {
          for (var i = 0, len = services.length; i < len; i++) {
            oauthServices[services[i].id] = services[i]
          }
        },
        function (e) {
          console.log('获取登录授权服务列表失败：' + e.message + ' - ' + e.code)
        }
      )

      // 获取支付服务
      window.plus.payment.getChannels(
        function (services) {
          for (var i = 0, len = services.length; i < len; i++) {
            payServices[services[i].id] = services[i]
          }
        },
        function (e) {
          console.log('获取支付通道失败：' + e.message + ' - ' + e.code)
        }
      )
    }

    // 判断微信是否存在
    var isWechatInstalled = function () {
      return (
        window.plus.runtime.isApplicationExist &&
        window.plus.runtime.isApplicationExist({
          pname: 'com.tencent.mm',
          action: 'weixin://'
        })
      )
    }

    // 分享验证
    function share (id, msg, success, error) {
      var service = shareServices[id]
      if (!service) {
        error && error()
        return
      }
      var _share = function () {
        service.send(
          msg,
          function () {
            _toast('分享到"' + service.description + '"成功！')
            success && success()
          },
          function (e) {
            _toast('分享到"' + service.description + '"失败！')
            error && error()
          }
        )
      }
      if (service.authenticated) {
        _share()
      } else {
        service.authorize(
          function () {
            _share()
          },
          function (e) {
            console.log('认证授权失败：' + e.message)
            error && error()
          }
        )
      }
    }

    // 分享
    function openShare (type, msg, success, error) {
      if (shareServices.weixin && isWechatInstalled() && !/360\sAphone/.test(navigator.userAgent)) {
        switch (type) {
          case 'WXSceneSession': // 分享到微信好友
            msg.extra = {
              scene: 'WXSceneSession'
            }
            share('weixin', msg, success, error)
            break
          case 'WXSceneTimeline': // 分享到微信朋友圈
            msg.title = msg.content
            msg.extra = {
              scene: 'WXSceneTimeline'
            }
            share('weixin', msg, success, error)
            break
          case 'miniProgram': // 分享到微小程序
            msg.title = msg.content
            msg.extra = {
              scene: 'miniProgram'
            }
            share('weixin', msg, success, error)
            break
        }
      } else {
        _toast('请先安装微信')
      }
    }

    // // 授权验证
    // function auth(id, callback) {
    //   var service = oauthServices[id];
    //   if (!service) {
    //     callback && callback(false);
    //     return;
    //   }
    //   if (service.authResult) {
    //     _alert('已经登录认证!');
    //     return;
    //   }

    //   if (service.authenticated) {
    //     _authLogin(id, callback);
    //   } else {
    //     service.authorize(
    //       function() {
    //         _authLogin(id, callback);
    //       },
    //       function(e) {
    //         console.log('认证授权失败：' + e.message);
    //         callback && callback(false);
    //       }
    //     );
    //   }
    // }

    function _authLogin (id, success, error) {
      var service = oauthServices[id]
      if (!service) {
        error && error()
        return
      }
      if (!service.authResult) {
        service.login(
          function () {
            _alert('登录认证成功!')
            _authUserInfo(id, success, error)
          },
          function (e) {
            error && error()
            _alert('登录认证失败: ' + JSON.stringify(e))
          }
        )
      } else {
        error && error()
        _alert('已经登录认证!')
      }
    }

    function authLogout (id, success, error) {
      var service = oauthServices[id]
      if (!service) {
        error && error()
        return
      }
      service.logout(
        function () {
          success && success()
          _alert('注销登录认证成功!')
        },
        function (e) {
          error && error()
          _alert('注销登录认证失败: ' + JSON.stringify(e))
        }
      )
    }

    function _authUserInfo (id, success, error) {
      var service = oauthServices[id]
      if (!service) {
        error && error()
        return
      }
      if (!service.authResult) {
        _alert('还未登录授权!')
      } else {
        service.getUserInfo(
          function () {
            // 拿到用户信息，进行相关处理，ajax传用户数据到服务器等
            var userInfo = JSON.stringify(service.userInfo)
            success && success(userInfo)
          },
          function (e) {
            _alert('获取用户信息失败： ' + JSON.stringify(e))
          }
        )
      }
    }

    // 请求支付
    function _requestPayment (id, statement, success, error) {
      var service = payServices[id]
      if (!service) {
        error && error()
        return
      }
      plus.payment.request(
        service,
        statement,
        function (res) {
          success && success(res.rawdata)
        },
        function (e) {
          _alert('支付失败： ' + JSON.stringify(e))
          error && error(e)
        }
      )
    }

    // 执行plusReady
    _plusReady(initServices)

    // 微信好友分享
    WXSceneSessionShare = function (config) {
      config = config || {}
      var msg = config.plus.msg
      var success = config.plus.success
      var error = config.plus.error
      openShare('WXSceneSession', msg, success, error)
    }

    // 微信朋友圈分享
    WXSceneTimelineShare = function (config) {
      config = config || {}
      var msg = config.plus.msg
      var success = config.plus.success
      var error = config.plus.error
      openShare('WXSceneTimeline', msg, success, error)
    }

    // 微信小程序分享
    MiniProgramShare = function (config) {
      config = config || {}
      var msg = config.plus.msg
      var success = config.plus.success
      var error = config.plus.error
      openShare('miniProgram', msg, success, error)
    }

    // 微信登录
    wxLogin = function (config) {
      config = config || {}
      var success = config.plus.success
      var error = config.plus.error
      _authLogin('weixin', success, error)
    }

    // 微信退出登录
    wxLogout = function (config) {
      config = config || {}
      var success = config.plus.success
      var error = config.plus.error
      authLogout('weixin', success, error)
    }

    // 定位
    getCurrentPosition = function (config) {
      config = config || {}
      var success = config.plus.success
      var error = config.plus.error
      var options = config.plus.options
      window.plus.geolocation.getCurrentPosition(success, error, options)
    }

    var _barcode = null

    // 关闭扫码
    closeBarcode = function () {
      if (!_barcode) {
        _alert('尚未开始扫码')
      }
      _barcode.close()
      _barcode = null
    }

    // 创建扫码
    createBarcode = function (config) {
      config = config || {}
      var style = config.plus.style || {}
      var success = config.plus.success
      var error = config.plus.error
      var defaultStyle = {
        background: '#000',
        frameColor: '#07c160',
        scanbarColor: '#07c160',
        top: '100px',
        left: '0px',
        width: '100%',
        height: '500px',
        position: 'static'
      }
      for (var key in style) {
        defaultStyle[key] = style[key]
      }
      if (!_barcode) {
        _barcode = window.plus.barcode.create('barcode', [], defaultStyle)
        _barcode.onmarked = function (text, result) {
          success && success(result)
          closeBarcode()
        }
        _barcode.onerror = function (err) {
          error && error(params, err)
          closeBarcode()
        }
        window.plus.webview.currentWebview().append(_barcode)
      }
      _barcode.start()
    }

    // 相册扫码
    chooseImgToScan = function (config) {
      config = config || {}
      var success = config.plus.success
      var error = config.plus.error
      window.plus.gallery.pick(
        function (path) {
          window.plus.barcode.scan(
            path,
            function (type, result) {
              success && success(result)
            },
            function (e) {
              error && error(e)
            }
          )
        },
        function (e) {
          error && error(e)
        },
        { filter: 'image', system: false }
      )
    }

    // 微信支付
    wxPay = function (config) {
      config = config || {}
      var success = config.plus.success
      var error = config.plus.error
      var data = config.plus.data
      _requestPayment('wxpay', data, success, error)
    }
  }) // --- _html5PlusEnv e ---

  window.mplus = {
    setConfig: setConfig, // 全局配置
    WXSceneSessionShare: WXSceneSessionShare, // 微信好友分享
    WXSceneTimelineShare: WXSceneTimelineShare, // 微信朋友圈分享
    MiniProgramShare: MiniProgramShare, // 微信小程序分享
    wxLogin: wxLogin, // 微信登录
    wxLogout: wxLogout, // 微信注销登录
    getCurrentPosition: getCurrentPosition, // 定位
    createBarcode: createBarcode, // 打开扫码
    closeBarcode: closeBarcode, // 关闭扫码
    chooseImgToScan: chooseImgToScan, // 选择图片扫码
    wxPay: wxPay // 微信支付
  }
})()
