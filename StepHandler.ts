//Global storage of loaded Steps
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
 * Confirms the Step specified.
 * 
 * @param {string} id The ID of the Step we want to confirm
 * @returns {boolean} Represents failure/success
 */
function confirmStep(id: string): void {
    getStep(id).confirm();
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