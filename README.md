# Darwin-Backend
The Backend built on Node for Darwin App  
Please run by  
```
npm start
```
By redirecting port 80 to custom port:
```
sudo iptables -t nat -I PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 3000
```
