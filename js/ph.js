'use strict';

class PhElement extends HTMLElement {
    static get observedAttributes() {
        return Object.keys(this.mappedAttributes || {});
    }

    static get propertyAttributeMap() {
        if (!this.mappedAttributes) {
            return {};
        }

        let pam = {};

        for (let k in this.mappedAttributes) {
            pam[this.mappedAttributes[k]] = k;
        }

        return pam;
    }

    constructor() {
        super();

        let root = this.attachShadow({
            'mode': 'open'
        });

        let contentNodeArray = this.constructor.template.content.children;

        var html = '';
        for (var i = 0; i < contentNodeArray.length; i++) {
            html += contentNodeArray[i].outerHTML;
        }

        this.shadowRoot.innerHTML = html;
    }

    connectedCallback() {
        for (let i = 0; i < this.attributes.length; i++) {
            var attr = this.attributes[i];

            if (attr.name in this) {
                this[attr.name] = attr.value;
            }
        }
    }

    attributeChangedCallback(attr, oldValue, newValue) {
        this[this.constructor.mappedAttributes[attr]] = newValue;
    }

    /*
     * sq - shadow query
     * Execute querySelector against this node's shadowRoot.
     */
    sq(query) {
        return this.shadowRoot.querySelector(query);
    }

    /*
     * sqa - shadow query all
     * Execute querySelectorAll against this node's shadowRoot.
     */
    sqa(query) {
        return this.shadowRoot.querySelectorAll(query);
    }

    // credit https://stackoverflow.com/a/54532941/149407
    // but I feel this code is needlessly tricky
    closestElement(
        selector,      // selector like in .closest()
        base = this,   // extra functionality to skip a parent
        __Closest = (el, found = el && el.closest(selector)) =>
            !el || el === document || el === window
                ? null // standard .closest() returns null for non-found selectors also
                : found
                    ? found // found a selector INside this element
                    : __Closest(el.getRootNode().host) // recursion!! break out to parent DOM
    ) {
        return __Closest(base);
    }

    get templateElement() {
        return this.constructor.template;
    }

    get g() {
        if (!this._g) {
            this._g = new Proxy({}, {
                get: (o, p) => {
                    return this.sq('#' + p);
                }
            });
        }

        return this._g;
    }
}

/*
 * phInit
 * Called after DOMContentLoaded to load all ph-include files and
 * process all PH web component templates.
 */
function phInit() {
    var head = document.querySelector('head');

    function titleCase(s) {
        return s && s[0].toUpperCase() + s.slice(1);
    }

    function nameToClassName(name) {
        return name.split('-').map(titleCase).join('');
    }

    function classFromClassName(className) {
        try {
            return eval(className);
        } catch (e) {
            return undefined;
        }
    }

    function appendScript(script) {
        let scriptNode = document.createElement('script');

        scriptNode.innerHTML = script;
        head.appendChild(scriptNode);
    }

    function loadComponents(root) {
        // execute all global include scripts
        root.querySelectorAll('script').forEach(function(script) {
            appendScript(script.innerHTML);
        });

        // process each template element
        root.querySelectorAll('template').forEach(function(template) {
            let tagName = template.getAttribute('name');

            if (!tagName) {
                // not a PH template
                return;
            }

            let className = nameToClassName(tagName);

            let mainScript = template.content.querySelector('script');
            if (mainScript) {
                mainScript.parentNode.removeChild(mainScript);

                try {
                    eval(mainScript.innerHTML);

                    var nse = document.createElement('script');
                    nse.appendChild(document.createTextNode(mainScript.innerHTML));
                    head.appendChild(nse);
                } catch (e) {
                    console.log('error creating class for ' + tagName + ' element:', e)
                }
            }

            let customClass = classFromClassName(className);
            if (!customClass) {
                // no custom class defined for this component, so
                // create a dummy class
                appendScript('class ' + className + ' extends PhElement {}');
                customClass = classFromClassName(className);

                console.warn('element ' + tagName + ': no class custom class defined (missing <script> tag in template?)');
            }

            customClass.tagName = tagName;
            customClass.template = document.importNode(template, true);

            customElements.define(tagName, customClass);
        });
    }

    let phIncludeQueue = [];

    function processPhIncludes(e) {
        let includesArray = document.querySelectorAll('ph-include');

        includesArray.forEach((phInclude) => {
            if (phInclude.innerHTML != '') {
                // it has already been included
                return;
            }

            phIncludeQueue.push(phInclude);
        });

        processPhIncludeQueue();
    }

    async function processPhIncludeQueue() {
        let phInclude = phIncludeQueue.shift();

        if (!phInclude) {
            document.dispatchEvent(new CustomEvent('ph-loaded'));
            return;
        }

        let response = await fetch(phInclude.getAttribute('src'));

        if (response.ok) {
            phInclude.innerHTML = await response.text();

            loadComponents(phInclude);
        }

        processPhIncludeQueue();
    }

    document.querySelectorAll('ph-components').forEach((phComponents) => {
        loadComponents(phComponents);
    });

    processPhIncludes();
}
