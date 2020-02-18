// pages/test/knowledge.js
var time = 0;//触摸时间
var touchPtY = 0;//触摸时的y原点
var touchPtX = 0;
var interval = "";//计时器
Page({
  /**
   * 页面的初始数据
   */
  data: {
    title:'',
    tips:'',
    prevTitle:'',
    prevTips:'',
    back:false
  },
    // 触摸开始事件
  touchStart: function (e) {
    touchPtY = e.touches[0].pageY; // 获取触摸时的原点
    touchPtX = e.touches[0].pageX;
    // 使用js计时器记录时间    
    interval = setInterval(function () {
      time++;
    }, 100);
  },
  // 触摸结束事件
  touchEnd: function (e) {
    //获取移动距离
    var touchMoveY = e.changedTouches[0].pageY - touchPtY;
    var touchMoveX = e.changedTouches[0].pageX - touchPtX;
    //tm小于一定值判断是滑动
    if (time < 10) {
      //如果横向移动>纵向移动
      if (Math.abs(touchMoveX) >= Math.abs(touchMoveY)) {
        //如果移动方向向左
        if (touchMoveX <= -40) {
          console.log("向右滑动");
          if (this.data.back) {
            var step1 = this.data.title, step2 = this.data.tips;
            this.setData({
              title: this.data.prevTitle,
              tips: this.data.prevTips
            });
            this.setData({
              prevTitle: step1,
              prevTips: step2,
              back:false
            });
          }
          else
          {
            this.refreshTips();
          }
        }
        //如果移动方向向右
        else if (touchMoveX >= 40) {
          console.log("向左滑动");
          if(this.data.prevTitle&&this.data.back==false)
          {
            var step1 = this.data.title,step2 = this.data.tips;
            this.setData({
              title:this.data.prevTitle,
              tips:this.data.prevTips
            });
            this.setData({
              prevTitle: step1,
              prevTips: step2,
              back:true
            });
          }
        }
      }
      else {
        //如果移动方向向上
        if (touchMoveY <= -40) {
          console.log("向下滑动");
          wx.navigateBack({
            url: 'mainpage'
          });
        }
        //如果移动方向向下
        else if (touchMoveY >= 40) {
          console.log("向上滑动");
        }
      }
    }
    time = 0;
    clearInterval(interval);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.refreshTips();
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
    clearInterval(interval); // 清除setInterval
    time = 0;
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
  refreshTips:function(){
    var that = this;
    wx.request({
      url: 'http://(网址)/interaction/tips', //目标数据集中的url
      method: 'GET',//get方法
      header: {
        'content-type': 'application/json' // 默认值
      },
      data: {
        //openId: wxOpenID//目前无参，可改成有参，再改8
      },
      //成功回调
      success: function (res) {
        //console.log(res.data)
        that.setData({
          prevTitle:that.data.title,
          prevTips:that.data.tips,
          tips:res.data.result.content,
          title:res.data.result.title
        });
      },
      //失败回调
      fail: function () {
        console.log("请求小知识失败");
      },
      complete: function () {

      }
    })
  }
})