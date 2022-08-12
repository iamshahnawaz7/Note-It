import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.1/firebase-app.js";
import { getAuth, getAdditionalUserInfo, signInWithPopup, GoogleAuthProvider, onAuthStateChanged,signOut   } from "https://www.gstatic.com/firebasejs/9.9.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.9.1/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyClMkr4HSsI66gAdbh9AIkAK84bFsPNDzU",
    authDomain: "note-it-bef86.firebaseapp.com",
    projectId: "note-it-bef86",
    storageBucket: "note-it-bef86.appspot.com",
    messagingSenderId: "135677917693",
    appId: "1:135677917693:web:509cac60fa524deacf0194"
};



const provider = new GoogleAuthProvider();
let user = null;
let docId = null;
let completed = [];
let todo = [];

const todoInput = document.querySelector('.todo-input');
const todoButton = document.querySelector('.todo-button');
const todoList = document.querySelector('.todo-list');
const filterOption = document.querySelector('.filter-todo');
const loginButton = document.querySelector('.login-button');
const todoOwner = document.querySelector('#todo-owner');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


 //EVENT LISTENERS
 todoButton.addEventListener('click', addTodo);
 todoList.addEventListener('click', deleteCheck);
 filterOption.addEventListener('change',filterTodo);
 loginButton.addEventListener('click',handleUser);

async function createDocument(uid){
    await setDoc(doc(db, 'TodoLists', `${uid}`), {
        completed : [],
        todo : []
    });
}

function fetchDocuments(){
    if(docId!==null){
        const unsub = onSnapshot(doc(db, "TodoLists", `${docId}`), (doc) => {
            const data = doc.data();
            completed = data.completed;
            todo = data.todo;
            todoList.innerHTML = "";
            addTodos(completed,"completed");
            addTodos(todo,"todo");
        });
    }
}

async function updateDocument(){
    if(docId!=null){
        await setDoc(doc(db, 'TodoLists', `${docId}`), {
            completed : completed,
            todo : todo
        });
    }
}

async function handleUser() {
    if(!user){
        signInWithPopup(auth, provider)
        .then( async (result) => {

            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const authUser = result.user;
            const isNewUser = await getAdditionalUserInfo(result).isNewUser;
            if(isNewUser){
                createDocument(authUser.uid);
            }

            docId = authUser.uid;

            // ...
        }).catch((error) => {

            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(error)
        });
    }

    else {
        signOut(auth).then(() => {
            // Sign-out successful.
          }).catch((error) => {
            // An error happened.
          });
    }
    
}

onAuthStateChanged(auth, (authUser)=>{
    if(authUser){
        const uid = authUser.uid;
        console.log(authUser)
        user = authUser;
        docId = uid;
        loginButton.innerHTML = "Logout";
        todoOwner.innerHTML = `${user.displayName.split(" ")[0]}'s List`
        fetchDocuments();
    }
    else {
        user = null;
        docId = null;
        loginButton.innerHTML = "Login";
        todoList.innerHTML = "";
        todoOwner.innerHTML = "Your List";
    }
})


 //FUNCTIONS

 function addTodos(arr, classname){
    arr.forEach((value,index)=>{
        const todoDiv = document.createElement("div");
        todoDiv.classList.add(classname);
        todoDiv.setAttribute("id",`t-${index}`);

    //Create LI
        const newTodo= document.createElement("li");
        newTodo.innerText= value;
        newTodo.classList.add("todo-item");
        //console.log(newTodo);
        todoDiv.appendChild(newTodo);

        //CHECK MARK BUTTON
        const completedButton = document.createElement("button");
        completedButton.innerHTML= '<i class="fas fa-check"></i>';
        completedButton.classList.add("complete-btn");
        todoDiv.appendChild(completedButton);

        //CHECK TRASH BUTTON
        const trashButton = document.createElement("button");
        trashButton.innerHTML= '<i class="fas fa-trash"></i>';
        trashButton.classList.add("trash-btn");
        todoDiv.appendChild(trashButton);

    //APPEND TO LIST
        todoList.appendChild(todoDiv);
        })
 }

function addTodo(event){
    //Prevent form from submitting
    event.preventDefault();
    todo.push(`${todoInput.value}`);
    updateDocument();
}

function deleteCheck(e){
    const item = e.target;
    const todoItem = item.parentElement;
    const className = todoItem.classList[0];
    const text = todoItem.firstChild.textContent;
     //DELETE TODO
    if(item.classList[0] === "trash-btn"){
    

 
    //ANIMATION

    todoItem.classList.add("fall");
    todoItem.addEventListener('transitionend',function(){
        if(className==="todo"){
            const removeAt = todo.indexOf(text);
            todo = [...todo.slice(0, removeAt), ...todo.slice(removeAt + 1)];
        }
        else {
            const removeAt = completed.indexOf(text);
            completed = [...completed.slice(0, removeAt), ...completed.slice(removeAt + 1)];
        }
        todoItem.remove();
    });

    // todo.remove();

    }

    //CHECK MARK
    if(item.classList[0]=== "complete-btn"){
        // const todo = item.parentElement;
        todoItem.classList.toggle("completed");
        if(className==="todo"){
            const removeAt = todo.indexOf(text);
            todo = [...todo.slice(0, removeAt), ...todo.slice(removeAt + 1)];
            completed.push(text);
        }
        else {
            const removeAt = completed.indexOf(text);
            completed = [...completed.slice(0, removeAt), ...completed.slice(removeAt + 1)];
            todo.push(text);
        }
    }
    updateDocument();
}

function filterTodo(e){
    const todos = todoList.childNodes;
    // console.log(e.target.value);
    todos.forEach(function(todo){
        // console.log(todo);
        switch(e.target.value){
        case "all":
        todo.style.display ="flex";
          break;
        case "completed":
            if(todo.classList.contains("completed")){
                todo.style.display ="flex";
            }else{
                todo.style.display="none";
            }
            break;
        case "incomplete":
            if(todo.classList.contains("completed")){
                todo.style.display ="none";
            }else{
                todo.style.display="flex";
            }
    }
});
}