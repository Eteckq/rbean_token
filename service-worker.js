chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Message");
    if (request.token) {
        console.log(request.token, request.session);





    }
})
