// left panel elements
const questionContainer = document.getElementById('questions-container');

// right panel Elements

// question realated elements
const discussionPortal = document.getElementById("discussion-portal");
const subject = document.getElementById('subject');
const questionArea = document.getElementById('new-question-area');
const submitQuestionBtn = document.getElementById('new-question-submit-btn');
const SubjectRequiredMeassage = document.getElementById('subject-required-message');
const questionRequiredMessage = document.getElementById('question-required-message');
const questionInfoContainer = document.getElementById('question-info-container');
const rightPaneQuestionSubject = document.getElementById('right-pane-question-subject');
const rightPaneQuestionBody = document.getElementById('right-pane-question-content');
const searchBar = document.getElementById('search-question-button');

// response related elements 
const userName = document.getElementById('user-name');
const responseArea = document.getElementById('new-comment-area');
const submitResponseBtn = document.getElementById('add-response-btn');
const existingResponseContainer = document.getElementById('existing-response-container');
const userNameRequiredMessage = document.getElementById('user-name-required-message');
const commentRequiredMessage = document.getElementById('comment-required-message');



// other data contianer user
let questions = {};
let favQuestions = [];
let responseCount = 0;
let currentQuestion = null;
let isQuestionsRendered = false;
let isAnyFavQuestion = false;
let currentTime = Date.now();
let questionTimeContainer = null;
let isVoted = false;

// question related code 
function createQuestion() {
    // for every new question there will be 0 response
    responseCount = 0;

    if (!isEmpty(subject, questionArea)) {
        const question = {
            subject: subject.value,
            body: questionArea.value,
            id: Date.now(),
            response: {},
            totalResponses: 0,
            createdAt: Date.now(),
            isFav: false,
            favId: 0,
            nextFavQuestion: 0,
            nextOfFavQuestionId: 0,
        }

        // add the question in dom
        addQuestionToDom(question);
        // update local Storage  
        loadQuestion(question);
    }
    else {
        addQuestionAlert();
    }
}

function addQuestionToDom(question) {

    const newQuestion = document.createElement('div');
    newQuestion.classList.add("question");
    newQuestion.setAttribute('id', `${question.id}`);

    const newSubject = document.createElement('h2');
    newSubject.classList.add("question-subject");
    newSubject.innerText = `${question.subject}`;

    const newQuestionContent = document.createElement('p');
    newQuestionContent.classList.add("question-content");
    newQuestionContent.innerText = `${question.body}`;

    const favIcon = document.createElement('i');
    favIcon.classList.add("ri-star-fill", "favourite-icon");
    favIcon.addEventListener('click', () => toggleFavourite(event, newQuestion));

    const questionCreationTime = document.createElement('h3');
    questionCreationTime.classList.add("question-creation-time");
    currentTime = Date.now();
    questionCreationTime.innerText = currentTime - question.createdAt + "sec ago";
    questionTimeContainer = questionContainer.querySelectorAll('.question-creation-time');

    newQuestion.appendChild(newSubject);
    newQuestion.appendChild(newQuestionContent);
    newQuestion.appendChild(favIcon);
    newQuestion.appendChild(questionCreationTime);

    // load respones...
    newQuestion.addEventListener('click', () => {
        loadQuestionInfo(question);
    });

    questionContainer.insertBefore(newQuestion, questionContainer.firstChild);

    // clearing inputs
    subject.value = "";
    questionArea.value = "";
}

// load the questions in the loacl storage 
function loadQuestion(question) {
    questions[question.id] = question;
    let item = JSON.stringify(questions);
    localStorage.setItem('questions', item);
}

// render the quetsions on the web
function renderQuestions() {
    isQuestionsRendered = true;
    // if the expression evaluates the false value then the default value will be {} empty object
    questions = JSON.parse(localStorage.getItem('questions')) || {};
    favQuestions = JSON.parse(localStorage.getItem('favQuestions')) || [];
    if (questions != {}) {
        const questionsFrag = createQuestionFragment();
        questionContainer.appendChild(questionsFrag);
    }
}

function updateQuestionTimer() {
    let questionKeyArray = Object.keys(questions);
    questionKeyArray.map((key) => {
        let questionElement = document.getElementById(key);
        questionTimeContainer = questionElement.querySelector('.question-creation-time');
        let question = questions[key];
        updateTimerSnippet(questionTimeContainer, question);
    });

}


