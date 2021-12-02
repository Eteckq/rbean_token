let onPresence = false
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
}, 500);

const API = "https://api-rbean.yohangastoud.fr/"
// const API = "http://localhost:5005/"

async function presencePage() {
    let token = ""

    try {
        token = await getToken()
    } catch (error) {
        console.error(error);
    }

    if (!token) {
        fetch(API).then(response => {
            if (response.ok) {
                notif("No token available. Submit your token to share it !", "warning text-light")
                document.querySelector(".simple_form").addEventListener("submit", function (e) {
                    if (confirm("Le token va être envoyé à tous le monde (Annuler pour ne pas envoyer le token)")) {
                        postToken()
                            .then(response => {
                                this.submit()
                            })
                            .catch(error => console.log('Error:', error));
                    } else {
                        this.submit()
                    }
                });
            } else {
                notif(`Unable to fetch API. ${API} is probably down`, "danger")
            }
        }).catch(err => {
            notif(`Unable to fetch API. ${API} is probably down`, "danger")
        })
    } else {
        document.getElementById("presence_token").value = token
        notif("Token available ! (You can erase it with the red button)")

        let elem = document.getElementsByClassName("d-flex justify-content-end mt-4")
        let btn = htmlToElement(`
        <input value="Valider et écraser" data-disable-with="Valider..." class="btn btn-danger mb-3 ml-4">
        `)
        btn.addEventListener("click", function (e) {
            postToken().then(response => {
                document.querySelector(".simple_form").submit()
            })
                .catch(error => console.log('Error:', error));
        })
        elem[0].append(btn)
    }

}

function postToken() {
    return fetch(API, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
            'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({ session: getSession(), token: document.getElementById("presence_token").value, u: getUsername(), url: window.location.href })
    })
}

function getSession() {
    let sessionPath = document.location.pathname.match(/\/[0-9]+\//g).toString()
    let session = sessionPath.slice(1, sessionPath.length - 1)

    return session
}

function getUsername() {
    let img = document.querySelectorAll('[height="35"]');
    return img[0].src.match(/(?<=thumb_)(.*?)(?=-)/g)
}

function getToken() {
    return new Promise((resolve, reject) => {
        fetch(API + getSession() + '/' + getUsername(), {
            method: 'GET'
        })
            .then(response => {
                if (response.ok) {
                    response.json().then(res => {
                        resolve(res.token)
                    })
                } else {
                    reject(response)
                }
            })
            .catch(error => reject(error));
    })
}

function notif(notif, color = "dark") {
    let elem = document.getElementsByClassName('tuto-box tuto')[0]
    elem.after(htmlToElement(`<div class="bg-${color} mb-2 py-3 pl-4 pr-3 tuto">${notif}</div>`))
}

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
}