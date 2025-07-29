(function() {

    /* ====== Phonenumber Verification Textfield ====== */
    const clamp = (val, max) => { return val > max ? max : val; };
    const focus_next_elem = (e) => { 
        document.getElementById('n' + clamp(+e.target.id.substring(1, 2) + 1, 3)).focus(); 
    };

    const paste_content = (e) => {
        e.preventDefault();
        let content = (e.clipboardData || window.clipboardData).getData('text');
        if(content.length === 4) {
            for(let i = 0; i < content.length; i++) {
                const elem = document.getElementById('n' + i);
                elem.value = value = content[i];
                if(i == 3) {
                    elem.focus();
                }
            }
        }

        return false;
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
        
        //Reset the error messages
        const error_no_token = document.getElementById('atlui_no_token');
        error_no_token.classList.add('atlui_hidden');

        const error_code_invalid = document.getElementById('atlui_code_invalid');
        error_code_invalid.classList.add('atlui_hidden');

        const error_token_invalid = document.getElementById('atlui_token_invalid');
        error_token_invalid.classList.add('atlui_hidden');


        //Parse lead token
        const url_params = new URLSearchParams(window.location.search);
        const lead_token = url_params.get('token');
        if(!lead_token) {
            error_no_token.classList.remove('atlui_hidden');
            return false;
        }

        //Write single values into the VerificationCode element and validate
        let verification_code = '';
        document.querySelectorAll('.atlui_verification_fields > input').forEach((elem) => {
            verification_code += elem.value;
        });

        if(verification_code.length !== 4) {
            error_code_invalid.classList.remove('atlui_hidden');
            return false;
        }

        submit_btn_enter_load();

        //Send lead validation request
        let response = await fetch(`https://atlas24.ch/?rest_route=/atlas24-api/v1/verify_lead/`, {

            method: 'POST',
            headers: {
                'Content-Type': 'application/json',   
            },
            body: JSON.stringify({token: lead_token, code: verification_code}),
            cache: 'no-store'
        });

        if(response.ok) {
            //Display success page
            document.querySelectorAll('.atlui_form_verification_start').forEach((elem) => {
                elem.classList.add('atlui_hidden');
            });

            document.querySelectorAll('.atlui_form_verification_success').forEach((elem) => {
                elem.classList.remove('atlui_hidden');
            });

        } else {
            submit_btn_exit_load();

            document.querySelectorAll('.atlui_verification_fields > input').forEach((elem) => {
                elem.value = '';
                elem.classList.add('atlui_element_validation_error');
            });

            //In case the token is invalid, display the proper error message.
            try {
                const response_json_body = await response.json();
                if(response_json_body?.message.includes('Token')) {
                    error_token_invalid.classList.remove('atlui_hidden');
                    return false;
                }

                error_code_invalid.classList.remove('atlui_hidden');

            } catch {
                error_no_token.classList.remove('atlui_hidden');
            }
        }

        return false;
    }

    /* ====== Initialization ====== */
    function init_form() { 
        //Setup keyup-handlers for the phone verification form (if available)
        const inputs = document.querySelectorAll('.atlui_verification_fields > input');
        inputs.forEach((elem) => {
            elem.addEventListener('keyup', focus_next_elem);
        });

        //Add a paste-handler to the first input and focus it
        inputs[0].addEventListener('paste', paste_content);
        inputs[0].focus();

        //Add submit-handler
        document.querySelector('.atlui_form').addEventListener('submit', submit_form);
    }

    //Register global event handlers
    window.addEventListener('DOMContentLoaded', init_form);

}());
