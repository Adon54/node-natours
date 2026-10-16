export const hideAlert = () => {
    const el = document.querySelector('.alert');
    if(el) el.parentElement.removeChild(el);
}

export const showAlert = (type, msg, sec = 5) => {
    console.log('hi from custom alert');
    hideAlert();
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup); 
    window.setTimeout(hideAlert, sec * 1000);
}