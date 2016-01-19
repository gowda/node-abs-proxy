var expect = require('Chai').expect;
var request = require('request');
var http = require('http');
var $ = require('cheerio');
var absProxy = require('../index');
var server;

describe('With http://httpbin.org, override', function() {
    describe('GET /', function() {
        var TEST_MESSAGE = "test message";
        before(function() {
            var proxy = absProxy
                .createAbsProxy({host: 'httpbin.org', port: 80});
            proxy.onGet('/', function(req, res) {
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end(TEST_MESSAGE);
            });

            server = http.createServer(function(req, res) {
                proxy.dispatch(req, res);
            }).listen(8080, 'localhost');
        });

        after(function() {
            server.close();
        });

        it('should return 200', function(done) {
            this.timeout(5000);
            var options = {
                url: 'http://localhost:8080',
                headers: {
                    'Content-Type': 'text/plain'
                }
            };

            request.get(options, function(err, res, body) {
                expect(res.statusCode).to.equal(200);
                done();
            });
        });

        it('should contain the body from override', function(done) {
            this.timeout(5000);
            var options = {
                url: 'http://localhost:8080',
                headers: {
                    'Content-Type': 'text/plain'
                }
            };

            request.get(options, function(err, res, body) {
                expect($('body', body).text())
                    .to.equal(TEST_MESSAGE);
                done();
            });
        })
    });
});