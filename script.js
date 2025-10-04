
let signs = ['+', '-', '*']
let container_main = document.querySelector('.main')
let container_start = document.querySelector('.start')
let container_start_h3 = container_start.querySelector('h3') 
let container_field = document.querySelector('.question')
let container_buttons = document.querySelectorAll('.answer')
let container_button = document.querySelector('.start-btn')
let container_limit_buttons = document.querySelectorAll('.limit-btn'); 
let question_limit = null;

// Елементи Таймера та Лічильника
let timer_display = document.querySelector('#timer') 
let counter_display = document.querySelector('#counter') 

let cookie = false
let cookies = document.cookie.split('; ')

for (let i = 0; i < cookies.length; i += 1) {
    if (cookies[i].split('=')[0] == 'numbers_high_score') {
        cookie = cookies[i].split('=')[1]
        break
    }
}

function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

if (cookie) {
    let data = cookie.split('/')
    container_start_h3.innerHTML = `<h3>Минулого разу ви дали ${data[1]} правильних відповідей із ${data[0]}. Точність - ${Math.round(data[1] * 100 / data[0])}%.</h3>`
}

function randint(min, max) {
    return Math.round(Math.random() * (max - min) + min) 
}

function getRandomSign() {
    return signs[randint(0, 2)]
}

class Question {
    constructor() {
        let a = randint(1, 30)
        let b = randint(1, 30)
        let sign = getRandomSign()
        this.question = `${a} ${sign} ${b}` 
        if (sign == "+") { this.correct = a + b }
        else if (sign == "-") { this.correct = a - b }
        else if (sign == "*") { this.correct = a * b }
        this.answers = [
            randint(this.correct - 20, this.correct - 1),
            randint(this.correct - 20, this.correct - 1),
            this.correct,
            randint(this.correct + 1, this.correct + 20),
            randint(this.correct + 1, this.correct + 20),
        ]
        this.answers = [...new Set(this.answers)];
        while (this.answers.length < 5) {
            let newAnswer = randint(this.correct - 20, this.correct + 20);
            if (!this.answers.includes(newAnswer)) {
                this.answers.push(newAnswer);
            }
        }
        this.answers = this.answers.slice(0, container_buttons.length);
        
        shuffle(this.answers);
    }

    display() {
        container_field.innerHTML = this.question 
        for (let i = 0; i < container_buttons.length; i += 1) {
            container_buttons[i].innerHTML = this.answers[i] || '—'
        }
    }
} 


let current_question
let correct_answers_given
let total_answers_given
let timer_interval 

const GAME_DURATION = 30; 

function endGame() {
    if (timer_interval) { 
        clearInterval(timer_interval); 
        timer_interval = null;
    }
    
    let accuracy = 0;
    if (total_answers_given > 0) {
        accuracy = Math.round(correct_answers_given * 100 / total_answers_given);
    }
    
    let new_cookie = `numbers_high_score=${total_answers_given}/${correct_answers_given}; max-age=10000000000` 
    document.cookie = new_cookie

    container_main.style.display = 'none'
    container_start.style.display = 'flex'
    container_start_h3.innerHTML = `<h3> Ви дали ${correct_answers_given} правильних відповідей із ${total_answers_given}. Точність - ${accuracy}%.</h3>` 
    container_limit_buttons.forEach(btn => btn.style.backgroundColor = ''); 
    question_limit = null;
}

function startTimer() {
    let timeLeft = GAME_DURATION; // Починаємо відлік з 30
    timer_display.innerHTML = `Час: ${timeLeft}`;
    
    if (timer_interval) clearInterval(timer_interval); 

    timer_interval = setInterval(() => {
        timeLeft -= 1;
        timer_display.innerHTML = `Час: ${timeLeft}`;

        if (timeLeft <= 10) { 
            timer_display.style.color = 'red'; 
        } else {
            timer_display.style.color = 'inherit';
        }

        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000); 
}

container_limit_buttons.forEach(button => {
    button.addEventListener('click', function() {
        question_limit = parseInt(this.dataset.limit);
        
        //скидання фонового кольору всіх кнопок вибору ліміту питань
        container_limit_buttons.forEach(btn => btn.style.backgroundColor = ''); 
        
        console.log(`Question limit set to: ${question_limit}`);
    });
});

container_button.addEventListener('click', function () { 
    if (timer_interval) {
        clearInterval(timer_interval);
    }

    container_main.style.display = 'flex'
    container_start.style.display = 'none'
    
    correct_answers_given = 0
    total_answers_given = 0
    
    // Оновлення лічильника якщо ліміт не вибрано
    const limitDisplay = question_limit !== null ? `/${question_limit}` : '';
    counter_display.innerHTML = `Питання: 0${limitDisplay}`; 

    current_question = new Question()
    current_question.display()
    
    // Запускаємо таймер на 30 секунд.
    startTimer();
})
   
for (let i = 0; i < container_buttons.length; i += 1) { 
    container_buttons[i].addEventListener('click', function () {
        
        // Перевірка ліміту якщо ліміт встановлено і він досягнутий, вихід.
        if (question_limit !== null && total_answers_given >= question_limit) {
            return; 
        }

        if (container_buttons[i].innerHTML == current_question.correct) {
            correct_answers_given += 1
            container_buttons[i].style.background = '#00FF00' 
            anime({
                targets: container_buttons[i], 
                background: '#FFFFFF',
                duration: 500,
                delay: 100,
                easing: 'linear'
            })
        } else {
            for (let j = 0; j < container_buttons.length; j++) {
                if (container_buttons[j].innerHTML == current_question.correct) {
                    container_buttons[j].style.background = '#ADD8E6'; 
                    anime({
                        targets: container_buttons[j], 
                        background: '#FFFFFF',
                        duration: 500,
                        delay: 100,
                        easing: 'linear'
                    })
                    break;
                }
            }
            container_buttons[i].style.background = '#FF0000'
            anime({
                targets: container_buttons[i], 
                background: '#FFFFFF',
                duration: 500,
                delay: 100,
                easing: 'linear'
        })
    }
    total_answers_given += 1
    
    // Оновлення лічильника
    const limitDisplay = question_limit !== null ? `/${question_limit}` : '';
    counter_display.innerHTML = `Питання: ${total_answers_given}${limitDisplay}`;
    
    // Перевірка, чи досягнуто ліміту, якщо він встановлений
    if (question_limit !== null && total_answers_given >= question_limit) {
        endGame(); 
        return; 
    }

    current_question = new Question()
    current_question.display()
    })
}
