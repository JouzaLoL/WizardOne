/// <reference path="Step.ts" />

class StepHandler {
    static Steps: Step[] = [];
    static StepQueue: Step[] = [];
    static StepData: Object[] = [];
    static currentStepIndex: number = 0;

    /**
     * Loads the Steps using a GET request, or from a local encoded array
     * Filters out Steps marked with DynamicallyAdded tag
     * TODO: Make the whole function support promises (async GET)
     * @param {LoadMethod} method
     * @param {Object} params
     * @returns {boolean}
     */
    static loadSteps(method: LoadMethod = LoadMethod.Local, params?: any): boolean {
        switch (method) {
            case LoadMethod.GET:
                throw new Error("Not implemented yet");
                //TODO: Make a GET request to the database
            case LoadMethod.Local:
                var steps = Encoder.DecodeSteps(params);
                var filteredSteps = StepHandler.filterDynAddedSteps(steps);
                StepHandler.Steps = steps;
                StepHandler.StepQueue = filteredSteps;
                break;
            default:
                break;
        }

        return true;
    };


    /**
     * Filter out Steps with the DynamicallyAdded tag
     * 
     * @static
     * @param {Step[]} steps
     * @returns {Step[]}
     * 
     * @memberOf StepHandler
     */
    static filterDynAddedSteps(steps: Step[]): Step[] {
        return steps.filter((step) => {
            return !StepHandler.hasTag(step, StepTag.DynamicallyAdded);
        });
    }

    /**
     * Checks if a Step has the Tag specified
     * 
     * @static
     * @param {Step} step
     * @param {StepTag} tag
     * @returns {boolean}
     * 
     * @memberOf StepHandler
     */
    static hasTag(step: Step, tag: StepTag): boolean {
        if (step.tags == undefined) {
            return false
        };
        return step.tags.indexOf(tag) != -1
    }

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
     * Get all Steps whose ID contains the specified string
     * 
     * @static
     * @param {string} id
     * @param {boolean} [queue=false]
     * @returns {Step[]}
     * 
     * @memberOf StepHandler
     */
    static getStepsByIDContains(id: string, fromqueue: boolean = false): Step[] {
        if (fromqueue) {
            return StepHandler.StepQueue.filter((x: Step) => {
                x.id.indexOf(id) !== -1
            });
        } else {
            return StepHandler.Steps.filter((x: Step) => {
                x.id.indexOf(id) !== -1
            });
        }
    }

    /**
     * Get the Step which is currently in the DOM.
     * 
     * @returns {Step}
     */
    static getCurrentStep(): Step {
        try {
            var id = $('step')
                .attr('id');
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
            //TODO: loadSteps().then(success{StepQueue = Steps;};
        }

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
     * Creates the Next and Reset buttons
     * 
     * @returns {JQuery} a JQuery element containing the Next and Reset buttons
     */
    static createNav(): JQuery {
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
        } else {
            $('#btn_back')
                .show();
        }
        if (StepHandler.getCurrentStep()
            .id == "finish") {
            $('#btn_next')
                .hide();
        } else {
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

            } catch (TypeError) {
                console.log("There are no dynsteps ahead.");
                //TODO: Fix this error
                return;
            }
        }
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
        if (!StepHandler.getCurrentStep()
            .getData()) {
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
    static StepLogic(step: Step) {
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
     * Insert the Step into the StepQueue INTO THE SPECIFIED INDEX.
     * Meaning the Step will end up in the index you specified, other elements will be moved.
     * Index defaults to after current step
     * @static
     * @param {number} index
     * @param {Step} step
     * 
     * @memberOf StepHandler
     */
    static insertStep(step: Step, index: number = StepHandler.currentStepIndex + 1) {
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
    static RemoveDynAddStepsAhead(index: number = StepHandler.currentStepIndex) {
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
}


enum LoadMethod {
    GET,
    Local
}