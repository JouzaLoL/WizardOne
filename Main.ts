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


// StepHandler.loadSteps(LoadMethod.Variable, steps);
var encoded = Encoder.EncodeSteps(TestSteps);
StepHandler.loadSteps(LoadMethod.Local, encoded);

$(document)
    .ready(StepHandler.Init);