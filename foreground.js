var onPresence = false

function afterNavigate() {
    if (location.pathname.match(/\/presence/g)) {
        if (!onPresence) {
            onPresence = true
            presencePage()
        }
    } else {
        onPresence = false
    }
}
// https://developer.mozilla.org/fr/docs/Web/API/HTMLElement/transitionend_event width & opacity on turbolinks-progress-bar
setInterval(() => {
    afterNavigate()
}, 1000);



async function presencePage() {
    let tokenInput = document.getElementById("presence_token")

    let token = await getToken()

    if (!token) {
        notif("No token available. Submit your token to share it !", "danger")
        document.querySelector(".simple_form").addEventListener("submit", function (e) {
            if (confirm("Le token va être envoyé à tous le monde (Annuler pour ne pas envoyer le token)")) {
                fetch("https://api-rbean.yohangastoud.fr/token", {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
                        'Content-Type': 'application/json; charset=utf-8'
                    },
                    body: JSON.stringify({ session: getSession(), token: document.getElementById("presence_token").value })
                })
                    .then(response => {
                        this.submit()
                        alert("Token envoyé !")
                    })
                    .catch(error => console.log('Error:', error));
            } else {
                this.submit()
            }
        });
    } else {
        tokenInput.value = token
        notif("Token available ! (You can erase it with the red button)")

        let elem = document.getElementsByClassName("d-flex justify-content-end mt-4")
        let btn = htmlToElement(`
        <input value="Valider et écraser" data-disable-with="Valider..." class="btn btn-danger mb-3 ml-4">
        `)
        btn.addEventListener("click", function (e) {
            fetch("https://api-rbean.yohangastoud.fr/token", {
                method: 'POST',
                headers: {
                    'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
                    'Content-Type': 'application/json; charset=utf-8'
                },
                body: JSON.stringify({ session: getSession(), token: document.getElementById("presence_token").value })
            })
                .then(response => {
                    document.querySelector(".simple_form").submit()
                    alert("Token envoyé !")
                })
                .catch(error => console.log('Error:', error));
        })
        elem[0].append(btn)
    }

}

function getSession() {
    let sessionPath = document.location.pathname.match(/\/[0-9]+\//g).toString()
    let session = sessionPath.slice(1, sessionPath.length - 1)

    return session
}

function getToken() {
    return new Promise((resolve, reject) => {
        fetch("https://api-rbean.yohangastoud.fr/token/" + getSession(), {
            method: 'GET'
        })
            .then(response => response.json())
            .then(response => resolve(response.token))
            .catch(error => reject(error));
    })
}

function notif(notif, color = "dark") {
    // console.log(notif);
    let elem = document.getElementsByClassName('tuto-box tuto')[0]
    elem.after(htmlToElement(`<div class="bg-${color} mb-2 py-3 pl-4 pr-3 tuto">${notif}</div>`))
}

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}