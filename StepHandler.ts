/// <reference path="Step.ts" />

class StepHandler {
    static Steps: Step[] = [];
    static StepQueue: Step[] = [];
    static StepData: Object[] = [];

    /**
     * Loads the Steps from JSON, DB or from the Hardcoded Steps array
     * TODO: Make the whole function support promises, because DB and HTTP JSON GET is async
     * @param {LoadMethod} method
     * @param {Object} params
     * @returns {boolean}
     */
    static loadSteps(method: LoadMethod = LoadMethod.Local, params?: any): boolean {
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

    /**
     * Return a Step with the specified ID
     * 
     * @param {string} id 
     * @returns {Step} If not found, will return null
     */
    static getStep(id: string, queue?: boolean): Step {
        if (queue) {
            return StepHandler.StepQueue.filter((x: Step) => x.id === id)[0];
        } else {
            return StepHandler.Steps.filter((x: Step) => x.id === id)[0];
        }
    };

    /**
     * Get the Step which is currently in the DOM.
     * 
     * @returns {Step}
     */
    static getCurrentStep(): Step {
        try {
            var id = $('step').attr('id');
        } catch (error) {
            throw "No Step found in DOM at the moment; " + error;
        }
        return StepHandler.getStep(id, true);
    };

    /**
     * First fn to be called on document.load
     * 
     * @description Makes Wizard ready for the user
     */
    static Init() {
        try {
            var $wizard = $('div#wizard');
        } catch (error) {
            throw "Wizard anchor div not found: " + error;
        }

        //Check if initial Step exists, else load it
        if (StepHandler.Steps[0] === null) {
            StepHandler.loadSteps();
            //TODO: loadSteps().then(success{StepQueue = Steps;}
        }
        StepHandler.StepQueue = StepHandler.Steps;

        var $initStep = StepHandler.Steps[0].createElement();
        $wizard.append($initStep);

        $wizard.append(StepHandler.createButtons());
        StepHandler.registerEvents();
    };

    /**
     * Creates the Next and Reset buttons
     * 
     * @returns {JQuery}
     */
    static createButtons(): JQuery {
        var $reset = StepHandler.c("button", {
            id: "btn_reset"
        });
        var $next = StepHandler.c("button", {
            id: "btn_next"
        });

        return $reset.add($next);
    };

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
    static Reset(hard: boolean = false) {
        if (hard) {
            window.location.reload(true);
        } else {
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
    };

    static readyForNext: boolean = false;

    static onNextClicked() {
        var $next = $('button#next');

        //Verify that some data has been entered
        if (!StepHandler.getCurrentStep().getData()) {
            //TODO: Display a fancy warning
            $next.text('Please fill out the form first.')
            return;
        }

        if (StepHandler.readyForNext) {
            $next.text('Next');
            StepHandler.onStepComplete();
        } else {
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
    static StepLogic(currentStepID: string) {
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

    static c(element: string, attributes?: Object): JQuery {
        var e = $(document.createElement(element));
        if (attributes) {
            e.attr(attributes);
        }
        return e;
    }

}

enum LoadMethod {
    JSON,
    GET,
    Local
}