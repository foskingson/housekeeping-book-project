//이 코드는 Node.js와 Express를 기반으로 한 간단한 지출 기록 애플리케이션입니다. MySQL을 사용하여 데이터를 저장하고 EJS를 사용하여 동적으로 데이터를 화면에 표시하고 있습니다.

require('dotenv').config();
var express = require('express');
var app = express();
var path = require('path');
var mysql = require('mysql');
var session = require('express-session')

app.use(session({                       // 요청이 있으면 세션이 시작됨
    secret: process.env.SESSION_SECRET,    // 꼭 넣어야 하는 시크릿코드 (보안의 이유로 다른 파일로 만들어서 변수처리해야함)
    resave: false,                      // 세션 데이터가 바뀌기 전까지 세션저장소에 저장하지 않음
    saveUninitialized: true ,            // 세션이 필요하기전까지 세션을 구동시키지 않음
}))

const http = require('http');
const socketIO = require('socket.io');

const server = http.createServer(app);
const io = socketIO(server);

app.set('view engine', 'ejs'); // 뷰 엔진을 EJS로 설정
app.set('views', './views');

var db=mysql.createConnection({     
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

db.connect((err)=>{
    if(err){
        return
    }

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    let month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    month=parseInt(month)
    changeDate = `${year}${month}`;

    
    if(month==1){
        createTableForMonth(year-1,12);
    }
    else{
        createTableForMonth(year,month-1);
    }
    
    createTableForMonth(year,month);

    if(month==12){
        createTableForMonth(year+1,1);
    }
    else{
        createTableForMonth(year,month+1);
    }

});

app.use(express.static('public'));

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());




function createTableForMonth(year, month) {
    const targetMonth = `${year}${month}`;
  
    // 테이블을 만들기 위한 SQL 쿼리
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS table_${targetMonth} (
        id INT PRIMARY KEY,
        date DATE,
        cash INT DEFAULT 0,
        card INT DEFAULT 0
      )
    `;
    // 테이블을 만들기 위한 쿼리 실행
    db.query(createTableQuery, (err, results) => {
        if (err) {
            console.error(`${targetMonth}에 대한 테이블 생성 중 오류:`, err);
        } else {
            console.log(`${targetMonth} 테이블이 성공적으로 생성되었습니다`);
            // 대상 월의 각 날짜에 데이터 삽입
            insertDataForCurrentMonth(targetMonth,year,month);
        }
    });
}

function insertDataForCurrentMonth(tableName,year,month) {
   if(year==undefined){
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1
   }
   
    const lastDayOfMonth = new Date(year, month, 0).getDate();
  
    // 각 날짜에 대한 데이터를 삽입하는 SQL 쿼리
    let insertDataQuery = `
      INSERT INTO \`table_${tableName}\` (id, date, cash, card) VALUES 
    `;
  
    for (let day = 1; day <= lastDayOfMonth; day++) {
      const date = `${year}-${month}-${day.toString().padStart(2, '0')}`;
      insertDataQuery += `(${day},'${date}', 0, 0),`;
    }
    // 맨 뒤에 추가된 쉼표 제거
    insertDataQuery = insertDataQuery.slice(0, -1);
    // ON DUPLICATE KEY UPDATE 추가
    insertDataQuery += ` ON DUPLICATE KEY UPDATE id=VALUES(id), date=VALUES(date);`;

    // 데이터를 삽입하는 쿼리 실행
    db.query(insertDataQuery, (err, results) => {
        if (err) {
        console.error('데이터 삽입 중 오류 발생:', err);
        } else {
        console.log('데이터가 성공적으로 삽입되었습니다');
        }
    });
}
  


app.get('/create/:pageId',(request,response)=>{

    var id= request.params.pageId;
    
    var temp=`
        <form action="/create_process" method="post">
            <p><input type="text" name="card" placeholder="카드 지출"></p>
            <p><input type="text" name="cash" placeholder="현금 지출"></p>
            <input type="hidden" name="id" value='${id}'>
            <p><input type="submit"></p>
        </form>

    `
    

    response.send(temp)
    
    //path.join(경로, .. .): 여러 인자를 넣으면 하나의 경로로 합쳐준다.
})

app.post('/create_process',(request,response)=>{
    var post = request.body;

    var id = post.id;
    var cash = post.cash;
    var card = post.card;

    

    var parts = id.split("-");  // 입력받은 문자열을 "-"를 기준으로 나눔

    request.session.updateDate=parts[0]
    

    const dateString = request.session.updateDate;

    // Extracting year and month
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4);
    request.session.updateYear=year
    request.session.updateMonth=month
    request.session.updateYearMonth=`${year}${month}`
    request.session.check=1

    db.query(`UPDATE \`table_${parts[0]}\` SET cash=?, card=? WHERE id=?`,[cash,card,parts[1]] ,function(err,result){
        // 쿼리문안에 변수를 넣으려면 위에 방법처럼 ?를 사용하고 뒤에 인자로 배열을주고 배열값을 차례대로 주고싶은 변수를 넣는다
        if(err) {
            throw err
        }
        

        response.redirect(`/?updatedYear=${year}&updatedMonth=${month}`);
       
      })

    

    })



