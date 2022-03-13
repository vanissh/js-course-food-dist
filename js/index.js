window.addEventListener('DOMContentLoaded', () => {

    //Tabs
    const tabsContent = document.querySelectorAll('.tabcontent'),
        tabsParent = document.querySelector('.tabheader__items'),
        tabs = document.querySelectorAll('.tabheader__item')

    function hideTabContent(){
        tabsContent.forEach(item => {
            item.classList.remove('show', 'fade')
            item.classList.add('hide')
        })
        tabs.forEach(item => item.classList.remove('tabheader__item_active'))
    }

    function showTabContent(i){
        tabsContent[i].classList.remove('hide')
        tabsContent[i].classList.add('show', 'fade')

        tabs[i].classList.add('tabheader__item_active')
    }

    function changeTabs () {

        tabsParent.addEventListener('click', e => {
            let target = e.target

            if(target.matches('.tabheader__item')){

                tabs.forEach((item, i) => {
                    if(target === item) {
                        hideTabContent()
                        showTabContent(i)
                    }
                }) 
            }

        })
    }

    hideTabContent()
    showTabContent(0)
    changeTabs()

    //Timer

    const deadline = '2022-03-08',
        timer = document.querySelector('.timer'),
        daysEl = timer.querySelector('#days'),
        hoursEl = timer.querySelector('#hours'),
        minutesEl = timer.querySelector('#minutes'),
        secondsEl = timer.querySelector('#seconds')

    function getTimeRemaining(endtime){

        const t =  Date.parse(endtime) - Date.parse(new Date()), // кол-во милисекунд
                    days = Math.floor(t / (1000*3600*24)),
                    hours = Math.floor((t / (1000*3600)) % 24),
                    minutes = Math.floor((t / (1000*60)) % 60),
                    seconds = Math.floor((t / 1000) % 60)
        
        return {
            t, 
            days,
            hours,
            minutes,
            seconds
        }
    }

    function setTimer (){
        const {days, hours, minutes, seconds} = getTimeRemaining(deadline)
        
        daysEl.innerHTML = getZero(days)
        hoursEl.innerHTML = getZero(hours)
        minutesEl.innerHTML = getZero(minutes)
        secondsEl.innerHTML = getZero(seconds)
    }

    function getZero(value) {
        return value.toString().length < 2 ? '0' + value : value
    }

    function timerUpdate () {

        let timerID = setInterval(() => {
            setTimer()
            if(getTimeRemaining(deadline).t <= 0){
                clearInterval(timerID)
            }
        }, 1000)
    }

    setTimer()
    timerUpdate()

    // Modal 

    const modalTriggers = document.querySelectorAll('[data-modal]'),
        modal = document.querySelector('.modal')

    function openModal () {
        modal.classList.add('show')
        modal.classList.remove('hide')
        document.body.style.overflow = 'hidden'

        console.log('open')

        clearInterval(modalTimerID)
        window.removeEventListener('scroll', openModalByScroll)
    }

    function closeModal () {
        modal.classList.add('hide')
        modal.classList.remove('show')
        document.body.style.overflow = 'visible'
    }

    function modalHandler () {
        modalTriggers.forEach(item => {
            item.addEventListener('click', () => {
                openModal()
            })
        })

        document.addEventListener('click', e => {
            let target = e.target

            if(target.matches('[data-close]') || target.matches('.modal')){
                closeModal()
            }
        })

        document.addEventListener('keydown', e => {
            if(e.code === 'Escape' && modal.classList.contains('show')){
                closeModal()
            }
        })
    }

    modalHandler()

    // Modal-modification

    const modalTimerID = setTimeout(openModal, 10000) // открыть модальное окно спустя 10 секунд

    function openModalByScroll () {
        if(document.documentElement.clientHeight + window.pageYOffset >= document.body.scrollHeight - 1){
            openModal()
        }
    }

    window.addEventListener('scroll', openModalByScroll)


    //Forms

    const forms = document.querySelectorAll('form')

    forms.forEach(item => postData(item))

    const message = {
        loading: 'img/form/spinner.svg',
        success: 'Спасибо, мы скоро с вами свяжемся',
        failure: 'Что-то пошло не так...'
    }

    function postData(form){
        form.addEventListener('submit', (e) => {
            e.preventDefault()

            const statusMessage = document.createElement('img')
            statusMessage.src = message.loading
            statusMessage.style.cssText =  `
                display: block;
                margin: 10px auto;
            `
            form.insertAdjacentElement('afterend', statusMessage)

            const formData = new FormData(form) //важно, чтобы был прописан атрибут name у input

            /* отправка данных в формате json*/

            const object = {}
            formData.forEach((value, key) => object[key] = value)

            fetch('server.php', {
                method: 'POST',
                headers: {
                    'Content-type' : 'application/json'
                },
                body: JSON.stringify(object)
            })
            .then(data => {
                if(data.status !== 200){
                    throw new Error('Error')
                }
                return data.text()
            })
            .then(data => {
                console.log(data)
                showThanksModal(message.success)
                statusMessage.remove()
            })
            .catch(() => showThanksModal(message.failure))
            .finally(() => form.reset())
        })
    }

    function showThanksModal(message){
        const prevModalDialog = document.querySelector('.modal__dialog')

        prevModalDialog.classList.add('hide')
        prevModalDialog.classList.remove('show')
        openModal()

        const thanksModal = document.createElement('div')
        thanksModal.classList.add('modal__dialog')
        thanksModal.innerHTML = `
            <div class="modal__content">
                <div data-close class="modal__close">×</div>
                <div class="modal__title">${message}</div>
            </div>
        `
        document.querySelector('.modal').append(thanksModal)
        setTimeout(() => {
            thanksModal.remove()
            prevModalDialog.classList.add('show')
            prevModalDialog.classList.remove('hide')
            closeModal()
        }, 2000)
    }
})

