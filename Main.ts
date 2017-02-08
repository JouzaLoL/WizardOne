/// <reference path="StepHandler.ts" />
// Manually load the steps for now
var TestSteps: Step[] = [];
TestSteps.push(
    new Step("start",
        new Information("Hello", "Welcome to Wizard")));
TestSteps.push(
    new Step("price",
        new FormRange("Price", "How much should the computer cost AT MOST?")));
TestSteps.push(
    new Step("use",
        new Select("Use", "What are you going to use the Computer for?", [
            new FormOption("Gaming", "gaming"),
            new FormOption("Office", "office"),
            new FormOption("Multimedia", "multimedia")
        ]), [StepTag.Dynamic]));
TestSteps.push(
    new Step("gaming_test",
        new Information("DynAdd test - Gaming", "DynAdd Test - Gaming"), [StepTag.DynamicallyAdded])
);
TestSteps.push(
    new Step("misc_wifi",
        new Checkbox("WiFi", "Do you want WiFi in your computer?", true)));
TestSteps.push(
    new Step("finish",
        new Information("Finished", "We are finished")));

var steps: Step[] = [];
steps = [
    new Step("start",
        new Information("Vítejte", "Vítejte v systému Wizard")),
    new Step("km",
        new Radio("Kilometry", "Kolik denně najezdíte km?",
            [new RadioOption("Méně než 50 km", "<50km"), new RadioOption("Více než 50 km", ">50km")])),
    new Step("velikost",
        new Radio("Velikost", "Jak velké potřebujete auto?",
            [new RadioOption("Stačí nějaké menší", "mensi"), new RadioOption("Velké", "velke")])),
    new Step("sport",
        new Radio("Sportovn9 jízda", "Chcete auto spíše pro sportovní jízdu?",
            [new RadioOption("Ano", "ano"), new RadioOption("Ne", "ne")])),
    new Step("rozpocet",
        new Radio("Rozpočet", "Jaký je váš rozpočet na auto?",
            [new RadioOption("Do 100 tisíc Kč", "<100k"), new RadioOption("Do 250 tisíc Kč", "<250k")])),
    new Step("finish",
        new Finish("Závěr", "Vaše výsledky jsou připraveny"))
];


var encoded = Encoder.EncodeSteps(steps);
StepHandler.loadSteps(LoadMethod.Local, encoded);

$(document)
    .ready(StepHandler.Init);