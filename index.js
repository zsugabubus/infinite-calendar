'use strict';

const http = require('http');
const ws = require('ws');
const fs = require('fs');

require('./DateUtils.js');
const Event = require('./Event.js');

const JsonDB = require('node-json-db');
const db = new JsonDB("events", true, false);

http.createServer((req, res) => {

    res.writeHead(200, {'Content-Type': 'text/html'});

    let path = __dirname + req.url.split('#')[0];

    try {

        if (fs.lstatSync(path).isFile()) {
            fs.readFile(path, (err, data) => {
                if (!err) {
                    res.end(data);
                } else {
                    res.end(err);
                }
            });
        } else {
            fs.readdir(path, (err, files) => {
                if (!err) {
                    res.write(`<a href="/..">..</a><br/>`);
                    for (let file of files) {

                        res.write(`<a href="./${file}${(fs.lstatSync(file).isFile() ? "" : "/")}">${file}</a><br/>`);
                    }
                } else {
                    res.write(err);
                }
                res.end();
            });
        }

    } catch (e) {
        res.end();
    }
}).listen(3000, () => {

});
console.log('Webserver is running on http://127.0.0.1:3000/.');


const wss = new ws.Server({host: undefined, port: 8080});

wss.on('connection', function(client) {

    function S(obj) {
        client.send(JSON.stringify(obj));
    }

    client.data = {
        viewStart: 0, viewEnd: 0
    };

    client
        .on('message', function(data) {

            var data = JSON.parse(data);

            switch (data.op) {
                case "create":
                {

                    var evt = data.event;

                    evt.id = (Math.random() * 0x7FffFFff) ^ (Math.random() * 0x7FffFFff);

                    evt.about = evt.about.toString() || "[hory]";

                    let d = db.push("/events[]", evt);

                    let newEventMsg = JSON.stringify({op: "events", event: evt});
                    wss.clients.forEach(function(clnt) {
                        clnt.send(newEventMsg);
                    });

                }
                    break;
                case "remove":
                {
                    let events = db.getData("/events");
                    let i;
                    for(i in events) {
                        if(events[i].id === data.id) break;
                    }

                    db.delete("/events[" + i + "]")
                }
                    break;
                case "get":
                {

                    let startDate, endDate;
                    if (data.viewStart > 0 && data.viewEnd > 0) {
                        startDate = new Date((client.data.viewStart = data.viewStart));
                        endDate = new Date((client.data.viewEnd = data.viewEnd));
                    } else {
                        client.data.viewStart = 0;
                        client.data.viewEnd = 0;
                        return;
                    }

                    let occuredEvents = [];
                    for (let eventData of db.getData("/events")) {
                        let event = new Event(eventData);
                        if (event.getOccures(startDate, endDate, NaN))
                            occuredEvents.push(eventData);
                    }

                    S({op: 'events', events: occuredEvents});

                    occuredEvents = null;

                    let infos = [];
                    
                    for (; startDate <= endDate; startDate.addDays()) {
                        let dayInfos = {};
                        const Q = (startDate.getUTCMonth() + 1) * 100 + startDate.getUTCDate();

                        const Y = startDate.getUTCFullYear();
                        const isLeapYear = startDate.isLeapYear();

                        for (let holiday of db.getData("/holidays")) {

                            const q = typeof holiday[1] === "number" ? holiday[1] : eval(holiday[1])(Y);

                            if (q % 1e4 === Q) {
                                dayInfos.holiday = {"name": holiday[0], "isPublicHoliday": q >= 1e4};
                                break;
                            }

                        }

                        for (let name of db.getData("/namedays")) {

                            const q = name[0];
                            if (q + +(isLeapYear && q >= 224 && q <= 228) === Q) {
                                dayInfos.names = name[1];
                                break;
                            }

                        }

                        infos.push(dayInfos);

                    }

                    S({op: 'infos', infos: infos});
                    infos = null;

                }
                    break;
                default:
                    console.log("unknown op: " + data.op);
            }

        })
        .on('close', function(code, reason) {

        });

});


