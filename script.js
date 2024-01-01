const pages=[];
const prevBtn = document.querySelector("#btn-prev");
const nextBtn = document.querySelector("#btn-nxt");
const nextBtnOpen = document.querySelector("#btn-nxt-open");
const book = document.querySelector("#Book");
let currentLocation = 1;
let numOfPapers = 0;
let maxLocation = 0;
// Button & Book Movement 
prevBtn.addEventListener("click", goPrevPage);
nextBtn.addEventListener("click", goNextPage);
nextBtnOpen.addEventListener("click", function() {
  goNextPage();
});
// Define the fillContent function outside the getBookpages function
function fillContent(clonedTemplate, item) {
  const contentTemplate = item.Template;
	const section = item.Section || '';
  const lessonTitle = item.LessonTitle || '';
  const unitImage = item.UnitImage && item.UnitImage[0].url || '';
  const text = item.Text1 || '';
  const pageNumber = item.PageNum || '';
  const coverImage = item.Image1[0].url || '';
  const List1 = item.ListItems || '';
  const text2 = item.Text2 || '';
  const tip1 = item.Tip2 || '';
  const recID = item.recIDquiz || '';
  //COVER TEMPLATE
  if (contentTemplate === 'Cover') {
    if (coverImage) {
      clonedTemplate.querySelector('#Cover-image').src = coverImage;
    } else {
      console.log("No image Found in UnitImage: ", coverImage);
    }
    clonedTemplate.style.flexDirection = 'column';
  } //Start of Unit Template template-Sunit-opener
  else if (contentTemplate === 'template-Sunit-opener') {
    clonedTemplate.querySelector('#unit-title').textContent = section;
    clonedTemplate.querySelector('#sec-title').textContent = lessonTitle;
    if (unitImage) {
      clonedTemplate.querySelector('.unit-title').style.backgroundImage = `url(${unitImage})`;
    }
    clonedTemplate.querySelector('.page-content').innerHTML = formatText(text);
    clonedTemplate.querySelector('#pageNum').textContent = pageNumber;
  }  // start of unit with text list text 
  else if (contentTemplate === 'text-list-text-uTitle') {
    clonedTemplate.querySelector('#unit-title').textContent = section;
    clonedTemplate.querySelector('#sec-title').textContent = lessonTitle;
    //clonedTemplate.querySelector('#').textContent = list1
    if (unitImage) {
      clonedTemplate.querySelector('.unit-title').style.backgroundImage = `url(${unitImage})`;
    }
    clonedTemplate.querySelector('#Text-Content1').innerHTML = formatText(text);
    clonedTemplate.querySelector('#pageNum').textContent = pageNumber;
    clonedTemplate.querySelector('#Text-Content2').textContent = text2;
    // List array
    const contentList = List1.split(/\d+\. /).filter(item => item.trim() !== '');
    contentList.forEach((contentListText) => {
    	const parts = contentListText.split(' - ');
    		if (parts.length === 2) {
      		contentListText = `<strong>${parts[0]}</strong> - ${parts[1]}`;
        }
    	const liElement = document.createElement("li");
      liElement.classList.add("Litem");
      liElement.innerHTML = contentListText;
      const olElement = clonedTemplate.querySelector('#content-list').appendChild(liElement);
    });    
  } // quiz-template
  else if (contentTemplate === 'template-quiz') {
    clonedTemplate.querySelector('#unit-title').textContent = section;
    clonedTemplate.querySelector('#sec-title').textContent = lessonTitle;
    if (unitImage) {
      clonedTemplate.querySelector('.unit-title').style.backgroundImage = `url(${unitImage})`;
    }
    //clonedTemplate.querySelector('.page-content').innerHTML = formatText(text);
    clonedTemplate.querySelector('#pageNum').textContent = pageNumber;
    getQuiz(recID,clonedTemplate);    
  }
}
window.addEventListener("DOMContentLoaded", () => {
  const table = 'Book-pages';
  const bookName = 'Referral Training Program';
  const url = `
https://dev--skilled-craftsmen--ozarkoc.autocode.dev/AirtableGetData/?table=${table}&bookName=${encodeURIComponent(bookName)}`;
  getBookpages(url);
});
async function getBookpages(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    // check the number of total pages
    const numItems = Math.ceil(data.length / 2);
    // Update the numOfPapers variable
		numOfPapers = numItems;
    maxLocation = numOfPapers+1;
    // Clone and create pages
    for (let i = 0; i < numItems; i++) {
      const newPage = document.createElement('div');
      newPage.classList.add('page');
      const ID = i + 1;
      newPage.id = `p${ID}`;
      newPage.style.display = "block";
      const zIndex = numItems - i;
      newPage.style.zIndex = zIndex;
      document.getElementById('Book').appendChild(newPage);
      const frontDiv = document.createElement('div');
      frontDiv.classList.add('front');
      document.getElementById(`${newPage.id}`).appendChild(frontDiv);
      let btnType;
      if (newPage.id === 'p1') {
        btnType = document.querySelector('#btn-nxt-open').cloneNode(true);
        frontDiv.appendChild(btnType);
      } else {
        btnType = document.querySelector('#btn-nxt').cloneNode(true);
        frontDiv.appendChild(btnType);
      }
    	pages.push(newPage);
    }
    data.forEach((item) => {
      const pageID = ("p" + item.PageID);
      let backDiv;
      const contentTemplate = item.Template;
      const clonedTemplate = document.querySelector(`#${contentTemplate}`).cloneNode(true);
      if (item.PageNum % 2 === 1) {
        frontDiv = document.querySelector(`#${pageID} .front`);
        fillContent(clonedTemplate, item);
        clonedTemplate.style.display = "flex";
        frontDiv.appendChild(clonedTemplate);
      } else {
        backDiv = document.createElement('div');
        document.getElementById(`${pageID}`).appendChild(backDiv);
        backDiv.classList.add('back');
        backDiv = document.querySelector(`#${pageID} .back`);
        clonedTemplate.style.display = "flex";
        fillContent(clonedTemplate, item);
        backDiv.appendChild(clonedTemplate);
        const contentDiv = backDiv.querySelector(`#${contentTemplate}`);
        contentDiv.classList.remove('content'); // WORKING HERE! ... trying not to have to duplicate back-content
       	contentDiv.classList.add('back-content');
        contentDiv.querySelector("#Unit-Header-div").classList.add("backside");
        contentDiv.querySelector("#NoPage").classList.remove("pagenum-front");
        contentDiv.querySelector("#NoPage").classList.add("pagenum-back");
      }
    });
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}
function openBook() {
		//console.log("Opening Book");
    book.style.transform = "translateX(50%)";
    prevBtn.style.display = "block";
  	nextBtn.style.display = "block";
    prevBtn.style.transform = "translateX(-975%)";
    //nextBtn.style.transform = "translateX(180px)";
    nextBtnOpen.style.display = "none";
}
function closeBook(isAtBeginning) {
		if(isAtBeginning) {
        book.style.transform = "translateX(0%)";
        nextBtnOpen.style.display = "block";
        prevBtn.style.display = "none";
  			nextBtn.style.display = "none";
    } else {
        book.style.transform = "translateX(100%)";
        prevBtn.style.display = "block";
  			nextBtn.style.display = "none";
    }
}
//go next pg
function goNextPage() {
  if (currentLocation <= maxLocation) 
  {
    if (currentLocation === 1) 
    {
      openBook();
    } else if (currentLocation === maxLocation-1){
    	closeBook();
    }
  pages[currentLocation - 1].classList.add("flipped");
	pages[currentLocation - 1].style.zIndex = currentLocation;
  currentLocation++;
  }
}
// Function to navigate to the previous page
function goPrevPage() {
  if (currentLocation > 1) {
    if (currentLocation === 2) {
      closeBook(true);
    } else if (currentLocation === maxLocation){
    	openBook();
    }
    pages[currentLocation - 2].classList.remove("flipped");
    pages[currentLocation - 2].style.zIndex = (maxLocation-currentLocation)+ 1;

    currentLocation--;
  }
}
function formatText(text) {
  // ** ** - BOLD
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Replace [text](link) with <a href="link">text</a>
  text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
  // New Lines
  text = text.replace(/\n/g, '<br>')
  return text;
}
function getQuiz(recID, clonedtemp) {
  fetch(`https://dev--skilled-craftsmen--ozarkoc.autocode.dev/quiz/?&recID=${encodeURIComponent(recID)}`)
    .then((response) => response.json())
    .then((data) => {
      let ansA, ansB, ansC, ansD, ansE, correct, type;
      clonedtemp.querySelector("#total-num").textContent = data.length; // Total Number
      for (let i = 0; i < data.length; i++) {
        const currentData = data[i];
        const question = currentData.Question;
        ansA = currentData.A; ansB = currentData.B; ansC = currentData.C; ansD = currentData.D; ansE = currentData.E; correct = currentData.correctAnswers;
        type = currentData.Type;
				const Qcontent = clonedtemp.querySelector("#quiz-content");
        const Q = Qcontent.querySelector(`#${type}`).cloneNode(true);
        Q.id = "q" + i;
        Q.style.display = "block";
        console.log(ansA);
        Q.querySelector(".question-text").textContent = question;
        Q.querySelector(".question-text-num").textContent = i + 1;
        Q.querySelector(`.${type}A`).textContent = ansA;
        Q.querySelector(`.${type}B`).textContent = ansB;
        Q.querySelector(`.${type}C`).textContent = ansC;
        if (ansD !== null) {
          Q.querySelector(`.${type}D`).textContent = ansD;
        } else {Q.querySelector(`.${type}D`).style.display = "none";}
        if (ansE !== null) {
          Q.querySelector(`.${type}E`).textContent = ansE;
        }else {Q.querySelector(`.${type}E`).style.display = "none";}
        const QAnsdiv=Q.querySelector(".c-answer");
       // QAnsdiv.style.display = "none";
       // QAnsdiv.textContent = correct;
       // Qcontent.appendChild(Q);
        
      }
    });
}