app.all('/',(request,response)=>{
    var changeYear=request.body.currentYear
    var changeMonth=request.body.currentMonth+1
    var changeDate;
    
    const updatedYear = request.query.updatedYear;
    const updatedMonth = request.query.updatedMonth;
    
    if(updatedYear){    // 새로고침했을때 바뀐달의 데이터를 보내주기
        db.query(`SELECT * FROM \`table_${updatedYear}${updatedMonth}\``, function(err1,money1){
     
            var i=0;
            var totalCash=0;
            var totalCard=0;
            while(money1[i]){         
                totalCard+=money1[i].card;
                totalCash+=money1[i].cash;
                i+=1;
            }

       
            db.query(`SELECT * FROM \`table_${updatedYear}${updatedMonth}\``, function(err,money){
                if(err) {
                    console.log(err)
                }
            
                response.render('index',{    
                    data: money,
                    yearMonth: `${updatedYear}${updatedMonth}`,
                    totalCard: totalCard,
                    totalCash: totalCash
                });
           
            })
        })
    }
    
  
    if(changeYear!=undefined){
        if(changeMonth==1){
            createTableForMonth(changeYear-1,12);
        }
        else{
            createTableForMonth(changeYear,changeMonth-1);
        }
        
        createTableForMonth(changeYear,changeMonth);

        if(changeMonth==12){
            createTableForMonth(changeYear+1,1);
        }
        else{
            createTableForMonth(changeYear,changeMonth+1);
        }
        
        changeDate=`${changeYear}${changeMonth}`

    }
    else{
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        let month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        month=parseInt(month)
        changeDate = `${year}${month}`;

        
        createTableForMonth(year,month);

    }

    

    
    if(request.session.check===1){
        request.session.check=0
        db.query(`SELECT * FROM \`table_${request.session.updateYearMonth}\``, function(err1,money1){
            var i=0;
            var totalCash=0;
            var totalCard=0;
            while(money1[i]){
                totalCard+=money1[i].card;
                totalCash+=money1[i].cash;
                i+=1;
            }
            db.query(`SELECT * FROM \`table_${request.session.updateYearMonth}\``, function(err,money){
                if(err) {
                    console.log(err)
                }
                
                io.emit('updateData', {money:money, year:request.body.currentYear, month:request.body.currentMonth,Cash:totalCash, Card:totalCard});
            
                response.render('index',{    
                    data: money,
                    yearMonth: request.session.updateYearMonth,
                    totalCard: totalCard,
                    totalCash: totalCash
                });
           
            })
        })
        
        

    }else(
        db.query(`SELECT * FROM \`table_${changeDate}\``, function(err1,money1){
     
            var i=0;
            var totalCash=0;
            var totalCard=0;
            while(money1[i]){         
                totalCard+=money1[i].card;
                totalCash+=money1[i].cash;
                i+=1;
            }
       
            db.query(`SELECT * FROM \`table_${changeDate}\``, function(err,money){
                if(err) {
                    console.log(err)
                }
                
                io.emit('updateData', {money:money, year:request.body.currentYear, month:request.body.currentMonth,Cash:totalCash, Card:totalCard});
            
                response.render('index',{    
                    data: money,
                    yearMonth: changeDate,
                    totalCard: totalCard,
                    totalCash: totalCash
                });
           
            })
        })
        
    )

    
    

})




// `<h4 style="color:blue">지출한 현금금액 : ${cash}</h4><h4>지출한 카드금액 : ${card}</h4><h4>총 금액 : ${cash+card}</h4>` 
server.listen(5000);