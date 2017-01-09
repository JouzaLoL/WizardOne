/// <reference path="Step.ts" />

class StepHandler {
    static Steps: Step[] = [];
    static StepQueue: Step[] = [];
    static StepData: Object[] = [];
    static currentStepIndex: number = 0;

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
        //Check for the wizard anchor
        try {
            var $wizard = $('div#wizard');
        } catch (error) {
            throw "Wizard anchor div not found: " + error;
        }

        //Check if Steps are loaded
        if (StepHandler.Steps[0] === null) {
            StepHandler.loadSteps();
            //TODO: loadSteps().then(success{StepQueue = Steps;}
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

    /**
     * Creates the Next and Reset buttons as jQuery element 
     * 
     * @returns {JQuery}
     */
    static createNav(): JQuery {
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
    static createProgressBar(): JQuery {
        var $progress = StepHandler.c('div', {
            id: "progress"
        });

        var $progress_bar = StepHandler.c('div', {
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
        $('button#btn_next').click(() => {
            StepHandler.onNextClicked();
            //onStepChange called in onStepComplete
        });
        $('button#btn_back').click(() => {
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
        if (StepHandler.getCurrentStep().id == "start") {
            $('#btn_back').hide();
        } else {
            $('#btn_back').show();
        }
        if (StepHandler.getCurrentStep().id == "finish") {
            $('#btn_next').hide();
        } else {
            $('#btn_next').show();
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
    }

    static readyForNext: boolean = false;

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
        if (!StepHandler.getCurrentStep().getData()) {
            //TODO: Display a fancy warning
            $next.text('Please fill out the form first.')
            return;
        }

        //Confirm functionality
        if (StepHandler.readyForNext) {
            $next.text('Next >');
            StepHandler.readyForNext = false;
            StepHandler.onStepComplete();
        } else {
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
    }

    /**
     * Handles individual Step logic such as disabling or reordering of Steps in the StepQueue
     * TODO: Make this information contained in a .logic() method in each Step Object
     * @param {string} stepID
     */
    static StepLogic(stepID: string) {
        switch (stepID) {
            case "value":

                break;
            case "finish": //Wizard is complete
                StepHandler.onFinish();
                break;
            case "start": //Wizard is complete
                StepHandler.onStart();
                break;
            default:
                break;
        }
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
        }).then((success) => {
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
    static Reset(hard: boolean = false) {
        if (hard) {
            window.location.reload(true);
        } else {
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

            //TODO: Create Progress Bar
        }
    };

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