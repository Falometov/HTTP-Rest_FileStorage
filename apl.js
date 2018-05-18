const express = require('express')
const bodyParser = require('body-parser')
const app = express();
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const morgan = require('morgan');

let IpAdress = '0.0.0.0';

// app.use(morgan('dev'));
var os = require('os');
var ifaces = os.networkInterfaces();

Object.keys(ifaces).forEach(function (ifname) {
    ifaces[ifname].forEach(function (iface) {
        if ('IPv4' !== iface.family || iface.internal !== false) {
            return;
        }
        if (ifname === "Беспроводная сеть" || ifname === "Ethernet") {
            IpAdress = iface.address;
        }
    });
});
console.log(IpAdress);


app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())
app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', '*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
function fileList(dir) {
    return fs.readdirSync(dir).reduce(function (list, file) {
        var name = path.join(dir, file);
        var isDir = fs.statSync(name).isDirectory();
        const items = list.concat(isDir ? fileList(name) : [name]);
        return items
    }, []);
}

app.use(express.static(__dirname + "/"));


app.get("/", function (request, response) {
    if (request.query.down === "true") {
         fs.createReadStream(request.query.data).pipe(response);
        return;
    }
    let dataArray = [];
    let arrayOffileDir = fs.readdirSync(request.query.data);
    for (let i = 0; i < arrayOffileDir.length; i++) {
        let value = "";

        var stats = fs.statSync(request.query.data + "/" + arrayOffileDir[i]);
        if (!stats.isDirectory()) {
            value = fs.readFileSync(request.query.data + "/" + arrayOffileDir[i], "utf8");
        }
        dataArray.push({
            nameFile: arrayOffileDir[i],
            valueFile: value
        });
    }
    response.send(dataArray);
});
app.put("/", function (request, response) {
    let dataReq = JSON.parse(request.query.data);
    fs.writeFile(dataReq.nameFile, dataReq.valueFile, function (err) {
    });
    response.send(true);
});
app.post("/", function (request, response) {
    let dataReq = JSON.parse(request.query.data);
    fs.appendFile(dataReq.nameFile, dataReq.valueFile, function (err) {
    });
    response.send(true);

});
app.delete("/", function (request, response) {
    if (request.query.data.includes(".")) {
        fs.unlink(request.query.data, function (err) {
        });
    } else {
        rimraf(request.query.data, function () { console.log('done'); });
    }
    response.send(true);
});
app.copy("/", function (request, response) {
    let dataReq = JSON.parse(request.query.data);
    fs.writeFile(dataReq.pathTo + dataReq.nameFile, dataReq.valueFile, function (err) {
    });
    response.send(true);
});
app.move("/", function (request, response) {
    let dataReq = JSON.parse(request.query.data);
    fs.writeFile(dataReq.pathTo + dataReq.nameFile, dataReq.valueFile, function (err) {
    });
    if (dataReq.pathFrom.includes(".")) {
        fs.unlink(dataReq.pathFrom, function (err) {
        });
    } else {
        rimraf(dataReq.pathFrom, function () { console.log('done'); });
    }
    response.send(true);
});


app.listen(3000, "0.0.0.0");