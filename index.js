import express from  "express"
import mongoose from "mongoose";
import path from "path"
import { User } from "./models/User.js";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken"
import { name } from "ejs";
import bcrypt from "bcrypt"


//-------data-------------
// {
//   name:"nayan",
//   email:"nayan@gmail.com"
// },
// {
//   name:"nayan11",
//   email:"nayan11@gmail.com"
// },
// {
//   name:"nayan22",
//   email:"nayan22@gmail.com"
// }

const users=[];
const app=express()

await mongoose.connect("mongodb://localhost:27017",{
  dbName:"contact"
})
.then(()=>console.log("database connected"))
.catch((error)=>console.log(error))

app.set("view engine","ejs")
app.use(express.static(path.join(path.resolve(),"public")))
app.use(express.urlencoded({extended:true}));   //middleware
app.use(cookieParser())


//---------------api's--------------------------
const isAuthenticated = async (req,res,next)=>{
  const {token}=req.cookies;
  if (token){
   const decoded= jwt.verify(token,"abcdefwsdsf");
   req.user= await User.findById(decoded._id)
  next();
  }
  else{
 res.redirect("/login")
  }
}
//-------------------------------------------

app.get("/",isAuthenticated,(req,res)=>{

  res.render("logout", {name:req.user.name})

  });

app.post("/register",async(req,res)=>{
   const {name,email,password} =(req.body);

   let user = await User.findOne({email});
   if (user){
    return res.redirect("/login")
   }
    const hashedPassword = await bcrypt.hash(password,10);

    user=await User.create({name,email, hashedPassword})

      
    const token= jwt.sign({_id:user._id},"abcdefwsdsf")

    res.cookie("token",token,{
      httpOnly:true,
      expires:new Date(Date.now()+60*1000)
    })
    res.redirect("/")
  });

app.post("/login",async(req,res)=>{
   const {email,password} =(req.body);
   let user = await User.findOne({email});
   if (!user){
    return res.redirect("/register")
   }
   
   const match= await bcrypt.compare(password,user.password)
   if(match){
    const token= jwt.sign({_id:user._id},"abcdefwsdsf")
    res.cookie("token",token,{
      httpOnly:true,
      expires:new Date(Date.now()+60*1000)
    })
    return res.redirect("/")
   }
   else{
    return res.render("login",{isMatch:"incorrect password",email})
   }

    
  });


app.get("/register",(req,res)=>{
  res.render("register")
})
app.get("/login",(req,res)=>{
  res.render("login");
})

app.get("/logout",(req,res)=>{
    res.cookie("token","",{
      httpOnly:true,
      expires:new Date(Date.now())
    })
    res.redirect("/")
  });









// app.get("/",(req,res)=>{
//   res.render("index");
// });

// app.post("/contact",async(req,res)=>{
//   // console.log(req.body);
  
//   const data={name:req.body.name, email: req.body.email}
//   // let user=new User(data);
//   // await user.save()
//   // .then(res=>console.log("done"))
//   // .catch(error=>console.log(error))

//   await User.create(data);
//   res.render("index",{statusOfForm: "user stored"});
// })

// app.get("/users",async(req,res)=>{
//  const users= await User.find()
//  res.json({
//   users,
//  })
// })

// app.get("/users/:userName",async(req,res)=>{
//   const user= req.params.userName;
//   console.log(user)
//   const userData= await User.find({name:user})
//   res.json({user:userData})


  // console.log(req.params.userName);
  
  // let user=users.filter((user)=>{
  //   return user.name == req.params.userName
  // });
  // console.log(user);
  // res.json({
  //   name:user[0].name,
  //   email:user[0].email
  // })
// })

app.listen(5000,()=>{
  console.log("server is working");
})


