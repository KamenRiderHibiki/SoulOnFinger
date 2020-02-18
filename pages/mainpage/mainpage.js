var time = 0;//触摸时间
var touchPtY = 0;//触摸时的y原点
var touchPtX = 0;
var interval = "";//计时器
var notNavigate = true;
var app = getApp()
Page({
  data: {
    background: [{ 
      name: 'report120', 
      src:'../../resources/ambulance.png'
      },
      {
        name:'report110',
        src:'../../resources/poicar.png'
        }],
    indicatorDots: true,
  },
  onLoad: function () {
    
  },
  onReady: function (e) {
  },
  /**
 * 生命周期函数--监听页面显示
 */
  onShow: function () {
    notNavigate = true;
  },

  myinf:function(){
    console.log("跳转myinf");
    wx.navigateTo({
      url: '../mypage/mypage',
    })
  },

  activevent: function () {
    console.log("跳转actevt");
    wx.navigateTo({
      url: '../activevent/activevent',
    })
  },

  warning:function(e){
    //wx.showToast({
    //  title: '成功',
    //  icon: 'success',
    //  duration: 2000
    //});
    wx.navigateTo({
      url: '../activevent/activevent?id=' + e.currentTarget.id
    });
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
          //console.log("向右滑动");
        }
        //如果移动方向向右
        else if (touchMoveX >= 40) {
          //console.log("向左滑动");
        }
      }
      else {
        //如果移动方向向上
        if (touchMoveY <= -40) {
          console.log("向下滑动");
        }
        //如果移动方向向下
        else if (touchMoveY >= 40) {
          console.log("向上滑动");
          if(notNavigate)
          {
            wx.navigateTo({
              url: '../knowledge/knowledge'
            });
            notNavigate = false;
          }
        }
      }
    }
    time = 0;
    clearInterval(interval);
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

  }
})