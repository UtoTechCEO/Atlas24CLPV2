(function() {
    
    /* ====== Global constants ====== */
    const locale_de = {
        days: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
        daysShort: ['Son', 'Mon', 'Die', 'Mit', 'Don', 'Fre', 'Sam'],
        daysMin: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
        months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
        monthsShort: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
        today: 'Heute',
        clear: 'Löschen',
        dateFormat: 'dd.MM.yyyy',
        timeFormat: 'HH:mm',
        firstDay: 1
    };

    const ATTRIBUTE_VALIDATION_METHOD = 'data-atlui-validation-method';
    const ATTRIBUTE_VALIDATION_SIBLING = 'data-atlui-validation-sibling';

    /* ====== Global elements ====== */
    const btn_nxt = document.getElementById('atlui_btn_next');
    const btn_fwd = document.getElementById('atlui_btn_forward');
    const btn_back = document.getElementById('atlui_btn_back');
    const btn_submit = document.getElementById('atlui_btn_submit');
    const dropdown_service = document.getElementById('Service');
    const title_move_out_1 = document.getElementById('title_move_out_1');
    const title_move_out_2 = document.getElementById('title_move_out_2');
    const label_move_date = document.getElementById('label_move_date');

    /* ====== Validation ====== */
    const validation_reg_exp = {
        email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
        phone: /(?:\b(0041|0)|\b\+41)(\s?\(0\))?\s?[7][5-9]\s?[0-9]{3}\s?[0-9]{2}\s?[0-9]{2}\b/, /*<-- Only Mobile|| All Phone Numbers --> /(\b(0041|0)|\B\+41)(\s?\(0\))?(\s)?[1-9]{2}(\s)?[0-9]{3}(\s)?[0-9]{2}(\s)?[0-9]{2}\b/,*/
        swiss_zip_code: /^(10[0-9]{2}|1[1-9][0-9]{2}|[2-8][0-9]{3}|9[0-5][0-9]{2}|960[0-9]|961[0-9]|962[0-9]|963[0-9]|964[0-9]|965[0-8])$/,
        street_num: /\d+[a-b]?\.?/,
        date: /\d{2}(\.|-)\d{2}(\.|-)\d{4}$/
    };

    const validation_methods = {
        non_empty: (v) => { return v.length > 0; },
        email: (v) => { return validation_reg_exp.email.test(v); },
        phone: (v) => { return validation_reg_exp.phone.test(v); },
        swiss_zip_code: (v) => { return validation_reg_exp.swiss_zip_code.test(v); },
        contains_street_num: (v) => { return validation_reg_exp.street_num.test(v); },
        date: (v) => { return validation_reg_exp.date.test(v); }
    };
    

    /* ====== View Index ====== */
    const start_index = 1, end_index = 3;
    var view_index = start_index;
	
	function update_button_states() {
    switch(view_index) {
        case start_index:
            btn_nxt.classList.add('atlui_hidden');
            btn_fwd.classList.remove('atlui_hidden');
            btn_back.classList.add('atlui_hidden');
            btn_submit.classList.add('atlui_hidden');
            break;

        case end_index:
            btn_nxt.classList.add('atlui_hidden');
            btn_fwd.classList.add('atlui_hidden');
            btn_back.classList.remove('atlui_hidden');
            btn_submit.classList.remove('atlui_hidden');
            break;

        default:
            btn_nxt.classList.remove('atlui_hidden');
            btn_fwd.classList.add('atlui_hidden');
            btn_back.classList.remove('atlui_hidden');
            btn_submit.classList.add('atlui_hidden');
    }
}


    function update_views() {
    update_button_states();

    document.querySelectorAll('[data-step-index]').forEach((elem) => {
        if (parseInt(elem.dataset.stepIndex) === view_index) {
            elem.classList.remove('atlui_hidden');
        } else {
            elem.classList.add('atlui_hidden');
        }
    });

    const progressbar = document.querySelector('.atlui_progress_container');
    if (progressbar) {
        if (view_index === 1) {
            progressbar.classList.add('atlui_hidden_by_step');
        } else {
            progressbar.classList.remove('atlui_hidden_by_step');
        }
    }
}

function init_pagination() {
    

    btn_fwd.addEventListener('click', (e) => {
        if ((view_index + 1) <= end_index) {
            if (validate_current_section()) {
                view_index++;
                update_views();
            }
        }
    });

    btn_nxt.addEventListener('click', (e) => {
        if ((view_index + 1) <= end_index) {
            if (validate_current_section()) {
                view_index++;
                update_views();
            }
        }
    });

    btn_back.addEventListener('click', (e) => {
        if ((view_index - 1) >= start_index) {
            view_index--;
            update_views();
        }
    });
}





    /* ====== Button load animation ====== */
    const load_span = document.createElement('span');
    load_span.classList.add('atlui_load_spinner');
    
    const submit_btn = document.getElementById('atlui_btn_submit');
    const btn_txt = submit_btn.innerText;
    const submit_btn_enter_load = () => {
        submit_btn.disabled = true;
        submit_btn.innerHTML = load_span.outerHTML;
    };

    const submit_btn_exit_load = () => {
        submit_btn.disabled = false;
        submit_btn.innerText = btn_txt;
    };

    /* ====== Form submission (Adapted for Test-DB API Endpoint) ====== */
    async function submit_form(e) {
        e.preventDefault();

        //If we had a server error, we might still have the error message
        let server_invalid_span = document.getElementById('atlui_server_invalid');
        server_invalid_span.classList.add('atlui_hidden');
 
        if(validate_current_section()) {
            submit_btn_enter_load();
            const form_data = new FormData(e.target);

            let obj_entries = Object.fromEntries(form_data.entries()); //statisch mit Testverknüpft
            let response = await fetch(`https://test.atlas24.ch/?rest_route=/atlas24-api/v1/create_lead/`, {

                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',   
                },
                body: JSON.stringify(obj_entries),
                cache: 'no-store'
            });

            if(response.ok) {
                //Redirect to the 2FA page if lead creation was successful
                let token = await response.text();
                token = token.replaceAll('"', ''); //Restated due to asynchronus function call (retruns promise)
                window.location.href = `${window.location.origin}/validate_phone_number?token=${token}`;
            } else {
                //Else display the 'Serverseitige Validierung Fehlgeschlagen' error message
                submit_btn_exit_load();
                server_invalid_span.classList.remove('atlui_hidden');
            }   
        }

        return false; //Prevent double submission
    }

    /* ====== Form validation ====== */
    var atlui_validation_map = new Map();
    class atlui_form_field {
        constructor(elem, validation_method, sibling_name) {
            this.elem = elem;
            this.elem.addEventListener('input', this.input.bind(this));
            this.elem.addEventListener('focusout', this.focus_out.bind(this));
            this.validation_method = validation_method;
            this.sibling_name = sibling_name;
            this.input_validation_toggle = false;
        }

        validate() {
            const is_valid = this.validation_method(this.elem.value);
            update_validation_message(this.elem, is_valid);
            update_progress();

            //Validate the siblings...
            //This needs to be done because the google places api will auto-fill the zip-code, which might lead to an erroneous validation message 
            if(this.sibling_name && atlui_validation_map.has(this.sibling_name)) {
                atlui_validation_map.get(this.sibling_name).validate();
            }

            //Reset input validation toggle for on_input events
            this.input_validation_toggle = !is_valid;
            return is_valid;
        }

        is_valid() { return this.validation_method(this.elem.value); }

        input() {
            if(this.input_validation_toggle && this.is_valid()) {
                update_validation_message(this.elem, true);
                update_progress();
                this.input_validation_toggle = false;
            }
        }

        focus_out() { 
            setTimeout(this.validate.bind(this), 200);
        }
    }

    function update_validation_message(elem, is_valid) {
        //Show validation error message on element, else remove error message
        const next_sibling = elem.nextElementSibling;
        if(!is_valid) {
            elem.classList.add('atlui_element_validation_error');
            if(next_sibling.tagName === 'SPAN')
                next_sibling.classList.remove('atlui_hidden');
        } else {
            elem.classList.remove('atlui_element_validation_error');
            if(next_sibling.tagName === 'SPAN')
                next_sibling.classList.add('atlui_hidden');
        }
    }

    function add_element_to_validation_map(key, elem) {
        //Resolve the validation method for the element
        let validation_method = null;
        const validation_method_name = elem.getAttribute(ATTRIBUTE_VALIDATION_METHOD);
        if(validation_method_name) {
            validation_method = validation_methods[validation_method_name];
        } else {
            console.warn(`[ATLAS_24] <input> elment is missing ${ATTRIBUTE_VALIDATION_METHOD}: ${elem.name}`);
            return;
        }
        
        //Get the 'validation sibling' for the element (if any)
        const validation_sibling = elem.getAttribute(ATTRIBUTE_VALIDATION_SIBLING);

        //Add the element as a new atlui_form_field object to our validation map
        atlui_validation_map.set(key, new atlui_form_field(elem, validation_method, validation_sibling));
    }

    function remove_element_from_validation_map(key) {
        if(atlui_validation_map.has(key))
            atlui_validation_map.remove(key);
    }

    function initialize_element_validation() {
        //Initalize atlui_form_field(s) for validation
        document.querySelectorAll('input[class*="atlui_block"]').forEach((elem) => {
            add_element_to_validation_map(elem.name, elem);
        });
    }

    /* ====== Progressbar ====== */
    const progress_fill = document.querySelector('.atlui_progress_bar.atlui_progress_fill');
    const get_rgb_for_progress = (percent) => { 
        switch(percent) {
            case 10:
            case 20:
            case 30:
                return 'rgb(234, 0, 0)';
            case 40:
            case 50:
            case 60:
                return 'rgb(234, 165, 0)';
            case 70:
            case 80:
            case 90:
                return 'rgb(234, 204, 0)';
            case 100:
                return 'rgb(90, 165, 0)';
        }
        return ;
    }; 

    let progress_bar_step = 10;
    const field_weights = {
    'MoveFromAddrZip': 40,
    'MoveFromAddrStreet': 10,
    'MoveToAddrStreet': 15,
    'MoveToAddrZip': 10,
    'Email': 5,
    'Phone': 5,
    'MovingDate': 5,
    'FirstName': 5,
    'LastName': 5,
    'Remarks': 5
};

const update_progress = () => {
    console.log('[Progress] update_progress() wurde aufgerufen');

    let current_progress = 0;

    atlui_validation_map.forEach((field_obj) => {
        const elem = field_obj.elem;
        if (!elem) {
            console.warn('[Progress] Kein Element in field_obj:', field_obj);
            return;
        }

        const field_name = elem.name;
        const is_text_field = ['text', 'email', 'tel', 'date', 'number'].includes(elem.type) || elem.tagName.toLowerCase() === 'textarea';


        console.log(`[Progress] ${field_name} | Typ: ${elem.type} | Valid: ${field_obj.is_valid()} | Gewicht: ${field_weights[field_name] || 0}`);

        if (is_text_field && field_obj.is_valid()) {
            const raw_weight = field_weights[field_name] || 0;
            const weight = Math.max(raw_weight, 5);
            current_progress += weight;
        }
    });

    console.log(`[Progress] Gesamtpunkte: ${current_progress}`);

    let progress_rounded = Math.min(Math.round(current_progress), 100);

    progress_fill.style.background = get_rgb_for_progress(progress_rounded);
    progress_fill.style.width = `${progress_rounded}%`;
    progress_fill.innerText = progress_rounded >= 10 ? `${progress_rounded}%` : '';
};




    function validate_current_section() {
        let section_is_valid = true;
        const current_section_elements = document.querySelectorAll(`[data-step-index="${view_index}"] input:not(.ignore)`);

        current_section_elements.forEach((elem) => {
            let elem_is_valid = true;
            if(elem.type !== 'radio') { //Exclude radio buttons as they should always have a value
                switch(elem.name) {
                    case 'MoveFromAddrStreet':
                    case 'MoveToAddrStreet':
                        elem_is_valid = validation_methods.contains_street_num(elem.value);
                        break;

                    case 'MoveFromAddrZip':
                    case 'MoveToAddrZip':
                        elem_is_valid = validation_methods.swiss_zip_code(elem.value);
                        break;

                    case 'Email':
                        elem_is_valid = validation_methods.email(elem.value);
                        break;
                    
                    case 'Phone':
                        elem_is_valid = validation_methods.phone(elem.value);
                        break;
                    
                    case 'MovingDate':
                        elem_is_valid = validation_methods.date(elem.value);
                        break;

                    default:
                        elem_is_valid = validation_methods.non_empty(elem.value);
                }

                //Show validation error message on element, else remove error message
                const next_sibling = elem.nextElementSibling;
                if(!elem_is_valid) {
                    section_is_valid = false;
                    elem.classList.add('atlui_element_validation_error');
                    if(next_sibling.tagName === 'SPAN')
                        next_sibling.classList.remove('atlui_hidden');
                } else {
                    elem.classList.remove('atlui_element_validation_error');
                    if(next_sibling.tagName === 'SPAN')
                        next_sibling.classList.add('atlui_hidden');
                }
            }
        });

        return section_is_valid;
    }

    /* ====== Initialization ====== */
    function init_form() {
       
        //Initialize AirDatepicker with proper locale settings
        new AirDatepicker('#MovingDate', {
            locale: locale_de,
            minDate: Date.now() + 259200000,
            onSelect({date, formattedDate, datepicker}) {
                datepicker.$el.dispatchEvent(new Event('focusout', { bubbles: true }));
            }
        });

        //Add submit-handler
        document.querySelector('.atlui_form').addEventListener('submit', submit_form);

        //Some fields should be removed for form quick when using it for 'reinigungen'
        dropdown_service.addEventListener('change' , (e) => {
            let mutate_elems = document.querySelectorAll('.atlui_hide_for_clean');
            let cleaning = +e.target.value === 2;
            mutate_elems.forEach((elem) => {
                if(cleaning) {
                    elem.classList.add('atlui_hidden');
                    elem.querySelector('input')?.classList.add('ignore');
                    
                    //Remove element from validation map
                    remove_element_from_validation_map(elem.name);
                    progress_bar_step = 14.3; //100 / 7
                    update_progress();
                } else {
                    elem.classList.remove('atlui_hidden');
                    elem.querySelector('input')?.classList.remove('ignore');

                    //Add element to validation map
                    add_element_to_validation_map(elem.name, elem);
                    progress_bar_step = 11.1; //100 / 9
                    update_progress();
                }
            });

            if(cleaning) {
                title_move_out_1.innerText = "Adresse";
                title_move_out_2.innerText = "Reinigungs Ort";
                label_move_date.innerText = "Reinigungstermin";
            } else {
                title_move_out_1.innerText = "Auszug";
                title_move_out_2.innerText = "Am Auszugsort";
                label_move_date.innerText = "Umzugstermin";
            }
        });

        initialize_element_validation();
		

    }

    function prevent_form_submit_on_enter(e) {
        if(e.keyCode == 13) {
            e.preventDefault();
            return false;
        }
    }
    
    //Register global event handlers
window.addEventListener('DOMContentLoaded', () => {
    init_form();
    init_pagination();
    update_views(); // <- wichtig!
});

    window.addEventListener('keydown', prevent_form_submit_on_enter);

}());

