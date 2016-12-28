var Select = (function () {
    function Select(title, text, options) {
        this.title = title;
        this.text = text;
        this.options = options;
    }
    Select.prototype.createElement = function () {
        var $element = c('form');
        var $title = c('div', { id: "title" }).text(this.title);
        var $text = c('div', { id: "text" }).text(this.text);
        $element.append($title).append($text);
        var $select = c("select", { name: "select" });
        this.options.forEach(function (el) {
            $("option", { value: el.value }).text(el.text).appendTo($select);
        });
        $element.append($select);
        return $element;
    };
    return Select;
}());
var Check = (function () {
    function Check() {
    }
    Check.prototype.createElement = function () {
        var $element = c('form');
        var $title = c('div', { id: 'title' }).text(this.title);
        var $text = c('div', { id: 'text' }).text(this.text);
        $element.append($title).append($text);
        var $check = c('input', { name: 'check', type: 'checkbox' }).prop('checked', this.checked);
        $element.append($check);
        return $element;
    };
    return Check;
}());
//Global permanent storage of loaded Steps
var Steps;
var StepQueue;
var WizardReady;
var StepData;
/**
 * Loads the Steps from JSON, DB or from the Hardcoded Steps array
 * TODO: Make the whole function support promises, because DB and HTTP JSON GET is async
 * @param {LoadMethod} method
 * @param {Object} params
 * @returns {boolean}
 */
function loadSteps(method, params) {
    if (method === void 0) { method = LoadMethod.Local; }
    switch (method) {
        case LoadMethod.JSON:
            Steps = JSON.parse(params);
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
var LoadMethod;
(function (LoadMethod) {
    LoadMethod[LoadMethod["JSON"] = 0] = "JSON";
    LoadMethod[LoadMethod["GET"] = 1] = "GET";
    LoadMethod[LoadMethod["Local"] = 2] = "Local";
})(LoadMethod || (LoadMethod = {}));
/**
 * Return a Step with the specified ID
 *
 * @param {string} id
 * @returns {Step} If not found, will return null
 */
function getStep(id, queue) {
    if (queue) {
        return StepQueue.filter(function (x) { return x.id === id; })[0];
    }
    else {
        return Steps.filter(function (x) { return x.id === id; })[0];
    }
}
/**
 * Get the Step which is currently in the DOM.
 *
 * @returns {Step}
 */
function getCurrentStep() {
    try {
        var id = $('step').attr('id');
    }
    catch (error) {
        throw "No Step found in DOM at the moment; " + error;
    }
    return getStep(id, true);
}
/**
 * TODO: First function to be called on page load
 * Makes Wizard ready for the user
 */
function Init() {
    try {
        var $wizard = $('div#wizard');
    }
    catch (error) {
        throw "Wizard anchor div not found: " + error;
    }
    //Check if initial Step exists, else load it
    if (Steps[0] === null) {
        loadSteps();
    }
    StepQueue = Steps;
    var $initStep = Steps[0].createElement();
    $wizard.append($initStep);
    $wizard.append(createButtons());
    registerEvents();
    WizardReady = true;
}
/**
 * Creates the Next and Reset buttons
 *
 * @returns {JQuery}
 */
function createButtons() {
    var $reset = c("button", { id: "btn_reset" });
    var $next = c("button", { id: "btn_next" });
    return $reset.add($next);
}
function registerEvents() {
    $('button#btn_next').click(onNextClicked);
    $('button#btn_reset').click(Reset);
}
/**
 * Reset the Wizard, either thru hard page reload or soft JS reset
 *
 * @param {boolean} [hard=false]
 */
function Reset(hard) {
    if (hard === void 0) { hard = false; }
    if (hard) {
        window.location.reload(true);
    }
    else {
        var $wizard = $('div#wizard');
        //Reset the StepQueue
        StepQueue = Steps;
        //Reset the whole Wizard
        $wizard.empty();
        var $initStep = Steps[0].createElement();
        $wizard.append($initStep);
        $wizard.append(createButtons());
        registerEvents();
        WizardReady = true;
    }
}
var ready = false;
function onNextClicked() {
    var $next = $('button#next');
    //Verify that some data has been entered
    if (!getCurrentStep().getData()) {
        //TODO: Display a fancy warning
        $next.text('Please fill out the form first.');
        return;
    }
    if (ready) {
        $next.text('Next');
        onStepComplete();
    }
    else {
        $next.text('Confirm');
        ready = true;
    }
}
/**
 * An event that fires on Step completion/confirmation.
 * Handles the shifting of the StepQueue, displaying of next Step
 */
function onStepComplete() {
    var step = getCurrentStep();
    StepData.push(step.getData());
    StepLogic(step.id);
    StepQueue.shift(); //Remove the current Step from the Queue, and shift the next to take it's place
    var nextStep = StepQueue[0];
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
function StepLogic(currentStepID) {
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
function c(element, attributes) {
    var e = $(document.createElement(element));
    e.attr(attributes);
    return e;
}
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
        var wrapper = c('step', { id: this.id });
        return this.form.createElement().wrap(wrapper);
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
