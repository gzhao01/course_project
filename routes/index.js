var express = require('express');
var router = express.Router();
//引入数据库包
var db = require("./db.js");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//login
router.post('/login', function(req, res, next){
  var id = req.body.user_id;
  var password = req.body.user_password;

  var sql = "select * from user";

  var to_login = false;
  var type = 0;

  db.query(sql, function(err, rows){
    if(err){
      res.end("login fail：", err);
    }
    else{
      rows.forEach(function(value,index){
          if(id == value.User_ID && password == value.Password) {
              to_login = true;
              type = value.type;
          }
      })
      if(to_login){
          if(type==1){
            //res.render("students");
            res.redirect("/students/"+id);
          }
          else{
            res.redirect("/teachers/"+id);
          }
      }
      else{
        res.redirect("/");
      }
    }
  });
});

//show students page
router.get('/students/:id', function(req, res, next){
  var id = req.params.id;
  var sql = "select * from student where User_ID = " + id;

  //student information
  db.query(sql, function(err,rows){
    if(err){
      res.end("no student data");
    }
    else{
      sql_course =
      "select * from course_record natural join course natural join teacher where Student_ID= "
      + rows[0].Student_ID;
      //courses
      db.query(sql_course, function(err2,courses){
        res.render('students',
        {
          Student_ID: rows[0].Student_ID,
          Student_name: rows[0].Student_name,
          Student_GPA: rows[0].GPA,

          courses: courses
        });
      });
    }
  });
});

//show teahcers page
router.get("/teachers/:id", function(req, res, next){
  var id = req.params.id;
  var sql = "select * from teacher where User_ID = " + id;

  //student information
  db.query(sql, function(err,rows){
    if(err){
      res.end("no teacher data");
    }
    else{
      sql_course =
      "select * from course_record natural join course natural join student where Teacher_ID= "
      + rows[0].Teacher_ID + " ORDER BY COURSE_ID";
      //courses
      db.query(sql_course, function(err2,courses){
        res.render('teachers',
        {
          Teacher_ID: rows[0].Teacher_ID,
          Teacher_name: rows[0].Teacher_name,
          Resume: rows[0].resume,
          User_ID: id,

          courses: courses
        });
      });
    }
  });
});

router.get("/update/:id-:stdid", function(req, res, next){
  var id = req.params.id;
  var stdid = req.params.stdid;
  var sql = "select * from course_record where Course_ID = " + id
  + " and Student_ID = " + stdid;
  db.query(sql, function(err,rows){
    res.render("update", {datas: rows});
  });
});

router.post("/haveUpdated", function(req, res, next){
  var grade = req.body.grade;
  var id = req.body.id;
  var sql = "update course_record set Grade = " + grade + " where Course_Record_ID = " + id;
  db.query(sql, function(err, rows){
    var sql_redir = "select * from course_record natural join teacher where Course_Record_ID = " + id;
    db.query(sql_redir, function(err2, rows2){
      res.redirect("/teachers/"+rows2[0].User_ID);
    });
  });
});

router.get("teacherAccount/:id", function(req, res, next){
  var id = req.params.id;
  res.redirect("teacher/"+id);
});

router.get("/edit/:id", function(req,res,next){
  var id = req.params.id;
  var sql = "select * from teacher where User_ID = " + id;
  db.query(sql, function(err, rows){
    res.render("edit",{teacher:rows[0]});
  });
});
router.post("/resumeUpdate", function(req,res,next){
  var id = req.body.userid;
  var resume = JSON.stringify(req.body.resume);
  var sql_redir = "update teacher set resume = "+ resume + " where User_ID = " + id;
  db.query(sql_redir, function(err2, rows2){
    res.redirect("/teachers/"+id);
  });
});

module.exports = router;