function updateTimerSnippet(questionTimeContainer, question) {
    currentTime = Date.now();
    let creationTime = question.createdAt;
    let questionAddedTime = Math.floor((currentTime - creationTime) / 1000);
    // for seconds
    let seconds = questionAddedTime;
    if (questionAddedTime < 60) {
        if (seconds < 5)
            questionTimeContainer.innerText = questionAddedTime + "sec ago";
        else
            questionTimeContainer.innerText = "few sec ago";
    }
    else {
        // for minutes 
        let min = Math.floor(questionAddedTime / 60);
        if (min < 60) {
            if (min < 5)
                questionTimeContainer.innerText = min + "min ago";
            else
                questionTimeContainer.innerText = "few min ago"
        }
        // for hours
        else if (min > 60) {
            let hours = Math.floor(min / 60);
            if (hours < 24)
                questionTimeContainer.innerText = hours + "hours ago";
            // for days
            else if (hours > 24) {
                let days = Math.floor(hours / 24);
                if (days < 30) {
                    if (days == 1)
                        questionTimeContainer.innerText = days + "day ago";
                    else
                        questionTimeContainer.innerText = days + "days ago";
                }
                // for months
                else if (days > 30) {
                    let months = Math.floor(days / 30);
                    if (months < 12) {
                        if (months == 1)
                            questionTimeContainer.innerText = months + "month ago";
                        else
                            questionTimeContainer.innerText = months + "months ago";
                    }
                    // for years
                    else if (months > 12) {
                        let years = Math.floor(months / 12);
                        if (years == 1)
                            questionTimeContainer.innerText = years + "year ago";
                        else
                            questionTimeContainer.innerText = years + "years ago";
                    }
                }
            }
        }
    }
}

function createQuestionFragment() {
    let fragment = document.createDocumentFragment();
    let objKeysArray = Object.keys(questions);
    objKeysArray.map((question) => {
        // add questions which are not favourite first
        if (!questions[question].isFav) {
            const newQuestion = questionFragmentSnippet(question);
            fragment.insertBefore(newQuestion, fragment.firstChild);
        }
        else {
            isAnyFavQuestion = true;
        }
    })
    if (isAnyFavQuestion) {
        // add favourite questions 
        favQuestions.map((question) => {
            const newQuestion = questionFragmentSnippet(question);
            fragment.insertBefore(newQuestion, fragment.firstChild);
        })
    }
    // returning the  newly created Questions fragment
    return fragment;
}


function questionFragmentSnippet(questionId) {
    let question = questions[questionId];
    const newQuestion = document.createElement('div');
    newQuestion.classList.add("question");
    newQuestion.setAttribute('id', `${question.id}`);

    const newSubject = document.createElement('h2');
    newSubject.classList.add("question-subject");
    newSubject.innerText = `${question.subject}`;

    const newQuestionContent = document.createElement('p');
    newQuestionContent.classList.add("question-content");
    newQuestionContent.innerText = `${question.body}`;

    // creating favourite icon for each question 
    const favIcon = document.createElement('i');
    if (question.isFav == true)
        favIcon.classList.add("ri-star-fill", "favourite-icon", "favourite");
    else
        favIcon.classList.add("ri-star-fill", "favourite-icon");

    // event listener to each  favourite icon 
    favIcon.addEventListener('click', () => toggleFavourite(event, newQuestion));


    const questionCreationTime = document.createElement('h3');
    questionCreationTime.classList.add("question-creation-time");

    newQuestion.appendChild(newSubject);
    newQuestion.appendChild(newQuestionContent);
    newQuestion.appendChild(favIcon);
    newQuestion.append(questionCreationTime);
    newQuestion.addEventListener('click', () => {
        loadQuestionInfo(question);
    });
    return newQuestion;

}


// calls when question clicks in the left pane and shows info..(store the current quetsion id)
function loadQuestionInfo(question) {
    existingResponseContainer.replaceChildren();
    currentQuestion = question.id;
    discussionPortal.classList.add("hidden");
    questionInfoContainer.classList.remove("hidden");
    rightPaneQuestionSubject.innerText = question.subject;
    rightPaneQuestionBody.innerText = question.body;
    if (question.response != {} || question.response != null)
        renderResponse(question);
}

function resolveQuestion() {
    let ques = questions[currentQuestion];
    let i = 0;
    // removing question from the favQuestions array 
    while (i < favQuestions.length) {
        if (favQuestions[i] == ques.id) {
            favQuestions.splice(i, 1);
        }
        i++;
    }
    loadFavQuestions(favQuestions); // loading the updated favourite question array in the local storage 
    removeQuestionFromDom();
    // removing resolved question from the local storage 
    delete questions[currentQuestion];
    updateQuetsionsLocalStorage();
    // immdiately remove that question info display and display newQuestionForm
    displayQuestionForm();
}

