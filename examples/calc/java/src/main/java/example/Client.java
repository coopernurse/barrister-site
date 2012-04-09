package example;

import com.bitmechanic.barrister.HttpTransport;

public class Client {

    public static void main(String argv[]) throws Exception {
        HttpTransport trans = new HttpTransport("http://127.0.0.1:8080/example/");
        CalculatorClient calc = new CalculatorClient(trans);

        System.out.println(String.format("1+5.1=%.1f", calc.add(1.0, 5.1)));
        System.out.println(String.format("8-1.1=%.1f", calc.subtract(8.0, 1.1)));
    }

}