function _getAndroidApps() {
  window.plus.android.importClass('java.util.ArrayList');
  window.plus.android.importClass('android.content.pm.PackageInfo');
  window.plus.android.importClass('android.content.pm.PackageManager');
  var ApplicationInfo = window.plus.android.importClass(
    'android.content.pm.ApplicationInfo'
  );
  var MainActivity = window.plus.android.runtimeMainActivity();
  var PackageManager = MainActivity.getPackageManager();

  var apk = window.plus.android.invoke(
    PackageManager,
    'getInstalledPackages',
    0
  );
  var apklist = [];
  if (apk != null) {
    for (var i = 0, l = apk.size(); i < l; i++) {
      var info = apk.get(i);
      var _thisapk =
        (info.plusGetAttribute('applicationInfo').plusGetAttribute('flags') &
          ApplicationInfo.FLAG_SYSTEM) !=
        0
          ? true
          : false;
      if (_thisapk == false) {
        const apkinfo = {
          appName: info
            .plusGetAttribute('applicationInfo')
            .loadLabel(PackageManager)
            .toString(),
          packageName: info.plusGetAttribute('packageName'),
          versionName: info.plusGetAttribute('versionName'),
          versionCode: info.plusGetAttribute('versionCode')
        };
        apklist.push(apkinfo);
      }
    }
  }
  // 返回所有的APP名称，包名，版本
  return apklist;
}

window._getAndroidApps = _getAndroidApps;
