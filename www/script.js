class Select {
    createElement() {
        var $element = StepHandler.c('form');
        var $title = StepHandler.c('div', {
            id: "title"
        }).text(this.title);
        var $text = StepHandler.c('div', {
            id: "text"
        }).text(this.text);
        $element.append($title).append($text);
        var $select = StepHandler.c("select", {
            name: "select"
        });
        this.options.forEach(el => {
            $("option", {
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
class Check {
    createElement() {
        var $element = StepHandler.c('form');
        var $title = StepHandler.c('div', {
            id: 'title'
        }).text(this.title);
        var $text = StepHandler.c('div', {
            id: 'text'
        }).text(this.text);
        $element.append($title).append($text);
        var $check = StepHandler.c('input', {
            name: 'check',
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
        var $element = StepHandler.c('form');
        var $title = StepHandler.c('div', {
            id: 'title'
        }).text(this.title);
        var $text = StepHandler.c('div', {
            id: 'text'
        }).text(this.text);
        $element.append($title).append($text);
        return $element;
    }
    ;
    constructor(title, text) {
        this.title = title;
        this.text = text;
    }
}
/// <reference path="Form.ts" />
/**
 * Step:
 * -generates Step element
 * -extracts information from its Form
 * @class Step
 */
class Step {
    createElement() {
        var wrapper = StepHandler.c('step', { id: this.id });
        return this.form.createElement().wrap(wrapper);
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
    constructor(id, form) {
        this.id = id;
        this.form = form;
    }
}
/// <reference path="Step.ts" />
class StepHandler {
    /**
     * Loads the Steps from JSON, DB or from the Hardcoded Steps array
     * TODO: Make the whole function support promises, because DB and HTTP JSON GET is async
     * @param {LoadMethod} method
     * @param {Object} params
     * @returns {boolean}
     */
    static loadSteps(method = LoadMethod.Local, params) {
        switch (method) {
            case LoadMethod.JSON:
                var tempObjects = JSON.parse(params);
                tempObjects.forEach(element => {
                    StepHandler.Steps.push(Object.setPrototypeOf(element, Step));
                });
                break;
            case LoadMethod.GET:
                throw new Error("Not implemented yet");
            case LoadMethod.Local:
                console.log('Steps loaded from local Steps array');
            default:
                break;
        }
        return true;
    }
    ;
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
    /**
     * Get the Step which is currently in the DOM.
     *
     * @returns {Step}
     */
    static getCurrentStep() {
        try {
            var id = $('step').attr('id');
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
        try {
            var $wizard = $('div#wizard');
        }
        catch (error) {
            throw "Wizard anchor div not found: " + error;
        }
        //Check if initial Step exists, else load it
        if (StepHandler.Steps[0] === null) {
            StepHandler.loadSteps();
        }
        StepHandler.StepQueue = StepHandler.Steps;
        var $initStep = StepHandler.Steps[0].createElement();
        $wizard.append($initStep);
        $wizard.append(StepHandler.createButtons());
        StepHandler.registerEvents();
    }
    ;
    /**
     * Creates the Next and Reset buttons
     *
     * @returns {JQuery}
     */
    static createButtons() {
        var $reset = StepHandler.c("button", {
            id: "btn_reset"
        });
        var $next = StepHandler.c("button", {
            id: "btn_next"
        });
        return $reset.add($next);
    }
    ;
    /**
     * Register the events for the page
     *
     *
     * @memberOf StepHandler
     */
    static registerEvents() {
        $('button#btn_next').click(StepHandler.onNextClicked);
        $('button#btn_reset').click(StepHandler.Reset);
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
            var $initStep = StepHandler.Steps[0].createElement();
            $wizard.append($initStep);
            $wizard.append(StepHandler.createButtons());
            StepHandler.registerEvents();
        }
    }
    ;
    static onNextClicked() {
        var $next = $('button#next');
        //Verify that some data has been entered
        if (!StepHandler.getCurrentStep().getData()) {
            //TODO: Display a fancy warning
            $next.text('Please fill out the form first.');
            return;
        }
        if (StepHandler.readyForNext) {
            $next.text('Next');
            StepHandler.onStepComplete();
        }
        else {
            $next.text('Confirm');
            StepHandler.readyForNext = true;
        }
    }
    /**
     * An event that fires on Step completion/confirmation.
     * Handles the shifting of the StepQueue, displaying of next Step
     */
    static onStepComplete() {
        var step = StepHandler.getCurrentStep();
        StepHandler.StepData.push(step.getData());
        StepHandler.StepLogic(step.id);
        StepHandler.StepQueue.shift(); //Remove the current Step from the Queue, and shift the next to take it's place
        var nextStep = StepHandler.StepQueue[0];
        var $currentStep = step.getElement();
        var $currentForm = step.getFormElement();
        $currentStep.attr('id', nextStep.id);
        $currentForm.empty();
        $currentForm.append(nextStep.createElement());
    }
    /**
     * Handles individual Step logic such as disabling or reordering of Steps in the StepQueue
     * TODO: Make this information contained in a .logic() method in each Step Object
     * @param {string} currentStepID
     */
    static StepLogic(currentStepID) {
        switch (currentStepID) {
            case "value":
                break;
            default:
                break;
        }
    }
    /**
     * A wrapper for the jQuery element creation.
     * Faster and more compatible than pure jQuery
     * @param {string} element
     * @param {Object} attributes
     * @returns {JQuery}
     */
    static c(element, attributes) {
        var e = $(document.createElement(element));
        e.attr(attributes);
        return e;
    }
}
StepHandler.Steps = [];
StepHandler.StepQueue = [];
StepHandler.StepData = [];
StepHandler.readyForNext = false;
var LoadMethod;
(function (LoadMethod) {
    LoadMethod[LoadMethod["JSON"] = 0] = "JSON";
    LoadMethod[LoadMethod["GET"] = 1] = "GET";
    LoadMethod[LoadMethod["Local"] = 2] = "Local";
})(LoadMethod || (LoadMethod = {}));
/// <reference path="StepHandler.ts" />
//Manually load the steps for now
var steps = [];
steps.push(new Step("intro", new Information("Hello", "Hope this displays correctly :)")));
steps.push(new Step("misc_wifi", new Check("WiFi", "Do you want WiFi in your computer?", true)));
StepHandler.loadSteps(LoadMethod.JSON, JSON.stringify(steps));
$(document).ready(StepHandler.Init);
