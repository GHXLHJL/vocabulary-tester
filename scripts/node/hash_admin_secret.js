const crypto = require('crypto');

const secret = process.argv[2];

if (!secret) {
    console.error('用法: node scripts/node/hash_admin_secret.js "你的管理员长密钥"');
    process.exit(1);
}

const hash = crypto.createHash('sha256').update(secret, 'utf8').digest('hex');

console.log(hash);
