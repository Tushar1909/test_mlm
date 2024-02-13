const express=require("express")
const bodyParser=require("body-parser");
const mongoose=require("mongoose");

const app=express()

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb://0.0.0.0:27017/test21db",{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
  console.log("Successfully connected to database");
}).catch((e)=>{
  console.log(e);
})

const userSchema= new mongoose.Schema({
    referal: String,
    referalCode: String,
    amount: String,
    role: String,
    name: String,
    password: String,
    email: String,
  });


  
const User= mongoose.model("User",userSchema);


app.get("/home",(req,res)=>{
    res.send("Welcome")
})

app.get("/",(req,res)=>{
      User.find().then(async(found)=>{
        let a=0;
        console.log(found)
        for(let i=0;i<found.length;i++){
            if(found[i].referal!=undefined && found[i].referal!=""){
                a++;
            }
        }
        res.render("agent",{parray:found,a:a})
    })
})

var login_valid=0;
app.get("/login",(req,res)=>{
    res.render("login",{login_valid:login_valid});
    login_valid=0;
})

app.post("/login",async (req,res)=>{
    const email= req.body.email;
    const Password= req.body.password;
    User.findOne({email: email}).then(async(found)=>{
        if(!found){
            login_valid=1;
            res.redirect("/login")
        }else{
         
             if(Password==found.password){
                res.redirect("/")
            }
            else{
                login_valid=2;
                    res.redirect("/login")
            }
        }
    })
})

var login_valid1=0;
app.get("/selfregister",(req,res)=>{
    res.render("register",{login_valid1:login_valid1});
    login_valid1=0;
})

app.post("/selfregister",async (req,res)=>{
    const email= req.body.email;
    const Password= req.body.password;
    const name= req.body.name;
    const referal= req.body.referal;
    const amount= req.body.amount;
    User.findOne({email: email}).then(async(found)=>{
        if(found){
            login_valid1=1;
            res.redirect("/selfregister")
        }
        else{
            if(referal==""){
                const fo=await User.findOne({role:"Admin"})
                let otp=Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000
                const user=new User({
                    referal: referal,
                    referalCode: otp,
                    amount: "0",
                    name: name,
                    role: "User",
                    password: Password,
                    email: email,
                })
                fo.amount=Number(amount)+Number(fo.amount)
                await fo.save().then(async ()=>{
                    await user.save().then(()=>{
                        res.redirect("/")
                    })    
                })
            }
            else{
                const fo=await User.findOne({referalCode:referal})
                if(!fo){
                    login_valid1=2;
                    res.redirect("/selfregister")
                }
                else{
                    let otp=Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000
                    const user=new User({
                        referal: referal,
                        referalCode: otp,
                        amount: "0",
                        name: name,
                        role: "User",
                        password: Password,
                        email: email,
                    })
                    fo.amount=Number(amount)+Number(fo.amount)
                    await fo.save().then(async ()=>{
                        await user.save().then(()=>{
                            res.redirect("/")
                        })    
                    })
               
                }
            }

        }
    })
})

app.listen(3000,(req,res)=>{
    console.log("Server started at 3000")
})