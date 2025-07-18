(function() {
    /* ====== Globals ====== */
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

    /* ====== Validation ====== */
    const validation_reg_exp = {
        email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
        phone: /(\b(0041|0)|\B\+41)(\s?\(0\))?(\s)?[1-9]{2}(\s)?[0-9]{3}(\s)?[0-9]{2}(\s)?[0-9]{2}\b/,
        zip_code: /\d{4}$/,
        street_num: /\d[a-b]?\.?/
    };

    const validation_methods = {
        non_empty: (v) => { return v.length > 0; },
        email: (v) => { return validation_reg_exp.email.test(v); },
        phone: (v) => { return validation_reg_exp.phone.test(v); },
        zip_code: (v) => { return v.length === 4 && validation_reg_exp.zip_code.test(v); },
        street_num: (v) => { return validation_reg_exp.street_num.test(v); }
    };

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

    /* ====== Form submission ====== */
    async function submit_form(e) {
        e.preventDefault();

        //If we had a server error, we might still have the error message
        let server_invalid_span = document.getElementById('atlui_server_invalid');
        server_invalid_span.classList.add('atlui_hidden');
 
        if(validate_properties(e.target) === true) {
            submit_btn_enter_load();
            const form_data = new FormData(e.target);

            let obj_entries = Object.fromEntries(form_data.entries());
            obj_entries.AdditionalServices = form_data.getAll('AdditionalServices[]');

            let response = await fetch(`${window.location.origin}/?rest_route=/atlas24-api/v1/create_lead/`, {
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
    function validate_properties(form) {
        let form_is_valid = true;
        form.querySelectorAll('input').forEach((elem) => {
            let elem_is_valid = true;
            if(elem.type !== 'radio') { //Exclude radio buttons as they should always have a value
                switch(elem.name) {
                    case 'MoveFromAddrNumber':
                    case 'MoveToAddrNumber':
                        elem_is_valid = validation_methods.street_num(elem.value);
                        break;

                    case 'MoveFromAddrZip':
                    case 'MoveToAddrZip':
                        elem_is_valid = validation_methods.zip_code(elem.value);
                        break;

                    case 'Email':
                        elem_is_valid = validation_methods.email(elem.value);
                        break;
                    
                    case 'Phone':
                        elem_is_valid = validation_methods.phone(elem.value);
                        break;

                    //Not required
                    case 'Availability':
                       return;

                    default:
                        elem_is_valid = validation_methods.non_empty(elem.value);
                }

                //Special case for ConfirmTruthfulEntries
                if(elem.name === 'ConfirmTruthfulEntries') {
                    if(form_is_valid) {
                        const chk_confirm_val = document.getElementById('confirm_invalid');
                        form_is_valid = elem.checked;
                        if(form_is_valid)
                            chk_confirm_val.classList.add('atlui_hidden');
                        else
                            chk_confirm_val.classList.remove('atlui_hidden');
                        
                    }

                    return;
                }

                //Show validation error message on element, else remove error message
                const next_sibling = elem.nextElementSibling;
                if(!elem_is_valid) {
                    form_is_valid = false;
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

        return form_is_valid;
    }


    /* ====== Initialization ====== */
    function init_form() {
        //Initialize AirDatepicker with proper locale settings
        new AirDatepicker('#MovingDate', {
            locale: locale_de,
            minDate: Date.now() + 259200000 //Today + 2 days
        });

        //Initialize MultiSelect
        const multi_select = document.querySelector('#AdditionalServices');
        if(multi_select) {
            new MultiSelect(multi_select, {
                placeholder: 'Bitte wählen...',
                search: false,
                selectAll: false
            });
        }

        //Add submit-handler
        document.querySelector('.atlui_form').addEventListener('submit', submit_form);
    }

    function prevent_form_submit_on_enter(e) {
        if(e.keyCode == 13) {
            e.preventDefault();
            return false;
        }
    }

    //Register global event handlers
    window.addEventListener('DOMContentLoaded', init_form);
    window.addEventListener('keydown', prevent_form_submit_on_enter);
})();


//Global Callbacks
var ATLUI_GLOBALS = function() {
    const fill_out_callback = (autocomplete, type) => {
        const place = autocomplete.getPlace();
        let street, street_num, plz, city;
        for(const component of place.address_components) {
            switch(component.types[0]) {
                case 'locality':
                    city = component.long_name;
                    break;
                
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

        document.querySelector(type ? '#MoveToAddrCity' : '#MoveFromAddrCity').value = city;
        document.querySelector(type ? '#MoveToAddrZip' : '#MoveFromAddrZip').value = plz;
        document.querySelector(type ? '#MoveToAddrStreet' : '#MoveFromAddrStreet').value = street;
        document.querySelector(type ? '#MoveToAddrNumber' : '#MoveFromAddrNumber').focus();
    };

    return {
        init_places: function () {
            let elem_from = document.querySelector('#MoveFromAddrStreet');
            if(elem_from) {
                const autocomplete_from = new google.maps.places.Autocomplete(elem_from, {
                    componentRestrictions: { country: ['ch']},
                    types: ['address'],
                    fields: ['address_components']
                });

                autocomplete_from.addListener('place_changed', () => {
                    fill_out_callback(autocomplete_from, 0);
                });
            }

            let elem_to = document.querySelector('#MoveToAddrStreet');
            if(elem_to) {
                const autocomplete_to = new google.maps.places.Autocomplete(elem_to, {
                    componentRestrictions: { country: ['ch']},
                    types: ['address'],
                    fields: ['address_components']
                });

                autocomplete_to.addListener('place_changed', () => {
                    fill_out_callback(autocomplete_to, 1);
                });
            }
        }
    }
}();