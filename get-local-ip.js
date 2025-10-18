import os from 'os';

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // 跳过内部地址和非IPv4地址
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return 'localhost';
}

const localIP = getLocalIP();
console.log('\n🌐 本地IP地址:', localIP);
console.log('📱 手机访问地址:', `http://${localIP}:5173`);
console.log('\n📋 使用步骤:');
console.log('1. 确保手机和电脑在同一WiFi网络');
console.log('2. 运行: npm run dev');
console.log('3. 在手机浏览器中访问上面的地址');
console.log('\n⚠️  注意事项:');
console.log('- 确保防火墙允许5173端口');
console.log('- 如果无法访问，请检查路由器设置');
console.log('- 某些企业网络可能阻止设备间通信\n');
