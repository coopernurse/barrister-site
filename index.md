---
layout: default
title: Barrister RPC
---

## Polyglot RPC Made Simple

 * Define your interface in a human readable IDL
 * Run `barrister` to convert IDL to JSON and produce [docco style HTML docs](http://jashkenas.github.com/docco/) for your interface
 * Write your server implementation
 * Consume it
  
## Barrister in 3 minutes

Say you write a file called `calc.idl`:

{% highlight go %}
    //
    // The Calculator service is easy to use.
    //
    // Examples
    // --------
    //
    //     x = calc.add(10, 30)
    //     # x == 40
    //
    //     y = calc.subtract(44, 10)
    //     # y == 34

    interface Calculator {
        // Adds two numbers together and returns the result   
        add(a float, b float) float
        
        // Subtracts b from a and returns the result
        subtract(a float, b float) float
    }
{% endhighlight %}

And then you run: `barrister -t "Calculator Interface" -d calc.html -j calc.json calc.idl`

You will have:

 * [A human readable interface doc](calc.html)
 * [A computer readable JSON file](calc.json)

Next you implement your calculator server.  Perhaps you write it in Python with Flask:

{% highlight python %}
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
{% endhighlight %}

You start the server and pass in the JSON parsed IDL: `python calc_server.py calc.json`

Then you write a client:

{% highlight python %}

    #!/usr/bin/env python
    
    import barrister
    import sys
    
    trans  = barrister.HttpTransport(sys.argv[1])
    client = barrister.Client(trans)
    
    print "1+5.1=%.1f" % client.Calculator.add(1, 5.1)
    print "8-1.1=%1.f" % client.Calculator.subtract(8, 1.1)

{% endhighlight %}

When you run the client: `python calc_client.py http://localhost:8080/calc`

You get:

    1+5.1=6.1
    8-1.1=7

## Nifty, now what?

 * [Download](download.html) Barrister and install it
 * Try writing some IDL files to get comfortable with the syntax
 * Join the [mailing list](https://groups.google.com/forum/#!forum/barrister-rpc)
 * [Contribute](contribute.html) to the project by writing a [new language binding](binding.html), a blog article, or a demo app

## Supported languages

* Python
* Java (with code generator)
* Javascript (client only)

We need your help!  Please [join the mailing list](https://groups.google.com/forum/#!forum/barrister-rpc) and talk to us about writing a runtime for
your favorite language.  We have a conformance test suite that we'd like to get all the runtimes
running under to ensure common behavior.
