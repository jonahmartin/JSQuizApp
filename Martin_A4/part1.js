window.onload = function () {
  getData();
};

//ajax call
function getData() {
  let url = "GeographyQuiz.json";
  let xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        let response = xhr.responseText;
        let json = JSON.parse(response);
        //builds quiz based on json file
        buildQuiz(json);
        //sends parsed json to buttons so that button functions can use it
        delcareButtons();
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

//declares & adds event listeners to buttons
function delcareButtons() {
  //for loading new quiz
  let btnNewQuiz = document.querySelector("#btnNewQuiz");
  btnNewQuiz.addEventListener("click", getNewData);
  //for generating new answers
  let btnGenerateAnswers = document.querySelector("#btnGenerateAnswers");
  btnGenerateAnswers.addEventListener("click", generateAnswers);
}

//fetches new json file based on dropdown selection in html
function getNewData() {
  let dropdown = document.querySelector("select");
  let options = dropdown.querySelectorAll("option");
  let selectedIndex = dropdown.selectedIndex;
  let url = "GeographyQuiz.json";
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
        //builds quiz based on json file
        buildQuiz(json);
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

function generateAnswers() {
  let questions = document.querySelectorAll(".question");
  //console.log("working");

  //loops through each question on page
  //generates a random number between 0 & the number of radio buttons
  //uses that random number to index a radio button to changed checked property of
  for (let i = 0; i < questions.length; i++) {
    let options = questions[i].querySelectorAll("input");
    //math.floor rounds the decimal number down to closest integer
    //math.random generates a number between 0 and 1, must multiply by the number of options to get an integer
    let randomNumber = Math.floor(Math.random() * options.length);
    options[randomNumber].checked = true;
  }
}

//builds quiz based on json file
function buildQuiz(json) {
  let titleArea = document.querySelector("h1");
  let titleText = json.title;
  let questionsArea = document.querySelector("#questionsArea");
  titleArea.innerHTML = "&#128221;" + titleText;

  //to identify each multiple choice answer
  //allows up to 10 options. More of the alphabet can be added if needed
  let letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

  let htmlString = "";
  for (let i = 0; i < json.questions.length; i++) {
    htmlString += //question number
      "<div class='question'><h2>Question " +
      (i + 1) +
      "</h2>" +
      "<p>" + //question text
      json.questions[i].questionText +
      "</p>";

    for (let j = 0; j < json.questions[i].choices.length; j++) {
      htmlString +=
        "<div class='inputLabelContainer'><input type = 'radio' name = 'Q" + //radio button input
        (i + 1) + //name for radio buttons all the same for each question
        "' id = '" +
        (i + 1) + //each id different for radio buttons for label tag to refer to
        letters[j] +
        "'>" +
        "<label for = '" +
        (i + 1) +
        letters[j] +
        "'>" +
        json.questions[i].choices[j] +
        "</div></label>";
    }

    htmlString += "</div>";
  }

  questionsArea.innerHTML = htmlString;
}
