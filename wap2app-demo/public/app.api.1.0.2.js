(function(){

    function callBackSuccess(params , res){
        try{
            if(typeof params.success){
                params.success(res) ;
                return true ;
            }
            return false ;
        }catch(e){
            alert("回调函数异常：");
            alert(e);
        }
    }

    function callBackFail(params , res){
        if(typeof params.fail){
            params.fail(res) ;
            return true ;
        }
        return false ;
    }

   

    var plusReady = false ;
    var shares=null;
    var wxShare = null ;
    var wxChannel = null ;
    var aliChannel = null ;
    document.addEventListener( "plusready", onPlusReady, false );
    function onPlusReady(){
        plusReady = true ;
        document.addEventListener("resume", onAppShow, false);
        document.addEventListener("foreground", onAppShow, false);
        getShares();

        window.plus.payment.getChannels(function(channels){
            console.log(channels, 888)
            for (var i = 0; i < channels.length; i++) {
                var channel = channels[i];
                if(channel.id == "wxpay"){
                    wxChannel = channel ;           
                }else if(channel.id == "alipay"){
                    aliChannel = channel ;
                }
            }
        },function(e){
            console.log("获取支付通道失败："+e.message);
        });

    }

    function requestPayment(params){
        if(!params.channel){
           alert("请输入支付通道：alipay || wxpay");
           return false ;
        }
        var channel = null ;
        if(params.channel == 'alipay'){
           channel = aliChannel ;
           if(!channel){
              alert("支付宝支付配置错误或还未准备好，无法调用支付宝支付。");
              return false ;
           }
        }else if(params.channel == 'wxpay'){
           channel = wxChannel ;
            if(!channel){
                alert("微信支付配置错误或还未准备好，无法调用微信支付。");
                return false ;
            }
        }
        if(!channel){
           alert("支付通道参数错误，支持：alipay || wxpay");
           return false ;
        }
        if(!params.statement){
           alert("请输入支付订单所需的statement参数");
           return false ;
        }
        window.plus.payment.request( channel, params.statement , function(res){
             callBackSuccess( params ,res.rawdata );
        }, function(err){
             callBackFail( params , err);
        });
    }

    function wxPay(params){
        params = params || {} ;
        params['channel'] = "wxpay" ;
        requestPayment(params);
    }

    function alipay(params){
        params = params || {} ;
        params['channel'] = "alipay" ;
        requestPayment(params);
    }

    function onAppShow(show){
        if(typeof  show == 'function'){
           show();
        }
    }

    function getShares(){
        window.plus.share.getServices(function(ss) {
            shares = ss;
            for (var i in ss ) {
                var s = ss[i];
                if(s.id == 'weixin'){
                    wxShare = s ;
                }
            }
        }, function(e) {
            console.log("获取分享服务列表失败：" + e.message);
        });
    }

    function isWechatInstalled() {
        return window.plus.runtime.isApplicationExist && window.plus.runtime.isApplicationExist({
                pname: 'com.tencent.mm',
                action: 'weixin://'
            });
    }

    function share(msg, callback) {
        var service = wxShare ;
        var _share = function() {
            service.send(msg, function(e) {
                callBackSuccess(msg , {code : 200 , message : "分享完成，但是无法判断是否分享成功哦~"});
            }, function(e) {
                callBackFail(msg , e);
            });
        };
        if(service.authenticated) {
            _share(service, msg, callback);
        } else {
            service.authorize(function() {
                _share(service, msg, callback);
            }, function(e) {
                console.log("认证授权失败");
                callBackFail(msg , e);
            })
        }
    }

    function openShare(msg) {
        if(msg.imgUrl){
           msg['thumbs'] = [msg.imgUrl];
        }
        if(wxShare) {
            if(isWechatInstalled() == false){
              alert("尚未安装微信，请先安装微信");
              return false ;
            }
            window.plus.nativeUI.actionSheet({
                title: '分享到' ,
                cancel: "取消" ,
                buttons: [{
                    title: "微信好友"
                }, {
                    title: "微信朋友圈"
                }]
            }, function(e) {
                var index = e.index;
                switch(index) {
                    case 1: //分享到微信好友
                        msg.extra = {
                            scene: 'WXSceneSession'
                        };
                        share( msg);
                        break;
                    case 2: //分享到微信朋友圈
                        msg.title = msg.content;
                        msg.extra = {
                            scene: 'WXSceneTimeline'
                        };
                        share(msg);
                        break;
                }
            })
        } else {
            alert("无法吊起...")
            callBackFail(msg , {code : -1 , message : "微信参数未设置，无法分享"});
        }
    }

    var txtFilePath = null ;
    function readTxtFile(params){
        params = params || {} ;
        var txtFilePath = params.filePath ;
        if(!txtFilePath){
            return false ;
        }
        window.plus.io.resolveLocalFileSystemURL( txtFilePath , function( entry ) {
            entry.file( function(file){
                var fileReader = new window.plus.io.FileReader();
                fileReader.readAsText(file, 'utf-8');
                fileReader.onloadend = function(evt) {
                    callBackSuccess(params , {
                        size : file.size , //文件大小
                        name : file.name , //文件名
                        content : evt.target.result //文件内容
                    });
                };
            });
        }, function ( e ) {
            callBackFail(params , e);
        } );
    }

    /**
     * 通讯录
     * @param params
     */
    function findContacts(params){
        params = params || {} ;
        window.plus.contacts.getAddressBook( window.plus.contacts.ADDRESSBOOK_PHONE , function (addressbook) {
            addressbook.find(["displayName","phoneNumbers"],function(contacts){
                callBackSuccess(params , contacts );
            }, function (err) {
                callBackFail(params , err);
            },{multiple:true});
        },function(e){
            callBackFail(params , e);
        });
    }


    /**
     * 创建下载任务
     * @param params
     * @param params.url 下载图片的路径
     * @returns {*}
     */
    function createDownload(params) {
        params = params || {} ;
        var fileUrl = params.url ;
        if(!fileUrl){
            alert('请输入下载文件的链接');
            return false ;
        }
        var dtask = window.plus.downloader.createDownload(fileUrl , {}, function(d, status){
            // 下载完成
            if(status == 200){
                txtFilePath = d.filename ;
                callBackSuccess(params ,  txtFilePath );
            } else {
                callBackFail(params , d );
            }
        });
        dtask.addEventListener("statechanged", function(download, status){
            if(download.state == 3){
                var percent = parseFloat(download.downloadedSize / download.totalSize * 100).toFixed(2) ;
                if(typeof params.onProgress == 'function'){
                    params.onProgress( dtask.downloadedSize , dtask.totalSize , percent + "%" );
                }
            }
        }, false);
        dtask.start();
        return dtask ;
    }

    function showToast(title){
        window.plus.nativeUI.toast(title);
    }

    function uploadFile(params){
        params = params || {} ;
        if(!params.url){
            showToast("请填写上传地址");
            return false ;
        }
        if(!params.filePath){
           showToast("请填写上传文件的本地路径");
           return false ;
        }
        if(!params.name){
           showToast("请填写上传文件对应的key参数");
           return false ;
        }
        var paramOption = params.options || {} ;
        var options = {
            method : "POST" ,
            blocksize : 102400 ,
            priority : 100 ,
            timeout : 120 ,
            retry : 3 ,
            retryInterval : 30
        };
        for(var key in paramOption){
            options[key] = paramOption[key] ;
        }

        var task = window.plus.uploader.createUpload( params.url , options ,
            function ( t, status ) {
                // 上传完成
                if ( status == 200 ) {
                    try{
                        callBackSuccess(params , JSON.parse(t.responseText) );
                    }catch(e){
                        callBackSuccess(params , t.responseText );
                    }
                } else {
                    callBackFail(params , t) ;
                }
            }
        );
        var addFileOption = {
            key : params.name
        };
        if(params.mimeType){
           addFileOption['mime'] = params.mimeType ;
        }

        var addSuccess = task.addFile( params.filePath , addFileOption );
        if(addSuccess == false){
            callBackFail({code : -1 , message : "指定的文件路径不合法或文件不存在"});
            return false ;
        }
        var formData = params.formData || {} ;
        for( var key in formData ){
            task.addData(key , formData[key]);
        }

        var header = params.header || {} ;
        for(var key in header){
            task.setRequestHeader( key , header[key] );
        }
        task.addEventListener( "statechanged" , function(){
              if(typeof params.onProgress == 'function'){
                  var percent = parseFloat(task.uploadedSize/ task.totalSize * 100 ).toFixed(2) ;
                  params.onProgress( task.uploadedSize , task.totalSize , percent + "%" );
              }
        }  , false );

        task.start();

        return task ;
    }

    function chooseImgToScan(params){
        params = params || {} ;
        window.plus.gallery.pick( function(path){
            window.plus.barcode.scan( path , function(type,result) {
                callBackSuccess(params , result);
            }, function(e){
                callBackFail(params , e) ;
            } );
        }, function ( e ) {
            callBackFail(params , e);
        }, {filter:"image" , system : false } );
    }



// 创建Barcode扫码控件
    var barcode = null ;
    function createBarcode(params) {
        params = params || {} ;
        var defaultStyle = {
            background : '#000',
            frameColor : '#07c160',
            scanbarColor : '#07c160' ,
            top:'100px',
            left:'0px',
            width: '100%',
            height: '500px',
            position: 'static'
        };
        var paramsStyle = params.style || {};
        for(var key in paramsStyle){
            defaultStyle[key] = paramsStyle[key] ;
        }
        if(!barcode){
            barcode = window.plus.barcode.create('barcode', [window.plus.barcode.QR], defaultStyle );
            barcode.onmarked = function(text , result){
                callBackSuccess(params , result);
                closeBarcodeComponent();
            };
            barcode.onerror = function(err){
                callBackFail(params , err );
                closeBarcodeComponent();
            };
            window.plus.webview.currentWebview().append(barcode);
        }
        barcode.start();
    }

    function closeBarcodeComponent(){
        if(!barcode){
            alert('尚未开始扫码');
        }
        barcode.close();
        barcode = null ;
    }

    function captureImage(params){
        params = params || {} ;
        var cmr = window.plus.camera.getCamera();
        var res = cmr.supportedImageResolutions[0];
        var fmt = cmr.supportedImageFormats[0];
        cmr.captureImage( function( path ){
                callBackSuccess(params , path );
            },
            function( error ) {
                callBackFail( params , error );
            },
            {resolution:res,format:fmt}
        );
    }

    function getLocation(params){
        console.log( window.plus, 2222)
        window.plus.geolocation.getCurrentPosition(function(p){
            callBackSuccess(params , p);
        }, function(e){
            callBackFail(params , e);
        } );
    }

    function setStorage(key , value){
        window.plus.storage.setItem(key, value);
    }

    function getStorage(key){
        return window.plus.storage.getItem(key);
    }


    /**
     * 从相册选择图片
     * @param params
     * @param params.count 最多选择的数量，不填则为不限制
     * @return 选择一张图片时返回图片路径，多张时返回数组
     */
    function galleryImg(params) {
        params = params || {} ;
        params['count'] = params.count || 'Infinity' ;
        // 从相册中选择图片
        window.plus.gallery.pick( function(res){
            var files = res.files ;
            if(!!files && files.length == 1){
                callBackSuccess(params , files[0]);
            }else{
                callBackSuccess(params , files);
            }
        }, function ( e ) {
            callBackFail(params , e);
        }, {filter:"image" ,multiple:true ,maximum : params.count , system : false , onmaxed : function(){
            window.plus.nativeUI.alert('最多只能选择'+ params.count +'张图片');
        }});
    }


    /**
     * 写入base64图片
     * @param dataUrl
     * @param params
     * @param success
     */
    function loadBase64(dataUrl , params , success){
        var b = new window.plus.nativeObj.Bitmap();
        b.loadBase64Data(dataUrl);
        var fileType = dataUrl.indexOf('png') > -1 ? ".png" : ".jpeg" ;
        var fileName = new Date().getTime() + fileType ;
        b.save('_www/' + fileName ,{overwrite:true},function(){
            success('_www/' + fileName);
        },function(err){
            callBackFail(params , err);
        });
    }


    // 保存图片到相册中
    function savePicture(params) {
        params = params || {} ;
        var filePath = params.filePath ;
        if(!filePath){
           alert("请传入要下载的图片路径");
           return false ;
        }
        if(filePath.indexOf('data:image/') == 0){

            loadBase64(filePath , params , function(localFilePath){
                window.plus.gallery.save( localFilePath , function (e) {
                    callBackSuccess(params , e.file );
                }, function (e) {
                    callBackFail(params , e);
                });
            });

        }else{

            createDownload({
                url : filePath ,
                success : function(path){
                    window.plus.gallery.save( path , function (e) {
                        callBackSuccess(params , e.file );
                    }, function (e) {
                        callBackFail(params , e);
                    });
                },
                fail : function(err){
                    callBackFail( params , err) ;
                }
            });

        }
    }

    window.ms = {
        scanCode : createBarcode ,
        closeBarcode : closeBarcodeComponent ,
        scanFromGallery : chooseImgToScan ,
        onAppShow : onAppShow ,
        getLocation : getLocation ,
        getContacts : findContacts ,
        takePhoto : captureImage ,
        chooseImage : galleryImg ,
        saveImage  : savePicture ,
        downloadFile : createDownload ,
        readTxtFile : readTxtFile ,
        setStorage : setStorage ,
        getStorage : getStorage ,
        wxShare : openShare ,
        uploadFile : uploadFile ,
        wxPay : wxPay ,
        alipay : alipay
    } ;

})();

