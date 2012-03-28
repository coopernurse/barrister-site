---
layout: default
title: Barrister RPC - Binding Dev Guide
---

## Binding Dev Guide

Thanks for your interest in writing a new language binding for Barrister.  This guide outlines
some things to keep in mind while writing your binding.

## Considerations

* Requests and responses are encoding using the [JSON-RPC 2.0](http://jsonrpc.org/specification) format.  Take a moment to familiarize yourself with that document.
* Should be hosted on GitHub so that we have a common hosting infrastructure for all bindings
* Should include a README that includes:
  * How to install the binding -- ideally using the language package manager if one exists
  * An example of how to write a client
  * An example of how to write a server
* Should include doc strings for all public classes/functions
* Should pass the conformance test suite (see below)

### Type Validation

* Client and server code should validate that request / response payloads match the type definitions specified in the IDL
* JSON-RPC error codes should be used to express errors. For example, invalid params passed to the server should result in an error with code=-32602
* Null values should be permitted, as some applications may rely on them semantically.  A future iteration of the Barrister IDL may provide a way to express whether a given parameter or field is required.

### Client

* Provide a HTTP transport that given an URL, loads the IDL contract for that endpoint
  * Send a request to the endpoint with the method: `barrister-idl`
* Ideally provides an "in process" transport that skips the serialization code but still performs type validation.
* Provide batch support so that clients can invoke multiple methods in a single RPC call
  * Clients are responsible for correlating the responses with the requests based on ID

### Server

* Provide a way to associate interface implementations with a given IDL
* Provide a transport independent dispatching mechanism that parses the JSON-RPC request and invokes the correct method on the registered interface implementation
* Implement the `barrister-idl` method, which returns the IDL JSON associated with the server instance
* Provide batch support.  Per the JSON-RPC spec, servers **may** parallelize execution of individual requests in the batch, but are not required to.

### Code Generation

* If the language is static, we encourage you to provide a command line code generator that takes a IDL JSON file as input and produces stubs for that interface
  * See the `barrister-java` implementation as an example
  * Interfaces, Structs, and Enums should all be supported
  * Consider writing the comments in the IDL as comments in the generated source code that match the convention of the host language (e.g. Javadoc style for Java)

## Conformance Tests

In the [python tree](https://github.com/coopernurse/barrister/tree/master/conform) there is a 
conformance test that runs all the clients and servers against each other in a pair-wise fashion 
using a common text input file.  The output from each client is checked and any anomolies are
logged as failures.

Each language runtime needs to provide a client and server implementation that can be run by the
test suite.  Look at the python code as a reference:

* `client.py` - Conformance test client
  * Is passed two command line arguments:
    * Path to input file: `conform.in`
    * Path to output file to write to
  * Initializes a HTTP client against `localhost:9233`
  * Opens input file and for each line:
    * Skips blank lines or comment lines
    * Splits line on pipes. See conform.in for a description fo the columns in the file.
    * Executes the method against the server
    * If result is ok, logs the `result`
    * If result is rpcerr, logs the `error.code`
  * Closes output file and exits

* `flask_server.py` - Conformance test server.
  * Implements the `A` and `B` interfaces defined in conform.idl/conform.json.  
  * Binds HTTP server to `localhost:9233`
  * Binds Barrister server to `/` URL
  * Binds a separate handler to `/exit` URL which is triggered by test suite
    * Server should exit when this URL is hit
  * No other magic in the server impl.  Should simply execute the calls made against it.
    * Some requests are intentionally invalid, so server should reject them with the correct error codes.
    
To add your implementation to the suite:

* Open `conform_test.py`
* Add the client to the `clients` block which starts around line 39
  * Format:  `[ "name", [ "command", "line", "to", "start", "client" ] ]`
* Add a new test method to the `ConformTest` class
  * See `test_python_server` as an example
  * Should provide a `cmd` array that can start the server
  * Can optionally sleep for x seconds to give server time to start and bind to port
* To run: `python conform_test.py`
  * The conformance test will run each client against each server
  * Any output from the clients that deviates from the expectation in `conform.in` will trigger a failure
