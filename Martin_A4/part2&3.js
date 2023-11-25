window.onload = function () {
  //AJAX call to retrieve json file & format it
  getData();
};

//ajax call
function getData() {
  let dropdown = document.querySelector("select");
  let options = dropdown.querySelectorAll("option");
  let selectedIndex = dropdown.selectedIndex;
  //default file
  let url = "GeographyQuiz.json";

  //determine which dropdown option was clicked to determine which json file to parse
  if (options[selectedIndex].value == "Math") {
    url = "MathQuiz.json";
  } else if (options[selectedIndex].value == "Music Short") {
    url = "MusicQuiz.json";
  } else if (options[selectedIndex].value == "Music Long") {
    url = "MusicQuizLong.json";
  }
  let xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        let response = xhr.responseText;
        let json = JSON.parse(response);
        //clear previous quiz results
        clearResults();
        //declares buttons & adds event listeners
        delcareButtons();
        //builds quiz based on json file
        buildQuiz(json);
        //adds click functionality to tabs
        tabClick();
      }
      //error getting data
      else {
        console.log(`Error: server sent status code ${xhr.status}`);
      }
    }
  };

  xhr.open("GET", url, true);
  xhr.send();
}

//adds clicking functionality to tabs
//to hide or shows appropriate tab content
function tabClick() {
  let tabs = document.querySelectorAll(".tab");
  //adds event listener to each tab on screen
  for (let i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener("click", showTab);
  }
}

//shows clicked tab content, hides all others
function showTab(evt) {
  let currentTab = evt.target;
  let tabCount = document.querySelectorAll(".tab");

  //removes active status from tabs
  for (let i = 0; i < tabCount.length; i++) {
    tabCount[i].classList.remove("active");
  }
  //adds active status to current tab
  currentTab.classList.add("active");

  //cycles through each question & removes hidden class
  //then re-adds hidden class if current index != the index most recently clicked tab
  for (let i = 0; i < tabCount.length; i++) {
    let question = document.querySelector("#tabContent" + (i + 1));
    question.classList.remove("hidden");

    if (tabCount[i] != currentTab) {
      question.classList.add("hidden");
    }
  }
}

//declares & adds event listeners to buttons
function delcareButtons() {
  //for loading new quiz
  let btnNewQuiz = document.querySelector("#btnNewQuiz");
  btnNewQuiz.addEventListener("click", getData);
  //for generating new answers
  let btnGenerateAnswers = document.querySelector("#btnGenerateAnswers");
  btnGenerateAnswers.addEventListener("click", validateInput);
  //submit button
  let btnSubmit = document.querySelector("#btnQuizSubmit");
  btnSubmit.addEventListener("click", showResults);
}

//validates user typed in a valid input
function validateInput() {
  //ask user which type of result they wish to generate
  let result = prompt(
    "What kind of result would you like to generate? " +
      "(type one of the following)\n\nOption 1 - Random\nOption 2 - 0%\nOption 3 - 100%",
    "Random"
  );
  //array of valid inputs
  let validResults = ["Random", "random", "0%", "0", "100%", "100"];

  //testing for valid inputs
  if (validResults.includes(result)) {
    generateResults(result);
  }
  //null would be returned if user clicks cancel
  else if (result != null) {
    alert("Invalid input, please try again");
    return;
  }
}

//checks all correct, all incorrect, or random radio buttons depending on
//which option the user chose
function generateResults(result) {
  //all questions
  let questions = document.querySelectorAll(".question");

  //if current option in index is correct answer - don't check
  //if it is, check it and return from function
  for (let i = 0; i < questions.length; i++) {
    //each radio button in question
    let options = questions[i].querySelectorAll("input");

    if (result == "Random" || result == "random") {
      let randomNumber = Math.floor(Math.random() * options.length);
      options[randomNumber].checked = true;
    }

    for (let j = 0; j < options.length; j++) {
      if (
        (result == "0%" || result == "0") &&
        !options[j].classList.contains("correct")
      ) {
        options[j].checked = true;
        break;
      } else if (
        (result == "100%" || result == "100") &&
        options[j].classList.contains("correct")
      ) {
        options[j].checked = true;
        break;
      }
    }
  }
  showResults();
}

