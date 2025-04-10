


const home = async (req,res) => {
    try {
       console.log("entering the function which renders the home page");
       res.render('user/home') 
    } catch (error) {
        console.log("error occured while rendering the home page",error)
    }
}  


const login= async(req,res)=>{
    try {
        console.log("login page  success")
        res.render('user/login')
    } catch (error) {
        console.log(error)
    }
}

const loadsignup= async(req,res)=>{
    try {
        console.log("signup  page  success")
        res.render('user/signup')
    } catch (error) {
        console.log(error)
    }
}


let 










const verifyOtp =async(req,res)=>{
    try {
        console.log("otp is",otp)
        res.render('user/verify-otp')
    } catch (error) {
        console.log(error);
    }
}





module.exports={
    home,
    login,
    loadsignup,
    verifyOtp
}