//Global permanent storage of loaded Steps
let Steps: Step[];

var StepQueue: Step[];

var WizardReady: boolean;

var StepData: Object[];

/**
 * Loads the Steps from JSON, DB or from the Hardcoded Steps array
 * TODO: Make the whole function support promises, because DB and HTTP JSON GET is async
 * @param {LoadMethod} method
 * @param {Object} params
 * @returns {boolean}
 */
function loadSteps(method: LoadMethod = LoadMethod.Hardcoded, params?: any): boolean {
    //TODO: Verify that IDs are unique (will be done auto on DB side)
    switch (method) {
        case LoadMethod.JSON:
            Steps = JSON.parse(params);
            break;
        case LoadMethod.DB:
            throw new Error("Not implemented yet");
        case LoadMethod.Hardcoded:
            console.log('Steps loaded from hardcoded Steps array');
        default:
            break;
    }

    return true;
}

enum LoadMethod {
    JSON,
    DB,
    Hardcoded
}

/**
 * Return a Step with the specified ID
 * 
 * @param {string} id 
 * @returns {Step} If not found, will return null
 */
function getStep(id: string, queue?: boolean): Step {
    if (queue) {
        return StepQueue.filter((x: Step) => x.id === id)[0];
    } else {
        return Steps.filter((x: Step) => x.id === id)[0];
    }
}

/**
 * Get the Step which is currently in the DOM.
 * 
 * @returns {Step}
 */
function getCurrentStep(): Step {
    try {
        var id = $('step').attr('id');
    } catch (error) {
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
    } catch (error) {
        throw "Wizard anchor div not found: " + error;
    }

    //Check if initial Step exists, else load it
    if (Steps[0] === null) {
        loadSteps();
        StepQueue = Steps;
        //TODO: loadSteps().then(success{queue steps}
    } else {

    }

    var $initStep = Steps[0].createElement();
    $wizard.append($initStep);

    $wizard.append(createButtons());
    registerEvents();

    WizardReady = true;
}

function createButtons(): JQuery {
    var $reset = c("button", { class: "btn_reset", id: "btn_reset" });
    var $next = c("button", { class: "btn_next", id: "btn_next" });

    return $reset.append($next);
}

function registerEvents() {
    $('button#btn_next').click(onStepComplete);
    $('button#btn_reset').click(Reset);
}

function Reset() {
    //force the reload, clearing the cache to avoid JS problems
    window.location.reload(true);
    //TODO: implement a reset without reloading the page
}


/**
 * An event that fires on Step completion/confirmation.
 * Handles the shifting of the StepQueue, displaying of next Step
 */
function onStepComplete() {
    var step = getCurrentStep(); //!: see if JS creates copies of objects or if the original object in the StepsQueue array got changed

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
 * TODO: Make this information contained in a .logic() method in each Step Objects
 * @param {string} currentStepID
 */
function StepLogic(currentStepID: string) {
    switch (currentStepID) {
        case "value":

            break;

        default:
            break;
    }
}

/**
 * A wrapper for the jQuery element creation
 * Faster and more compatible than pure jQuery
 * @param {string} element
 * @param {Object} attributes
 * @returns {JQuery}
 */
function c(element: string, attributes: Object): JQuery {
    var e = $(document.createElement(element));
    e.attr(Object);
    return e;
}