function removeQuestionFromDom() {
    let question = document.getElementById(`${currentQuestion}`);
    question.remove();
}

function updateQuetsionsLocalStorage() {
    questions = JSON.stringify(questions);
    localStorage.setItem('questions', questions);
    questions = JSON.parse(localStorage.getItem('questions'));
}


let nextOfFavQuestion = null;

function toggleFavourite(event, questionElement) {
    event.stopPropagation();
    let element = event.target;
    let question = questions[questionElement.id];
    element.classList.toggle("favourite");

    if (element.classList.contains("favourite")) {
        favQuestions.push(questionElement.id);

        questionElement.favId = Date.now();
        question.isFav = true;
        // finding the next question from the current question
        nextOfFavQuestion = questionElement.nextSibling;

        if (nextOfFavQuestion != null) {
            question.nextOfFavQuestionId = nextOfFavQuestion.id;
            if (nextOfFavQuestion.isFav == true) {
                questionElement.nextFavQuestion = nextOfFavQuestion;
            }
        }
        addFavQuestionToTop(questionElement);
    }
    else {
        let i = 0;
        // removing un-favourite id from the favQuestions array 
        while (i < favQuestions.length) {
            if (favQuestions[i] == questionElement.id) {
                favQuestions.splice(i, 1);
            }
            i++;
        }


        question.isFav = false;
        let nextQuestionId = question.nextOfFavQuestionId;
        if (nextQuestionId) {
            nextOfFavQuestion = document.getElementById(nextQuestionId);
            addQuesToPrevPos(questionElement, nextOfFavQuestion);
        }
        else {
            addQuestionToLast(questionElement);
        }
    }
    // loading the updated value to the local storage  
    loadQuestion(question);
    loadFavQuestions(favQuestions);
}

function loadFavQuestions(favQuestions) {
    localStorage.setItem('favQuestions', JSON.stringify(favQuestions));
}

function addFavQuestionToTop(question) {
    questionContainer.insertBefore(question, questionContainer.firstChild);
}

function addQuesToPrevPos(currentQuestion, nextQuestion) {
    questionContainer.insertBefore(currentQuestion, nextQuestion);
}

function addQuestionToLast(question) {
    questionContainer.appendChild(question);
}

function searchQuestion() {
    const question = searchBar.value;
    const regex = new RegExp(`(${question})`, 'i'); // Adding capture group for highlighting

    for (const key in questions) {
        if (questions.hasOwnProperty(key)) {
            const element = document.getElementById(key);
            if (element) {
                if (regex.test(questions[key].subject)) {
                    const subject = element.querySelector('.question-subject');
                    subject.innerHTML = questions[key].subject.replace(regex, '<span class="highlight">$1</span>');
                    element.classList.remove('hidden');
                } else {
                    subject.innerHTML = questions[key].subject; // removin highlight when hidden
                    element.classList.add('hidden');
                }
            }
        }
    }
}



// Reponse realted code
function createResponse() {
    questions[currentQuestion].totalResponses++;
    if (!isEmpty(userName, responseArea)) {
        let response = {
            subject: userName.value,
            body: responseArea.value,
            id: `response${questions[currentQuestion].totalResponses}`,
            createdAt: Date.now(),
            isFav: false,
            prevResponseId: responseCount,
            upVotes: 0,
            downVotes: 0,
            netVotes: 0,
        }

        // add response to the dom
        addResponseToDom(response);
        // update local storage 
        loadResponse(response);
        arrangeResponses();
    }
    else {
        addResponseAlert();
    }
}

function loadResponse(response) {
    questions[currentQuestion].response[`${response.id}`] = response;
    localStorage.setItem('questions', JSON.stringify(questions));
}

