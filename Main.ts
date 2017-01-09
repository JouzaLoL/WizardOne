/// <reference path="StepHandler.ts" />
//Manually load the steps for now
var steps: Step[] = [];
steps.push(
    new Step("intro",
        new Information("Hello", "Hope this displays correctly :)")));
steps.push(
    new Step("misc_wifi",
        new Check("WiFi", "Do you want WiFi in your computer?", true)));
steps.push(
    new Step("use",
        new Select("Use", "What are you going to use the Computer for?", [
            new Option("Gaming", "gaming"),
            new Option("Office", "office")
        ])));
//StepHandler.loadSteps(LoadMethod.JSON, JSON.stringify(steps));
StepHandler.Steps = steps;
$(document).ready(StepHandler.Init);