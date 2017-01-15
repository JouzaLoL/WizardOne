/// <reference path="StepHandler.ts" />
//Manually load the steps for now
var steps: Step[] = [];
steps.push(
    new Step("start",
        new Information("Hello", "Welcome to Wizard")));
steps.push(
    new Step("price",
        new FormRange("Price", "How much should the computer cost AT MOST?")));
steps.push(
    new Step("use",
        new Select("Use", "What are you going to use the Computer for?", [
            new Option("Gaming", "gaming"),
            new Option("Office", "office"),
            new Option("Multimedia", "multimedia")
        ]), [StepTag.Dynamic]));
steps.push(
    new Step("gaming_test",
        new Information("DynAdd test - Gaming","DynAdd Test - Gaming"),
        [StepTag.DynamicallyAdded])
);
steps.push(
    new Step("misc_wifi",
        new Checkbox("WiFi", "Do you want WiFi in your computer?", true)));
steps.push(
    new Step("finish",
        new Information("Finished", "We are finished")));

StepHandler.loadSteps(LoadMethod.Variable, steps);

$(document)
    .ready(StepHandler.Init);