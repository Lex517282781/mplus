<template>
  <div class="home">
    <button @click="handleWXSceneSessionShare">微信好友分享</button><br /><br />
    <button @click="handlCloseBarcode">关闭扫码</button><br /><br />
    <button @click="handleWXSceneTimelineShare">微信朋友圈分享</button><br /><br />
    <button @click="handleMiniProgramShare">微信小程序分享</button><br /><br />
    <button @click="handleWxLogin">微信登录</button><br /><br />
    <button @click="handleWxLogout">微信退出登录</button><br /><br />
    <button @click="handlePosition">定位</button><br /><br />
    <button @click="handleCreateBarcode">打开扫码</button><br /><br />
    <button @click="handleChooseImgToScan">相册扫码</button><br /><br />
    <button @click="handleWxPay">微信支付</button><br /><br />
    <button @click="handleOpenApp">打开第三方应用</button><br /><br />
    <button @click="handleOpenMmj">打开蘑菇街</button><br /><br />
    <button @click="handleOpenMap">打开地图</button><br /><br />
    <button @click="handleSaveImg">保存图片</button><br /><br />
    <button @click="handleUpload">上传文件</button><br /><br />
  </div>
</template>

<script>
export default {
  name: "home",
  mounted() {},
  methods: {
    handleWXSceneSessionShare() {
      window.mplus.WXSceneSessionShare({
        plus: {
          msg: {
            title: document.title, // 标题
            content: "微信分享", // 分享内容或者应用描述
            href: location.href, // 分享出去后，点击跳转的地址
            thumbs: [
              "http://thirdwx.qlogo.cn/mmopen/vi_32/DYAIOgq83eo5hd9ovRGbib6TYibI1TpRNEqWjW3VmZ5Kv0FCOwAXibXeqiauFF80Jcg53oYr3bUzwyYrYjZ7Ogu8ibQ/132"
            ] // 分享缩略图
          },
          success: () => {
            console.log("分享成功");
          },
          error: () => {
            console.log("分享失败");
          }
        },
        h5: {
          success: () => {
            console.log("h5 handleWXSceneSessionShare");
          }
        }
      });
    },
    handleWXSceneTimelineShare() {
      window.mplus.WXSceneTimelineShare({
        plus: {
          msg: {
            title: document.title, // 标题
            content: "朋友圈分享", // 分享内容或者应用描述
            href: location.href, // 分享出去后，点击跳转的地址
            thumbs: [
              "http://thirdwx.qlogo.cn/mmopen/vi_32/DYAIOgq83eo5hd9ovRGbib6TYibI1TpRNEqWjW3VmZ5Kv0FCOwAXibXeqiauFF80Jcg53oYr3bUzwyYrYjZ7Ogu8ibQ/132"
            ] // 分享缩略图
          },
          success: () => {
            console.log("分享成功");
          },
          error: () => {
            console.log("分享失败");
          }
        },
        h5: {
          success: () => {
            console.log("h5 handleWXSceneTimelineShare");
          }
        }
      });
    },
    handleMiniProgramShare() {
      window.mplus.MiniProgramShare({
        plus: {
          msg: {
            type: "miniProgram",
            title: document.title, // 标题
            content: "朋友圈分享", // 分享内容或者应用描述
            href: location.href, // 分享出去后，点击跳转的地址
            thumbs: [
              "http://thirdwx.qlogo.cn/mmopen/vi_32/DYAIOgq83eo5hd9ovRGbib6TYibI1TpRNEqWjW3VmZ5Kv0FCOwAXibXeqiauFF80Jcg53oYr3bUzwyYrYjZ7Ogu8ibQ/132"
            ], // 分享缩略图
            miniProgram: {
              id: "gh_33446d7f7a26", // gh_33446d7f7a26
              path: "/pages/component/component", // /pages/component/component
              webUrl: "http://uniapp.dcloud.io",
              type: 0
            }
          },
          success: () => {
            console.log("分享成功");
          },
          error: () => {
            console.log("分享失败");
          }
        },
        h5: {
          success: () => {
            console.log("h5 handleMiniProgramShare");
          }
        }
      });
    },
    handleWxLogin() {
      window.mplus.wxLogin({
        plus: {
          success: userInfo => {
            console.log(userInfo, "handleWxLogin");
          }
        },
        h5: {
          success: () => {}
        }
      });
    },
    handleWxLogout() {
      window.mplus.wxLogout({
        plus: {
          success: () => {
            console.log("注销");
          }
        },
        h5: {
          success: () => {}
        }
      });
    },
    handlePosition() {
      window.mplus.getCurrentPosition({
        plus: {
          success: function(res) {
            console.log(res);
          },
          error: function() {}
        },
        h5: {
          success: function(res) {
            console.log(res);
          },
          error: function() {}
        }
      });
    },
    handleCreateBarcode() {
      window.mplus.createBarcode({
        plus: {
          success: res => {
            console.log(res);
          }
        }
      });
    },
    handlCloseBarcode() {
      window.mplus.closeBarcode();
    },
    handleChooseImgToScan() {
      window.mplus.chooseImgToScan({
        plus: {}
      });
    },
    handleWxPay() {
      window.mplus.wxPay({
        plus: {
          data: {},
          success: res => {
            console.log(res);
          }
        }
      });
    },
    handleOpenApp() {
      window.mplus.openTaobao({
        plus: {
          appUrl: "",
          h5Url: ""
        },
        h5: {
          url: ""
        }
      });
    },
    handleOpenMmj() {
      window.mplus.openMmj({
        plus: {
          pictures: [
            "https://s11.mogucdn.com/mlcdn/711693/191213_4le3dig2b248a2l5gkc162j5gkja3_430x430.jpg"
          ]
        }
      });
    },
    handleOpenMap() {
      window.mplus.openMap({
        query: {
          address: "浙江省杭州市下城区武林路376号",
          lat: "30.27541648767812",
          lon: "120.16598489722605"
        }
      });
    },
    handleSaveImg() {
      window.mplus.saveImg({
        plus: {
          pictures: [
            "https://htkimg.xiaoxixi8.com/s97042822404dd1620632ab642fa81a22e3201fdd3c1.jpg",
            "https://htkimg.xiaoxixi8.com/s97027560299cb53fda6e00e48958c9f94a932ad5c7e.jpg"
          ],
          progress: function(downloadedSize, totalSize, percent, completed) {
            console.log(downloadedSize, totalSize, percent, completed);
          },
          success: function(res) {
            console.log(res);
          },
          error: function(err) {
            console.log(err);
          }
        }
      });
    },
    handleUpload() {
      window.mplus.openGalleryImg({
        plus: {
          multiple: true,
          success: function(paths) {
            paths.forEach(item => {
              window.mplus.uploadFile({
                plus: {
                  remoteUrl:
                    "https://cpspddtest.hzquwei.com/image/uploadImg.do?resType=1",
                  filePath: item,
                  success: function(res) {
                    console.log(res, 135);
                  }
                }
              });
            });
          }
        }
      });
    }
  }
};
</script>