// Menu cards
const menuContainer = document.querySelector('.menu__field .container')
class MenuCard {
    constructor({img, alt, title, description, price}, ...classes){
        this.img = img,
        this.alt = alt,
        this.title = title,
        this.description = description,
        this.price = price,
        this.classes = classes
    }

    render = () => {

        const card = document.createElement('div')
        card.classList.add(...this.classes)
        card.innerHTML = `
            <img src="${this.img}" alt="${this.alt}">
            <h3 class="menu__item-subtitle">Меню "${this.title}"</h3>
            <div class="menu__item-descr">${this.description}</div>
            <div class="menu__item-divider"></div>
            <div class="menu__item-price">
                <div class="menu__item-cost">Цена:</div>
                <div class="menu__item-total"><span>${this.price}</span> руб/день</div>
            </div>
        `
        menuContainer.append(card)
    }
}

const vegyData = {
    img: 'img/tabs/vegy.jpg',
    alt: 'vegy',
    title: 'Фитнес',
    description: `Меню "Фитнес" - это новый подход к приготовлению блюд: больше свежих
                овощей и фруктов. Продукт активных и здоровых людей. Это абсолютно новый продукт с оптимальной
                ценой и высоким качеством!`,
    price: 1145
}

const eliteData = {
    img: 'img/tabs/elite.jpg',
    alt: 'elite',
    title: 'Премиум',
    description: `В меню “Премиум” мы используем не только красивый дизайн упаковки, но
                и качественное исполнение блюд.<br><br>Красная рыба, морепродукты, фрукты - ресторанное меню 
                без похода в ресторан!`,
    price: 2750
}

const postData = {
    img: 'img/tabs/post.jpg',
    alt: 'post',
    title: 'Постное',
    description: `Меню “Постное” - это тщательный подбор ингредиентов: полное отсутствие
                продуктов животного происхождения, молоко из миндаля, овса, кокоса или гречки, правильное
                количество белков за счет тофу и импортных вегетарианских стейков.`,
    price: 2150
}

const vegyCard = new MenuCard(vegyData, 'menu__item', 'щищ')
vegyCard.render()

const eliteCard = new MenuCard(eliteData, 'menu__item')
eliteCard.render()

const postCard = new MenuCard(postData, 'menu__item')
postCard.render()

