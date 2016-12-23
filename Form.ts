/**
 * Form and its derivates are used to generate HTML code for Steps
 * 
 * @interface Form
 */
interface Form {
    title: string;
    text: string;
    createElement(this: Form): string;
}

//TODO: Use native <form> elements to simplify JSON.stringifying
class Select implements Form {
    title: string;
    text: string;
    values: string[];
    createElement(this: Form): string {
        var e = $("<select></select>");
        
        return e;
    }
    result: number;
}

class Check implements Form {
    value: boolean;
    title: string;
    text: string;
    createElement(this: Form): string {
        return;
    }
    result: boolean;
}