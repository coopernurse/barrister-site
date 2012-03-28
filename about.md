---
layout: default
title: Barrister RPC - About
---

## Why

A variety of forces are conspiring to make distributed systems more and more commonplace.  
Consequently we need a way to express the interfaces between the components in our
systems.  

Ideally this tool would:

* Provide uniform semantics across all supported languages
* Produce human readable documentation of the interface
* Produce a computer readable description of the interface
* Exploit the advantages of the host language, be it static or dynamic
  * Dynamic languages should be able to produce proxy clients from the interface without a code generation step
  * Static languages may generate code from interfaces to allow static compilation of servers and clients
* Work over HTTP by default, but allow plugable transports
  * ZeroMQ, Redis, and AMQP are all interesting possibilities for the future
* Serialize via JSON by default, but allow plugable serialization
  * [MessagePack](http://msgpack.org) is one possibility, as it maps cleanly to JSON data types

My hope is that Barrister becomes a tool that fulfills these requirements.

## Roadmap

Barrister currently provides a way to express a type system for an interface and validate that
requests and responses comply with that type system.  Future possibilities for development include:

* Validation
  * Enhance the IDL to allow expression of required fields, min/max values, regexp, etc
  * JSON Schema is one possibility, although it's a huge spec
* More transports and serialization formats
  * Main motivation would be performance.  HTTP/JSON works well for public APIs, but if you want to route requests internally behind a firewall, you might want something faster.

## Who are You?

I'm James Cooper of Seattle, WA.  I do freelance hacking as [bitmechanic](http://bitmechanic.com/).
Nice to meet you.
