package example;

public class CalculatorClient implements Calculator {

    private com.bitmechanic.barrister.Transport _trans;

    public CalculatorClient(com.bitmechanic.barrister.Transport trans) {
        trans.getContract().setPackage("example");
        this._trans = trans;
    }

    public Double add(Double a, Double b) throws com.bitmechanic.barrister.RpcException {
        Object _params = new Object[] { a, b };
        com.bitmechanic.barrister.RpcRequest _req = new com.bitmechanic.barrister.RpcRequest(java.util.UUID.randomUUID().toString(), "Calculator.add", _params);
        com.bitmechanic.barrister.RpcResponse _resp = this._trans.request(_req);
        if (_resp == null) {
            return null;
        }
        else if (_resp.getError() == null) {
            return (Double)_resp.getResult();
        }
        else {
            throw _resp.getError();
        }
    }

    public Double subtract(Double a, Double b) throws com.bitmechanic.barrister.RpcException {
        Object _params = new Object[] { a, b };
        com.bitmechanic.barrister.RpcRequest _req = new com.bitmechanic.barrister.RpcRequest(java.util.UUID.randomUUID().toString(), "Calculator.subtract", _params);
        com.bitmechanic.barrister.RpcResponse _resp = this._trans.request(_req);
        if (_resp == null) {
            return null;
        }
        else if (_resp.getError() == null) {
            return (Double)_resp.getResult();
        }
        else {
            throw _resp.getError();
        }
    }

}

