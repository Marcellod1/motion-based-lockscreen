$(document).ready(function(){  
    // More API functions here:
    // https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose
    let model, webcam, ctx, maxPredictions;
    var currActions = 0;    
    var isStanding = true;
    var mode = 0;
    var locked = true;
    
    const WEBCAM_SIZE = 300;  
    const BUFFER_TIME = 5;
    const MAX_ACTIONS = 10;

    // the link to your model provided by Teachable Machine export panel
    const PUSH_UP_MODEL_URL = "https://teachablemachine.withgoogle.com/models/RyZAgGy7F/";
    const SQUAT_MODEL_URL = "https://teachablemachine.withgoogle.com/models/xdAU4LaGu/";

    $("#button-container").show();
    $("#canvas-container").hide();   
    
    function countdown(duration) {
        var remainingTime = duration;
        var timer = setInterval(function() {
          
        // Reset the countdown DOM element
        var countdown_str = "";
        $("#countdown").text(countdown_str);
        
        if (remainingTime == 0) {
            // Change Gif and countdown
            countdown_str = "Go!";
            if(mode == 1) $("#canvas").attr("src","resources/img/push-up.gif");
            else if (mode == 2) $("#canvas").attr("src","resources/img/squat.gif");
            else $("#canvas").attr("src","resources/img/push-up-set-up.gif");

            // Init teachable machine and webcam
            clearInterval(timer);
            init();
        
        } else {
          countdown_str = remainingTime;
        }
        
        $("#countdown").text(countdown_str);
        remainingTime -= 1;
      }, 1000);
    }


  async function init() {
    var URL = ""
    
    if(mode == 1) URL = PUSH_UP_MODEL_URL;
    else if (mode == 2) URL = SQUAT_MODEL_URL;
    else URL = PUSH_UP_MODEL_URL;
        
    navigator.mediaDevices.getUserMedia({ video: true });
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // Note: the pose library adds a tmPose object to your window (window.tmPose)
    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    webcam = new tmPose.Webcam(WEBCAM_SIZE, WEBCAM_SIZE, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);
  }


  // Loop function called each time an animation frame is requested. Handles most program logic.
  async function loop(timestamp) {
    webcam.update(); // update the webcam frame
    await predict();
    
    // reset the counter DOM element
    var counter_str = "";
    
    if(currActions > MAX_ACTIONS - 1 && locked){
        locked = false;
        unlockPhone();
        counter_str = "Unlocked!";

    } else {
      // Decide on the mode 0 = no mode, 1 = push ups, 2 = squats
      if(mode == 0) counter_str = "";
      else if (mode == 1) counter_str = "Push-ups: " + currActions + " / " + MAX_ACTIONS;
      else if (mode == 2) counter_str = "Squats: " + currActions + " / " + MAX_ACTIONS;
    }

    // Update counter DOM element
    $("#counter").text(counter_str);
    window.requestAnimationFrame(loop);
  }


  // Predict function
  async function predict() {
    // Prediction #1: run input through posenet
    // estimatePose can take in an image, video or canvas html element
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    // Prediction 2: run input through teachable machine classification model
    const prediction = await model.predict(posenetOutput);

    for (let i = 0; i < maxPredictions; i++) {
      
      if (prediction[0].probability.toFixed(2) == 1.0 && !isStanding) {
        isStanding = true;
        currActions++;
      }
      if (prediction[1].probability.toFixed(2) == 1.0) {
        isStanding = false;
      }
    }
  }
  

  // Simple push up button event - recognize user input and get a new user prompt
  $("#push-up-button").mousedown(function(e){
          $("#push-up-button").css("transform", "scale(0.85)");   
  });

  // Mouse up event handler for the push up button - resets the image to normal scale
  $("#push-up-button").mouseup(function(e){
          $("#push-up-button").css("transform", "scale(1.0)");
          mode = 1;
          // Change canvas gif depending on mode
          $("#button-container").hide();
          $("#canvas-container").show();
          countdown(BUFFER_TIME);
  });

  // Simple squat button event - recognize user input and get a new user prompt
  $("#squat-button").mousedown(function(e){
          $("#squat-button").css("transform", "scale(0.85)");   
  });

  // Mouse up event handler for the squat button - resets the image to normal scale
  $("#squat-button").mouseup(function(e){
          $("#squat-button").css("transform", "scale(1.0)");
          mode = 2;
          $("#button-container").hide();
          $("#canvas-container").show();
          $("#canvas").attr("src","resources/img/Setup-squats.gif");
          countdown(BUFFER_TIME);
  });


  // Play the unlock animation, lock animation and reset the state
  function unlockPhone(){
    console.log("unlocking...");
    $("#phone-lock-screen").css("z-index", "1");
    $("#phone-border").css("z-index", "2");

         // Queue up animations
    var height = $("#phone-lock-screen").css('height');
    $("#phone-lock-screen").animate({bottom: "+=" + height}, "easeOutCirc");
  }

  // Reset the action counter and hide counters
  function resetCounters(){
    currActions = 0;
    $("#countdown").text("");
    $("#counter").text("");
  }

  // Reset the action counter and hide counters
  function displayMenu(){
    mode = 0;
    $("#button-container").show();
    $("#canvas-container").hide();
  }
});