/**
 * Step:
 * -contains and updates information about individual Step
 * -handles events on self such as State change
 * -parses information from child form
 * @class Step
 */
class Step {
    id: string;
    state: StepState;
    form: Form;
    confirm(): boolean {
        //TODO: Check if this step === StepHandler.CurrentStep
        try {
            //Detach the elem but keep the jQuery object, since we might need it later
            var $step = $('step#' + this.id).detach();
        } catch (error) {
            throw new Error("Step not found in DOM");
        }

        this.state = StepState.Complete;

        return true;
    };
    getElement(): JQuery {
        return $('#' + this.id);
    };
    getFormElement(): JQuery {
        return $('#' + this.id + ' > ' + 'form');
    }
    
    /**
     * Extract data from the Step
     * 
     * @returns {string} JSON object of the Form data
     * 
     * @memberOf Step
     */
    getData(): string {
        var o = {};
        var a = this.getFormElement().serializeArray();
        $.each(a, function () {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return JSON.stringify(o);
    };
}

/**
 * Represents the state of the Step
 * Queued - Step is waiting in Queue
 * Complete - User has completed this Step
 * Disabled - Step was removed from the Queue due to previous user input
 * 
 * @enum {number}
 */
enum StepState {
    Queued,
    Complete,
    Disabled
}