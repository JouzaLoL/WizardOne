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
        var wrapper = StepHandler.c('step', { id: this.id });
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
            var id = $('step').attr('id');
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
    };
    ;
    /**
     * Creates the Next and Reset buttons as jQuery element
     *
     * @returns {JQuery}
     */
    StepHandler.createNav = function () {
        var $nav = StepHandler.c("div", {
            id: "navigation",
            class: "clearfix"
        });
        var $back = StepHandler.c("button", {
            id: "btn_back"
        }).text("< Back");
        var $next = StepHandler.c("button", {
            id: "btn_next"
        }).text("Next >");
        return $nav.append($back).append($next);
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
        var $progress = StepHandler.c('div', {
            id: "progress"
        });
        var $progress_bar = StepHandler.c('div', {
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
        $('button#btn_next').click(function () {
            StepHandler.onNextClicked();
            StepHandler.onStepChange();
        });
        $('button#btn_back').click(function () {
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
        StepHandler.updateProgress();
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
        //remove previous step's data
        StepHandler.StepData.pop();
        //Take the last element of the Queue (the previous Step) and put it first
        StepHandler.StepQueue.unshift(StepHandler.StepQueue.pop());
        var prevStep = StepHandler.StepQueue[0];
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
        //Verify that data was been entered
        if (!StepHandler.getCurrentStep().getData()) {
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
        StepHandler.StepQueue.push(StepHandler.StepQueue.shift());
        //Move to next step
        var nextStep = StepHandler.StepQueue[0];
        var $currentStep = step.getElement();
        var $currentForm = step.getFormElement();
        $currentStep.attr('id', nextStep.id);
        $currentStep.empty();
        $currentStep.append(nextStep.form.createElement());
    };
    /**
     * Handles individual Step logic such as disabling or reordering of Steps in the StepQueue
     * TODO: Make this information contained in a .logic() method in each Step Object
     * @param {string} currentStepID
     */
    StepHandler.StepLogic = function (currentStepID) {
        switch (currentStepID) {
            case "value":
                break;
            case "finish":
                StepHandler.onFinish();
                break;
            default:
                break;
        }
    };
    /**
     * Called when User reaches last Step (step#finish)
     *
     * @static
     *
     * @memberOf StepHandler
     */
    StepHandler.onFinish = function () {
        $('#btn_next').hide(); //we don't want the user to continue
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
        }).then(function (success) {
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
    /**
     * A wrapper for the jQuery element creation.
     * Faster and more compatible than pure jQuery
     * @param {string} element
     * @param {Object} attributes
     * @returns {JQuery}
     */
    StepHandler.c = function (element, attributes) {
        var e = $(document.createElement(element));
        if (attributes) {
            e.attr(attributes);
        }
        return e;
    };
    return StepHandler;
}());
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
var Select = (function () {
    function Select(title, text, options) {
        this.title = title;
        this.text = text;
        this.options = options;
    }
    Select.prototype.createElement = function () {
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
        this.options.forEach(function (el) {
            StepHandler.c("option", {
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
        var $element = StepHandler.c('form');
        var $title = StepHandler.c('div', {
            id: 'title'
        }).text(this.title);
        var $text = StepHandler.c('div', {
            id: 'text'
        }).text(this.text);
        $element.append($title).append($text);
        return $element;
    };
    ;
    return Information;
}());
/// <reference path="StepHandler.ts" />
//Manually load the steps for now
var steps = [];
steps.push(new Step("intro", new Information("Hello", "Hope this displays correctly :)")));
steps.push(new Step("misc_wifi", new Check("WiFi", "Do you want WiFi in your computer?", true)));
steps.push(new Step("use", new Select("Use", "What are you going to use the Computer for?", [
    new Option("Gaming", "gaming"),
    new Option("Office", "office")
])));
//StepHandler.loadSteps(LoadMethod.JSON, JSON.stringify(steps));
StepHandler.Steps = steps;
$(document).ready(StepHandler.Init);
