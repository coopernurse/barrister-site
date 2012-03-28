---
layout: default
title: Barrister RPC - Download
---

# Download Barrister

The Barrister parser, which converts the IDL file into JSON/HTML is written in Python. 
Regardless of what language you write your clients/servers in, you'll probably want to install
this package so you can translate your `.idl` files.  Once you have the `.json` file for your
IDL, you can copy that around into any server projects that implement it.  Your client and 
server programs only need the language binding for the language they're written in.

Python ships with an `easy_install` utility that knows about the main 
[Python Package Index](http://pypi.python.org/pypi).  Unfortunately it doesn't know how to 
do things like uninstall, so we encourage using [pip](http://pypi.python.org/pypi/pip).  

To install pip, run:  `easy_install pip`

Then: `pip install barrister`

At that point you should be able to run: `barrister -h`

# Download Language Bindings

The GitHub project for each language includes more detailed information on how to write 
clients and servers using the binding.

#### Python - [https://github.com/coopernurse/barrister](https://github.com/coopernurse/barrister)

The `barrister` package described above contains the runtime bindings, so that's all you need.


#### Java - [https://github.com/coopernurse/barrister-java](https://github.com/coopernurse/barrister-java)