//Global Callbacks
var ATLUI_GLOBALS = function() {
    const fill_out_street_callback = (autocomplete, type) => {
        const place = autocomplete.getPlace();
        let street, street_num, plz;
        for(const component of place.address_components) {
            switch(component.types[0]) { 
                case 'postal_code':
                    plz = component.short_name;
                    break;

                case 'route':
                    street = component.long_name;
                    break;
                
                case 'street_number':
                    street_num = component.short_name;
                    break;
            }
        }

        //The quick form behaves differently here
        let street_addr = street_num ? street + ' ' + street_num : street + ' 1';

        const elem_street = document.querySelector(type ? '#MoveToAddrStreet' : '#MoveFromAddrStreet');
        elem_street.value = street_addr;
        elem_street.dispatchEvent(new Event('focusout', { bubbles: true }));

        const elem_zip = document.querySelector(type ? '#MoveToAddrZip' : '#MoveFromAddrZip')
        elem_zip.value = plz;
        elem_zip.dispatchEvent(new Event('focusout', { bubbles: true }));
    };

    const fill_out_city_callback = (autocomplete, type) => {
        const place = autocomplete.getPlace();
        let plz, city, sublocality;
        for(const component of place.address_components) {
            switch(component.types[0]) {
                case 'postal_code':
                    plz = component.short_name;
                    break;

                case 'locality':
                    city = component.long_name;
                    break;

                case 'sublocality_level_1':
                    sublocality = component.long_name;
                    break;
            }
        }

        //Special case: if there is no locality take sublocality
        city = city ? city : sublocality;
        document.querySelector(type ? '#MoveToAddrCity' : '#MoveFromAddrCity').value = plz + ' ' + city ;
    };

    return {
        init_places: function () {
            let elem_street_from = document.querySelector('#MoveFromAddrStreet');
            if(elem_street_from) {
                const autocomplete_street_from = new google.maps.places.Autocomplete(elem_street_from, {
                    componentRestrictions: { country: ['ch'] },
                    types: ['address'],
                    fields: ['address_components']
                });

                autocomplete_street_from.addListener('place_changed', () => {
                    fill_out_street_callback(autocomplete_street_from, 0);
                });
            }

            let elem_street_to = document.querySelector('#MoveToAddrStreet');
            if(elem_street_to) {
                const autocomplete_street_to = new google.maps.places.Autocomplete(elem_street_to, {
                    componentRestrictions: { country: ['ch'] },
                    types: ['address'],
                    fields: ['address_components']
                });

                autocomplete_street_to.addListener('place_changed', () => {
                    fill_out_street_callback(autocomplete_street_to, 1);
                });
            }

            let elem_city_from = document.querySelector('#MoveFromAddrCity');
            if(elem_city_from) {
                const autocomplete_city_from = new google.maps.places.Autocomplete(elem_city_from, {
                    componentRestrictions: { country: ['ch'] },
                    types: ['postal_code'],
                    fields: ['address_components']
                });

                autocomplete_city_from.addListener('place_changed', () => {
                    fill_out_city_callback(autocomplete_city_from, 0);
                });
            }


            let elem_city_to = document.querySelector('#MoveToAddrCity');
            if(elem_city_to) {
                const autocomplete_city_to = new google.maps.places.Autocomplete(elem_city_to, {
                    componentRestrictions: { country: ['ch'] },
                    types: ['postal_code'],
                    fields: ['address_components']
                });

                autocomplete_city_to.addListener('place_changed', () => {
                    fill_out_city_callback(autocomplete_city_to, 1);
                });
            }
        }
    }
}();