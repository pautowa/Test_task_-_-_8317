let body = document.body;
let table = document.createElement('table');/*Создание элемента страницы с тегом 'table'
                                            для отображения на страницы таблицы с данными*/
let formDiv = document.createElement('div');/*Создание элемента страницы с тегом 'div'
                                            для размещения на экране формы дл редактирования*/
formDiv.classList.add('modal');

let numCell = 0;

/*
    Метод для получения данных с сервера (в качестве сервера использовался web-сервер nginx).
    После получения данных происходит создание заголовка и тела таблицы с заполнением этими данными.
    Затем создается форма для редактирования.
*/
function readData(path){
    let request = new XMLHttpRequest();
    request.onreadystatechange = ()=>{
        if(request.readyState === 4 && request.status === 200){
            let data = JSON.parse(request.responseText);
            createThead();            
            createTbody(data);
            createForm();
        }
    }
    request.open('GET',path,true);
    request.send();
}

/*
    Создание заголовка таблицы с 4мя столбцами.
    Каждый столбец имеет возможность сортировки по алфавиту и в обратном порядке,
    для этого создаются выпадающие списки, к которым добавляются слушатели:
    при выборе одного из значений происходит сортировка всей таблицы по выбранному столбцу. 
*/
function createThead(){
    const thead = {0:'Имя', 1:'Фамилия', 2:'Описание', 3:'Цвет глаз'};
    let tr = table.insertRow();
    for(let key in thead){
        let th = document.createElement('th');

        let p = document.createElement('p');
        p.textContent = thead[key];
        th.appendChild(p);

        let select = document.createElement('select');
        select.id = key;

        let opt0 = document.createElement('option');
        opt0.value = "default";
        opt0.textContent = "Сортировать";
        select.appendChild(opt0);

        let opt1 = document.createElement('option');
        opt1.value = "alphabet";
        opt1.textContent = "A-Z";
        select.appendChild(opt1);

        let opt2 = document.createElement('option');
        opt2.value = "not alphabet";
        opt2.textContent = "Z-A";
        select.appendChild(opt2);

        select.addEventListener('change', ()=>{sorting(key);});

        th.appendChild(select);
        tr.appendChild(th);
    }

    table.tBodies[0].appendChild(tr);
}

/*
    Создание тела таблицы с 4мя столбцами.
    К каждой строке добавлем слушатель:
    при клике на одну из строк справа от таблицы появляется модальное окно для редактирования данных выбранной строки. 
*/
function createTbody(data){
    const numRow = data.length;

    let createTd = (nameClass, text)=>{
        let td = document.createElement('td');
        td.classList.add(nameClass);
        td.appendChild(document.createTextNode(text));
        return td
    }
    
    if(data.length > 0){
        for(let i=0; i<numRow; i++){
            let tr = table.insertRow();
            const {id,phone, ...obj} = data[i]; //удаление значений с ключами id и phone из объекта для таблицы
            for(let key in obj){
                if(typeof obj[key] === 'object'){
                    for(let k in obj[key]){
                        tr.appendChild(createTd(k,(obj[key][k])));
                    }
                }
                else{
                    tr.appendChild(createTd(key, obj[key]));
                }
                
            }
            tr.addEventListener('click', ()=>{
                formDiv.style.display='block';
                let inputs = document.querySelectorAll('input');
                for(let i=0; i<4; i++){
                    inputs[i].value = tr.cells[i].textContent;
                }
                tr.style.backgroundColor = '#888';
                let buttons = document.querySelectorAll('button');
                buttons[0].addEventListener('click',()=>{tr.style.backgroundColor = 'white';});
                buttons[1].addEventListener('click',()=>{tr.style.backgroundColor = 'white';});
            });
            table.tBodies[0].append(tr);
        }
    }
}

/*
    Создание модального окна для редактирования строки. 
*/
function createForm(){
    let modalDiv = document.createElement('div');
    modalDiv.classList.add('modal-content');
    modalDiv.textContent = 'Редактировать';
    for(let i=0; i<4; i++){
        let input = document.createElement('input');
        input.id = "in_"+i;
        modalDiv.appendChild(input);
    }
    let button1 = document.createElement('button');
    button1.textContent = "Принять";
    button1.classList.add('enter');
    button1.addEventListener('click',()=>{formDiv.style.display='none'});

    let button2 = document.createElement('button');
    button2.textContent = "Отмена";
    button2.classList.add('cancel');
    button2.addEventListener('click',()=>{formDiv.style.display='none'});

    modalDiv.appendChild(button1);
    modalDiv.appendChild(button2);

    formDiv.appendChild(modalDiv);
}

/*
    Сортировка таблицы по соответсвующему столбцу.
*/
function sorting(id){
    console.log("sorting");
    if(id){
        numCell = String(id);
        let value = document.getElementById(id).value;
        let sortedRows = Array.from(table.rows).slice(1);
  
        switch (value) {
            case "alphabet":
                sortedRows.sort(cmpDirect);
                break;
            case "not alphabet":
                sortedRows.sort(cmpReverse);
                break;
            default:
                break;
        }

        table.tBodies[0].append(...sortedRows);
    }
}

/*
    Компараторы для сортировки в алфавитном порядке и в обратном порядке.
*/
function cmpDirect(prev,next){
    return prev.cells[numCell].innerHTML > next.cells[numCell].innerHTML ? 1 : -1
}
function cmpReverse(prev,next){
    return prev.cells[numCell].innerHTML > next.cells[numCell].innerHTML ? -1 : 1
}

readData("./data.json");
body.append(table);
body.append(formDiv);