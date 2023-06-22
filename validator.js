// 
function Validator(options){

    function getParent(element, selector) {
        while(element.parentElement){
            if(element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {};
    
    function validate(inputElement, rule){
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
        // var errorMessage = rule.test(inputElement.value);
        var errorMessage;
        // lay ra cac rules cua selector
               var rules = selectorRules[rule.selector];

            // Lap qua tung rules & (check)
            //  Neu co loi thi dung vec kiem tra 
               for(var i = 0; i < rules.length; ++i){
                    switch (inputElement.type){
                        case 'radio':
                        case 'checkbox':
                            errorMessage = rules[i](
                                formElement.querySelector(rule.selector + ':checked')
                            );
                            break;
                        default:
                            errorMessage = rules[i](inputElement.value);
                        }
                   if(errorMessage) break;
               }


        if(errorMessage){
            errorElement.innerText = errorMessage
           getParent(inputElement, options.formGroupSelector).classList.add('invalid');
        }else{
            errorElement.innerText = '';
           getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
        }

        return !errorMessage;
    }

    // lay duoc form 
    var formElement = document.querySelector(options.form); 
    if(formElement){
        // Khi submit form
        formElement.onsubmit = function (e){
            e.preventDefault();

            var isFormValid = true;

                // lap qua cac phan tu rules va validate
            options.rules.forEach(function (rule){
                 var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if(!isValid){
                    isFormValid = false;
                }
            });
        
            if(isFormValid){
                if(typeof options.onSubmit === 'function'){

                    var enableInputs = formElement.querySelectorAll('[name]');

                    var formValues =Array.from(enableInputs).reduce(function(values, input){

                        // values[input.name] = input.value;
                        switch(input.type){
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name +'"]:checked').value;
                                break;

                            case 'checkbox':
                                if(!input.matches(':checked')){ 
                                    values[input.name] = '';
                                    return values;
                                }
                                if(!Array.isArray(values[input.name])){
                                    values[input.name] = [];
                                }
                                values[input.name].push(input.value);
                                break;
                            
                            case 'file':
                                values[input.name] = input.files;
                                break;

                            default:
                                values[input.name] = input.value;
                        }

                        
                        return values;
                    }, {});
                  options.onSubmit(formValues);
                }
            }else{
                // console.log('Co loi')
                // formElement.submit();

            }

        }

        // lap qua moi rule va xu li (lang nghe su kien blur, iput)
        options.rules.forEach(function (rule){

            //  Luu lai cac rules trong input
            if(Array.isArray( selectorRules[rule.selector] )) {
                selectorRules[rule.selector].push(rule.test);
            }else {
                selectorRules[rule.selector] = [rule.test];
            }            

            //  Lấy ra phần tử input  #fullname, #email
            var inputElements = formElement.querySelectorAll(rule.selector);

            Array.from(inputElements).forEach(function(inputElement){
                // Xử lí trường hợp blur ra khỏi input
                inputElement.onblur = function (){
                    validate(inputElement, rule);
                }
                // Xử lí trường hợp người dùng nhập vào input
                inputElement.oninput = function(){
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector('.form-message');
                    errorElement.innerText = '';
                   getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                }

            });

            // if(inputElement){
            // }
            
        });
        

    }
}

Validator.isRequired = function (selector, message){
    return {
        selector: selector,
        test(value){
            return value ? undefined : message || 'Vui lòng nhập trường này';
        }
    };
}

Validator.isEmail = function (selector, message){
    return {
        selector:selector,
        test(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                return regex.test(value) ? undefined : message || 'Trường này phải là email';
        }
    };
}


Validator.minLength = function (selector, min,message){
    return {
        selector:selector,
        test(value) {
                return value.length >= min ? undefined : message ||`Vui lòng nhập lại tối thiểu ${min} kí tự`;
        }
    };
}


Validator.isConfirmed = function (selector, getCofirmValue, message){
    return {
        selector:selector,
        test(value) {
                return value === getCofirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác';
        }
    };
}

