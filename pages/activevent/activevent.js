// pages/test/er.js
var app = getApp();

var timer; // 计时器

Page({

  /**
   * 页面的初始数据
   */
  data: {
    type:'',      //进入本页面来源类型
    province: '', //不用多说8
    city: '',     //放着备用
    longitude: 0.0,//经度
    latitude: 0.0,//纬度
    //状态类型
    statusType: [{ type: 0, text:'无事件'},
                { type: 1, text: '待处理'},
                { type: 2, text: '已查看'},
                { type: 3, text: '处理中'},
                { type: 4, text: '派人中'},
                { type: 5, text: '派车中'},
                { type: 6, text: '调查中'},
                { type: 7, text: '已失效'},
                { type: 8, text: '已完成'},
                { type: 9, text: '申请完成'},
                { type: 10, text: '否认完成'}],
    status:0,//自动机状态码
    statusText:'',//。。。这你也要看注释？
    sendTime:'',//发送时间戳
    lastUpdateTime:'',//最后更新时间戳
    details: '',//备注
    stepdetails: '',//临时变量,乱动必炸
    position:'',//地点
    showWay:0,//底部按键自动机
    button0: '确认完成',//button0的文本
    button1:'修改备注',//button1的文本
    tstcode: '',//我要疯了不想改了，这是地点行政编码
    eventID:'',//事件id
    descText:'备注',
    finConfirm:true,
    autoTimer:''//自动刷新计时器
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //读取状态       读取个屁，没网看需要刷新的页面干啥
    //var tryStatus = wx.getStorageSync("STATUS");
    //if (tryStatus) {
    //  that.setData({
    //    status: res.data});
    //}
    //else
    //{
    //  console.log('读取失败');
    //}
    //读取时间戳
    //wx.getStorage({
    //  key: 'LASTIME',
    //  success:function(res)
    //  {
    //     that.setData({
    //      time: res.data, //成功则展示数据
    //    });
    //  },
    //  fail:function()
    //  {
    //    console.log('读取失败t');
    //  }
    //});

    //处理不同种类的进入页面方式
    if (options.id!=null)
    {
      that.setData({        //存下来源类型，响应用户是第一重要的
        type: options.id,   
      });
    }
    var wxOpenID = wx.getStorageSync("WXID");//如果没数据了怎么办？  我反正不改了自己粘贴mypage页的办法8
    //查询是否有事件
    wx.request({
      url: 'http://47.95.10.255/interaction/action', 
      method: 'get',//get,post方法
      header: {
        'content-type': 'application/json' // 默认值
      },
      data: {
        'openId': wxOpenID//发送wxid换事件id
      },
      //成功回调
      success: function (res) {
        if(res.data.status==201)//201：今日相安无事
        {
          that.setData({ status: 0});//修改状态码
          that.setData({ statusText: that.data.statusType[that.data.status].text });//修改显示数据
        }
        else if (res.data.status==202)//事情来了
        {
          that.setData({
            eventID: res.data.result//保存事件id
          });
          wx.setStorageSync('EVENT', res.data.result);//进主界面读取一下往过跳
          //查询事件详情
          wx.request({
            url: 'http://47.95.10.255/query/record', 
            method: 'get',//get,post方法
            header: {
              'content-type': 'application/json' // 默认值
            },
            data: {
              'recordId': res.data.result//发送事件id
            },
            //成功回调
            success: function (rst) {
              //根据回调写下状态
              that.setData({
                status:rst.data.result.status.id,//状态
                longitude: rst.data.result.lng,//经度
                latitude: rst.data.result.lat,//纬度
              });
              if (that.data.status > 6 && that.data.status<9)//失效了就8用客户端瞎动
              {
                that.setData({
                  showWay: 1
                });
              }
              else if (that.data.status>3)//开始派人就不让反悔了
              {
                that.setData({
                  showWay:4
                });
                if (that.data.status==9)
                {
                  that.setData({
                    finConfirm: false
                  });
                }
                else
                {
                  that.setData({
                    finConfirm: true
                  });
                }
              }
              else {              //其他情况允许反悔
                that.setData({
                  showWay: 2
                });
              }
              that.setData({
                statusText: that.data.statusType[that.data.status].text,
                descText: '已经成功求助！'//修改备注栏信息
                });//修改显示数据
              if (rst.data.result.description) {
                that.setData({ details: rst.data.result.description });//有备注修改备注数据
              }
              that.autoRefresh();//启动自动刷新
            },
            //失败回调
            fail: function () {
              wx.showToast({
                title: '查询详情失败',
                icon: 'none',
                duration: 1500
              });
            },
            complete: function () {

            }
          })
        }
      },
      //失败回调
      fail: function () {
        wx.showToast({
          title: '查询事件失败',
          icon: 'none',
          duration: 1500
        });
      },
      complete: function () {

      }
    })
    //处理状态机
    switch(this.data.status)
    {
      //0状态允许用户改变
      case 0:
        if (that.data.type)//有用户状态
      {   //看转换图
          if (that.data.type == 'report110' || that.data.type == 'report120')
        {
            that.setData({
              showWay:2
            });
        }
        else
        {
            that.setData({
              showWay: 3
            });
        }
      }
      //0状态0类型是没事
      else
      {
          that.setData({
            showWay: 0
          });
      }
      break;
      case 7:
        that.setData({
          showWay: 1
        });
        break;
      case 9:
        that.setData({
          showWay: 4,
          finConfirm: false
        });
        break;
      //其他状态默认是4态
      default:
        //that.setData({
        //  showWay: 4
        //});
      break;
    }

    //调用微信授权开地图
    wx.getSetting({
      success: (res) => {
        //console.log(JSON.stringify(res))
        // res.authSetting['scope.userLocation'] == undefined    表示 初始化进入该页面
        // res.authSetting['scope.userLocation'] == false    表示 非初始化进入该页面,且未授权
        // res.authSetting['scope.userLocation'] == true    表示 地理位置授权
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
          wx.showModal({
            title: '请求授权当前位置',
            content: '需要获取您的地理位置，请确认授权',
            success: function (res) {
              if (res.cancel) {
                wx.showToast({
                  title: '拒绝授权',
                  icon: 'none',
                  duration: 1000
                })
              } else if (res.confirm) {
                wx.openSetting({
                  success: function (dataAu) {
                    if (dataAu.authSetting["scope.userLocation"] == true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 1000
                      })
                      //再次授权，调用wx.getLocation的API

                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'none',
                        duration: 1000
                      })
                    }
                  }
                })
              }
            }
          })
        } else if (res.authSetting['scope.userLocation'] == undefined) {
          //调用wx.getLocation的API
          wx.getLocation();
        }
        else {
          //调用wx.getLocation的API
          wx.getLocation();
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function (e) {
    var that = this;
    //获取中心点位置
    //that.mapCtx.getCenterLocation({
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        if(that.data.latitude<1&that.data.longitude<1)//这说明之前查询status并未返回改变坐标的活动事件，读取当前坐标
        {
          that.setData({
            longitude: res.longitude,
            latitude: res.latitude
          });
        }
        that.tst();//逆地址解析找到地点存进position
      }
    });
    switch (this.data.type) {//如果有来源标记则是求助请求
      case 'report110': //报警请求，你不用写
        console.log('110');
      case 'report120': //立即发送的求助
        console.log('120');
        that.Countdown(1);
        //请求，然后调起备注页面
        break;
      case 'reportfam':
        ;
      case 'reportotr':
        ;
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (e) {
    //地图环境
    this.mapCtx = wx.createMapContext('myMap');
    //地图移到现在位置
    this.mapCtx.moveToLocation();
    
  },

  tst: function () {
    var that = this;
    wx.request({
      url: 'http://api.map.baidu.com/geocoder/v2/', //百度api
      method: 'get',//get,post方法
      header: {
        'content-type': 'application/json' // 默认值
      },
      data: {
        location: that.data.latitude + ',' + that.data.longitude,//纬度+经度
        output: 'json',//回应格式
        coordtype: 'gcj02ll',//支那坐标系，呕
        ak: 'Otj3OdBxgTvwMw7osTr9MBmmo2YPT9P0',//私密key，上线记得改
        latest_admin: 1//使用新行政区划
      },
      //成功回调
      success: function (res) {
        //console.log(res);
        var step = (res.data.result.addressComponent.adcode.substr(0, 4)).concat('00');//绕死你个看代码的
        that.setData({
          tstcode: step,
          position: res.data.result.formatted_address
        })
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
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(this.data.autoTimer);
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



  cancel: function () {
    var that = this;
    wx.showModal({
      title: '确认',
      content: '是否取消救援',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          wx.request({
            url: 'http://47.95.10.255/interaction/invalid', //发送事件api
            method: 'get',//get,post方法
            header: {
              'content-type': 'application/json' // 默认值
            },
            data: {
              recordId: that.data.eventID,
            },
            //成功回调
            success: function (res) {
              console.log(res);
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
              that.refresh();
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
//确认完成
  change: function () {
    var that = this;
    wx.showModal({
      title: '确认',
      content: '是否确认完成',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定');
          wx.request({
            url: 'http://47.95.10.255/interaction/finish/determine', //发送事件api
            method: 'get',//get,post方法
            header: {
              'content-type': 'application/json' // 默认值
            },
            data: {
              recordId: that.data.eventID, 
            },
            //成功回调
            success: function (res) {
              //console.log(res);
              that.refresh();
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
        } else if (res.cancel) {
          console.log('用户点击取消')
          wx.request({
            url: 'http://47.95.10.255/interaction/finish/deny', //发送事件api
            method: 'get',//get,post方法
            header: {
              'content-type': 'application/json' // 默认值
            },
            data: {
              recordId: that.data.eventID,
            },
            //成功回调
            success: function (res) {
              //console.log(res);
              that.refresh();
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
      }
    })
  },
//刷新功能，谨慎再谨慎
  refresh:function(){
    var that = this;
    //没有事件id的情况
    var eventid = '';
    if (!that.data.eventID) {
      var wxOpenID = wx.getStorageSync("WXID");//如果没数据了怎么办？我暂且蒙在鼓里！
      wx.request({
        url: 'http://47.95.10.255/interaction/action', //查询是否有事件
        method: 'get',//get,post方法
        header: {
          'content-type': 'application/json' // 默认值
        },
        data: {
          'openId': wxOpenID//发送openid
        },
        //成功回调
        success: function (res) {
          
          if (res.data.status == 201)//201：今日相安无事
          {
            eventid = -1;
            that.setData({ status: 0 });//修改状态码
            that.setData({ statusText: that.data.statusType[that.data.status].text });//修改显示数据
          }
          else if (res.data.status == 202)//喊”破喉咙“没人会来救你的！
          {
            eventid = res.data.result;
            that.setData({
              eventID: eventid
            });
          }
        },
        //失败回调
        fail: function () {
          wx.showToast({
            title: '查询事件失败',
            icon: 'none',
            duration: 1500
          });
        },
        complete: function () {

        }
      })
    }
    else {
      eventid = that.data.eventID;
    }
    //如果有事件
    if (eventid&&eventid != -1) {
      var update = false;
      wx.request({
        url: 'http://47.95.10.255/query/record', //查询事件详情
        method: 'get',//get,post方法
        header: {
          'content-type': 'application/json' // 默认值
        },
        data: {
          recordId: eventid,//发送事件id
          timeonly: true
        },
        //成功回调
        success: function (res) {
          //根据回调写下状态
          if (that.data.lastUpdateTime)
          {
            if (res.data.result > that.data.lastUpdateTime) {
              update = true;
            }
            else
            {
              update = false;
            }
          }
          else
          {
            update = true;
          }
          if (update) {
            wx.request({
              url: 'http://47.95.10.255/query/record', //查询事件详情
              method: 'get',//get,post方法
              header: {
                'content-type': 'application/json' // 默认值
              },
              data: {
                'recordId': eventid//发送事件id
              },
              //成功回调
              success: function (rst) {
                //console.log(rst);
                //根据回调写下状态
                that.setData({
                  status: rst.data.result.status.id,
                  longitude: rst.data.result.lng,
                  latitude: rst.data.result.lat,
                  lastUpdateTime: rst.data.result.updateTime
                });
                that.tst();
                if (that.data.status == 7) {
                  that.setData({
                    showWay: 1
                  });
                }
                else if (that.data.status > 3) {
                  that.setData({
                    showWay: 4
                  });
                }
                else {
                  that.setData({
                    showWay: 2
                  });
                }
                that.setData({
                  statusText: that.data.statusType[that.data.status].text,
                  descText: '已经成功求助！'//修改备注栏信息
                  });//修改显示数据
                if (rst.data.result.description) {
                  that.setData({ details: rst.data.result.description });//修改备注数据
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
          else {
            console.log('没更新');
          }
        },
        //失败回调
        fail: function () {
          wx.showToast({
            title: '获取更新时间错误',
            icon: 'none',
            duration: 1500
          });
        },
        complete: function () {
        }
      })
    }
    else {
      console.log('没事');
    }
  },

  /**
   * 弹窗
   */
  showDialogBtn: function () {
    this.setData({
      showModal: true,
      stepdetails:this.data.details
    });
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
  onCancel: function (e) {
    var that = this;
    this.setData({
      stepdetails: ''
    });
    this.hideModal();
  },
  /**
   * 对话框确认按钮点击事件
   */
  onConfirm: function (e) {
    var that = this;
    this.setData({
      details: that.data.stepdetails,
      stepdetails: ''
    });
    if(that.data.eventID)
    {
      wx.request({
        url: 'http://47.95.10.255/interaction/description', //发送事件api
        method: 'get',//get,post方法
        header: {
          'content-type': 'application/json' // 默认值
        },
        data: {
          recordId: that.data.eventID,
          description: that.data.details//备注
        },
        //成功回调
        success: function (res) {
          console.log(res);
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
          that.refresh();
        }
      })
    }
    this.hideModal();
  },
  bindTextAreaBlur: function (e) {
    this.setData({
      stepdetails: e.detail.value
    });
  },
  //等有坐标就发出请求
  Countdown: function (e) {
    var that = this;
    timer = setTimeout(function () {
      if (that.data.latitude < 1||that.data.longitude<1) {
        that.Countdown(e);
      }
      else
      {
        that.sendHelp(e);
      }
    }, 1000);
  },
  //按键请求不能带参，弄个专用函数
  send:function()
  {
    this.sendHelp(1);
  },
  //发送求助
  sendHelp:function(e)
  {
    var that = this;
    var wxOpenID = wx.getStorageSync("WXID");//读取wxid，准备数据
    var desc = '';
    if(that.data.details)//有备注填入
    {
      desc = that.data.details;
    }
    //console.log(that.data.latitude + ',' + that.data.longitude);
    wx.request({
      url: 'http://47.95.10.255/interaction/help', //发送事件api
      method: 'get',//get,post方法
      header: {
        'content-type': 'application/json' // 默认值
      },
      data: {
        openId:wxOpenID,//wxid
        classId:e,//求助类型
        lat: that.data.latitude,//纬度
        lng: that.data.longitude,//经度
        cityCode:that.data.tstcode,//区划编码
        description:desc//备注
      },
      //成功回调
      success: function (res) {
        that.setData({
          eventID:res.data.result,//事件id
          sendTime:that.timeString()
        });
        that.setData({
          lastUpdateTime:0,
          descText:'已经成功求助！'//修改备注栏信息
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
      complete: function () {
        that.refresh();//刷新状态
        that.autoRefresh();//启动自动刷新
      }
    })
  },
  //时间转换
  timeString:function(){
    var newDate = new Date();//date对象
    var Time = newDate.format('yyyy-MM-dd h:m:s');
    return Time;
  },
  autoRefresh: function () {
    var that = this;
    if(that.data.status!=7)
    {
      that.data.autoTimer = setTimeout(function () {
        that.refresh();
        that.autoRefresh();
      }, 30000);
    }
  }
})

//自定义字符串转换方法
Date.prototype.format = function (format) {
  var date = {
    "M+": this.getMonth() + 1,
    "d+": this.getDate(),
    "h+": this.getHours(),
    "m+": this.getMinutes(),
    "s+": this.getSeconds(),
    "q+": Math.floor((this.getMonth() + 3) / 3),
    "S+": this.getMilliseconds()
  };
  if (/(y+)/i.test(format)) {
    format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  for (var k in date) {
    if (new RegExp("(" + k + ")").test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length == 1
        ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
    }
  }
  return format;
}