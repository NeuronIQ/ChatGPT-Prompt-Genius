if (typeof browser === "undefined") {
    let settings;
    chrome.action.onClicked.addListener(function(tab) {
        let url;
        chrome.storage.local.get({settings: {home_is_prompts: true}}, function(result) {
            settings = result.settings
            if (settings.hasOwnProperty('home_is_prompts')) {
                if (settings.home_is_prompts === true) {
                    url = "pages/prompts.html"
                }
                else {
                    url = "pages/explorer.html"
                }
            }
            else {
                url = "pages/explorer.html"
            }
            chrome.tabs.create({url: url});
        });
    });
    browser = chrome;
}
else {
    let settings;
        // Listen for a click on the browser action
    browser.browserAction.onClicked.addListener(function(tab) {
        browser.storage.local.get({settings: {home_is_prompts: false}}, function(result) {
            settings = result.settings
            let url;
            if (settings.hasOwnProperty('home_is_prompts')) {
                if (settings.home_is_prompts === true) {
                    url = "pages/prompts.html"
                }
                else{
                    url = "pages/explorer.html"
                }
            }
            else{
                url = "pages/explorer.html"
            }
            browser.tabs.create({url: url});
        });
    });
}

browser.runtime.onMessage.addListener( async function(message, sender, sendResponse) {
    if (message.type === 'b_continue_convo') {
        console.log('background received')
        browser.tabs.create({url: 'https://chat.openai.com/chat', active: true}, function (my_tab){
            let sent = false;
            browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
                if (tab.id === my_tab.id && changeInfo.status === 'complete' && !sent) {
                    setTimeout(() => browser.tabs.sendMessage(my_tab.id, {
                        type: 'c_continue_convo',
                        id: message.id,
                        convo: message.convo
                    }), 500)
                    sent = true;
                }
            });
        });
    }
	else if(message.type ==='b_use_prompt') {
		console.log('background received')
        browser.tabs.create({url: 'https://chat.openai.com/chat', active: true}, function (my_tab){
            let sent = false;
            browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
                if (tab.id === my_tab.id && changeInfo.status === 'complete' && !sent) {
                    setTimeout(() => browser.tabs.sendMessage(my_tab.id, {
                        type: 'c_use_prompt',
                        id: message.id,
                        prompt: message.prompt
                    }), 500)
                    sent = true;
                }
            });
        });
	}
});

function getDate() { // generated by ChatGPT
    var date = new Date();
    var options = {year: 'numeric', month: 'long', day: 'numeric'};
    return date.toLocaleString('default', options);
}

function getTime() { // generated by ChatGPT
    var currentDate = new Date();
    var options = {
        hour12: true,
        hour: "numeric",
        minute: "numeric"
    };
    var timeString = currentDate.toLocaleTimeString("default", options);
    return timeString
}

function generateUUID() { // generated by ChatGPT
    // create an array of possible characters for the UUID
    var possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    // create an empty string that will be used to generate the UUID
    var uuid = "";

    // loop over the possible characters and append a random character to the UUID string
    for (var i = 0; i < 36; i++) {
        uuid += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
    }

    // return the generated UUID
    return uuid;
}

function new_prompt(title, text, tags="", category="") {
    let prompt = {
        date: getDate(),
        time: getTime(),
        id: generateUUID(),
        title: title,
        text: text,
        tags: tags,
        category: category
    };
    return prompt;
}
browser.runtime.onInstalled.addListener(async () => {
    browser.contextMenus.create({
        id: "savePrompt",
        title: "Save text as prompt",
        contexts: ["selection"],
    });

});


browser.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === "savePrompt") {
        browser.storage.local.get({prompts: []}, function(result) {
            let prompts = result.prompts
            prompts.push(new_prompt("", info.selectionText))
            browser.storage.local.set({prompts: prompts})
            browser.tabs.create({url: "pages/prompts.html"});
            setTimeout(() => browser.runtime.sendMessage({message: "New Prompt"}), 300)
        });
    }
});
