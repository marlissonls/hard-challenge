// funções auxiliares

import { adminName, adminProfileImg, profileImg, router, userCoins, userName } from './index.js';
let requestcardID;

const errorModal = document.querySelector('#error-log');
const btnCloseErrorModal = document.querySelector('#icon-close-error-log');
const errorLogMessage = document.querySelector('#error-log-message');
const successModal = document.querySelector('#success-log');
const btnCloseSuccessModal = document.querySelector('#icon-close-success-log');
const successLogMessage = document.querySelector('#success-log-message');
const shopModal = document.querySelector('#shop-modal');
const btnCloseShopModal = document.querySelector('#icon-close-shop-modal');
const pendingTradeModal = document.querySelector('#pendingtrade-modal');
const btnClosePendingModal = document.querySelector('#icon-close-pending-modal');
const tradeModal = document.querySelector('#trade-modal');
const btnCloseTradeModal = document.querySelector('#icon-close-trade-modal');

const userImgPreview = document.querySelector('#user-img-preview');
const userImg = document.querySelector('#profile-edit-img');
const adminImgPreview = document.querySelector('#admin-img-preview');
const adminImg = document.querySelector('#admin-profile-edit-img');
const packageImgPreview = document.querySelector('#package-img-preview');
const packageImg = document.querySelector('#addpackage-image');
const characterImgPreview = document.querySelector('#character-img-preview');
const characterImg = document.querySelector('#addcharacter-image');

export function navigateTo(url) {
    history.pushState(null, null, url);
    router();
};

export function linkClick(e) {
    e.preventDefault();
    userImgPreview.src = './images/default-profile.svg';
    userImg.value = '';
    adminImgPreview.src = './images/default-profile.svg';
    adminImg.value = '';
    characterImgPreview.src = './images/default-profile.svg';
    characterImg.value = '';
    packageImgPreview.src = './images/default-profile.svg';
    packageImg.value = '';
    navigateTo(e.target.href);
}

export function closeModals() {
    closeShopModal();
    closePendingTradeModal();
    closeErrorModal();
    closeSuccessModal();
}

export async function buyCard(e) {
    try {
        const packageID = e.target.id;
        const acqCardImg = document.querySelector('.card-acquired');
        const acqCardName = document.querySelector('.name-new-card');
        const acqCardRarity = document.querySelector('.rarity-new-card');
        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },              
        };
        const response = await fetch(`api/packages/${packageID}`, options)
        if (response.status !== 200) {
            const error = await response.json();
            throw new Error(`${error.message}`);
        };
        const cardObject = await response.json();
        const acquiredCard = cardObject.card;
        acqCardImg.src = `../images/uploads/character/${acquiredCard.character_id}.png`;
        acqCardName.textContent = `${acquiredCard.character_name}`;
        acqCardRarity.textContent = `${acquiredCard.rarity}`;
        userCoins.innerText = `${acquiredCard.user_coins}`;
        openShopModal();
    } catch (error) {
        openErrorModal(`${error.message}`);
    }
}

export async function listChangeableCards(e) {
    try {
        requestcardID = e.target.id; //criado no escopo global
        const options = {
            method: "GET",
            headers: { "Content-Type": "application/json" },              
        };
        const response = await fetch(`api/cards`, options)
        if (response.status !== 200) {
            const error = await response.json();
            throw new Error(`${error.message}`);
        };
        const userCardsForTrade = await response.json();
        openUserCardsToTradeModal()
        const userCardsModalToTrade = document.querySelector('#user-cards-modal');
        userCardsModalToTrade.innerHTML = "";
        for (let i = 0; i < userCardsForTrade.cards.length; i++) {
            userCardsModalToTrade.innerHTML += `<div class="container-packages">
                <img src="./images/uploads/character/${userCardsForTrade.cards[i].characterid}.png" alt="${userCardsForTrade.cards[i].charactername}" class="packages">
                <div class="trade-shop">
                    <p>${userCardsForTrade.cards[i].charactername}</p>
                    <p>${userCardsForTrade.cards[i].brand_name} ${userCardsForTrade.cards[i].brand_series}</p>
                    <p>${userCardsForTrade.cards[i].characterrarity}</p>
                    <button class="btn-shop" id="${userCardsForTrade.cards[i].cardid}" data-cardTradeOffer>Ofertar</button>
               </div>
            </div>`
        };
    } catch (error) {
        openErrorModal(`${error.message}`);
    }
}

