const winston = require('winston');
const path = require('path');

module.exports = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    // hiển thị log thông qua console
    new winston.transports.Console(),
    // Thiết lập ghi các errors vào file 
    new winston.transports.File({
      level: 'error',
      filename: path.join(__dirname, 'errors.log')
    })
  ],
})