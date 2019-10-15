(function() {
    const BASE_URL = 'https://movie-list.alphacamp.io'
    const INDEX_URL = BASE_URL + '/api/v1/movies/'
    const POSTER_URL = BASE_URL + '/posters/'
    const data = []

    const dataPanel = document.getElementById('data-panel')
    const searchForm = document.getElementById('search')
    const searchInput = document.getElementById('search-input')

    const pagination = document.getElementById('pagination')
    const ITEM_PER_PAGE = 12

    const listPanel = document.getElementById('list-panel')
    let paginationData = []

    btnPanel = document.getElementById('btn-panel')

    const btnListData = {
        "1": "Action",
        "2": "Adventure",
        "3": "Animation",
        "4": "Comedy",
        "5": "Crime",
        "6": "Documentary",
        "7": "Drama",
        "8": "Family",
        "9": "Fantasy",
        "10": "History",
        "11": "Horror",
        "12": "Music",
        "13": "Mystery",
        "14": "Romance",
        "15": "Science Fiction",
        "16": "TV Movie",
        "17": "Thriller",
        "18": "War",
        "19": "Western"
    }


    let onPage = 1 //起始預設頁面為1
    let onType = "card" //起始排列樣式頁面為 card
    let onResult //專門讀取localStorage內results結果

    axios.get(INDEX_URL).then((response) => {

        // 預設起始網頁所有讀取Data與產生Html
        data.push(...response.data.results);
        //將所有結果results記錄在localStorage內
        localStorage.setItem('results', JSON.stringify(data));
        onResult = JSON.parse(localStorage.getItem("results"));
        //預設排列樣式並記錄在localStorage內
        localStorage.setItem('type', "card");
        //預設當前頁數並記錄在localStorage內
        localStorage.setItem('page', 1);


        // Movie List與頁數 產生
        showMoviePage(onPage, onResult, onType);
        // Movie 左方分類按鈕 產生
        btnPanel.innerHTML = displayBtnList(btnListData);

    }).catch((err) => console.log(err))


    //上方電影搜尋-按鈕監聽動作
    searchForm.addEventListener('submit', event => {
        event.preventDefault()
        onResult = searchData(data);
        localStorage.setItem('page', 1);
        onPage = 1;
        showMoviePage(onPage, onResult, onType);
    })


    //左方電影分類-按鈕監聽動作
    btnPanel.addEventListener('click', (event) => {
        if (event.target.matches('.btn-genres')) {
            onResult = searchGenres(data, event.target.dataset.id);
            localStorage.setItem('page', 1);
            onPage = 1;
            showMoviePage(onPage, onResult, onType);
        }
    })

    //內容電影類別-按鈕監聽動作
    dataPanel.addEventListener('click', (event) => {

        //按下電影圖片
        if (event.target.matches('.btn-show-movie')) {
            showMovie(event.target.dataset.id);

            //按下電影下方分類名稱
        } else if (event.target.matches('.btn-genres')) {
            onResult = searchGenres(data, event.target.dataset.id);
            localStorage.setItem('page', 1);
            onPage = 1;
            showMoviePage(onPage, onResult, onType);
        }
    })

    // 右上方list排列樣式切換
    listPanel.addEventListener('click', (event) => {

        if (event.target.matches('.fa-th')) {
            //因按下了＂Card＂按鈕， localStorage內的type設定為Card顯示
            localStorage.setItem('type', "card");
            onType = "card";

        } else if (event.target.matches('.fa-bars')) {
            //因按下了＂Table＂按鈕， localStorage內的type設定為Table顯示
            localStorage.setItem('type', "table");
            onType = "table";
        }

        showMoviePage(onPage, onResult, onType);

    })


    //重新讀取結果資料並取顯示電影清單與頁數
    function showMoviePage(page, result, type) {
        getPageData(page, result, type);
        pagination.innerHTML = getTotalPages(onResult);

        //將網頁視窗位置導向TOP，讓使用者得知目前已經重新讀取資料
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    }

    //HTML產生：左方分類按鈕列表
    function displayBtnList(data) {
        let html = ` <div class=" d-flex align-content-start flex-wrap">`
        for (value in btnListData) {
            html += `   <button type="button" class="btn btn-light btn-custom btn-genres" data-id="${value}">${btnListData[value]}</button>   `
        }
        html += `    </div>`
        return html;
    }

    //分類結果回傳：將分類屬性比對後產生出符合分類屬性之電影
    function searchGenres(data, clickGenres) {
        let results = []
        results = data.filter(val => val.genres.includes(parseInt(clickGenres)));
        localStorage.setItem('results', JSON.stringify(results)) //將搜尋結果存在storage
        return results;
    }


    //分類結果回傳：將名稱比對後產生出符合名稱之電影
    function searchData(data) {
        let results = []
        const regex = new RegExp(searchInput.value, 'i')

        results = data.filter(movie => movie.title.match(regex))
        localStorage.setItem('results', JSON.stringify(results)) //將搜尋結果存在storage

        return results;
    }


    //HTML產生：電影圖文清單(卡片式排列)
    function displayDataList(data) {
        let html = ' <div class="card-columns">'
        data.forEach(function(item, index) {
            html += `
                      <div class="card">
                            <img class="card-img-top btn-show-movie" src="${POSTER_URL}${item.image}" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}" alt="Card image cap">

                            <div class="card-body">
                              <h5 class="card-title">${item.title}</h5>
                            </div>

                            <div class="card-footer">      `
            for (value in item.genres) {
                let genres = btnListData[item.genres[value]];
                html += `       <button type="button" class="btn btn-secondary btn-sm mt-1 mb-1 btn-genres" data-id="${item.genres[value]}">${genres}</button>`
            }
            html += `       </div>
                       </div>`

        })

        html += ` </div>`
        return html;
    }
    //HTML產生：電影圖文清單(表格式排列)
    function displayTableList(data) {
        let html = `<table class="table table-hover">
                    <thead>
                      <tr>
                        <th scope="col-1">No.</th>
                        <th scope="col-4">Movie Name</th>
                        <th scope="col-6"></th>
                        <th scope="col-1">-</th>
                      </tr>
                    </thead>
                   <tbody> `
        data.forEach(function(item, index) {
            html += `

             <tr>
                <th scope="row">${item.id}</th>
                <td>${item.title}</td>
                <td>`

            for (value in item.genres) {
                let genres = btnListData[item.genres[value]];
                html += `  <button type="button" class="btn btn-secondary btn-sm mt-1 mb-1 btn-genres" data-id="${item.genres[value]}">${genres}</button>`
            }
 
            html += ` </td>
                <td><button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button></td>      
            </tr>
           
          `
        })
        html += `  </tbody>
          </table>`
        return html;
    }

    //顯示電影詳細介紹內容
    function showMovie(id) {
        // get elements
        const modalTitle = document.getElementById('show-movie-title')
        const modalImage = document.getElementById('show-movie-image')
        const modalDate = document.getElementById('show-movie-date')
        const modalDescription = document.getElementById('show-movie-description')

        // set request url
        const url = INDEX_URL + id

        // send request to show api
        axios.get(url).then(response => {
            const data = response.data.results

            // insert data into modal ui
            modalTitle.textContent = data.title
            modalImage.innerHTML = `<img src="${POSTER_URL}${data.image}" class="img-fluid" alt="Responsive image">`
            modalDate.textContent = `release at : ${data.release_date}`
            modalDescription.textContent = `${data.description}`
        })
    }

    //頁數事件監聽
    pagination.addEventListener('click', event => {

        if (event.target.tagName === 'A') {
            localStorage.setItem('page', event.target.dataset.page) //每次按下頁數，就把頁數存進localStorage的'page'中
            onPage = localStorage.getItem('page');
            onType = localStorage.getItem("type")
            onResult = JSON.parse(localStorage.getItem("results"));

            getPageData(onPage, onResult, onType)
        }
    })

    //依照傳入資料算出目標該頁需要的頁面內容，依照卡片模式或是表格模式，重新顯示資料
    function getPageData(pageNum, data, type) {
        paginationData = data || paginationData
        let offset = (pageNum - 1) * ITEM_PER_PAGE
        let pageData = paginationData.slice(offset, offset + ITEM_PER_PAGE)

        if (type === "card") {
            dataPanel.innerHTML = displayDataList(pageData);
        } else if (type === "table") {
            dataPanel.innerHTML = displayTableList(pageData);
        }
        //將網頁視窗位置導向TOP，讓使用者得知目前已經重新讀取資料
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    }

    //依照傳入資料計算頁數
    function getTotalPages(data) {
        let totalPages = Math.ceil(data.length / ITEM_PER_PAGE) || 1;
        let pagehtml = '';

        console.log(totalPages);

        for (let i = 0; i < totalPages; i++) {
            let page = i + 1;
            pagehtml += `
        <li class="page-item">
          <a class="page-link" href="javascript:;" data-page="${page}">${page}</a>
        </li>
      `
        }
        return pagehtml;
    }

})()