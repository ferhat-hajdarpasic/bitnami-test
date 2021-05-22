pm2 start index.js --name "bitnami-test"
pm2 list
pm2 stop bitnami-test

POST /demo HTTP/1.1
Host: <host>:8080
Content-Type: application/json
Content-Length: 187

{
  "device": "410CBA",
  "time": "1609621205",
  "data": "1701001128000080070041e2",
  "data2": "1100300420a30000000000c7",
  "data3": "1100300420a30000000000c7",
  "seqNumber": "2283"
}