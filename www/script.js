/// <reference path="Form.ts" />
/// <reference path="StepHandler.ts" />
/**
 * Step:
 * -generates Step element
 * -extracts information from its Form
 * @class Step
 */
var Step = (function () {
    function Step(id, form) {
        this.id = id;
        this.form = form;
    }
    Step.prototype.createElement = function () {
        var wrapper = FormHelper.c('step', { id: this.id });
        var el = wrapper.append(this.form.createElement());
        return el;
    };
    Step.prototype.getElement = function () {
        return $('#' + this.id);
    };
    ;
    Step.prototype.getFormElement = function () {
        return $('#' + this.id + ' > ' + 'form');
    };
    /**
     * Serializes the form data into a JS object
     *
     * @returns {Object} The JS object containing the form data
     *
     * @memberOf Step
     */
    Step.prototype.getData = function () {
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
    };
    ;
    return Step;
}());
/// <reference path="Step.ts" />
var StepHandler = (function () {
    function StepHandler() {
    }
    /**
     * Loads the Steps from JSON, DB or from the Hardcoded Steps array
     * TODO: Make the whole function support promises, because DB and HTTP JSON GET is async
     * @param {LoadMethod} method
     * @param {Object} params
     * @returns {boolean}
     */
    StepHandler.loadSteps = function (method, params) {
        if (method === void 0) { method = LoadMethod.Local; }
        switch (method) {
            case LoadMethod.JSON:
                break;
            case LoadMethod.GET:
                throw new Error("Not implemented yet");
            case LoadMethod.Local:
                console.log('Steps loaded from local Steps array');
            default:
                break;
        }
        return true;
    };
    ;
    /**
     * Return a Step with the specified ID
     *
     * @param {string} id
     * @returns {Step} If not found, will return null
     */
    StepHandler.getStep = function (id, queue) {
        if (queue) {
            return StepHandler.StepQueue.filter(function (x) { return x.id === id; })[0];
        }
        else {
            return StepHandler.Steps.filter(function (x) { return x.id === id; })[0];
        }
    };
    ;
    /**
     * Get the Step which is currently in the DOM.
     *
     * @returns {Step}
     */
    StepHandler.getCurrentStep = function () {
        try {
            var id = $('step')
                .attr('id');
        }
        catch (error) {
            throw "No Step found in DOM at the moment; " + error;
        }
        return StepHandler.getStep(id, true);
    };
    ;
    /**
     * First fn to be called on document.load
     *
     * @description Makes Wizard ready for the user
     */
    StepHandler.Init = function () {
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
    };
    ;
    /**
     * Creates the Next and Reset buttons as jQuery element
     *
     * @returns {JQuery}
     */
    StepHandler.createNav = function () {
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
    };
    ;
    /**
     * Update the Progress Bar according to the current state
     *
     * @static
     * @param {number} percent
     *
     * @memberOf StepHandler
     */
    StepHandler.updateProgress = function () {
        var current_step = StepHandler.getCurrentStep();
        var percent = ((StepHandler.StepQueue.indexOf(current_step) + 1) / StepHandler.StepQueue.length) * 100;
        var $progress_bar = $('#progress_bar');
        $progress_bar.width(percent + "%");
    };
    /**
     * Creates the Progress Bar as jQuery element
     *
     * @static
     *
     * @memberOf StepHandler
     */
    StepHandler.createProgressBar = function () {
        var $progress = FormHelper.c('div', {
            id: "progress"
        });
        var $progress_bar = FormHelper.c('div', {
            id: "progress_bar"
        });
        return $progress.append($progress_bar);
    };
    /**
     * Register the events for the page
     *
     *
     * @memberOf StepHandler
     */
    StepHandler.registerEvents = function () {
        $('button#btn_next')
            .click(function () {
            StepHandler.onNextClicked();
            //onStepChange called in onStepComplete
        });
        $('button#btn_back')
            .click(function () {
            StepHandler.onBackClicked();
            StepHandler.onStepChange();
        });
    };
    /**
     * Fires on Step change (Back or Next)
     * Contains functionality common for all Step changes
     * @static
     *
     * @memberOf StepHandler
     */
    StepHandler.onStepChange = function () {
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
    };
    /**
     * Fired when the User clicks the Back button
     * Moves the User back one Step
     *
     * @static
     *
     * @memberOf StepHandler
     */
    StepHandler.onBackClicked = function () {
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
    };
    /**
     * Fired when the User clicks the Next button
     *
     * @static
     * @returns
     *
     * @memberOf StepHandler
     */
    StepHandler.onNextClicked = function () {
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
    };
    /**
     * An event that fires on Step completion/confirmation.
     * Handles the shifting of the StepQueue, displaying of next Step
     */
    StepHandler.onStepComplete = function () {
        var step = StepHandler.getCurrentStep();
        //Extract and store the Step data
        StepHandler.StepData.push(step.getData());
        //Execute Logic corresponding to the Step
        StepHandler.StepLogic(step.id);
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
    };
    /**
     * Handles individual Step logic such as disabling or reordering of Steps in the StepQueue
     * TODO: Make this information contained in a .logic() method in each Step Object
     * @param {string} stepID
     */
    StepHandler.StepLogic = function (stepID) {
        switch (stepID) {
            case "value":
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
    };
    /**
     * Called when User reaches first Step (step#start)
     *
     * @static
     *
     * @memberOf StepHandler
     */
    StepHandler.onStart = function () {
    };
    /**
     * Called when User reaches last Step (step#finish)
     *
     * @static
     *
     * @memberOf StepHandler
     */
    StepHandler.onFinish = function () {
        //TODO: Have a special button in Finish that calls submitData
        StepHandler.submitData();
    };
    /**
     * Submits the data to the backend
     *
     * @static
     *
     * @memberOf StepHandler
     */
    StepHandler.submitData = function () {
        var data = StepHandler.StepData;
        $.ajax({
            type: "POST",
            url: "/api/default",
            data: data,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
        })
            .then(function (success) {
            //do something
        }, function (failure) {
            //we failed, oh noes
        });
    };
    /**
     * Reset the Wizard, either thru hard page reload or soft JS reset
     *
     * @param {boolean} [hard=false]
     */
    StepHandler.Reset = function (hard) {
        if (hard === void 0) { hard = false; }
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
    };
    ;
    return StepHandler;
}());
StepHandler.Steps = [];
StepHandler.StepQueue = [];
StepHandler.StepData = [];
StepHandler.currentStepIndex = 0;
StepHandler.readyForNext = false;
var LoadMethod;
(function (LoadMethod) {
    LoadMethod[LoadMethod["JSON"] = 0] = "JSON";
    LoadMethod[LoadMethod["GET"] = 1] = "GET";
    LoadMethod[LoadMethod["Local"] = 2] = "Local";
})(LoadMethod || (LoadMethod = {}));
/// <reference path="StepHandler.ts" />
var Select = (function () {
    function Select(title, text, options) {
        this.title = title;
        this.text = text;
        this.options = options;
    }
    Select.prototype.createElement = function () {
        var $element = FormHelper.c('form');
        var $title = FormHelper.c('div', {
            id: "title"
        }).text(this.title);
        var $text = FormHelper.c('div', {
            id: "text"
        }).text(this.text);
        $element.append($title).append($text);
        var $select = FormHelper.c("select", {
            name: "select"
        });
        this.options.forEach(function (el) {
            FormHelper.c("option", {
                value: el.value
            }).text(el.text).appendTo($select);
        });
        $element.append($select);
        return $element;
    };
    return Select;
}());
var Check = (function () {
    function Check(title, text, checked) {
        if (checked === void 0) { checked = false; }
        this.title = title;
        this.text = text;
        this.checked = checked;
    }
    Check.prototype.createElement = function () {
        var $element = FormHelper.c('form');
        var $title = FormHelper.c('div', {
            id: 'title'
        }).text(this.title);
        var $text = FormHelper.c('div', {
            id: 'text'
        }).text(this.text);
        $element.append($title).append($text);
        var $check = FormHelper.c('input', {
            name: 'check',
            type: 'checkbox'
        }).prop('checked', this.checked);
        $element.append($check);
        return $element;
    };
    ;
    return Check;
}());
var Information = (function () {
    function Information(title, text) {
        this.title = title;
        this.text = text;
    }
    Information.prototype.createElement = function () {
        var $element = FormHelper.c('form');
        var $title = FormHelper.c('div', {
            id: 'title'
        }).text(this.title);
        var $text = FormHelper.c('div', {
            id: 'text'
        }).text(this.text);
        $element.append($title).append($text);
        return $element;
    };
    ;
    return Information;
}());
var FormRange = (function () {
    function FormRange(title, text, min, max, step, defaultValue) {
        if (min === void 0) { min = 0; }
        if (max === void 0) { max = 30000; }
        if (step === void 0) { step = 500; }
        if (defaultValue === void 0) { defaultValue = 20000; }
        this.title = title;
        this.text = text;
        this.min = min;
        this.max = max;
        this.step = step;
    }
    FormRange.prototype.createElement = function () {
        var $element = FormHelper.createForm(this.title, this.text);
        var $range = FormHelper.c('input', {
            type: "range",
            min: this.min,
            max: this.min,
            step: this.min,
            defaultValue: this.defaultValue
        });
        $element.append($range);
        return $element;
    };
    ;
    return FormRange;
}());
var FormHelper = (function () {
    function FormHelper() {
    }
    /**
     * A wrapper for the jQuery element creation.
     * Faster and more compatible than pure jQuery
     * @param {string} element Tag name of the element. E.g. 'form', 'div'
     * @param {Object} attributes Attributes of the element. Format: { attribute: "value" }
     * @returns {JQuery}
     */
    FormHelper.c = function (element, attributes) {
        var e = $(document.createElement(element));
        if (attributes) {
            e.attr(attributes);
        }
        return e;
    };
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
    FormHelper.createForm = function (title, text) {
        var $element = FormHelper.c('form');
        var $title = FormHelper.c('div', {
            id: 'title'
        }).text(title);
        var $text = FormHelper.c('div', {
            id: 'text'
        }).text(text);
        $element.append($title).append($text);
        return $element;
    };
    return FormHelper;
}());
/// <reference path="StepHandler.ts" />
//Manually load the steps for now
var steps = [];
steps.push(new Step("start", new Information("Hello", "Hope this displays correctly :)")));
steps.push(new Step("misc_wifi", new Check("WiFi", "Do you want WiFi in your computer?", true)));
steps.push(new Step("use", new Select("Use", "What are you going to use the Computer for?", [
    new Option("Gaming", "gaming"),
    new Option("Office", "office")
])));
steps.push(new Step("price", new FormRange("Price", "How much should the computer cost AT MOST?")));
steps.push(new Step("finish", new Information("Finished", "We are finished")));
//StepHandler.loadSteps(LoadMethod.JSON, JSON.stringify(steps));
StepHandler.Steps = steps;
$(document)
    .ready(StepHandler.Init);
