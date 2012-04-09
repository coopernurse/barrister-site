package example;

public class EchoClient implements Echo {

    private com.bitmechanic.barrister.Transport _trans;

    public EchoClient(com.bitmechanic.barrister.Transport trans) {
        trans.getContract().setPackage("example");
        this._trans = trans;
    }

    public String echo(String s) throws com.bitmechanic.barrister.RpcException {
        Object _params = s;
        com.bitmechanic.barrister.RpcRequest _req = new com.bitmechanic.barrister.RpcRequest(java.util.UUID.randomUUID().toString(), "Echo.echo", _params);
        com.bitmechanic.barrister.RpcResponse _resp = this._trans.request(_req);
        if (_resp == null) {
            return null;
        }
        else if (_resp.getError() == null) {
            return (String)_resp.getResult();
        }
        else {
            throw _resp.getError();
        }
    }

}

