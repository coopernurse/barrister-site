---
layout: default
title: Barrister RPC - Documentation
---

# Documentation

## Writing an IDL file

Fundamentally Barrister is simply a way to describe meta information about a system.  You express
this information in an interface defintion language (IDL) file.  Barrister takes this file and
generates a JSON representation of the file that the runtime language bindings use.  Static 
languages may also provide a code generator so that clients and servers may benefit from compile
time type checking.

### Example

Here's a simple IDL example that uses all the primitive types and entities available.

    struct Response {
        // in milliseconds
        elapsedTime int
    }
    
    struct HelloResponse extends Response {
        hello string
    }
    
    // sorry if your favorite lang isn't here!
    enum Language {
        java
        csharp
        python
        ruby
        javascript
    }
    
    struct GitHubProject {
        id        int
        owner     string
        name      string
        language  Language
        isPrivate bool
    }
    
    interface ExampleService {
        // returns the word "hello"
        sayHello() HelloResponse
        
        // adds all the numbers together
        addInts(nums []int) int
        addFloats(nums []float) float
        
        // stores this project in a db
        // returns the generated ID
        storeProject(project GitHubProject) int
    }

----

### Types

Barrister supports four primitive types:

* string
* bool
* int
* float

### Structs

You may define your own types by declaring a `struct`

    struct Person {
        firstName string
        email     string
    }
    
Notice that the type comes after the identifier (like in SQL or Go).

Structs can extend each other.  The child struct inherits all fields from its ancestors.

    struct A {
        x   string
    }
    
    // has fields x and y
    struct B extends A {
        y   string
    }
    
    // has fields x, y, and z
    struct C extends B {
        z   string
    }
    
But you **cannot** redeclare a field that one of your ancestors defined:

    struct Animal {
        type string
    }
    
    // INVALID!!
    struct Cat extends Animal {
        type int
    }
    
Structs may use other structs as field types, but circular references are *not* allowed:

    
    struct Animal {
        color Color
    }
    
    struct Color {
        name string
        
        // INVALID!
        animalsWithThisColor []Animal
    }
    
### Enums

Enums are marshaled as string values, so choose good names.  Enums may be used in structs,
function parameters, and return types.

    enum Colors {
        blue
        black
        red
    }

### Arrays

Types may be declared as arrays.  Simply put `[]` before the type.

    struct Book {
        categoryIds []int
    }

### Interfaces

Each IDL file may define one or more interfaces.  An interface is a collection of functions.

### Functions

Functions have a name, zero or more parameters, and a return type.  Parameters have a name, and 
a type.  Parameters and return types may optionally be declared as arrays.

### Comments

Comments are preceeded by double slashes `//`.  Comments immediately above an interface, struct,
enum, or function are included in the generated IDL JSON so that clients can expose them at 
runtime.  

Comments may contain [Markdown](http://daringfireball.net/projects/markdown/syntax).  When the
HTML documentation is generated, the Markdown will be converted to HTML.

Use a blank line to separate sections in the generated HTML output.

----

## Running Barrister

Use the `barrister` tool to convert your IDL into JSON and HTML representations.

First [download and install](download.htm) barrister using `pip`

Then run Barrister.  A common invocation looks like this:

    barrister -t "My Awesome Interface" -d awesome.html -j awesome.json awesome.idl
    
This will take `awesome.idl` as input and write `awesome.html` and `awesome.json` using
"My Awesome Interface" as the title and H1 tag in the HTML file.

If your IDL has a syntax error, the error message will be displayed.

To get a complete list of options, run:  `barrister -h`

That's honestly about all there is to it.  Once you have the JSON file, you're ready to start
writing some clients and servers.

----

## Runtime Considerations

### Errors

Barrister uses [JSON-RPC 2.0](http://jsonrpc.org/specification) messages, which defines a 
standard way to express errors.

JSON-RPC errors have 3 elements:

* code - An integer that identifies the error.  You can use any numbers you wish.  JSON-RPC reservers some negative numbers for internal errors, but if you stick with postitive integers you'll be fine.
* message - A human readable string that describes the error
* data - An opaque payload that provides more information about the error.  If you provide this element, please use primitive types, a list of primitives, or a map of string/primitives.  This ensures that the marshaling layer will properly encode the data, as it is not governed by the IDL format.

In practice, each Barrister language binding will provide a way to raise errors.  For example, 
the Python binding provides a `RpcException` class:

{% highlight python %}
    def myFunction(self, a, b):
        if a < 1:
            raise barrister.RpcException(100, "myFunction.a must be >= 1")
{% endhighlight %}

Please view the documentation for your language binding for more information on how to send
errors (in servers) or catch errors (in clients).

