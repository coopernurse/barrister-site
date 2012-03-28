
function BarristerUI(rootElem) {
    var me = this;
    me.rootElem = rootElem;
    me.client = new BarristerClient();

    var html = "<div class='grid_3'><h3>Functions:</h3></div>";
    html += "<div class='grid_9'><div id='barrister-msg'></div></div>";
    html += "<div class='clear'></div>";
    html += "<div class='grid_3'><div id='barrister-ifaces'></div></div>";
    html += "<div class='grid_9'><div id='barrister-main'></div></div>";
    html += "<div class='clear'></div>";
    jQuery(rootElem).html(html);

    jQuery("#barrister-ui").delegate("a.barrister-func", "click", function() {
        var pos = this.href.lastIndexOf("#");
        var re = /iface-(\d+)-(\d+)/;
        var match = re.exec(this.href.substr(pos+1));
        var ifaceAndFunc = me.client.getFunctionByOffset(match[1], match[2]);
        me.showFunctionForm(ifaceAndFunc);
        return false;
    });
    jQuery("#barrister-ui").delegate("a.add-row", "click", function() {
        var pos = this.href.lastIndexOf("#");
        var name = this.href.substr(pos+1);
        var p = me.nameToType[name];
        var pClone = { name: p.name, type: p.type, is_array: false };
        var row = me.renderParamHtml(name + "-" + p.rows, pClone) + "<br />";
        p.rows++;
        jQuery(this).before(row);
        return false;
    });
    jQuery("#barrister-main").delegate("form", "submit", function() {
        var params = me.parseParams(this);  // this == submitted form
        var method = me.currentIface.name + "." + me.currentFunc.name;
        console.log("params: " + params);
        me.client.call(method, params, me.onErr, function(resp) {
            if (resp.result) {
                var html = "<h3>Result:</h3><pre>" + jQuery.toJSON(resp.result) + "</pre>";
                me.showMessage("info", me.currentFunc.name);
                jQuery("#barrister-result").html(html);
            }
            else if (resp.error) {
                me.onErr(resp.error.message);
            }
        });
        return false;
    });
}

BarristerUI.prototype.escapeHTML = function(s) {
   s = s.replace('&', '&amp;');
   s = s.replace('<', '&lt;');
   s = s.replace('>', '&gt;');
   s = s.replace('"', '&#34;');
   s = s.replace("'", '&#39;');
   return s;
};

BarristerUI.prototype.parseParams = function(form) {
    var me     = this;
    var params = me.currentFunc.params;
    var parsed = [ ];
    var i;
    
    var formValArr = jQuery(form).serializeArray();
    var formValMap = { };
    for (i = 0; i < formValArr.length; i++) {
        var v = formValArr[i];
        formValMap[v.name] = v.value;
    }
    
    for (i = 0; i < params.length; i++) {
        var key = "param-" + i;
        parsed.push(me.parseParam(key, formValMap, params[i]));
    }
    
    return parsed;
};

BarristerUI.prototype.parseParam = function(key, formValMap, field) {
    if (field.is_array) {
        var arr = [ ];
        var t = this.nameToType[key];
        var fieldClone = { name: field.name, type: field.type, is_array: false };
        var i;
        for (i = 0; i < t.rows; i++) {
            arr.push(this.parseParam(key+"-"+i, formValMap, fieldClone));
        }
        return arr;
    }
    else if (field.type === "string") {
        return formValMap[key];
    }
    else if (field.type === "int") {
        return parseInt(formValMap[key], 10);
    }
    else if (field.type === "float") {
        return parseFloat(formValMap[key]);
    }
    else if (field.type === "bool") {
        return formValMap[key] === "true" || formValMap[key] === "1";
    }
    else {
        var s = this.client.structs[field.type];
        if (s) {
            var m = { };
            this.addStructParams(key, formValMap, s, m);
            return m;
        }
        else {
            s = this.client.enums[field.type];
            if (s) {
                return formValMap[key];
            }
        }
    }
};

BarristerUI.prototype.addStructParams = function(key, formValMap, s, m) {
    var x;
    if (s['extends'] && s['extends'] !== "") {
        var parent = this.client.structs[s['extends']];
        if (parent) {
            this.addStructParams(key, formValMap, parent, m);
        }
    }
    for (x = 0; x < s.fields.length; x++) {
        m[s.fields[x].name] = this.parseParam(key + "-" + x, formValMap, s.fields[x]);
    }
};

BarristerUI.prototype.loadContract = function(url) {
    var me = this;
    this.client.loadContract(url, this.onErr, function() {
        var i, x;
        var html = "<ul>";
        var ifaces = me.client.interfaceNames;
        for (i = 0; i < ifaces.length; i++) {
            html += "<li>" + ifaces[i] + "<ul>";
            var iface = me.client.interfaces[ifaces[i]];
            var funcs = iface.functions;
            
            for (x = 0; x < funcs.length; x++) {
                var f = funcs[x];
                html += "<li><a class='barrister-func' href='#iface-" + i + "-" + x + "'>" + f.name + "</a></li>";
            }
            html += "</ul></li>";
        }
        html += "</ul>";
        
        jQuery("#barrister-ifaces").html(html);
        me.showMessage("info", "Contract loaded");
    });
};

