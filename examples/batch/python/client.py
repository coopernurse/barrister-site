#!/usr/bin/env python

import barrister

trans  = barrister.HttpTransport("http://localhost:7667/batch")
client = barrister.Client(trans)

print client.Echo.echo("hello")
try:
    client.Echo.echo("err")
except barrister.RpcException as e:
    print "err.code=%d" % e.code

batch = client.start_batch()
batch.Echo.echo("batch 0")
batch.Echo.echo("batch 1")
batch.Echo.echo("err")
batch.Echo.echo("batch 2")
batch.Echo.echo("batch 3")

result = batch.send()
for i in range(result.count):
    try:
        print result.get(i)
    except barrister.RpcException as e:
        print "err.code=%d" % e.code

