// pages/r/r.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    openid:'',
    showTopTips: false,
    errMsg: '',
    btnValue: '获取验证码',
    phone: '',
    verifiedPhone: '',
    authCode: '',
    second: 60,
    isAgree: false,
    isRead: false,
    btnDisabled: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({                             //this.setData的方法用于把传递过来的id转化成小程序模板语言
    openid: options.id,     //id是a页面传递过来的名称，a_id是保存在本页面的全局变量   {{b_id}}方法使用
    })
  },


  bindAgreeChange: function (e) {
    this.setData({
      isAgree: !!e.detail.value.length
    });
  },

  bindRead: function () {
    this.setData({ isRead: true });
  },

  showTopTips: function () {
    var that = this;
    this.setData({
      showTopTips: true
    });
    setTimeout(function () {
      that.setData({
        showTopTips: false,
        errMsg: ''
      });
    }, 3000);
  },

  bindPhoneInput: function (e) {
    //console.log(e.detail.value);
    var val = e.detail.value;
    this.setData({
      phone: val
    })
  },

  bindCodeInput(e) {
    this.setData({
      code: e.detail.value
    })
  },

  timer: function () {
    let promise = new Promise((resolve, reject) => {
      let setTimer = setInterval(
        () => {
          var second = this.data.second - 1;
          this.setData({
            second: second,
            btnValue: second + '秒',
            btnDisabled: true
          })
          if (this.data.second <= 0) {
            this.setData({
              second: 60,
              btnValue: '获取验证码',
              btnDisabled: false
            })
            resolve(setTimer)
          }
        }
        , 1000)
    })
    promise.then((setTimer) => {
      clearInterval(setTimer)
    })
  },

  getAuthCode: function (e) {
    if (this.verifyPhone()) {
      //console.log('获取验证码');
      var that = this;//想在回调里改数据得靠这个
      that.setData({
        verifiedPhone: that.data.phone
      });
      wx.request({
        url: 'http://47.95.10.255/test/send', //目标数据集中的url
        method: 'get',//get方法
        header: {
          'content-type': 'application/json' // 默认值
        },
        data: {
          'phoneNum': that.data.phone//发送什么数据
        },
        //成功回调
        success: function (res) {
          //console.log(res.data)
          that.setData({
            authCode: res.data
          });
          that.timer();
        },
        //失败回调
        fail: function () {
          wx.showToast({
            title: '请求验证码失败',
            icon: 'loading',
            duration: 1500
          });
        },
        complete: function () {

        }
      })
    }
  },

  verifyPhone: function () {
    var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if (this.data.phone.length == 0) {
      this.setData({
        errMsg: '输入的手机号为空'
      })
      this.showTopTips();
      return false;
    } else if (this.data.phone.length < 11) {
      this.setData({
        errMsg: '手机号长度有误！'
      })
      this.showTopTips();
      return false;
    } else if (!myreg.test(this.data.phone)) {
      this.setData({
        errMsg: '手机号有误！'
      })
      this.showTopTips();
      return false;
    } else {
      wx.showToast({
        title: '请求已发送',
        icon: 'success',
        duration: 1500
      })
      return true;
    }
  },

  Arbiter: function () {
    if (this.data.verifiedPhone)
    {
      if (this.data.code) {
        if (this.data.code.length == 6 & this.data.code == this.data.authCode) {
          if (!this.data.isAgree) {
            this.setData({
              errMsg: '您尚未同意免责声明'
            })
            this.showTopTips();
          } else if (!this.data.isRead) {
            this.setData({
              errMsg: '您没有真看免责声明'
            })
            this.showTopTips();
          }
          else {
            var that = this;
            wx.request({
              url: 'http://47.95.10.255/interaction/register', //目标url
              method: 'get',//get,post方法
              header: {
                'content-type': 'application/json' // 默认值
              },
              data: {
                'openId':this.data.openid,
                'phoneNum': this.data.verifiedPhone//发送什么数据
              },
              //成功回调
              success: function (res) {
                //console.log(res);
                if(res.data.status==200)
                {
                  wx.showToast({
                    title: '成功注册！',
                    icon: 'success',
                    duration: 1500
                  });
                  wx.setStorageSync('WXID', that.data.openid);//注册以后就本地存储wxid
                  wx.redirectTo({
                    url: '../../pages/mainpage/mainpage'
                  });
                }
                else
                {
                  wx.showToast({
                    title: '发生错误，大概在修了',
                    icon: 'none',
                    duration: 1500
                  });
                }
              },
              //失败回调
              fail: function () {
                wx.showToast({
                  title: '网络错误，请稍后再点击尝试',
                  icon: 'none',
                  duration: 1500
                });
              },
              complete: function () {

              }
            })
          }
        }
        else {
          this.setData({
            errMsg: '验证码错误！'
          })
          this.showTopTips();
        }
      }
      else {
        this.setData({
          errMsg: '验证码为空！'
        })
        this.showTopTips();
      }
    }
    else
    {
      this.setData({
        errMsg: '未验证手机号！'
      })
      this.showTopTips();
    }

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})