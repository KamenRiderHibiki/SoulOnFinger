//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    openID:'0'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //如果本地存储wxid说明已经注册过，直接跳转主界面
    var wxOpenID = wx.getStorageSync("WXID");
    if(wxOpenID)
    {
      this.login();
    }
    else
    {
      console.log('本地未获取openid');
    }
  },

  login: function () {
    var that = this;//？
    wx.showToast({
      title: '登录中',
      icon: 'loading',
      duration: 500
    });
    wx.login({
      success: function (res) {
        //成功登录则发送请求
        wx.request({//请求微信服务器获取openid
          url: 'https://api.weixin.qq.com/sns/jscode2session?appid=' + 'wxe6b4307b192f8cb7' + '&secret=' +'94f7aac3ed4e113bb29eae7ac435633d'+'&js_code=' + res.code +'&grant_type=authorization_code', //接口地址,appid,appsecret,临时密钥3个参数
          method: 'GET',
          header: {
            'content-type': 'application/json' //默认值
          },
          success: function (res) {
            wx.request({//用res中的openid请求自己服务器
              url: 'http://(网址)/query/user', //目标数据集中的url
              method: 'get',//get方法
              header: {
                'content-type': 'application/json' // 默认值
              },
              data: {
                openId: res.data.openid//发送openid
              },
              //成功回调
              success: function (rst) {
                //console.log(rst.data)
                if(rst.data.status==200)
                {
                  var stepID = wx.getStorageSync("WXID");
                  if(!stepID)
                  {
                    console.log(rst.data.result);
                    wx.setStorageSync('WXID', rst.data.result.openId);
                    console.log('已存储wxid');
                  }
                  wx.redirectTo({
                    url: '../../pages/mainpage/mainpage'
                  });
                }
                //返回4开头代表被封
                else if (Math.trunc(rst.data.status / 100)==4)
                {
                  wx.removeStorage({
                    key: 'WXID',
                    success: function () {
                      console.log('本地缓存id已清除');
                    },
                  })
                  wx.redirectTo({
                    url: '../../pages/register/register?id=' + res.data.openid
                  }); 
                }
              },
              //失败回调
              fail: function () {
                wx.showToast({
                  title: '服务器失联，请稍后重试',
                  icon: 'none',
                  duration: 1500
                });
              },
              complete: function () {

              }
            })
          },
          fail: function () {
            wx.showToast({
              title: '获取openId失败，请稍后重试',
              icon: 'none',
              duration: 1500
            });
          },
        })
      },
      fail: function () {
        wx.showToast({
          title: '拉取登录信息失败，可能没网',
          icon: 'none',
          duration: 1500
        });
      },
    })
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
})