function addResponseToDom(response) {
    const newResponse = document.createElement('div');
    newResponse.classList.add("comment");
    newResponse.setAttribute('id', response.id);
    newResponse.setAttribute('data-net-votes', '0');

    const newUserName = document.createElement('h2');
    newUserName.classList.add("user-name");
    newUserName.innerText = response.subject;

    // votes container 
    const votesContainer = document.createElement('span');
    votesContainer.classList.add('votes-container');

    // upVoteContainer 
    const upVoteContainer = document.createElement('div');
    upVoteContainer.classList.add('up-down-votes-container');

    const upVoteIcon = document.createElement('i');
    upVoteIcon.classList.add("ri-arrow-up-s-fill", "up-vote");

    const upVoteCountContainer = document.createElement('span');
    upVoteCountContainer.classList.add('votes-count');
    upVoteCountContainer.innerText = response.upVotes;

    upVoteContainer.appendChild(upVoteIcon);
    upVoteContainer.appendChild(upVoteCountContainer);

    upVoteIcon.addEventListener('click', (event) => {
        updateVotes(event, newResponse, response);
    });


    // downVoteContainer 
    const downVoteContainer = document.createElement('div');
    downVoteContainer.classList.add('up-down-votes-container');

    const donwVoteIcon = document.createElement('i');
    donwVoteIcon.classList.add("ri-arrow-down-s-fill", "down-vote");
    donwVoteIcon.addEventListener('click', (event) => {
        updateVotes(event, newResponse, response);
    });

    const donwVoteCountContainer = document.createElement('span');
    donwVoteCountContainer.classList.add('votes-count');
    donwVoteCountContainer.innerText = response.downVotes;

    downVoteContainer.appendChild(donwVoteIcon);
    downVoteContainer.appendChild(donwVoteCountContainer);

    votesContainer.appendChild(upVoteContainer);
    votesContainer.appendChild(downVoteContainer);

    const newResponseBody = document.createElement('p');
    newResponseBody.classList.add("comment-content");
    newResponseBody.innerText = response.body;
    existingResponseContainer.insertBefore(newResponse, existingResponseContainer.firstChild);
    newResponse.appendChild(newUserName);
    newResponse.appendChild(newResponseBody);
    newResponse.appendChild(votesContainer);

    // clears the inputs after submit
    userName.value = "";
    responseArea.value = "";
    // Insert the new comment div at the beginning of the existing response container
    existingResponseContainer.insertBefore(newResponse, existingResponseContainer.firstChild);
}

function renderResponse(question) {
    let responsesKeyArray = Object.keys(question.response);

    if (responsesKeyArray.length > 0) {
        const responeFrag = createResponseFragment(question, responsesKeyArray);
        existingResponseContainer.appendChild(responeFrag);
        arrangeResponses();
    }
}


function createResponseFragment(question, responseKeyArray) {
    responseCount = 0;

    const fragment = document.createDocumentFragment();
    responseKeyArray.map((responsekey) => {
        let response = question.response[responsekey];
        const newResponse = document.createElement('div');
        newResponse.classList.add("comment");
        newResponse.setAttribute('id', `response${++responseCount}`);
        newResponse.setAttribute('data-net-votes', `${response.netVotes}`);

        const newUserName = document.createElement('h2');
        newUserName.classList.add("user-name");
        newUserName.innerText = response.subject;

        // votes container 
        const votesContainer = document.createElement('span');
        votesContainer.classList.add('votes-container');

        // upVoteContainer 
        const upVoteContainer = document.createElement('div');
        upVoteContainer.classList.add('up-down-votes-container');

        const upVoteIcon = document.createElement('i');
        upVoteIcon.classList.add("ri-arrow-up-s-fill", "up-vote");

        const upVoteCountContainer = document.createElement('span');
        upVoteCountContainer.classList.add('votes-count');
        upVoteCountContainer.innerText = response.upVotes;
        upVoteContainer.appendChild(upVoteIcon);
        upVoteContainer.appendChild(upVoteCountContainer);

        upVoteIcon.addEventListener('click', (event) => {
            updateVotes(event, newResponse, response);
        });

        // downVoteContainer
        const downVoteContainer = document.createElement('div');
        downVoteContainer.classList.add('up-down-votes-container');

        const donwVoteIcon = document.createElement('i');
        donwVoteIcon.classList.add("ri-arrow-down-s-fill", "down-vote");
        donwVoteIcon.addEventListener('click', (event) => {
            updateVotes(event, newResponse, response);
        });

        const donwVoteCountContainer = document.createElement('span');
        donwVoteCountContainer.classList.add('votes-count');
        donwVoteCountContainer.innerText = response.downVotes;
        downVoteContainer.appendChild(donwVoteIcon);
        downVoteContainer.appendChild(donwVoteCountContainer);

        votesContainer.appendChild(upVoteContainer);
        votesContainer.appendChild(downVoteContainer)

        const newResponseBody = document.createElement('p');
        newResponseBody.classList.add("comment-content");
        newResponseBody.innerText = response.body;
        existingResponseContainer.insertBefore(newResponse, existingResponseContainer.firstChild);
        newResponse.appendChild(newUserName);
        newResponse.appendChild(newResponseBody);
        newResponse.appendChild(votesContainer);

        // Insert the new comment div at the beginning of the existing response container
        fragment.insertBefore(newResponse, fragment.firstChild);
    })

    // arrangeResponses(responseKeyArray);
    // return arrangeResponses(fragment);
    return fragment;
}


