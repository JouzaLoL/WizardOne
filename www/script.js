/**
 * Responsible for
 * * Encoding and decoding Steps
 *
 * @class Encoder
 */
class Encoder {
    /**
     * Encodes the Steps provided for exchange between front and back-end
     *
     * @static
     * @param {Step[]} steps The Steps to be encoded
     * @returns {string} A JSON-string containing the Steps encoded in Format
     *
     * @memberOf Encoder
     */
    static EncodeSteps(steps) {
        var readySteps = new Array();
        var steps = new Array().concat(steps);
        steps.forEach(step => {
            //Add information about Form Class
            var formclass = Encoder.getFormClass(step);
            step['FormClass'] = formclass;
            //Add the ready Step to be encoded
            readySteps.push(step);
        });
        //Encode and return the Steps
        return JSON.stringify(readySteps);
    }
    /**
     * Decodes the JSON-string into Step objects
     *
     * @static
     * @param {string} json
     * @returns {Step[]}
     *
     * @memberOf Encoder
     */
    static DecodeSteps(json) {
        var objs = JSON.parse(json);
        var steps = [];
        objs.forEach(obj => {
            var type = obj['FormClass'];
            //Decode the Form
            var outform;
            var objform = obj['form'];
            switch (type) {
                case "Select":
                    var options = [];
                    //Decode FormOptions
                    objform.options.forEach(option => {
                        options.push(new FormOption(option.text, option.value));
                    });
                    outform = new Select(objform.title, objform.text, options);
                    break;
                case "Information":
                    outform = new Information(objform.title, objform.text);
                    break;
                case "Checkbox":
                    outform = new Checkbox(objform.title, objform.text, objform.checked);
                    break;
                case "FormRange":
                    outform = new FormRange(objform.title, objform.text, objform.min, objform.max, objform.step, objform.defaultValue);
                    break;
            }
            //Add the finished Step to the array
            steps.push(new Step(obj['id'], outform));
        });
        return steps;
    }
    static getFormClass(step) {
        return step.form.constructor.name;
    }
}
/// <reference path="Form.ts" />
/// <reference path="StepHandler.ts" />
/**
 * Step:
 * -generates Step element
 * -extracts information from its Form
 * @class Step
 */
