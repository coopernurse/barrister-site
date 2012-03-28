#!/usr/bin/env python

from flask import Flask, request, make_response
import barrister
import sys
import json

class Calculator(object):

    def add(self, a, b):
        return a+b

    def subtract(self, a, b):
        return a-b

app = Flask(__name__)

server = barrister.Server(barrister.contract_from_file(sys.argv[1]))
server.add_handler("Calculator", Calculator())

@app.route("/calc", methods=["POST"])
def calc():
    req = json.loads(request.data)
    resp_data = server.call(req)
    resp = make_response(json.dumps(resp_data))
    resp.headers['Content-Type'] = 'application/json'
    return resp

app.run(host="127.0.0.1", port=8080)
