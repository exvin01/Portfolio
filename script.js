//footer icons
const whatsappIcon = document.getElementById("whatsappIcon");
const facebookIcon = document.getElementById("facebookIcon");
const emailIcon = document.getElementById("emailIcon");
const instagramIcon = document.getElementById("instagramIcon");

 whatsappIcon.addEventListener("click",
                function(event){
                    event.preventDefault();//prevent page from reload
                    window.location.href = "//wa.me/265897910448";
                    });

          facebookIcon.addEventListener("click",
                function(event){
                    event.preventDefault();//prevent page from reload
                    window.location.href = "https://www.facebook.com/real.exvin";
                    });

         emailIcon.addEventListener("click",
                function(event){
                    event.preventDefault();//prevent page from reload
                    window.location.href = "mailto:chipwereexvin@gmail.com";
                    });

        instagramIcon.addEventListener("click",
                function(event){
                    event.preventDefault();//prevent page from reload
                    
                    window.location.href = "https://www.instagram.com/exvinchipwere?igsh=Yzljk10Dg3Zg==";
                    });
 // headerbuttons
 const Home = document.getElementById("Home");
const AboutMe = document.getElementById("AboutMe");
const Contact = document.getElementById("Contact");
const Items = document.getElementById("Items");

Home.addEventListener('click', (event) =>{
    event.preventDefault();
    window.location.href = "index.html";
});
AboutMe.addEventListener("click", (event) =>{
    event.preventDefault();
    window.location.href = "my profile.htm";
});
Contact.addEventListener('click', (event) =>{
    event.preventDefault();
    window.location.href = "contact me.htm";
});

Items.addEventListener('click', (event) =>{
    event.preventDefault();
    alert('This site is under maintainance please vist the contact tab');

    window.location.href = "contact me.htm";
});