export async function createRequest(e) {
    try {
        const offeredcardID = e.target.id;
        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },              
        };
        const response = await fetch(`api/change-requests/${offeredcardID}/for/${requestcardID}`, options)
        if (response.status !== 201) {
            const error = await response.json();
            throw new Error(`${error.message}`);
        };
        const res = await response.json();
        openSuccessModal(`${res.res.res}`);
        navigateTo('/trade');
    } catch (error) {
        openErrorModal(`${error.message}`);
    }
}

export async function getChangeRequests(e) {
    try {
        const cardID = e.target.id;
        const pendingCardContainer = document.querySelector('#pendingtrade-cards');
        pendingCardContainer.innerHTML = ''
        const pendingTradeResponse = await fetch(`api/change-requests/${cardID}`)
        if (pendingTradeResponse.status !== 200) {
            const error = await pendingTradeResponse.json();
            throw new Error(`${error.message}`);
        }
        const data = await pendingTradeResponse.json();
        for (let i = 0; i < data.cards.length; i++) {
            pendingCardContainer.innerHTML += `<div>
            <img src="./images/uploads/character/${data.cards[i].character_id}.png" alt="card ofertada" class="card-pending">
            <div class="description-pending-card">
                <p>${data.cards[i].name}</p>
                <p>${data.cards[i].brand_name} ${data.cards[i].brand_series}</p>
                <p>${data.cards[i].rarity}</p>
                <button class="pending-cardbtn" data-reqcardid="${e.target.id}" data-offcardid="${data.cards[i].offeredcard_id}" data-finishChangeReq>Selecionar</button>
            </div>
            </div>`
        }
        openPendingTradeModal();
    } catch (error) {
        openErrorModal(`${error.message}`);
    }
}

export async function finishChangeRequest(e) {
    try {
        const reqcardID = e.target.dataset.reqcardid;
        const offcardID = e.target.dataset.offcardid;
        const bodyValue = {
            reqcardID,
            offcardID
        }
        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyValue)                
        };
        const response = await fetch('api/trade', options);
        if (response.status !== 201) {
            const error = await response.json();
            throw new Error(`${error.message}`);
        }
        openSuccessModal('Troca realizada com succeso!');
        closePendingTradeModal();
        navigateTo('/pendingtrade');
    } catch (error) {
        openErrorModal(`${error.message}`);
    }
}

export async function login() {
    try {
        const emailValue = document.querySelector('#login-input-email').value;
        const passwordValue = document.querySelector('#login-input-password').value;
        const bodyValue = {
            email: emailValue,
            password: passwordValue
        }
        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyValue)                
        };
        const response = await fetch('api/login', options);
        if (response.status !== 200) {
            const error = await response.json();
            throw new Error(`${error.message}`);
        }
        const data = await response.json();
        if (data.admin) {
            navigateTo('/addpackage');
        } else {
            navigateTo('/home');
        }
    } catch (error) {
        openErrorModal(`${error.message}`);
    }
}

export async function logout() {
    try {
        const options = { method: "POST" };
        const response = await fetch('api/logout', options);
        if (response.status !== 200) {
            const error = await response.json();
            throw new Error(`${error.message}`);
        }
        navigateTo('/login');
    } catch (error) {
        openErrorModal(`${error.message}`);
    }
}

export async function signup() {
    try {
        const emailValue = document.querySelector('#signup-input-email').value;
        const passwordValue = document.querySelector('#signup-input-password').value;
        const userNameValue = document.querySelector('#signup-input-user').value;
        const bodyValue = {
            email: emailValue,
            password: passwordValue,
            name: userNameValue
        }
        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyValue)                
        };
        const response = await fetch('api/signup', options);
        if (response.status !== 201) {
            const error = await response.json();
            throw new Error(`${error.message}`);
        }
        openSuccessModal('Usuário cadastrado com sucesso!');
        navigateTo('/login');
    } catch (error) {
        openErrorModal(`${error.message}`);
    }
}

export async function toggleChange(e) {
    try {
        e.preventDefault()
        const cardID = e.target.id;
        const changeAvailable = e.target.dataset.change;
        const bodyValue = {
            'card' : cardID,
            'change': changeAvailable
        }
        const options = {
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyValue)
        }
        const result = await fetch('api/cards', options)
        if (result.status !== 200) {
            const error = await result.json();
            throw new Error(`${error.message}`);
        }
        const data = await result.json();
        e.target.checked = data.change_available;
        e.target.dataset.change = data.change_available;
    } catch (error) {
        console.log(error, error.message);
    }
}