//builds quiz based on json file
//builds intially hidden table to be show later
function buildQuiz(json) {
  let titleArea = document.querySelector("h1");
  let titleText = json.title;
  titleArea.innerHTML = "&#128221;" + titleText;
  let activeStatus = "";

  //to identify each multiple choice answer
  //allows up to 10 options. More of the alphabet can be added if needed
  let letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

  let htmlTabString = "";
  let isActive = "";
  //adds tabs to page, first one is active by default
  for (let i = 0; i < json.questions.length; i++) {
    if (i == 0) {
      isActive = "active";
    } else {
      isActive = "";
    }

    htmlTabString +=
      "<div class='" + isActive + " tab'>Question " + (i + 1) + "</div>";
  }
  let tabArea = document.querySelector("#tabContainer");
  tabArea.innerHTML = htmlTabString;

  //string for questions html
  let htmlString = "";
  //string for results table html
  let htmlTableString =
    "<table><tr><th>Question #</th><th>Question Text</th><th>Correct Answer</th><th>Your Answer</th><th>Score</th></tr>";

  //adds questions to page, tab content hidden if not the first one
  for (let i = 0; i < json.questions.length; i++) {
    if (i != 0) {
      activeStatus = "hidden";
    }
    htmlString +=
      "<div class = '" +
      activeStatus +
      "' id = 'tabContent" +
      (i + 1) + //new tab id
      "'><div class='question'><h2>Question " +
      (i + 1) + //question number
      "</h2>" +
      "<p>" + //question text
      json.questions[i].questionText +
      "</p>";

    let correctAnswerAsIndex = json.questions[i].answer;
    //builds table on page with all data except for user answer data
    //table is invisible until user clicks submit & their data gets entered into table
    htmlTableString +=
      "<tr><td>Question " +
      (i + 1) +
      "</td><td>" +
      json.questions[i].questionText +
      "</td><td class = 'correctAnswer'>" +
      json.questions[i].choices[correctAnswerAsIndex] +
      "</td><td class ='yourAnswer'></td><td class = 'score'></td><td class = 'checkX'></td>" +
      "</tr>";

    //for radio buttons within question
    for (let j = 0; j < json.questions[i].choices.length; j++) {
      //checks if currect radio button is the correct answer
      if (j == json.questions[i].answer) {
        correctAnswers = "correct";
      } else {
        correctAnswers = "";
      }
      htmlString +=
        "<div class='inputLabelContainer'><input type = 'radio' name = 'Q" + //radio button input
        (i + 1) + //name for radio buttons all the same for each question
        "' id = '" +
        (i + 1) + //each id different for radio buttons for label tag to refer to
        letters[j] +
        "' class = '" +
        correctAnswers +
        "'>" +
        "<label for = '" +
        (i + 1) +
        letters[j] +
        "'>" +
        json.questions[i].choices[j] +
        "</div></label>";

      let previousButton = "<button class = 'previous'><-Previous</button>";
      let nextButton = "<button class='next'>Next -></button>";
      if (
        j == json.questions[i].choices.length - 1 &&
        i != 0 &&
        i != json.questions.length - 1
      ) {
        htmlString += "<div>" + previousButton + nextButton + "</div>";
      } else if (j == json.questions[i].choices.length - 1 && i == 0) {
        htmlString += "<div>" + nextButton + "</div>";
      } else if (
        j == json.questions[i].choices.length - 1 &&
        i == json.questions.length - 1
      ) {
        htmlString += "<div>" + previousButton + "</div>";
      }
    }

    htmlString += "</div></div>";
  }

  htmlTableString += "</table>";
  //putting table html on page
  let tableArea = document.querySelector("#results");
  tableArea.innerHTML = htmlTableString;

  //putting questions html on page
  let questionsArea = document.querySelector("#questionsArea");
  questionsArea.innerHTML = htmlString;
  declarePrevNextButtons();
}

