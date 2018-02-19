var express = require("express");
var app = express();
var mongoose = require("mongoose");
var bodyParser  = require("body-parser");
var passport    = require("passport");
var LocalStrategy = require("passport-local");
app.use(require('method-override')('_method'));
var passportLocalMongoose = require("passport-local-mongoose");
var User = require("./models/user");
var Book = require("./models/books");
var issueBook = require("./models/issuebooks");
app.use(express.static(__dirname + "/public")); 
app.set("view engine","ejs");
mongoose.connect("mongodb://localhost/project2");
app.use(bodyParser.urlencoded({extended: true}));

// var requested = function requested()
// {
//   this.issue="requested";
// }
var objs = [];
app.use(require("express-session")({
    secret: "Chintu is the best!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
 });


app.get("/",function(req,res){
    res.render("start");
});
app.get("/user",isLoggedIn,function(req,res){
    res.render("user");
});

//========Adding new book and saving it ==========
app.get("/newbook",function(req,res){
    res.render("newbook");
});
app.post("/newbook",function(req,res){
    Book.create({
        name:req.body.bookname,
        publisher:req.body.publisher,
        author:req.body.author,
        units:req.body.units,
        issuedunits:0,
        availableunits:req.body.units
        // issue:"false"
    },function(err,createdBook){
        if(err){
            console.log(err)
        }
        else{
            console.log(createdBook);
            res.redirect("/adminallbooks");
        }
    });
});

//=======Requesting a book=======
app.put("/request/:id",function(req,res){
    Book.findById(req.params.id,function(err,foundBook){
        if(err){
            console.log(err);
        }
        else{
            issueBook.create({
                bookID:foundBook._id,
                bookname:foundBook.name,
                userID:req.user._id,
                username:req.user.name
            },function(err,issbook){
                if(err){
                    console.log(err);
                }
                else{
                    console.log(issbook);
                }
            });
            // foundBook.units=(foundBook.units-1);
            foundBook.availableunits=(foundBook.availableunits-1);
            foundBook.issuedunits=(foundBook.issuedunits+1);
            foundBook.save();
            // foundBook.issue='requested';
            // foundBook.saokID:fove();
            // var obj = {boundBook._id,userID:req.user._id}
            // objs.push(obj);
            // console.log(obj);
            // console.log(foundBook);
            // console.log(objs);
            res.redirect("/allbooks");
        }
    }); 
});

//======Accepting a requested book======
app.delete("/accept/:bookid/:userid",function(req,res){
    // console.log("bookid",req.params.bookid);
    issueBook.findByIdAndRemove(req.params.bookid,function(err,foundBook){
        if(err){
            console.log(err);
        }
        else{
            Book.findById(foundBook.bookID,function(err,ibook){
                if(err){
                    console.log(err)
                }
                else{
                    User.findById(req.params.userid,function(err,foundUser){
                        if(err){
                            console.log(err)
                        }
                        else{ 
                            var book = {id:ibook._id,name:ibook.name,issuedon: new Date()};
                            console.log("ibook",ibook)
                            foundUser.booksissued.push(book);
                            foundUser.save();
                            console.log(foundUser.booksissued);
                        }
                    })
                }
            })
            // console.log("foundBook",foundBook);
            res.redirect("/admin");
        }
    });
});

//======Finding and displaying all books=======
app.get("/allbooks",function(req,res){
    Book.find({},function(err,books){
        if(err){
            console.log(err)
        }
        else{
            issueBook.find({},function(err,issuebooks){
                if(err){
                    console.log(err)
                }
                else{
                        res.render("allbooks1",{books:books});
                    } 
            });          
        }
    });
});

//======displaying issued books=======
app.get("/issuedbooks",function(req,res){
    User.findById(req.user._id,function(err,foundUser){
        if(err){
            console.log(err)
        }
        else{
            res.render("issuedbooks",{foundUser:foundUser});
        }
    })
});

//=======Returning issued book======
app.put("/return/:id",function(req,res){
    // console.log("issue book id",req.params.id)
    User.findById(req.user._id,function(err,foundUser){
        if(err){
            console.log(err);
        }
        else{
            // var deletedBook =[]
            var bookissue = foundUser.booksissued;
            // console.log("deleted book",bid);
            bookissue.forEach(function(id){
                console.log("id",id.id);
                if(id._id.equals(req.params.id)){
                    Book.findById(id.id,function(err,foundBook){
                        if(err){
                            console.log(err);
                        }
                        else{
                            // console.log("phle",foundBook);
                            foundBook.availableunits=(foundBook.availableunits+1);
                            foundBook.issuedunits=(foundBook.issuedunits-1);
                            foundBook.save();
                            // console.log("baadme",foundBook);
                        }
                    })
                } 
            });
            foundUser.booksissued.remove({_id:req.params.id});
            foundUser.save();   
            res.redirect("/issuedbooks");         
            // foundUser.booksissued.find({},function(err,issuedbooks){
            //     if(err){
            //         console.log(err)
            //     }
            //     else{
            //         console.log("done");
            //     }
            // });
            // console.log("deleted book",deletedBook);
            // foundUser.save();
            // res.redirect("/issuedbooks");
            // var index = 0;
            // foundUser.booksissued.forEach(function(book,i){
            //     console.log("book id",book.id);
            //     console.log("params id",req.params.id);
            //     var found = (book.id.equals(req.params.id));
            //     console.log("result",found);
            //     if(found){
            //         index=i;
            //         console.log("i=",i);
            //         console.log("index=",index);
            //     }
            // })
            
            // var i = 0;
            // while(foundUser.booksissued.length>i){
            //     var found = (foundUser.booksissued[i].id===req.params.id);
            //     console.log("result",found);
            //     if(!found){
            //         delete foundUser.booksissued[i];
            //         res.redirect("/issuedbooks");
            //     }
            //     else{
            //         i++;
            //     }
            // }
            // foundBook.issue='false';
            // foundBook.save();
            // console.log(foundBook);
            
            
        }
        // foundUser.booksissued.splice(index,1);
        // delete foundUser.booksissued[index];
        
    });
});

//========displaying book details=====/
app.get("/bookdetails/:id",function(req,res){
    Book.findById(req.params.id,function(err,foundBook){
        if(err){
            console.log(err);
        }
        else{
            console.log(foundBook);
            res.render("showbook",{foundBook:foundBook});
        }
    })
    
})
//=======Searching a book======//
app.post("/search",function(req,res){
    Book.find({},function(err,books){
        if(err){
            console.log(err)
        }
        else{
            // console.log(req.body.search);
            res.render("search",{books:books,search:req.body.search});
        }
    });
});
//=========Sorting by name======//
app.post("/sort",function(req,res){
    // Book.find({},function(err,books){
    //     if(err){
    //         console.log(err)
    //     }
    //     else{
    //         var bookss = books.sort({ name :1})
    //         console.log(bookss);
    //         // console.log(req.body.search);
    //         res.render("sort",{bookss:bookss});
    //     }
    // });
    Book.find((err, books) => {
        if (err) {
          console.log(err);
        } else {
          res.render("sort", { books: books });
        }
      }).sort({ name: 'asc' });
    // var mysort= {name:1};
    // Book.find().sort(mysort).toArray(function(err,result){
    //     if(err){
    //         console.log(err);
    //     }
    //     else{
    //         console.log(result);
    //     }
    // });
    // res.render("sort",{books:Book.find().sort({name:1})});
});

//========Admin viewing books======//
app.get("/adminallbooks",function(req,res){
    Book.find({},function(err,books){
        if(err){
            console.log(err);
        }
        else{
            res.render("adminallbooks",{books:books});
        }
    });
});

//=========Admin updating books=======
app.get("/update/:id",function(req,res){
    Book.findById(req.params.id,function(err,book){
        res.render("updatebook",{book:book});
    });
});
app.put("/update/:id",function(req,res){
    Book.findByIdAndUpdate(req.params.id,req.body.book,function(err,updatedBook){
        if(err){
            console.log(err);
        }
        else{
            updatedBook.availableunits=req.body.book.units-updatedBook.issuedunits;
            updatedBook.save();
            res.redirect("/admin");
        }
    });
});

//====admin and displaying requested books=====

// app.get("/admin",function(req,res){
//     res.render("admin",);
// });
app.get("/admin",function(req,res){
    issueBook.find({},function(err,books){
        if(err){
            console.log(err)
        }
        else{
            res.render("admin",{books:books});
        }
    })
});

//=======Signing up a user======
app.get("/signup",function(req,res){
    res.render("signup");
});
app.post("/signup",function(req,res){
    // console.log(req.body);
    var newUser = new User({
        name: req.body.name, 
        dob: req.body.dob, 
        gender: req.body.gender,
        phone:req.body.phone,
        username:req.body.username,
    });
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("login");
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/user"); 
        });        
    });
});

//========LOGIN and Logout========
app.get("/login",function(req,res){
    res.render("login");
});
app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/user",
        failureRedirect: "/login"
    }), function(req, res){
});
app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});
// function isLoggedIn(req, res, next){
//     if(req.isAuthenticated()){
//             return next();
//         }
//     else{
//         res.redirect("/login");
//     }
// }
// function AdminLoggin(req,res,next){
//     if(req.isAuthenticated()){
//         if(req.user.username==='admin'){
//             return next();
//         }
//     else{
//         res.redirect("/login");
//     }}
//     }

function isLoggedIn(req, res, next){
        if(req.isAuthenticated()){
            if(req.user.username==="admin"){
                res.redirect("/admin");
            }else{
                return next();
            }  
            }
        else{
            res.redirect("/login");
        }
    }
    


app.listen(4000,function(err){
    console.log("server started");
})