BarristerUI.prototype.showFunctionForm = function(ifaceAndFunc) {
    this.currentFunc  = ifaceAndFunc.func;
    this.currentIface = ifaceAndFunc.iface;
    this.nameToType   = { };
    var f = this.currentFunc;
    var i;
    
    var html = "";
    if (f.comment) {
        html += "<p class='comment'>" + this.escapeHTML(f.comment) + "</p>";
    }
    html += "<form><table>";
    
    for (i = 0; i < f.params.length; i++) {
        html += this.renderParamRow("param-" + i, f.params[i]);
    }
    html += "</table>";
    html += "<input type='submit' value='Call Function' />";
    html += "</form>";
    html += "<div id='barrister-result'></div>";
    
    this.showMessage("info", f.name);
    jQuery("#barrister-main").html(html);
};

BarristerUI.prototype.renderParamRow = function(name, p) {
    this.nameToType[name] = p;
    var html = this.renderParamHtml(name, p);
    var type = p.type;
    if (p.is_array) {
        type = "array of " + type;
    }
    return "<tr><td><span class='pname'>" + p.name + "</span><span class='ptype'>" + type + "</span></td><td>" + html + "</td></tr>";
};

BarristerUI.prototype.renderParamHtml = function(name, p) {
    var html = null;
    var i;
    if (p.is_array) {
        p.rows = 0;
        html = "<a class='add-row' href='#" + name + "'>add array element</a>";
    }
    else if (p.type === 'string' || p.type === 'int' || p.type === 'float') {
         html = "<input type='text' name='" + name + "'></input>";
    }
    else if (p.type === 'bool') {
        html = "<select name='" + name + "'>";
        html += "<option value='true'>true</option>";
        html += "<option value='false'>false</option>";
        html += "</select>";
    }
    else {
        var s = this.client.structs[p.type];
        if (s) {
            html = "<table>";
            for (i = 0; i < s.fields.length; i++) {
                html += this.renderParamRow(name + "-" + i, s.fields[i]);
            }
            html += "</table>";
        }
        else {
            var e = this.client.enums[p.type];
            if (e) {
                html = "<select name='" + name + "'>";
                for (i = 0; i < e.values.length; i++) {
                    html += "<option value='" + e.values[i].value + "'>" + e.values[i].value + "</option>";
                }
                html += "</select>";
            }
        }
    }
    
    if (html === null) {
        alert("Unknown type: " + p.type);
    }
    
    if (p.comment) {
        html += "<br /><p class='comment'>" + this.escapeHTML(p.comment) + "</p>";
    }

    return html;
};

BarristerUI.prototype.onErr = function(o) {
    var s = "Error: " + jQuery.toJSON(o);
    this.showMessage("error", s.substr(0, 80));
};

BarristerUI.prototype.showMessage = function(type, msg) {
    var html = "<div class=\"" + type + "\"><h3>" + this.escapeHTML(msg) + "</h3></div>";
    jQuery("#barrister-msg").html(html);
};

/////////////////////////////////////////////////////////////////////

function BarristerClient() {

}

BarristerClient.prototype.loadContract = function(url, onErr, onSuccess) {
    var me = this;
    this.url = url;
    this.call("barrister-idl", null, onErr, function(resp) {
        me.contract = resp.result;
        me.parseContract();
        onSuccess();
    });
};

BarristerClient.prototype.parseContract = function() {
    console.log(jQuery.toJSON(this.contract));
    this.interfaceNames = [ ];
    this.interfaces = { };
    this.structs = { };
    this.enums = { };
    var i;
    
    for (i = 0; i < this.contract.length; i++) {
        var e = this.contract[i];
        console.log("Got thing: " + jQuery.toJSON(e));
        if (e.type === "enum") {
            this.enums[e.name] = e;
        }
        else if (e.type === "struct") {
            this.structs[e.name] = e;
        }
        else if (e.type === "interface") {
            this.interfaces[e.name] = e;
            this.interfaceNames.push(e.name);
        }
    }
    
    console.log("interfaceNames: " + jQuery.toJSON(this.interfaceNames));
};

BarristerClient.prototype.getFunctionByOffset = function(ifaceOffset, funcOffset) {
    var ifaceName = this.interfaceNames[ifaceOffset];
    if (ifaceName) {
        var iface = this.interfaces[ifaceName];
        var func  = iface.functions[funcOffset];
        return { iface: iface, func: func };
    }
    else {
        alert("Invalid offset: " + ifaceOffset + " >= " + this.interfaceNames.length);
    }
};

BarristerClient.prototype.call = function(method, params, onErr, onSuccess) {
    var req = { "jsonrpc": "2.0", "method": method };
    if (params !== null && params !== undefined) {
        req.params = params;
    }
    
    console.log("sending post: method=" + method);
    var settings = {
        type: "POST",
        contentType: "application/json",
        data: jQuery.toJSON(req),
        error: onErr,
        success: function(data, textStatus, jqXHR) {
            onSuccess(data);
        }
    };
    jQuery.ajax(this.url, settings);
};