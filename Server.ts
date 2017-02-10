// Purpose: Gets data and returns results

class Model {

    A: number;
    B: number;
    C: number;
    D: number;
    Name: string;
    constructor(a, b, c, d, name) {
        this.A = a;
        this.B = b;
        this.C = c;
        this.D = d;
        this.Name = name;
    }
}

class Data {
    static Data: Model[] = [
        new Model(1, 1, 1, 1, "Lancia Ypsilon 1.2i 2008"),
        new Model(2, 1, 1, 1, "Fiat Punto 1.9 Mjet 2006"),
        new Model(1, 1, 2, 1, "Toyota Celica 1.8 VVT-I 2002"),
        new Model(2, 1, 2, 1, "Alfa Romeo GT 1.9 jtd 2005"),
        new Model(1, 1, 1, 2, "Lancia Delta 1.4 T-JET 2010"),
        new Model(1, 1, 1, 2, "VW Polo 1.6 Tdi 2011"),
        new Model(1, 1, 2, 2, "Mazda MX-5 1.8i 2006"),
        new Model(2, 1, 2, 2, "Alfa Romeo Brera 2.4 jtdm 2008"),
        new Model(1, 2, 1, 1, "Ford Focus Combi 1.6i 2008"),
        new Model(2, 2, 1, 1, "Fiat Croma 1.9 jtd 2007"),
        new Model(1, 2, 2, 1, "Jaguar X-Type 2.5i 2002"),
        new Model(2, 2, 2, 1, "Jaguar X-Type 2.5i 2003"),
        new Model(1, 2, 1, 2, "Škoda Roomster 1.4i 2010"),
        new Model(2, 2, 1, 2, "Ford S-Max 1.8 TDCi 2010"),
        new Model(1, 2, 2, 2, "Lexus IS 250 2008"),
        new Model(2, 2, 2, 2, "BMW 530d 2007")
    ];
    static getModel(a, b, c, d): Model {
        return this.Data.filter((model) => {
            return model.A == a && model.B == b && model.C == c && model.D == d;
        })[0];
    }
}