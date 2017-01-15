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
        var wrapper = FormHelper.c('step', {id: this.id});
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
    getData(): Object {
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
        return o;
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