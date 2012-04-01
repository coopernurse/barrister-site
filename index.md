---
layout: default
title: Barrister RPC
---

## Polyglot RPC Made Easy

* Define your interface in a human readable IDL
* Run `barrister` to convert IDL to JSON and produce [docco style HTML docs](http://jashkenas.github.com/docco/) for your interface
* Write your server implementation
* Consume it
  
## What's it good for?

Consider Barrister whenever you're developing a web service that you want to expose internally or 
externally.  My goal is to provide some of the type safety you get with tools like SOAP, Thrift,
or Protocol Buffers, but with less tooling.  For example, Barrister doesn't require code generation for
dynamic languages, but can optionally generate code for languages like Java that benefit from compile
time checks.

RPC calls are encoded as [JSON-RPC 2.0](http://jsonrpc.org/specification) requests/responses.

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

 * `calc.html` - [A human readable interface doc](calc.html)
 * `calc.json` - [A computer readable JSON file](calc.json)

Next you implement your calculator server.  Perhaps you write it in Python with Flask:

{% highlight python %}
    #!/usr/bin/env python

    from flask import Flask, request, make_response
    import barrister
    import sys

    # Our implementation of the 'Calculator' interface in the IDL
    class Calculator(object):

        # Parameters match the params in the functions in the IDL
        def add(self, a, b):
            return a+b

        def subtract(self, a, b):
            return a-b

    app = Flask(__name__)

    # Load the 'calc.json' file and parse it
    contract = barrister.contract_from_file(sys.argv[1])
    
    # Create a server to wrap this contract
    server = barrister.Server(contract)
    
    # Bind an instance of our class to the "Calculator" interface
    server.add_handler("Calculator", Calculator())

    # This is standard Flask stuff.  Create a function
    # bound to the "/calc" URL that only accepts POSTs
    # The implementation is boilerplate for any Barrister server
    @app.route("/calc", methods=["POST"])
    def calc():
        # server.call_json will deserialize its JSON input,
        # invoke the function on the correct Python handler class,
        # and serialize the return value back to JSON
        resp_data = server.call_json(request.data)
        
        # Send the response back to the client
        resp = make_response(resp_data)
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
    
    # Create a transport and pass in the endpoint that
    # the server is bound to
    trans  = barrister.HttpTransport(sys.argv[1])
    
    # Create a Barrister client. This will automatically
    # request the IDL JSON from the server, parse it, and
    # create proxies for the interfaces/functions defined
    # in the interface
    client = barrister.Client(trans)
    
    # Call functions on remote server
    # Note how Calculator.add is derived from the IDL names
    print "1+5.1=%.1f" % client.Calculator.add(1, 5.1)
    print "8-1.1=%.1f" % client.Calculator.subtract(8, 1.1)

{% endhighlight %}

When you run the client: `python calc_client.py http://localhost:8080/calc`

You get:

    1+5.1=6.1
    8-1.1=6.9
    
## Under the hood

When this code executes: `client = barrister.Client(trans)`

A JSON-RPC message is POSTed to `http://localhost:8080/calc` that looks like:

    { "jsonrpc": "2.0", "id": "1", "method": "barrister-idl" }
    
The server sends back the IDL JSON registered with the `server = barrister.Server(contract)` call.
The response looks something like:

    { "jsonrpc": "2.0", "id": "1", "result": { ... idl json here ... } }
    
The client parses the IDL JSON and uses it to validate outgoing requests against that endpoint.

When this code executes: `client.Calculator.add(1, 5.1)`

A JSON-RPC message is POSTed to `http://localhost:8080/calc` that looks like:

    { "jsonrpc": "2.0", "id": "uuid-4-here", "method": "Calculator.add", "params": [1, 5.1] }
    
The server unpacks the JSON, verifies that the method exists, and validates that the parameter types
agree with the types defined for the `add()` function on the `Calculator` interface in the IDL.  If 
validation passes, the method is invoked, and the result is returned as a JSON response that looks like:

    { "jsonrpc": "2.0", "id": "id-from-request", "result": 6.1 }

If an error occurs, an `error` property replaces the `result`:

    { "jsonrpc": "2.0", "id": "id-from-request", 
      "error" : { "code": -32601, "message": "Unknown function: Calculator.multiply" } }
      
Theoretically you could use any JSON-RPC 2.0 client to consume a Barrister service, but you'd lose
the request/response validation.

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
