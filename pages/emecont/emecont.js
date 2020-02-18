// pages/test/emecont.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    //是否显示弹框
    showModal: false,
    //联系人列表：
    emergencyList: [],
    //微信openid：
    Wxid:''
  },
  //删除联系人
  deletePop: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;//获取当前长按联系人下标
    wx.showModal({
      title: '提示',
      content: '确定要删除此联系人吗？',
      success: function (res) {
        if (res.confirm) {
          //点击确定了
          //服务器端请求删除
          wx.request({
            url: 'http://(网址)/interaction/contact/delete',
            method: 'get',//get,post方法
            header: {
              'content-type': 'application/json' // 默认值
            },
            data: {
              openId: that.data.Wxid,//根据wxid和电话删除
              phoneNum: that.data.emergencyList[index].phone
            },
            //成功回调，成功才删除本地
            success: function (res) {
              var temp = that.data.emergencyList;//temp=当前列表
              temp.splice(index, 1);//删除从index开始的一个元素
              //刷新列表
              that.setData({
                emergencyList: that.data.emergencyList
              });
            },
            //失败回调
            fail: function () {
              wx.showToast({
                title: '网络错误',
                icon: 'none',
                duration: 1500
              });
            },
          })    
        } else if (res.cancel) {
          //点击取消了
        }
        
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //获取openid
    var OpenID = wx.getStorageSync("WXID");
    if(OpenID)
    {
      this.setData({
        Wxid: OpenID
      })
    }
    //请求联系人列表
    wx.request({
      url: 'http://(网址)/interaction/contact/select',
      method: 'get',//get,post方法
      header: {
        'content-type': 'application/json' // 默认值
      },
      data: {
        openId: OpenID,
      },
      //成功回调
      success: function (res) {
        if(res.data.status==200)
        {

        }
        //服务器列表
        var resultList = res.data.result;
        //处理服务器数据
        for(var i in resultList)
        {
          //声明新结构
          var cIndex = {};
          //填充值
          cIndex.name = resultList[i].name;
          cIndex.phone = resultList[i].phoneNum;
          //插入本地数据中
          let emergencyList = that.data.emergencyList;
          emergencyList.push(cIndex);
        }
        //同名变量
        let emergencyList = that.data.emergencyList;
        //刷新页面
        that.setData({emergencyList});
      },
      //失败回调
      fail: function () {
        wx.showToast({
          title: '网络错误',
          icon: 'none',
          duration: 1500
        });
      },
      complete: function () {

      }
    })
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

  },

  //弹窗
  showDialogBtn: function () {
    this.setData({
      showModal: true
    })
  },
  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function () {
  },
  /**
   * 隐藏模态对话框
   */
  hideModal: function () {
    this.setData({
      showModal: false
    });
  },
  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function () {
    this.setData({
      stepname: 'void',
      stepnum: '0'
    })
    this.hideModal();
  },
  /**
   * 对话框确认按钮点击事件
   */
  onConfirm: function (e) {
    var that = this;
    //声明新结构
    var newc ={};
    console.log("1");
    //填充值
    if (that.data.stepname!=null)
    {
      newc.name = that.data.stepname;
    }
    if (that.data.stepnum!=null)
    {
      console.log("2");
      newc.phone = that.data.stepnum;
      //发送插值请求
      wx.request({
        url: 'http://(网址)/interaction/contact/insert',
        method: 'get',//get,post方法
        header: {
          'content-type': 'application/json' // 默认值
        },
        data: {
          openId: that.data.Wxid,
          phoneNum: that.data.stepnum,
          name: that.data.stepname
        },
        //成功回调
        success: function (res) {
          //成功就在本地更新
          if (res.data.status == 200) {
            //同名变量
            let emergencyList = that.data.emergencyList;
            emergencyList.push(newc);
            that.setData({ emergencyList });
            that.setData({
              stepname: 'void',
              stepnum: '0'
            });
            that.hideModal();
          }
        },
        //失败回调
        fail: function () {
          wx.showToast({
            title: '网络错误',
            icon: 'none',
            duration: 1500
          });
        },
        complete: function () {
          
        }
      })
    }
  },
  bindNumInput: function (e) {
    this.setData({
      stepnum: e.detail.value
    })
  },
  bindNameInput: function (e) {
    this.setData({
      stepname: e.detail.value
    })
  }
})