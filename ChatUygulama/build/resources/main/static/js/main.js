'use strict';

const disconnectButton = document.querySelector('#logout');
const usernamePage = document.querySelector('#username-page');
const chatPage = document.querySelector('#chat-page');
const usernameForm = document.querySelector('#usernameForm');
const messageForm = document.querySelector('#messageForm');
const messageInput = document.querySelector('#message');
const messageArea = document.querySelector('#messageArea');

let stompClient = null;
let username = null;

const toast = async(type, message, timer= 5000) => {
    await Swal.mixin({
        toast: true,
        position: 'top-end',
        tton: true,
        timerProgressBar: true,
        showConfirmButton: false,
        didOpen: (toast) => {      timer: timer,
        showCloseBu
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    }).fire({
        timer: timer,
        icon: type,
        html: message,
    });
}

/**
 * Bu işlev geçerli saati SS:dd formatında döndürür.
 * İşlev, Today adı verilen yeni bir Date nesnesi oluşturarak başlar.
 * Daha sonra sırasıyla geçerli saat ve dakikayı elde etmek için getHours() ve getMinutes() yöntemlerini kullanır.
 * Son olarak bu değerleri döndürdüğü bir karakter dizisi halinde birleştirir.
 *1
 * @returns {`${number}:${number}`}
 */
const getCurrentTime = () => {
    const today = new Date();
    return `${today.getHours()}:${today.getMinutes()}`;
}

/**

 * Bu fonksiyon girdi olarak kullanıcı adını alır ve bir renk döndürür.
 * İşlev bir karma değeri oluşturarak başlar.
 * Hash değeri, kullanıcı adının 31 ile çarpılması ve ardından kullanıcı adındaki her karakterin ASCII kodunun eklenmesiyle hesaplanır.
 *
 * Hash değeri hesaplandıktan sonra,
 * işlev döndürülecek rengin indeksini hesaplar.
 * İndeks, hash değerinin mutlak değeri alınarak renk sayısına bölünerek hesaplanır.
 *
 * Son olarak işlev, hesaplanan dizindeki rengi döndürür.
 * @param username
 * @returns {string}
 */


const getAvatarColor = username => {
    let hash = 0;
    const colors = [
        '#2196F3', '#32c787', '#00BCD4', '#ff5652',
        '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
    ];

    for (let i = 0; i < username.length; i++) {
        hash = 31 * hash + username.charCodeAt(i);
    }

    let index = Math.abs(hash % colors.length);
    return colors[index];
}

/**

 * Bu fonksiyon, kullanıcı "Giriş" butonuna tıkladığında çağrılır.
 * Fonksiyon öncelikle kullanıcı tarafından girilen verilerden kullanıcı adını alır.
 * Kullanıcı adı boş değilse, işlev kullanıcı adı sayfasını gizler ve sohbet sayfasını görüntüler.
 *
 * İşlev daha sonra yeni bir SockJS nesnesi ve yeni bir Stomp nesnesi oluşturur.
 * SockJS nesnesi WebSocket sunucusuna bağlanmak için kullanılır.
 * Stomp nesnesi WebSocket sunucusuna mesaj gönderip almak için kullanılır.
 *
 * İşlev daha sonra Stomp nesnesinde connect() yöntemini çağırır.
 * connect() yöntemi girdi olarak bir veri yükü alır.
 * Yük, kullanıcı adını ve diğer bilgileri içeren bir nesnedir.
 *
 * connect() yöntemi aynı zamanda iki işlevi de çağırır: onConnected() ve onError().
 * Bağlantı başarılı olduğunda onConnected() işlevi çağrılır.
 * Bağlantı başarısız olduğunda onError() işlevi çağrılır.
 *
 * @param e
 */

//Bağlan düğmesine tıklandığında çalışan fonksiyon
const connect = e => {
    username = document.querySelector('#name').value.trim();

    if(username) {
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');

        const socket = new SockJS('/websocket');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError);
    }
    e.preventDefault();
}

const disconnect = e => {
    chatPage.classList.add('hidden');
    usernamePage.classList.remove('hidden');
    stompClient.connect({}, onDisconnected, onError)
}

/**

 * onConnected() fonksiyonu WebSocket'e başarılı bir şekilde bağlandığında sohbet mesajlarını görüntüler.
 * @param options
 */
const onConnected = options => {
    // Subscribe to the Public Topic
    stompClient.subscribe('/topic/public', onMessageReceived);
    stompClient.send("/app/chat.register", {}, JSON.stringify({sender: username, type: 'JOIN'}))
}

const onDisconnected = options => {
    stompClient.send("/app/chat.register", {}, JSON.stringify({sender: username, type: 'LEAVE'}))
}

/**

 * onError() işlevi bir hata mesajı görüntüler.
 * @param e
 * @returns {Promise<void>}
 */
const onError = async e => {
    await toast('error', 'WebSockete baglanilamiyor! Sayfayi yenileyin ve tekrar deneyin.');
}

/**
*Bu fonksiyon, kullanıcı "Gönder" düğmesine tıkladığında çağrılır.
    Fonksiyon ilk önce mesaj içeriğini kullanıcı girişinden alır.
    Mesaj içeriği boş değilse fonksiyon, mesajı WebSocket sunucusuna gönderir.
    Fonksiyon daha sonra mesaj giriş alanını temizler.

 * @param event
 */
function send(event) {
    let content = messageInput.value.trim();

    if(content && null !== stompClient) {
        stompClient.send("/app/chat.send", {}, JSON.stringify({
            content,
            sender: username,
            type: 'CHAT',
            time: getCurrentTime()
        }));
        messageInput.value = '';
    }
    event.preventDefault();
}
//WebSocket aracılığıyla alınan gelen mesajları işleyen fonksiyon
async function onMessageReceived(payload) {
    const message = JSON.parse(payload.body);

    const chatEvent = async (event, type) => {
        await toast(type, event, 2000)
        return `
            <div class="chat-sap">
                <div class="chat-sap-meta"><span>${event}</span></div>
            </div>
        `
    }

    const chatMessage = (message) => `
        <div class="chat ${username === message.sender ? 'is-me' : 'is-you'}">
            <div class="chat-avatar">
                <div class="user-avatar fw-bold" style="background-color: ${getAvatarColor(message.sender)}">
                    <span>${message.sender.charAt(0).toUpperCase()}</span>
                </div>
            </div>
            <div class="chat-content">
                <div class="chat-bubbles">
                    <div class="chat-bubble">
                        <div class="chat-msg">${message.content}</div>
                    </div>
                </div>
                <ul class="chat-meta">
                    <li>${message.sender}</li>
                    <li><time>${message.time}</time></li>
                </ul>
            </div>
        </div>
    `

    switch (message.type) {
        case 'JOIN':
            messageArea.innerHTML += await chatEvent(`${message.sender} sohbete katildi!`, 'success');
            break;
        case 'LEAVE':
            messageArea.innerHTML += await chatEvent(`${message.sender} sohbetten ayrildi!`, 'warning');
            break;
        default:
            messageArea.innerHTML += chatMessage(message)
            break;

    }

    messageArea.scrollTop = messageArea.scrollHeight;
}

usernameForm.addEventListener('submit', connect, true)
messageForm.addEventListener('submit', send, true)
disconnectButton.addEventListener('click', disconnect, true)