export async function createBrand() {
    try {
        const brandName = document.querySelector('#addbrand-input-name').value;
        const brandSeries = document.querySelector('#addbrand-input-series').value;
        if (!brandName || !brandSeries) {
            throw new Error('Preencha todos os campos!');
        }
        const bodyValue = {
            name: brandName,
            series: brandSeries
        }
        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyValue)                
        };
        const response = await fetch('api/brands', options);
        if (response.status !== 201) {
            const error = await response.json();
            throw new Error(`${error.message}`);
        }
        openSuccessModal('Coleção cadastrada com sucesso!');
        document.querySelector('#addbrand-input-name').value = '';
        document.querySelector('#addbrand-input-series').value = '';
    } catch (error) {
        openErrorModal(`${error.message}`);
    }
}

export async function createPackage() {
    try {
        const packageSeries = document.querySelector('#addpackage-input-series').value;
        const packageRarity = document.querySelector('#addpackage-rarity').value;
        const packagePrice = document.querySelector('#addpackage-price').value;
        const packageRareChance = parseInt(document.querySelector('#addpackage-rarechance').value) + parseInt(document.querySelector('#addpackage-ultrararechance').value);
        const packageUltraRareChance = parseInt(document.querySelector('#addpackage-ultrararechance').value);
        if (!packageImg || !packageSeries || !packageRarity || !packagePrice || !packageRareChance || !packageUltraRareChance) {
            throw new Error('Preencha todos os campos!');
        }
        const formData = new FormData();
        formData.append("brand", packageSeries);
        formData.append("type", packageRarity);
        formData.append("price", packagePrice);
        formData.append("chancerare", packageRareChance);
        formData.append("chanceultrarare", packageUltraRareChance);
        const options = {
            method: "POST",
            body: formData                
        };
        const response = await fetch('api/packages', options);
        if (response.status !== 201) {
            const error = await response.json();
            throw new Error(`${error.message}`);
        }
        const data = await response.json();
        const formImageData = new FormData();
        formImageData.append("package-image", packageImg.files[0]);
        const optionstwo = {
            method: "POST",
            body: formImageData
        }
        const responsetwo = await fetch(`api/packageimage/${data.packageID}`, optionstwo);
        if (responsetwo.status !== 201) {
            const errortwo = await responsetwo.json();
            throw new Error(`${errortwo.message}`);
        }
        openSuccessModal('Pacote cadastrado com sucesso!');
        packageImgPreview.src = './images/default-profile.svg';
        packageImg.value = '';
        document.querySelector('#addpackage-input-series').selectedIndex = -1;
        document.querySelector('#addpackage-rarity').selectedIndex = -1;
        document.querySelector('#addpackage-price').value = '';
        document.querySelector('#addpackage-rarechance').value = '';
        document.querySelector('#addpackage-ultrararechance').value = '';
    } catch (error) {
        openErrorModal(`${error.message}`);
    }
}

export async function createCharacter() {
    try {
        const characterSeries = document.querySelector('#addcharacter-input-series').value;
        const characterRarity = document.querySelector('#addcharacter-rarity').value;
        const characterName = document.querySelector('#addcharacter-input-name').value;
        if (!characterImg || !characterSeries || !characterRarity || !characterName) {
            throw new Error('Preencha todos os campos!');
        }
        const formData = new FormData();
        formData.append("brand", characterSeries);
        formData.append("rarity", characterRarity);
        formData.append("name", characterName);
        const options = {
            method: "POST",
            body: formData                
        };
        const response = await fetch('api/character', options);
        if (response.status !== 201) {
            const error = await response.json();
            throw new Error(`${error.message}`);
        }
        const data = await response.json();
        const formImageData = new FormData();
        formImageData.append("character-image", characterImg.files[0]);
        const optionstwo = {
            method: "POST",
            body: formImageData
        }
        const responsetwo = await fetch(`api/characterimage/${data.characterID}`, optionstwo);
        if (responsetwo.status !== 201) {
            const errortwo = await responsetwo.json();
            throw new Error(`${errortwo.message}`);
        }
        openSuccessModal('Personagem cadastrado com sucesso!');
        characterImgPreview.src = './images/default-profile.svg';
        characterImg.value = '';
        document.querySelector('#addcharacter-input-series').selectedIndex = -1;
        document.querySelector('#addcharacter-rarity').selectedIndex = -1;
        document.querySelector('#addcharacter-input-name').value = '';
    } catch (error) {
        openErrorModal(`${error.message}`);
    }
}

