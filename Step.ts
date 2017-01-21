/// <reference path="Form.ts" />
/// <reference path="StepHandler.ts" />

/**
 * Step:
 * -generates Step element
 * -extracts information from its Form
 * @class Step
 */
class Step {
    id: string;
    form: Form;
    tags: StepTag[];
    createElement(): JQuery {
        var wrapper = FormHelper.c('step', { id: this.id });
        var el = wrapper.append(this.form.createElement());
        return el;
    }
    getElement(): JQuery {
        return $('#' + this.id);
    };
    getFormElement(): JQuery {
        return $('#' + this.id + ' > ' + 'form');
    }
    /**
     * Serializes the form data into a JS object
     * 
     * @returns {Object} The JS object containing the form data
     * 
     * @memberOf Step
     */
    getData(): IStepData {
        var a = this.getFormElement().serializeArray();

        var stepData: IStepData = {
            id: this.id,
            tags: this.tags,
            data: {}
        };

        $.each(a, function () {
            if (stepData.data[this.name]) {
                if (!stepData.data[this.name].push) {
                    stepData.data[this.name] = [stepData.data[this.name]];
                }
                stepData.data[this.name].push(this.value || '');
            } else {
                stepData.data[this.name] = this.value || '';
            }
        });
        
        return stepData;


    };
    constructor(id: string, form: Form, tags?: StepTag[]) {
        this.id = id;
        this.form = form;
        this.tags = tags;
    }
}

enum StepTag {
    Dynamic,
    DynamicallyAdded
}

interface IStepData {
    id: string;
    tags: StepTag[];
    data: Object;
}