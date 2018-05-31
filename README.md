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
Getting the api by requesting to the url: http://ec2-18-219-52-58.us-east-2.compute.amazonaws.com/api_name

Getting the api in test server by requesting to: http://ec2-13-59-228-81.us-east-2.compute.amazonaws.com/api_name
