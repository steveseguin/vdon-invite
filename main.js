function getById(id) { return document.getElementById(id); };
function log(message) { console.log(message); }
function error(message) { console.error(message); }

function copyFunction(copyText) {

    try {
        copyText.select();
        copyText.setSelectionRange(0, 99999);
        document.execCommand("copy");
    } catch (e) {
        var dummy = document.createElement('input');
        document.body.appendChild(dummy);
        dummy.value = copyText;
        dummy.select();
        document.execCommand('copy');
        document.body.removeChild(dummy);
        return false;
    }
}

function popupMessage(e, message = "Copied to Clipboard") {

    var posx = 0;
    var posy = 0;

    if (!e) var e = window.event;

    if (e.pageX || e.pageY) {
        posx = e.pageX;
        posy = e.pageY;
    } else if (e.clientX || e.clientY) {
        posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    posx += 10;


    var menu = document.querySelector("#messagePopup");
    menu.innerHTML = "<center>" + message + "</center>";
    var menuState = 0;
    var menuWidth;
    var menuHeight;

    var windowWidth;
    var windowHeight;

    if (menuState !== 1) {
        menuState = 1;
        menu.classList.add("active");
    }

    menuWidth = menu.offsetWidth + 4;
    menuHeight = menu.offsetHeight + 4;

    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;

    if ((windowWidth - posx) < menuWidth) {
        menu.style.left = windowWidth - menuWidth + "px";
    } else {
        menu.style.left = posx + "px";
    }

    if ((windowHeight - posy) < menuHeight) {
        menu.style.top = windowHeight - menuHeight + "px";
    } else {
        menu.style.top = posy + "px";
    }

    function toggleMenuOff() {
        if (menuState !== 0) {
            menuState = 0;
            menu.classList.remove("active");
        }
    }
    setTimeout(function () { toggleMenuOff(); }, 1000);
    event.preventDefault();
}

function toggleObfuscate(type="url") {
    var url = getById(type);

	
    if (url.dataset.obfuscated == "true") {
        url.dataset.obfuscated = "false";
        url.href = url.dataset.raw;
        url.innerText = url.href;
		
		if (url.dataset.beta == "true") {
			url.href = betaURL(url);
			url.innerText = url.href;
		}
		
    } else {
		
		if (url.dataset.beta == "true") {
			url.href = betaURL(url);
			url.innerText = url.href;
		}
        url.dataset.obfuscated = "true";
        url.href = obfuscateURL(url);
        url.innerText = url.href;
    }
}
function obfuscateURL(element) {
    input = element.href;

    if (input.startsWith("https://obs.ninja/")) {
        input = input.replace('https://obs.ninja/', '');
    } else if (input.startsWith("http://obs.ninja/")) {
        input = input.replace('http://obs.ninja/', '');
    } else if (input.startsWith("obs.ninja/")) {
        input = input.replace('obs.ninja/', '');
    }
    
    if (input.startsWith("https://vdo.ninja/")) {
        input = input.replace('https://vdo.ninja/', 'vdo.ninja/');
    } else if (input.startsWith("http://vdo.ninja/")) {
        input = input.replace('http://vdo.ninja/', 'vdo.ninja/');
    } 

    var key = "OBSNINJAFORLIFE";
    var encrypted = CryptoJS.AES.encrypt(input, key);
    var output = "https://invite.cam/" + encrypted.toString();
    return output;
}
function toggleBeta(type="url") {
    var url = getById(type);

    if (url.dataset.beta == "true") {
        url.dataset.beta = "false";
        url.href = url.dataset.raw;
        url.innerText = url.href
    } else {
        url.dataset.beta = "true";
        url.href = betaURL(url);
        url.innerText = url.href;
    }
	
    if (url.dataset.obfuscated == "true") {
        url.href = obfuscateURL(url);
        url.innerText = url.href;
    }  
}
function betaURL(element) {
    input = element.dataset.raw;;

    if (input.startsWith("https://obs.ninja/")) {
        input = input.replace('https://obs.ninja/', 'https://obs.ninja/beta/');
    } else if (input.startsWith("http://obs.ninja/")) {
        input = input.replace('http://obs.ninja/', 'https://obs.ninja/beta/');
    } else if (input.startsWith("obs.ninja/")) {
        input = input.replace('obs.ninja/', 'https://obs.ninja/beta/');
    }
    
    if (input.startsWith("https://vdo.ninja/")) {
        input = input.replace('https://vdo.ninja/', 'https://vdo.ninja/beta/');
    } else if (input.startsWith("http://vdo.ninja/")) {
        input = input.replace('http://vdo.ninja/', 'https://vdo.ninja/beta/');
    } else if (input.startsWith("vdo.ninja/")) {
        input = input.replace('vdo.ninja/', 'https://vdo.ninja/beta/');
    }
    return input;
}


function makeid(length) {
    var result = "";
    let characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function togglePopup() {
    window.removeEventListener('click', togglePopup);
    var popup = getById('popup');
    popup.classList.toggle("active");
    popup.style.left = "-1000px";
    popup.style.top = "-1000px";
}

function base64EncodeUrl(str) {
    return btoa(str)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/\=+$/, "");
}

let jsonUrl = "data.json";

fetch(jsonUrl)
    .then((res) => res.json())
    .then((out) => {
        printSteps(out);
    })
    .catch((err) => {
        throw err;
    });

function printSteps(steps) {
    steps.forEach(function (step, index) {
        item = steps[index];

        var panel = document.createElement("div");
        panel.classList = ["panel"];

        var titleElement = document.createElement("span");
        titleElement.className = "title";
        titleElement.innerText = item.title;


        // Sliding expanding panels
        titleElement.addEventListener("click", function (evt) {
            if (evt.target !== this) return; // Do nothing

            this.parentElement.classList.toggle("active");
            var content = this.parentElement.querySelector(".answers");

            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
            setTimeout(function () {
                panel.scrollIntoView({ block: "center", behavior: "smooth" });
            }, 200)

        });

        var descriptionElement = document.createElement("span");
        descriptionElement.className = "description ";
        descriptionElement.title = item.description;

        var iconElement = document.createElement("i");
        iconElement.className = "las la-info-circle";

        iconElement.addEventListener("click", function (evt) {
            if (evt.target !== this) return; // These are not the droids we are looking for

            var popupDescription = getById("popupDescription");
            popupDescription.innerText = descriptionElement.title;

            var rect = descriptionElement.getBoundingClientRect();
            var popup = getById("popup");

            var x = evt.x - popupDescription.getBoundingClientRect().width - 30;
            var y =
                evt.y -
                rect.height / 2 -
                popupDescription.getBoundingClientRect().height / 2;

            popup.style.left = x + "px";
            popup.style.top = y + "px";

            getById("popup").classList.toggle("active");
            setTimeout(function () {
                window.addEventListener('click', togglePopup);
            }, 100);

        });

        descriptionElement.appendChild(iconElement);

        var answersElement = document.createElement("div");
        answersElement.className = "answers";

        var answersContainerElement = document.createElement("div");
        answersContainerElement.className = "answersContainer";

        panel.appendChild(titleElement);
        panel.appendChild(descriptionElement);

        item.answers.forEach(function (answer) {
            var el;
            switch (answer.type) {
                case "radio":
                    var switchGroupElement = document.createElement("div");
                    switchGroupElement.className = "switchGroup";

                    var label = document.createElement("label");
                    label.className = "switch";

                    el = document.createElement("input");
                    el.setAttribute("type", "radio");
                    el.setAttribute("name", answer.group);
                    el.setAttribute("data-param", answer.params);
                    el.setAttribute("onchange", "updateLink(this)");
                    el.setAttribute("data-for", answer.for);
                    el.setAttribute("data-beta", answer.beta);

                    if (answer.selected) {
                        el.setAttribute("checked", true);
                    }

                    el.innerText = answer.label;
                    el.id = answer.label;

                    label.appendChild(el);

                    var sliderElement = document.createElement("span");
                    sliderElement.className = "slider round";

                    label.appendChild(sliderElement);

                    switchGroupElement.appendChild(label);

                    var textElement = document.createElement("span");
                    textElement.innerText = answer.label;

                    switchGroupElement.appendChild(textElement);

                    answersContainerElement.appendChild(switchGroupElement);

                    break;
                case "toggle":
                    var switchGroupElement = document.createElement("div");
                    switchGroupElement.className = "switchGroup";

                    var label = document.createElement("label");
                    label.className = "switch";

                    el = document.createElement("input");
                    el.setAttribute("type", "checkbox");
                    el.setAttribute("data-param", answer.params);
                    el.setAttribute("onchange", "updateLink(this)");
                    el.setAttribute("data-for", answer.for);
                    el.setAttribute("data-beta", answer.beta);
                    
                    if (answer.function) {
                        el.setAttribute("data-function", answer.function);
                    }


                    el.innerText = answer.label;
                    el.id = answer.label;

                    label.appendChild(el);

                    var sliderElement = document.createElement("span");
                    sliderElement.className = "slider round";

                    label.appendChild(sliderElement);

                    switchGroupElement.appendChild(label);

                    var textElement = document.createElement("span");
                    textElement.innerText = answer.label;
                    textElement.title = answer.tooltip;

                    switchGroupElement.appendChild(textElement);

                    answersContainerElement.appendChild(switchGroupElement);

                    break;
                case "text":
                    var textGroupElement = document.createElement("div");
                    textGroupElement.className = "textGroup";

                    el = document.createElement("input");
                    el.setAttribute("type", "text");
                    el.setAttribute("data-param", answer.params);
                    el.setAttribute("onchange", "updateLink(this)");
                    el.setAttribute("data-for", answer.for);
                    el.setAttribute("data-beta", answer.beta);
                    el.setAttribute("onfocus", "this.oldValue = this.value");
                    
                    if (answer.function) {
                        el.setAttribute("data-function", answer.function);
                    }

                    if (answer.placeholder) {
                        el.setAttribute("placeholder", answer.placeholder);
                    }

                    var exampleElement = document.createElement("span");

                    switch (answer.params) {
                        case "&room":
                            var roomName = generateName();
                            exampleElement.className = 'click';
                            exampleElement.innerText = "Example room name: " + roomName;
                            exampleElement.addEventListener("click", function () {
                                el.value = roomName;
                                el.oldValue = '';
                                el.onchange();

                            });
                            break;
                        case "&push":
                            var pushid = makeid(10);
                            el.value = pushid;
                            el.blur();
                            getById('url').href = getById('url').href + "?push=" + pushid;
                            getById('url').innerText = getById('url').href;
                            getById('url').dataset.raw = getById('url').dataset.raw + "?push=" + pushid;

                            if ((getById('viewUrl').href.indexOf("&room=") > -1) && (getById('viewUrl').href.indexOf("&scene") == -1)){
                                getById('viewUrl').href = getById('viewUrl').href + "&scene";
                                getById('viewUrl').dataset.raw = getById('viewUrl').dataset.raw + "?view=" + pushid + "&scene";
                                getById('viewUrl').innerText = getById('viewUrl').href;
                            } else {
                                getById('viewUrl').innerText = getById('viewUrl').href;
                                getById('viewUrl').dataset.raw = getById('viewUrl').dataset.raw + "?view=" + pushid;
                            }
                            
                            exampleElement.innerText = answer.label;
                            break;
                        case "&b64css":
                            exampleElement.innerText = answer.label;
                            exampleElement.className = "click";
                            exampleElement.innerText = "URL-encod CSS (click here to encode)";
                            exampleElement.addEventListener("click", function () {
                                el.oldValue =  el.value;
                                el.value = base64EncodeUrl(el.value);
                                el.onchange();
                            });
                            break;
                        default:
                            exampleElement.innerText = answer.label;
                            break;

                    }

                    textGroupElement.appendChild(exampleElement);
                    textGroupElement.appendChild(el);
                    answersContainerElement.appendChild(textGroupElement);
                    break;

                case "select":
                    var textGroupElement = document.createElement("div");
                    textGroupElement.className = "textGroup";

                    el = document.createElement("select");
                    el.setAttribute("data-param", answer.params);
                    el.setAttribute("onchange", "updateLink(this); this.blur()");
                    el.setAttribute("data-for", answer.for);
                    el.setAttribute("data-beta", answer.beta);
                    el.setAttribute("onfocus", "this.oldValue = this.value");

                    var optionValues = answer.optionValues.split(",");
                    var optionLabels = answer.optionLabels.split(",");
                    optionValues.forEach((option, index) => {
                        var optionElement = document.createElement('option');
                        optionElement.setAttribute('value', option);
                        optionElement.innerText = optionLabels[index];
                        el.appendChild(optionElement);
                    })

                    var exampleElement = document.createElement("span");
                    exampleElement.innerText = answer.label;

                    textGroupElement.appendChild(exampleElement);
                    textGroupElement.appendChild(el);
                    answersContainerElement.appendChild(textGroupElement);
                    break;
                default:
                    break;
            }
            answersElement.appendChild(answersContainerElement);
            panel.appendChild(answersElement);
            getById("panels").appendChild(panel);
        });

    });
}

function encodeUri(uri){
    return encodeURIComponent(uri).replace(/'/g,"%27").replace(/"/g,"%22")
}

function checkDirector(){
    console.log("Checking for a room....");
    if (getById("url").innerText.includes('&room')) {
        
    } else {
        console.log("There is no room so generating a random one");
        document.querySelector("input[data-param='&room']").previousElementSibling.click();
    }
}

function setAllLinkParams(param, input){
    setStringParam(new URL(getById("url").dataset.raw), 'url', param, input, 'push')
    setStringParam(new URL(getById("viewUrl").dataset.raw), 'viewUrl', param, input, 'view');
    setStringParam(new URL(getById("directorUrl").dataset.raw), 'directorUrl', param, input, 'director');
}

function setStringParam(url, target, param, input, type){
    console.log(`Setting string param: ${url} ${target} ${param} ${input} ${type}`)

    if (input.dataset.for.includes(type))
    {
        // Handle checkboxes
    if (input.getAttribute("type") == "checkbox"){
        if (input.checked) {
            getById(target).dataset.raw += param;
        } else {
            getById(target).dataset.raw = getById(target).dataset.raw.replace(param, '');
        }
    }

    if (input.tagName == 'SELECT'){
        if (input.value != ""){
            // There's a new value
            if (input.oldValue != "" && getById(target).dataset.raw.includes(`&${param}`)) {
                console.log("There was an old value so we're changing that");
                console.log("We are replacing: " + input.oldValue);

                getById(target).dataset.raw = getById(target).dataset.raw.replace(`&${param}=${input.oldValue}`, `&${param}=${input.value}`);
                
            } else {

                getById(target).dataset.raw += `&${param}=${input.value}`;

            }
        } else {
            // Theres an empty new value, remove the parameter from the url
            if (param == 'room' && target == 'directorUrl'){ 
                getById(target).dataset.raw = getById(target).dataset.raw.replace(`?dir=${input.oldValue}`, '');
            } else {
                getById(target).dataset.raw = getById(target).dataset.raw.replace(`&${param}=${input.oldValue}`, '');
            }
        }
    }

    if (input.getAttribute("type") == "text") {
        console.log("Changing a text input field");
        console.log(`${param} - ${target}`)

        if (input.value != ""){
            // There's a new value
		
		//  ele.value = encodeURIComponent(ele.value);
		
		
            if (input.oldValue != "") {
                console.log("There was an old value so we're changing that");
                if (param == '&room' && target == 'directorUrl'){ 
                    getById(target).dataset.raw = getById(target).dataset.raw.replace(`?dir=${input.oldValue}`, `?dir=${input.value}`);
                } else {
                    console.log(`Replacing ${input.oldValue} with ${input.value} on this url: ${target}`);
                    if (param == '&push'){param = '?push'}
                    if (param == '&view'){param = '?view'}
                    getById(target).dataset.raw = getById(target).dataset.raw.replace(`${param}=${input.oldValue}`, `${param}=${input.value}`);
                }
            } else {
                var inp = input.value;
		if (param == "&pw"){
                    inp = encodeURIComponent(inp);
		}

                if (param == '&room' && target == 'directorUrl'){
                    console.log("changing room on directorUrl")
                    getById(target).dataset.raw += `?dir=${inp}`;
                } else {
                    if (param == '&push'){param = '?push'}
                    if (param == '&view'){param = '?view'}
                    getById(target).dataset.raw += `${param}=${inp}`;
                }
            }
        } else {
            // Theres an empty new value, remove the parameter from the url
            if (param == '&room' && target == 'directorUrl'){ 
                getById(target).dataset.raw = getById(target).dataset.raw.replace(`?dir=${input.oldValue}`, '');
            } else {
                getById(target).dataset.raw = getById(target).dataset.raw.replace(`${param}=${input.oldValue}`, '');
            }
        }

    }

    // Update the href and link text
    getById(target).href = getById(target).dataset.raw;
    getById(target).innerText = getById(target).dataset.raw;
    }
    
    if ((type == "view") && (target == "viewUrl")){
        var viewer = getById('viewUrl');
        // Keep the room scene flag in the source used by radio/beta updates.
        if (viewer.dataset.raw.indexOf("&room=") > -1) {
            if (!/&scene(?=&|$)/.test(viewer.dataset.raw)) {
                viewer.dataset.raw += "&scene";
            }
        } else {
            viewer.dataset.raw = viewer.dataset.raw.replace(/&scene(?=&|$)/g, "");
        }
        viewer.href = viewer.dataset.raw;
        viewer.innerText = viewer.href;
    }    
}

function setRadioParam(url, target, param, input, type){
    console.log(`Setting radio param: ${url} ${target} ${param} ${input.dataset.param} ${type}`)

    var otherGroupInputs = input.parentElement.parentElement.parentElement.querySelectorAll(
        'input[name="' + input.name + '"]'
    );

    console.log("Disabling the other params of the group");
    otherGroupInputs.forEach((input) => {
        if ( input.dataset.param != '') {
            console.log("Disabling " + input.dataset.param)
            // Match a complete option, not prefixes such as &s in &sl or &ss.
            var option = input.dataset.param.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            getById(target).dataset.raw = getById(target).dataset.raw.replace(new RegExp(option + '(?=&|$)', 'g'), "");
            getById(target).innerText = getById(target).dataset.raw;
            getById(target).href = getById(target).dataset.raw;
        }
    });


    if (input.dataset.for != undefined && input.dataset.for.includes(type)) {
        console.log("There's a param to set for this type")

        // Add the param 
        getById(target).dataset.raw += input.dataset.param;
        var string = getById(target).dataset.raw;

        getById(target).innerText = string;
        getById(target).href = string;
    }



}

/**
 * Update the invite links when changing parameters
 * @param  {HTMLElement} input This input triggered the change
 */
function updateLink(input) {
    
    if (input.tagName == "SELECT") {
        var param = input.dataset.param.replace("&", "")

        setAllLinkParams(param, input);
        
    }

    if (input.getAttribute("type") == "text") {
        var param = input.dataset.param;
        // Parameter value is  empty, remove it altogether.
        if (input.value.length == 0) {

            console.log("Clearing parameter since input is empty");
            setAllLinkParams(param, input)


            // Special case - If no push id is provided, generate a random one
            if (param == '&push') {
                var randomId = makeid(10);
                input.value = randomId;
                input.blur();

                setStringParam(new URL(getById("url").dataset.raw), 'url', "&push", input, 'push');
                setStringParam(new URL(getById("viewUrl").dataset.raw), 'viewUrl', "&view", input, 'view');
                
            }
        } else {
            
            if (param == '&room') { // Sanitize the room name
                input.value = input.value.replace(/[\W]+/g, "_");
            }

            if (param == '&push') { // Setting a push id should also set a &view
                console.log("Also update the view string on the viewUrl");
                setStringParam(new URL(getById("viewUrl").dataset.raw), 'viewUrl', "?view", input, 'view');
            }

            // Run helper functions
            if (input.dataset.function) {
                console.log("running helper function");
                input.value = window[input.dataset.function](input.value);
            }

            setAllLinkParams(param, input);

        }
    }

    if (input.getAttribute("type") == "checkbox"){
        var param = input.dataset.param;
        // Checkbox checked, add the corresponding param

        // Run helper functions
        if (input.dataset.function) {
            console.log("running helper function");
            window[input.dataset.function]();
        }

        setAllLinkParams(param, input);

    }

    // This is a radio button, handle removing other possible param from the url
    if (input.getAttribute("type") == "radio") {
        var param = input.dataset.param.replace("&", "");
        console.log("This is a radio group")

        setRadioParam(new URL(getById("url").dataset.raw), 'url', param, input, 'push')
        setRadioParam(new URL(getById("viewUrl").dataset.raw), 'viewUrl', param, input, 'view');
        setRadioParam(new URL(getById("directorUrl").dataset.raw), 'directorUrl', param, input, 'director');
    }


    // Toggle the director link panel
    if (getById("url").innerText.includes('&room')) {
        getById('directorLink').classList.add('show');
    } else {
        getById('directorLink').classList.remove('show');
    }

    var url = getById("url");

    if (url.dataset.beta == "true") {
        url.href = betaURL(url);
        url.innerText = url.href;
    }
    
    if (url.dataset.obfuscated == "true") {
        url.href = obfuscateURL(url);
        url.innerText = url.href;
    }
	
	var url = getById("viewUrl");

    if (url.dataset.beta == "true") {
        url.href = betaURL(url);
        url.innerText = url.href;
    }
    
    if (url.dataset.obfuscated == "true") {
        url.href = obfuscateURL(url);
        url.innerText = url.href;
    }

        if (input.dataset.beta === "true") {
          var guestBeta = getById("guestBetaToggle");
          var viewerBeta = getById("viewerBetaToggle");

          if (!guestBeta.checked) {
            guestBeta.click();
          }
          if (!viewerBeta.checked) {
            viewerBeta.click();
          }

        }
}


function guestQRCode(id){
    console.log(id)
    const link = document.querySelector(id).href

    img = QRCode.generatePNG(link, {
      ecclevel: "M",
      fillcolor: "#FFFFFF",
      textcolor: "#000000",
      margin: 2,
      modulesize: 20,
    });

    const template = `<div id='guestQRCode' onclick='this.outerHTML=""'><img src='${img}'/><a href='${img}' download='Guest Invite QRCode.png'>Download</a></div>`;

    document.body.insertAdjacentHTML('beforeend', template)
}