//loops through each question to check if question has been answered
//if they have, then it displays a table with all correct/incorrect answers and a score
function showResults() {
  let questions = document.querySelectorAll(".question");
  let yourAnswer = document.querySelectorAll(".yourAnswer");
  let answered = 0;
  let correctAnswers = 0;
  // let percentGrade = Math.round((correctAnswers / questions.length) * 100);
  let scoreArea = document.querySelector("#score");
  let resultsTable = document.querySelector("#results");

  //to loop through questions on page
  for (let i = 0; i < questions.length; i++) {
    let radioButtons = questions[i].querySelectorAll("input");
    //to loop through radio buttons on questions
    for (let j = 0; j < radioButtons.length; j++) {
      //tests for answered questions
      if (radioButtons[j].checked == true) {
        answered++;
        //add answered question text to table on page

        let labels = questions[i].querySelectorAll("label");
        //setting your answer field in table to inner html of corresponding label
        yourAnswer[i].innerHTML = labels[j].innerHTML;
      }
      //tests for correct answers
      if (
        radioButtons[j].checked == true &&
        radioButtons[j].classList.contains("correct")
      ) {
        //to give us a score
        correctAnswers++;
      }

      applyPassFailStylesTable(i, yourAnswer);
    }
  }

  //checks if all questions have been answered
  if (answered != questions.length) {
    alert("All questions must be answered to submit");
  }

  //adds score to page
  else {
    let percentGrade = Math.round((correctAnswers / questions.length) * 100);
    //apply red/green font styling appropriately
    //applyPassFailStylesScore(percentGrade, scoreArea);

    //calculate & put score in html
    displayScore(correctAnswers, questions, percentGrade);

    //shows score & table
    scoreArea.classList.remove("hidden");
    resultsTable.classList.remove("hidden");

    //message if user gets 100% on the quiz
    if (percentGrade == 100) {
      alert("Good job, 100%!");
    }
  }
}
function declarePrevNextButtons() {
  let btnNext = document.querySelectorAll(".next");
  let btnPrev = document.querySelectorAll(".previous");

  for (let i = 0; i < btnNext.length; i++) {
    if (btnNext[i] != null) {
      btnNext[i].addEventListener("click", navigateQuestions);
    }
    if (btnPrev[i] != null) {
      btnPrev[i].addEventListener("click", navigateQuestions);
    }
  }
}

//decides which tab content to show depending on which button was clicked
function navigateQuestions(evt) {
  let questions = document.querySelectorAll(".question");

  for (let i = 0; i < questions.length; i++) {
    let currentTabContent = document.querySelector("#tabContent" + (i + 1));
    let nextTabContent = document.querySelector("#tabContent" + (i + 2));
    let tabs = document.querySelectorAll(".tab");
    let btnNext = document.querySelectorAll(".next");
    let btnPrev = document.querySelectorAll(".previous");

    if (evt.target == btnNext[i]) {
      currentTabContent.classList.add("hidden");
      nextTabContent.classList.remove("hidden");
      tabs[i].classList.remove("active");
      tabs[i + 1].classList.add("active");
    } else if (
      evt.target == btnPrev[i] &&
      !nextTabContent.classList.contains("hidden")
    ) {
      nextTabContent.classList.add("hidden");
      currentTabContent.classList.remove("hidden");
      tabs[i + 1].classList.remove("active");
      tabs[i].classList.add("active");
    }
  }
}

//applys pass/fail styles to the table, including adding x or checkmark
function applyPassFailStylesTable(i, yourAnswer) {
  let scoreValue = document.querySelectorAll(".score");
  let rows = document.querySelectorAll("tr:not(:first-child)");
  let correctAnswer = document.querySelectorAll(".correctAnswer");
  let emojiCell = rows[i].querySelector(".checkX");

  scoreValue[i].innerHTML = "";

  //if your answer is correct at this index of the table
  if (correctAnswer[i].innerHTML == yourAnswer[i].innerHTML) {
    scoreValue[i].innerHTML = "1";
    if (rows[i].classList.contains("red")) {
      rows[i].classList.remove("red");
    }
    rows[i].classList.add("green");
    emojiCell.innerHTML = "&#9989;";
  }
  //if your answer is incorrect at this index of the table
  else {
    if (rows[i].classList.contains("green")) {
      rows[i].classList.remove("green");
    }
    rows[i].classList.add("red");
    scoreValue[i].innerHTML = "0";
    emojiCell.innerHTML = "&#10060;";
  }
}

//formats score & puts it into html tag
function displayScore(correctAnswers, questions, percentGrade) {
  let scoreArea = document.querySelector("#score");

  let scoreString =
    "You Scored: " +
    correctAnswers +
    " / " +
    questions.length +
    " (" +
    percentGrade +
    "%)";

  scoreArea.innerHTML = scoreString;
}

//clears all quiz results
function clearResults() {
  //quiz score
  let score = document.querySelector("#score");
  score.innerHTML = "";
  score.classList.add("hidden");

  //table
  let resultsTable = document.querySelector("#results");
  resultsTable.innerHTML = "";
  resultsTable.classList.add("hidden");
}
