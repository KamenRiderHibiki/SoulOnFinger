// pages/test/mypage.js
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    point:0,
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    //读取本地缓存
    var Point = wx.getStorageSync("POINT");
    if(Point)
    {
      that.setData({
        point: Point
      });
    }

    var wxOpenID = wx.getStorageSync("WXID");//如果没数据了怎么办？我暂且蒙在鼓里！
    if(!wxOpenID)//那么就再登录一次8！
    {
      var that = this;//？
      wx.login({
        success: function (res) {
          //成功登录则发送请求
          wx.request({//请求微信服务器获取openid
            url: 'https://api.weixin.qq.com/sns/jscode2session?appid=' + '(appid)' + '&secret=' + '(secret)' + '&js_code=' + res.code + '&grant_type=authorization_code', //接口地址,appid,appsecret,临时密钥3个参数
            method: 'GET',
            header: {
              'content-type': 'application/json' //默认值
            },
            success: function (res) {
              wx.setStorageSync('WXID', res.data.result.openId);
              console.log('已存储wxid');
              wxOpenID = res.data.result.openId;
            }
          })
        }
      })
    }
    //请求服务器端的点数
    wx.request({
      url: 'http://(网址)/query/user', //目标数据集中的url
      method: 'GET',//get方法
      header: {
        'content-type': 'application/json' // 默认值
      },
      data: {
        openId: wxOpenID
      },
      //成功回调
      success: function (res) {
        if(res.data.result.point)
        that.setData({
          point: res.data.result.point
        });
        var stepPt = wx.getStorageSync("POINT");
        if (!stepPt) {
          wx.setStorageSync('POINT', res.data.result.point);
        }
      },
      //失败回调
      fail: function () {
        wx.showToast({
          title: '请求数据失败',
          icon: 'none',
          duration: 1500
        });
      },
      complete: function () {

      }
    })
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

  },
  
  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

    emecont: function () {
    wx.navigateTo({
      url: '../emecont/emecont',
    })
  },
  requestpoint: function (e) {
    
  }
})