class Step {
    createElement() {
        var wrapper = FormHelper.c('step', { id: this.id });
        var el = wrapper.append(this.form.createElement());
        return el;
    }
    getElement() {
        return $('#' + this.id);
    }
    ;
    getFormElement() {
        return $('#' + this.id + ' > ' + 'form');
    }
    /**
     * Serializes the form data into a JS object
     *
     * @returns {Object} The JS object containing the form data
     *
     * @memberOf Step
     */
    getData() {
        var o = {};
        //Assign an ID to the Data object
        o['id'] = this.id;
        var a = this.getFormElement().serializeArray();
        $.each(a, function () {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            }
            else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    }
    ;
    constructor(id, form, tags) {
        this.id = id;
        this.form = form;
        this.tags = tags;
    }
}
var StepTag;
(function (StepTag) {
    StepTag[StepTag["Dynamic"] = 0] = "Dynamic";
    StepTag[StepTag["DynamicallyAdded"] = 1] = "DynamicallyAdded";
})(StepTag || (StepTag = {}));
/// <reference path="Step.ts" />
class StepHandler {
    /**
     * Loads the Steps from JSON, DB or from the Hardcoded Steps array
     * Filter out Steps marked with DynamicallyAdded tag
     * TODO: Make the whole function support promises, because DB access is async
     * @param {LoadMethod} method
     * @param {Object} params
     * @returns {boolean}
     */
    static loadSteps(method = LoadMethod.Local, params) {
        switch (method) {
            case LoadMethod.DB:
                throw new Error("Not implemented yet");
            case LoadMethod.Variable:
                StepHandler.Steps = params;
                StepHandler.StepQueue = StepHandler.filterDynAddedSteps(params);
                break;
            default:
                break;
        }
        return true;
    }
    ;
    /**
     * Filter out Steps with the DynamicallyAdded tag
     *
     * @static
     * @param {Step[]} steps
     * @returns {Step[]}
     *
     * @memberOf StepHandler
     */
    static filterDynAddedSteps(steps) {
        return steps.filter((step) => {
            return !StepHandler.hasTag(step, StepTag.DynamicallyAdded);
        });
    }
    static hasTag(step, tag) {
        if (step.tags == undefined) {
            return false;
        }
        ;
        return step.tags.indexOf(tag) != -1;
    }
    /**
     * Return a Step with the specified ID
     *
     * @param {string} id
     * @returns {Step} If not found, will return null
     */
    static getStep(id, queue) {
        if (queue) {
            return StepHandler.StepQueue.filter((x) => x.id === id)[0];
        }
        else {
            return StepHandler.Steps.filter((x) => x.id === id)[0];
        }
    }
    ;
    static getStepsByIDContains(stepid, queue = false) {
        if (queue) {
            return StepHandler.StepQueue.filter((x) => {
                x.id.indexOf(stepid) !== -1;
            });
        }
        else {
            return StepHandler.Steps.filter((x) => {
                x.id.indexOf(stepid) !== -1;
            });
        }
    }
    /**
     * Get the Step which is currently in the DOM.
     *
     * @returns {Step}
     */
    static getCurrentStep() {
        try {
            var id = $('step')
                .attr('id');
        }
        catch (error) {
            throw "No Step found in DOM at the moment; " + error;
        }
        return StepHandler.getStep(id, true);
    }
    ;
    /**
     * First fn to be called on document.load
     *
     * @description Makes Wizard ready for the user
     */
    static Init() {
        //Check for the wizard anchor
        try {
            var $wizard = $('div#wizard');
        }
        catch (error) {
            throw "Wizard anchor div not found: " + error;
        }
        //Check if Steps are loaded
        if (StepHandler.Steps[0] === null) {
            StepHandler.loadSteps();
        }
        //Populate the StepQueue
        StepHandler.StepQueue = StepHandler.Steps;
        //Initialize the first Step
        var $initStep = StepHandler.Steps[0].createElement();
        $wizard.append($initStep);
        //Create and append the Navigation
        $wizard.append(StepHandler.createNav());
        //Create and prepend (append as first child) the Progress Bar
        $wizard.prepend(StepHandler.createProgressBar());
        //Register UI events
        StepHandler.registerEvents();
        //Run StepLogic once to hide the Back button on start
        StepHandler.onStepChange();
    }
    ;
    /**
     * Creates the Next and Reset buttons as jQuery element
     *
     * @returns {JQuery}
     */
    static createNav() {
        var $nav = FormHelper.c("div", {
            id: "navigation",
            class: "clearfix"
        });
        var $back = FormHelper.c("button", {
            id: "btn_back"
        })
            .text("< Back");
        var $next = FormHelper.c("button", {
            id: "btn_next"
        })
            .text("Next >");
        return $nav.append($back)
            .append($next);
    }
    ;
    /**
     * Update the Progress Bar according to the current state
     *
     * @static
     * @param {number} percent
     *
     * @memberOf StepHandler
     */
    static updateProgress() {
        var current_step = StepHandler.getCurrentStep();
        var percent = ((StepHandler.StepQueue.indexOf(current_step) + 1) / StepHandler.StepQueue.length) * 100;
        var $progress_bar = $('#progress_bar');
        $progress_bar.width(percent + "%");
    }
    /**
     * Creates the Progress Bar as jQuery element
     *
     * @static
     *
     * @memberOf StepHandler
     */
    static createProgressBar() {
        var $progress = FormHelper.c('div', {
            id: "progress"
        });
        var $progress_bar = FormHelper.c('div', {
            id: "progress_bar"
        });
        return $progress.append($progress_bar);
    }
    /**
     * Register the events for the page
     *
     *
     * @memberOf StepHandler
     */
    static registerEvents() {
        $('button#btn_next')
            .click(() => {
            StepHandler.onNextClicked();
            //onStepChange called in onStepComplete
        });
        $('button#btn_back')
            .click(() => {
            StepHandler.onBackClicked();
            StepHandler.onStepChange();
        });
    }
    /**
     * Fires on Step change (Back or Next)
     * Contains functionality common for all Step changes
     * @static
     *
     * @memberOf StepHandler
     */
    static onStepChange() {
        //Update the Progress Bar
        StepHandler.updateProgress();
        //Update currentStepIndex
        StepHandler.currentStepIndex = StepHandler.StepQueue.indexOf(StepHandler.getCurrentStep());
        //Hide/show buttons
        if (StepHandler.getCurrentStep()
            .id == "start") {
            $('#btn_back')
                .hide();
        }
        else {
            $('#btn_back')
                .show();
        }
        if (StepHandler.getCurrentStep()
            .id == "finish") {
            $('#btn_next')
                .hide();
        }
        else {
            $('#btn_next')
                .show();
        }
    }
    /**
     * Fired when the User clicks the Back button
     * Moves the User back one Step
     *
     * @static
     *
     * @memberOf StepHandler
     */
    static onBackClicked() {
        var step = StepHandler.getCurrentStep();
        //remove previous Step's data from StepData
        StepHandler.StepData.pop();
        //Move to previous Step
        var prevStep = StepHandler.StepQueue[StepHandler.currentStepIndex - 1];
        var $currentStep = step.getElement();
        var $currentForm = step.getFormElement();
        $currentStep.attr('id', prevStep.id);
        $currentStep.empty();
        $currentStep.append(prevStep.form.createElement());
        //Remove Dynamically Added Steps ahead if the previous step is Dynamic
        if (StepHandler.hasTag(prevStep, StepTag.Dynamic)) {
            try {
                StepHandler.RemoveDynAddStepsAhead(StepHandler.currentStepIndex - 1);
            }
            catch (TypeError) {
                console.log("There are no dynsteps ahead.");
                //TODO: Fix this error
                return;
            }
        }
    }
    /**
     * Fired when the User clicks the Next button
     *
     * @static
     * @returns
     *
     * @memberOf StepHandler
     */
    static onNextClicked() {
        var $next = $('button#btn_next');
        //Verify that data has been entered
        if (!StepHandler.getCurrentStep()
            .getData()) {
            //TODO: Display a fancy warning
            $next.text('Please fill out the form first.');
            return;
        }
        //Confirm functionality
        if (StepHandler.readyForNext) {
            $next.text('Next >');
            StepHandler.readyForNext = false;
            StepHandler.onStepComplete();
        }
        else {
            $next.text('Confirm ?');
            StepHandler.readyForNext = true;
        }
    }
    /**
     * An event that fires on Step completion/confirmation.
     * Handles the shifting of the StepQueue, displaying of next Step
     */
    static onStepComplete() {
        var step = StepHandler.getCurrentStep();
        //Extract and store the Step data
        StepHandler.StepData.push(step.getData());
        //Execute Logic corresponding to the Step
        StepHandler.StepLogic(step);
        // Take the first Step and put to the end of the Queue
        //StepHandler.StepQueue.push(StepHandler.StepQueue.shift());
        //Move to next step
        var nextStep = StepHandler.StepQueue[StepHandler.currentStepIndex + 1];
        var $currentStep = step.getElement();
        var $currentForm = step.getFormElement();
        $currentStep.attr('id', nextStep.id);
        $currentStep.empty();
        $currentStep.append(nextStep.form.createElement());
        //Next event is complex, calling the onStepChange here
        StepHandler.onStepChange();
    }
    /**
     * Handles individual Step logic such as disabling or reordering of Steps in the StepQueue
     *
     * @param {string} stepID
     */
    /**
     *
     *
     * @static
     * @param {Step} step
     *
     * @memberOf StepHandler
     */
    static StepLogic(step) {
        //Store the current Step's data in a var for easier access
        var stepData = StepHandler.StepData[StepHandler.StepData.length - 1];
        switch (step.id) {
            case "use":
                var use = stepData['select'];
                switch (use) {
                    case "gaming":
                        var gamingsteps = StepHandler.getStepsByIDContains("gaming");
                        gamingsteps.forEach((step) => {
                            StepHandler.insertStep(step);
                        });
                        break;
                }
                break;
            case "finish":
                StepHandler.onFinish();
                break;
            case "start":
                StepHandler.onStart();
                break;
            default:
                break;
        }
    }
    /**
     * Insert the Step into the StepQueue INTO THE SPECIFIED INDEX.
     * Meaning the Step will end up in the index you specified, other elements will be moved.
     * Index defaults to after current step
     * @static
     * @param {number} index
     * @param {Step} step
     *
     * @memberOf StepHandler
     */
    static insertStep(step, index = StepHandler.currentStepIndex + 1) {
        StepHandler.StepQueue.splice(index, 0, step);
    }
    /**
     * Removes Dynamically Added Steps ahead of the specified index or, if not specified, the current Step
     *
     * @static
     * @param {number} index The index to start at
     *
     * @memberOf StepHandler
     */
    static RemoveDynAddStepsAhead(index = StepHandler.currentStepIndex) {
        //Get Steps ahead of the current Step
        var ahead = StepHandler.StepQueue.slice(StepHandler.currentStepIndex);
        //Find DynamicallyAdded Steps in the sliced array
        var dynadded = ahead.filter((el) => {
            return StepHandler.hasTag(el, StepTag.DynamicallyAdded);
        });
        //Remove these Steps from the StepQueue
        dynadded.forEach((dynaddstep) => {
            var index = StepHandler.StepQueue.indexOf(dynaddstep);
            if (index > -1) {
                StepHandler.StepQueue.splice(index, 1);
            }
        });
    }
    /**
     * Called when User reaches first Step (step#start)
     *
     * @static
     *
     * @memberOf StepHandler
     */
    static onStart() {
    }
    /**
     * Called when User reaches last Step (step#finish)
     *
     * @static
     *
     * @memberOf StepHandler
     */
    static onFinish() {
        //TODO: Have a special button in Finish that calls submitData
        StepHandler.submitData();
    }
    /**
     * Submits the data to the backend
     *
     * @static
     *
     * @memberOf StepHandler
     */
    static submitData() {
        var data = StepHandler.StepData;
        $.ajax({
            type: "POST",
            url: "/api/default",
            data: data,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
        })
            .then((success) => {
            //do something
        }, (failure) => {
            //we failed, oh noes
        });
    }
    /**
     * Reset the Wizard, either thru hard page reload or soft JS reset
     *
     * @param {boolean} [hard=false]
     */
    static Reset(hard = false) {
        if (hard) {
            window.location.reload(true);
        }
        else {
            var $wizard = $('div#wizard');
            //Reset the StepQueue
            StepHandler.StepQueue = StepHandler.Steps;
            //Reset the whole Wizard
            $wizard.empty();
            //Append init Step
            var $initStep = StepHandler.Steps[0].createElement();
            $wizard.append($initStep);
            //Create and append Navigation
            $wizard.append(StepHandler.createNav());
            //Register UI events
            StepHandler.registerEvents();
        }
    }
    ;
}
StepHandler.Steps = [];
StepHandler.StepQueue = [];
StepHandler.StepData = [];
StepHandler.currentStepIndex = 0;
StepHandler.readyForNext = false;
var LoadMethod;
(function (LoadMethod) {
    LoadMethod[LoadMethod["DB"] = 0] = "DB";
    LoadMethod[LoadMethod["Local"] = 1] = "Local";
    LoadMethod[LoadMethod["Variable"] = 2] = "Variable";
})(LoadMethod || (LoadMethod = {}));
/// <reference path="StepHandler.ts" />
class Select {
    createElement() {
        var $element = FormHelper.createForm(this.title, this.text);
        var $select = FormHelper.c("select", {
            name: "select"
        });
        this.options.forEach(el => {
            FormHelper.c("option", {
                value: el.value
            }).text(el.text).appendTo($select);
        });
        $element.append($select);
        return $element;
    }
    constructor(title, text, options) {
        this.title = title;
        this.text = text;
        this.options = options;
    }
}
class FormOption {
    constructor(text, value) {
        this.text = text;
        this.value = value;
    }
}
class Checkbox {
    createElement() {
        var $element = FormHelper.createForm(this.title, this.text);
        var $check = FormHelper.c('input', {
            name: 'checkbox',
            type: 'checkbox'
        }).prop('checked', this.checked);
        $element.append($check);
        return $element;
    }
    ;
    constructor(title, text, checked = false) {
        this.title = title;
        this.text = text;
        this.checked = checked;
    }
}
class Information {
    createElement() {
        var $element = FormHelper.createForm(this.title, this.text);
        return $element;
    }
    ;
    constructor(title, text) {
        this.title = title;
        this.text = text;
    }
}
class FormRange {
    createElement() {
        var $element = FormHelper.createForm(this.title, this.text);
        //Fix for the pesky "this"" handling in JS :/
        var THIS = this;
        var $range = FormHelper.c('input', {
            type: "range",
            name: "range",
            min: THIS.min,
            max: THIS.max,
            step: THIS.step,
            defaultValue: THIS.defaultValue
        });
        $element.append($range);
        return $element;
    }
    ;
    constructor(title, text, min = 0, max = 30000, step = 500, defaultValue = 20000) {
        this.title = title;
        this.text = text;
        this.min = min;
        this.max = max;
        this.step = step;
        this.defaultValue = defaultValue;
    }
}
class FormHelper {
    /**
     * A wrapper for the jQuery element creation.
     * Faster and more compatible than pure jQuery
     * @param {string} element Tag name of the element. E.g. 'form', 'div'
     * @param {Object} attributes Attributes of the element. Format: { attribute: "value" }
     * @returns {JQuery}
     */
    static c(element, attributes) {
        var e = $(document.createElement(element));
        if (attributes) {
            e.attr(attributes);
        }
        return e;
    }
    /**
     * Creates a basic Form with Title and Text and returns it as a JQuery object
     *
     * @static
     * @param {string} title
     * @param {string} text
     * @returns {JQuery}
     *
     * @memberOf FormHelper
     */
    static createForm(title, text) {
        var $element = FormHelper.c('form');
        var $title = FormHelper.c('div', {
            id: 'title'
        }).text(title);
        var $text = FormHelper.c('div', {
            id: 'text'
        }).text(text);
        $element.append($title).append($text);
        return $element;
    }
}
/// <reference path="StepHandler.ts" />
//Manually load the steps for now
var steps = [];
steps.push(new Step("start", new Information("Hello", "Welcome to Wizard")));
steps.push(new Step("price", new FormRange("Price", "How much should the computer cost AT MOST?")));
steps.push(new Step("use", new Select("Use", "What are you going to use the Computer for?", [
    new FormOption("Gaming", "gaming"),
    new FormOption("Office", "office"),
    new FormOption("Multimedia", "multimedia")
]), [StepTag.Dynamic]));
steps.push(new Step("gaming_test", new Information("DynAdd test - Gaming", "DynAdd Test - Gaming"), [StepTag.DynamicallyAdded]));
steps.push(new Step("misc_wifi", new Checkbox("WiFi", "Do you want WiFi in your computer?", true)));
steps.push(new Step("finish", new Information("Finished", "We are finished")));
StepHandler.loadSteps(LoadMethod.Variable, steps);
$(document)
    .ready(StepHandler.Init);
