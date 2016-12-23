
/**
 * Returns an element wrapped in <form>
 * 
 * @param {JQuery} o
 * @returns {string}
 */
function Wrap(o: JQuery): JQuery {
    return o.wrap("<form></form>");
}


/**
 * Form and its derivates are used to generate the Form element
 *
 * @interface Form
 */
interface Form {
    title: string;
    text: string;
    createElement(): JQuery;
}

class Select implements Form {
    title: string;
    text: string;
    /**
     * First is value, second is text
     * 
     * @type {[string, string][]}
     * @memberOf Select
     */
    options: [string, string][];
    createElement(): JQuery {
        var e = $("select", {name: "select"}); //TODO: Verify that this works, if not try with <select> and </select>
        this.options.forEach(el => {
            $("option", { value: el[0], text: el[1] }).appendTo(e);
        });
        return Wrap(e);
    }
    constructor(title: string, text: string, options: [string, string][]) {
        this.title = title;
        this.text = text;
        this.options = options;
    }
}

class Check implements Form {
    value: boolean;
    title: string;
    text: string;
    createElement(): JQuery {
        var e = $("input", {name: "check", type: "checkbox"});
        return e;
    }
}