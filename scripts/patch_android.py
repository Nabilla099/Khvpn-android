import pathlib
m = pathlib.Path('android/app/src/main/AndroidManifest.xml'); s = m.read_text()
svc = '<service android:name=".KhVpnService" android:permission="android.permission.BIND_VPN_SERVICE" android:exported="false" android:foregroundServiceType="systemExempted"><intent-filter><action android:name="android.net.VpnService"/></intent-filter></service>\n'
perm = ''.join(f'<uses-permission android:name="android.permission.{p}"/>\n' for p in ['FOREGROUND_SERVICE', 'FOREGROUND_SERVICE_SYSTEM_EXEMPTED', 'POST_NOTIFICATIONS', 'ACCESS_NETWORK_STATE'])
assert '</application>' in s and '<application' in s
s = s.replace('</application>', svc + '</application>', 1).replace('<application', '<application android:extractNativeLibs="true"', 1).replace('</manifest>', perm + '</manifest>', 1)
m.write_text(s)
g = pathlib.Path('android/app/build.gradle'); t = g.read_text()
assert 'dependencies {' in t and 'android {' in t
t = t.replace('dependencies {', "dependencies {\n    implementation 'org.connectbot:sshlib:2.2.+'", 1)
t = t.replace('android {', "android {\n    packagingOptions { jniLibs { useLegacyPackaging = true } }", 1)
g.write_text(t)
print('patched')
