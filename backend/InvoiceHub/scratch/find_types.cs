using System;
using Microsoft.OpenApi.Models;
using Microsoft.OpenApi;

public class Program {
    public static void Main() {
        var types = typeof(OpenApiSecurityScheme).Assembly.GetTypes();
        foreach(var t in types) {
            if (t.Name.Contains("Reference")) {
                Console.WriteLine(t.FullName);
            }
        }
    }
}