export async function updateAdminProfile() {
    try {
        const adminNewImg = adminImg.files[0];
        const adminNewName = document.querySelector('#admin-profile-name-input').value;
        const adminNewEmail = document.querySelector('#admin-profile-email-input').value;
        const adminNewPassword = document.querySelector('#admin-profile-password-input').value;
        const formData = new FormData();
        if(adminNewImg) formData.append("profile-image", adminNewImg);
        if(adminNewName) formData.append("name", adminNewName);
        if(adminNewEmail) formData.append("email", adminNewEmail);
        if(adminNewPassword) formData.append("password", adminNewPassword);
        const options = {
            method: "PUT",
            body: formData
        }
        const response = await fetch('api/user', options);
        if (response.status !== 200) {
            const error = await response.json();
            throw new Error(`${error.message}`);
        }
        const data = await response.json();
        openSuccessModal('Usuário atualizado com sucesso!');
        adminName.innerText = `${data.name}`;
        adminProfileImg.src = `./images/uploads/${data.userID}.png`
        adminImgPreview.src = './images/default-profile.svg';
        adminImg.value = '';
        document.querySelector('#admin-profile-name-input').value = '';
        document.querySelector('#admin-profile-email-input').value = '';
        document.querySelector('#admin-profile-password-input').value = '';
    } catch (error) {
        openErrorModal(`${error.message}`);
    };
}

export async function updateUserProfile() {
    try {
        const newImg = userImg.files[0];
        const newName = document.querySelector('#profile-name-input').value;
        const newEmail = document.querySelector('#profile-email-input').value;
        const newPassword = document.querySelector('#profile-password-input').value;
        const formData = new FormData();
        if(newImg) formData.append("profile-image", newImg);
        if(newName) formData.append("name", newName);
        if(newEmail) formData.append("email", newEmail);
        if(newPassword) formData.append("password", newPassword);
        const options = {
            method: "PUT",
            body: formData
        }
        const response = await fetch('api/user', options);
        if (response.status !== 200) {
            const error = await response.json();
            throw new Error(`${error.message}`);
        }
        const data = await response.json();
        openSuccessModal('Usuário atualizado com sucesso!');
        userName.innerText = `${data.name}`;
        profileImg.src = `./images/uploads/${data.userID}.png`
        userImgPreview.src = './images/default-profile.svg';
        userImg.value = '';
        document.querySelector('#profile-name-input').value = '';
        document.querySelector('#profile-email-input').value = '';
        document.querySelector('#profile-password-input').value = '';
    } catch (error) {
        openErrorModal(`${error.message}`);
    };
}

btnCloseErrorModal.addEventListener('click', closeErrorModal);
btnCloseSuccessModal.addEventListener('click', closeSuccessModal)
btnCloseShopModal.addEventListener('click', closeShopModal);
btnClosePendingModal.addEventListener('click', closePendingTradeModal);
btnCloseTradeModal.addEventListener('click', closeUserCardsToTradeModal);

export function openErrorModal(message) {
    errorLogMessage.innerText = message;
    errorModal.style.display = 'flex';
}

function closeErrorModal() {
    errorModal.style.display = 'none';
}

function openSuccessModal(message) {
    successLogMessage.innerText = message;
    successModal.style.display = 'flex';
}

function closeSuccessModal() {
    successModal.style.display = "none";
}

function openShopModal(){
    shopModal.style.display = 'flex';
}

function closeShopModal(){
    shopModal.style.display = 'none';
}

function openPendingTradeModal(){
    pendingTradeModal.style.display = 'flex';
}

function closePendingTradeModal(){
    pendingTradeModal.style.display = 'none';
}

function openUserCardsToTradeModal(){
    tradeModal.style.display = 'flex';
}

function closeUserCardsToTradeModal(){
    tradeModal.style.display = 'none';
}

userImg.addEventListener('change', (e) => {
    const url = window.URL.createObjectURL(e.target.files[0]);
    userImgPreview.src = url;
    userImgPreview.onload = function() { window.URL.revokeObjectURL(url) }
})

adminImg.addEventListener('change', (e) => {
    const url = window.URL.createObjectURL(e.target.files[0]);
    adminImgPreview.src = url;
    adminImgPreview.onload = function() { window.URL.revokeObjectURL(url) }
})

characterImg.addEventListener('change', (e) => {
    const url = window.URL.createObjectURL(e.target.files[0]);
    characterImgPreview.src = url;
    characterImgPreview.onload = function() { window.URL.revokeObjectURL(url) }
})

packageImg.addEventListener('change', (e) => {
    const url = window.URL.createObjectURL(e.target.files[0]);
    packageImgPreview.src = url;
    packageImgPreview.onload = function() { window.URL.revokeObjectURL(url) }
})