function updateVotes(event, responseElement, response) {
    let vote = event.target;
    let voteCountContainer = event.target.nextSibling;

    if (vote.classList.contains('up-vote')) {
        // update upvotes 
        response.upVotes++;
        voteCountContainer.innerText = response.upVotes;
    }
    else {
        // update donwVotes 
        response.downVotes++;
        voteCountContainer.innerText = response.downVotes;
    }

    // updating the net votes 
    response.netVotes = response.upVotes - response.downVotes;
    responseElement.setAttribute('data-net-votes', `${response.netVotes}`);
    // update local Storage 
    loadResponse(response);
    arrangeResponses();
}


function arrangeResponses() {

    let responseKeyArray = Object.keys(questions[currentQuestion].response);
    let length = responseKeyArray.length;
    let currResponseNetVotes = null;
    let nextResponseNetVotes = null;
    let nextResElement = null;

    // sorting the elements using bubble sort
    for (let i = 0; i < length - 1; i++) {

        for (let j = 0; j < length - i - 1; j++) {

            currResponseNetVotes = parseInt(existingResponseContainer.children[j].getAttribute('data-net-votes'));
            nextResponseNetVotes = parseInt(existingResponseContainer.children[j + 1].getAttribute('data-net-votes'));

            if (currResponseNetVotes < nextResponseNetVotes) {
                currResElement = existingResponseContainer.children[j];
                nextResElement = existingResponseContainer.children[j + 1];

                // swapping
                existingResponseContainer.insertBefore(nextResElement, currResElement);
            }
        }
    }

}



// ---------------------------------------- utility Functions ----------------------------------------
function isEmpty(subject, body) {
    if (subject.value.trim("") == "" || body.value.trim("") == "")
        return 1;
    else
        return 0;
}

function displayQuestionForm() {
    discussionPortal.classList.remove("hidden");
    questionInfoContainer.classList.add("hidden");
}



// ------------------------------------ Css function ---------------------------------------------

// question alert action 
function addQuestionAlert() {
    if (subject.value.trim("") == "") {
        SubjectRequiredMeassage.classList.remove('required-field');
        SubjectRequiredMeassage.classList.add('display-required-field');
    }
    if (questionArea.value.trim("") == "") {
        questionRequiredMessage.classList.remove('required-field');
        questionRequiredMessage.classList.add('display-required-field');
    }
}


function addResponseAlert() {
    if (userName.value.trim("") == "") {
        userNameRequiredMessage.classList.toggle('display-required-field');
        userNameRequiredMessage.classList.add('required-field');
    }
    if (responseArea.value.trim("") == "") {
        commentRequiredMessage.classList.toggle('display-required-field');
        commentRequiredMessage.classList.add('required-field');
    }
}

// remove the alert message on the  subject input
function removeSubjectAlertMessage() {
    if (SubjectRequiredMeassage.classList.contains('display-required-field')) {
        SubjectRequiredMeassage.classList.toggle('display-required-field');
        SubjectRequiredMeassage.classList.add('required-field');
    }
}

function removeUserNameAlertMessage() {
    if (userNameRequiredMessage.classList.contains('display-required-field')) {
        userNameRequiredMessage.classList.toggle('display-required-field');
        userNameRequiredMessage.classList.add('required-field');
    }
}

// remove the alert message on the new question textarea
function removeQuestionAlertMessage() {
    questionRequiredMessage.classList.remove('display-required-field');
    questionRequiredMessage.classList.add('required-field');

}

function removeCommentAlertMessage() {
    commentRequiredMessage.classList.remove('display-required-field');
    commentRequiredMessage.classList.add('required-field');
}


function displayQuestionForm() {
    discussionPortal.classList.remove("hidden");
    questionInfoContainer.classList.add("hidden");
}


function addComment() {
    if (rightPaneUserName.value.trim() == "" || rightPaneComment.value.trim() == "") {
        SubjectRequiredMeassage.classList.remove('required-field');
        SubjectRequiredMeassage.classList.add('display-required-field');
        if (textArea.value.trim() == "") {
            questionRequiredMessage.classList.remove('required-field');
            questionRequiredMessage.classList.add('display-required-field');
        }
    }
}


// by default rendering the questions from the local storage 
window.addEventListener('load', renderQuestions);
setInterval(updateQuestionTimer, 1000);
