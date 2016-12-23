//Global permanent storage of loaded Steps
let Steps: Step[];

/**
 * Loads the Steps from JSON, DB or from the Hardcoded Steps array
 * 
 * @param {LoadMethod} method
 * @param {Object} params
 * @returns {boolean}
 */
function loadSteps(method: LoadMethod, params: any): boolean {
    if ((params || method) === null) {
        throw new Error("Parameters cannot be null");
    }
    //TODO: Verify that IDs are unique
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
 * Returns a Step with the specified ID
 * 
 * @param {string} id 
 * @returns {Step} If not found, will return null
 */
function getStep(id: string): Step {
    return Steps.filter((x: Step) => x.id === id)[0];
}

var StepQueue: Step[];

function registerEvents() {
    //TODO: Register onStepComplete to the Next button
    //TODO: Register Reset to the Reset button
}

function Init() {
    //TODO: Find the div#wizard and append initialStep (Steps[0])
    //TODO: Create Next and Reset buttons
}

function getCurrentStep(): Step {
    var id = $('step').attr('id');
    return getStep(id);
}

/**
 * An event that fires on Step completion/confirmation.
 * 
 */
function onStepComplete() {
    var step = getCurrentStep();
    step.getData(); //TODO: Store the data
    step.state = StepState.Complete;
    $('step#' + step.id).remove(); //Remove the Step from the DOM

    StepLogic(step.id);
    DisplayNextStep();
}

function StepLogic(currentStepID: string) {

}


function DisplayNextStep() {

}
