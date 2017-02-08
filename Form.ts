/// <reference path="StepHandler.ts" />
/**
 * IForm and its derivates are used to generate the Form element
 *
 * @interface IForm
 */
interface IForm {
    title: string;
    text: string;
    createElement(): JQuery;
}

class Select implements IForm {
    title: string;
    text: string;
    options: FormOption[];
    createElement(): JQuery {
        var $element = FormHelper.createForm(this.title, this.text);

        var $select = FormHelper.c("select", {
            name: "select"
        });
        this.options.forEach(el => {
            FormHelper.c("option", {
                value: el.value
            })
                .text(el.text)
                .appendTo($select);
        });
        $element.append($select);

        return $element;
    }
    constructor(title: string, text: string, options: FormOption[]) {
        this.title = title;
        this.text = text;
        this.options = options;
    }
}

class FormOption {
    text: string;
    value: string;
    constructor(text: string, value: string) {
        this.text = text;
        this.value = value;
    }
}

class Checkbox implements IForm {
    title: string;
    text: string;
    checked: boolean;
    createElement(): JQuery {

        var $element = FormHelper.createForm(this.title, this.text);

        var $check = FormHelper.c('input', {
            name: 'checkbox',
            type: 'checkbox'
        })
            .prop('checked', this.checked);
        $element.append($check);

        return $element;
    };
    constructor(title: string, text: string, checked: boolean = false) {
        this.title = title;
        this.text = text;
        this.checked = checked;
    }
}

class Radio implements IForm {
    title: string;
    text: string;
    options: RadioOption[];
    createElement(): JQuery {
        var $element = FormHelper.createForm(this.title, this.text);

        this.options.forEach(el => {
            FormHelper.c("input", {
                type: "radio",
                name: "select",
                value: el.value
            })
                .appendTo($element)
                .after($(document.createTextNode(el.text)));
        });

        return $element;
    }
    constructor(title: string, text: string, options: RadioOption[]) {
        this.title = title;
        this.text = text;
        this.options = options;
    }
}

class RadioOption {
    text: string;
    value: string;
    constructor(text: string, value: string) {
        this.text = text;
        this.value = value;
    }
}

class Information implements IForm {
    title: string;
    text: string;
    createElement(): JQuery {

        var $element = FormHelper.createForm(this.title, this.text);

        return $element;
    };
    constructor(title: string, text: string) {
        this.title = title;
        this.text = text;
    }
}

class FormRange implements IForm {
    title: string;
    text: string;
    value: number;
    min: number;
    max: number;
    step: number;
    defaultValue: number;
    createElement(): JQuery {

        var $element = FormHelper.createForm(this.title, this.text);
        // Fix for the pesky "this"" handling in JS :/
        var THIS = this;
        var $range = FormHelper.c('input', {
            type: "range",
            name: "range",
            min: THIS.min,
            max: THIS.max,
            step: THIS.step,
            defaultValue: THIS.defaultValue
        });
        $element.append($range);

        return $element;
    };
    constructor(title: string, text: string, min: number = 0, max: number = 30000, step: number = 500, defaultValue: number = 20000) {
        this.title = title;
        this.text = text;
        this.min = min;
        this.max = max;
        this.step = step;
        this.defaultValue = defaultValue;
    }
}

class Finish implements IForm {
    title: string;
    text: string;
    createElement(): JQuery {

        var $element = FormHelper.createForm(this.title, this.text);
        var $finishbutton = FormHelper.c("button", {
            type: "button",
            id: "btn_finish"
        })
            .text("Dokončit");
        $element.append($finishbutton);

        return $element;
    };
    constructor(title: string, text: string) {
        this.title = title;
        this.text = text;
    }
}

class FormHelper {
    /**
     * A wrapper for the jQuery element creation.
     * Faster and more compatible than pure jQuery
     * @param {string} element Tag name of the element. E.g. 'form', 'div'
     * @param {Object} attributes Attributes of the element. Format: { attribute: "value" }
     * @returns {JQuery}
     */
    static c(element: string, attributes?: Object): JQuery {
        var e = $(document.createElement(element));
        if (attributes) {
            e.attr(attributes);
        }
        return e;
    }

    /**
     * Creates a basic Form with Title and Text and returns it as a JQuery object
     *
     * @static
     * @param {string} title
     * @param {string} text
     * @returns {JQuery}
     *
     * @memberOf FormHelper
     */
    static createForm(title: string, text: string): JQuery {
        var $element = FormHelper.c('form');

        var $title = FormHelper.c('div', {
            id: 'title'
        })
            .text(title);
        var $text = FormHelper.c('div', {
            id: 'text'
        })
            .text(text);
        $element.append($title)
            .append($text);

        return $element;
    }
}