$(document).ready(function(){





    

    // Simple submit button event - recognize user input and get a new user prompt
    $("#submit-button").mousedown(function(e){
            $("#submit-button").css("transform", "scale(0.85)");
            
            
    });

    // Mouse up event handler for the submit button - resets the image to normal scale
    $("#submit-button").mouseup(function(e){
            $("#submit-button").css("transform", "scale(1.0)");
            unlockPhone();
    });









    // Play the unlock animation, lock animation and reset the state
    function unlockPhone(){
        console.log("unlocking...");
        $("#phone-lock-screen").css("z-index", "1");
        $("#phone-border").css("z-index", "2");

        // Queue up animations
        $("#phone-lock-screen").animate({bottom: '+=500px'}, "easeOutCirc");
        $("#phone-lock-screen").animate({bottom: '-=500px'}, "easeOutCirc");

        // Wait for animations to complete then reset the state
        $("#phone-lock-screen").promise().done(function(){
            $("#phone-lock-screen").css("z-index", "2");
            $("#phone-border").css("z-index", "1");
        });
    }
});